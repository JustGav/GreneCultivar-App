
import { db, storage } from '@/lib/firebase-config';
import type { Cultivar, Review, CannabinoidProfile, PlantCharacteristics, AdditionalFileInfo, AdditionalInfoCategoryKey, Terpene, PricingProfile, YieldProfile, CultivarImage, CultivarStatus, CultivarHistoryEntry } from '@/types';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  DocumentData,
  query,
  orderBy,
  deleteField,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const CULTIVARS_COLLECTION = 'cultivars';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading image to ${path}:`, error);
    throw error;
  }
};

export const deleteImageByUrl = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log(`Successfully deleted image from storage: ${imageUrl}`);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`File not found for deletion (may have already been deleted or never existed): ${imageUrl}`);
    } else {
      console.error(`Error deleting image ${imageUrl} from storage:`, error);
      throw error;
    }
  }
};


const mapDocToCultivar = (docData: DocumentData, id: string): Cultivar => {
  const data = docData as any;
  const mapTimestampToString = (timestamp: any): string => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    return new Date().toISOString();
  };

  const defaultCannabinoidProfile: CannabinoidProfile = { min: undefined, max: undefined };

  return {
    id,
    name: data.name,
    genetics: data.genetics,
    status: data.status || 'recentlyAdded',
    source: data.source,
    thc: (data.thc || defaultCannabinoidProfile) as CannabinoidProfile,
    cbd: (data.cbd || defaultCannabinoidProfile) as CannabinoidProfile,
    cbc: (data.cbc || defaultCannabinoidProfile) as CannabinoidProfile | undefined,
    cbg: (data.cbg || defaultCannabinoidProfile) as CannabinoidProfile | undefined,
    cbn: (data.cbn || defaultCannabinoidProfile) as CannabinoidProfile | undefined,
    thcv: (data.thcv || defaultCannabinoidProfile) as CannabinoidProfile | undefined,
    effects: data.effects || [],
    medicalEffects: data.medicalEffects || [],
    flavors: data.flavors || [],
    description: data.description,
    images: data.images || [],
    reviews: (data.reviews || []).map((review: any) => ({
      ...review,
      createdAt: mapTimestampToString(review.createdAt),
    })),
    cultivationPhases: data.cultivationPhases,
    plantCharacteristics: data.plantCharacteristics as PlantCharacteristics | undefined,
    additionalInfo: data.additionalInfo,
    terpeneProfile: data.terpeneProfile || [],
    pricing: data.pricing as PricingProfile | undefined,
    supplierUrl: data.supplierUrl,
    parents: data.parents || [],
    children: data.children || [],
    createdAt: mapTimestampToString(data.createdAt),
    updatedAt: mapTimestampToString(data.updatedAt),
    history: (data.history || []).map((entry: any) => ({
        ...entry,
        timestamp: mapTimestampToString(entry.timestamp),
    })),
  };
};


export const getCultivars = async (): Promise<Cultivar[]> => {
  try {
    const cultivarsCol = collection(db, CULTIVARS_COLLECTION);
    const q = query(cultivarsCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => mapDocToCultivar(docSnapshot.data(), docSnapshot.id));
  } catch (error) {
    console.error("Error fetching cultivars: ", error);
    throw error;
  }
};

export const getCultivarById = async (id: string): Promise<Cultivar | null> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
    const docSnap = await getDoc(cultivarDocRef);
    if (docSnap.exists()) {
      return mapDocToCultivar(docSnap.data(), docSnap.id);
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching cultivar by ID: ", error);
    throw error;
  }
};

const prepareDataForFirestore = (data: Record<string, any>): Record<string, any> => {
  const cleanedData: Record<string, any> = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      cleanedData[key] = data[key];
    }
  }

  const cannabinoidFields: (keyof Cultivar)[] = ['thc', 'cbd', 'cbc', 'cbg', 'cbn', 'thcv'];
  cannabinoidFields.forEach(field => {
    const fieldName = field as string;
    if (cleanedData[fieldName] && typeof cleanedData[fieldName] === 'object') {
      const profile = cleanedData[fieldName] as CannabinoidProfile;
      if (profile.min === undefined || profile.min === null || isNaN(Number(profile.min))) delete profile.min;
      if (profile.max === undefined || profile.max === null || isNaN(Number(profile.max))) delete profile.max;
      if (Object.keys(profile).length === 0 && cleanedData[fieldName] !== undefined) {
        // if profile becomes empty after cleaning, ensure it's removed or handled if field is optional
        // For now, if both min/max are removed, the object might remain empty. Firestore handles empty maps.
      }
    } else if (cleanedData[fieldName] !== undefined) {
      // If it's not an object but defined (e.g. {}), ensure it's cleaned or conforms
      // This case should ideally not happen with strong typing but good to be aware
    }
  });
  return cleanedData;
};

export const addCultivar = async (cultivarDataInput: Partial<Omit<Cultivar, 'id' | 'reviews' | 'createdAt' | 'updatedAt' | 'history'>> & { source?: string; status?: CultivarStatus }): Promise<Cultivar> => {
  try {
    const dataToSave: { [key: string]: any } = {};
    // Copy only defined properties from cultivarDataInput
    for (const key in cultivarDataInput) {
      if (cultivarDataInput[key as keyof typeof cultivarDataInput] !== undefined) {
        dataToSave[key] = cultivarDataInput[key as keyof typeof cultivarDataInput];
      }
    }

    const arrayFields: (keyof typeof dataToSave)[] = ['images', 'parents', 'children', 'effects', 'medicalEffects', 'terpeneProfile', 'flavors'];
    arrayFields.forEach(field => {
      if (dataToSave[field] === undefined) {
        dataToSave[field] = [];
      }
    });

    if (dataToSave.additionalInfo && typeof dataToSave.additionalInfo === 'object') {
      const ai = dataToSave.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
      const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
      expectedAICategories.forEach(catKey => {
        if (ai[catKey] === undefined) {
          (ai[catKey] as any) = [];
        }
      });
    } else if (dataToSave.additionalInfo === undefined) { // Check if additionalInfo itself is undefined
      dataToSave.additionalInfo = {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
      };
    }

    const initialHistoryEntry: Omit<CultivarHistoryEntry, 'timestamp'> & { timestamp: any } = {
        timestamp: serverTimestamp(),
        event: cultivarDataInput.status === 'User Submitted' ? "Cultivar Submitted by User" : "Cultivar Created",
        details: { status: cultivarDataInput.status || 'recentlyAdded', source: cultivarDataInput.source || 'System' }
    };

    const finalDataForFirestore = {
      ...dataToSave, // Contains properties from cultivarDataInput including potentially status and source
      reviews: [], // Always initialize reviews as empty
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [initialHistoryEntry],
    };
    
    // Ensure status defaults if not provided by cultivarDataInput
    if (!finalDataForFirestore.status) {
      finalDataForFirestore.status = 'recentlyAdded' as CultivarStatus;
    }


    const cleanedData = prepareDataForFirestore(finalDataForFirestore);
    const docRef = await addDoc(collection(db, CULTIVARS_COLLECTION), cleanedData);

    const savedDoc = await getDoc(docRef);
    if (!savedDoc.exists()) {
      throw new Error("Failed to retrieve saved cultivar post-creation.");
    }
    return mapDocToCultivar(savedDoc.data(), savedDoc.id);

  } catch (error) {
    console.error("Error adding cultivar: ", error);
    throw error;
  }
};


export const updateCultivar = async (id: string, cultivarData: Partial<Omit<Cultivar, 'id' | 'createdAt' | 'history'>>): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);

    const dataToUpdate = prepareDataForFirestore(cultivarData);

    if (dataToUpdate.additionalInfo && typeof dataToUpdate.additionalInfo === 'object') {
        const ai = dataToUpdate.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
        const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
        expectedAICategories.forEach(catKey => {
            if (ai[catKey] === undefined) {
                (ai[catKey] as any) = [];
            }
        });
    }


    const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(), // Client-side timestamp for immediate use in history
        event: "Cultivar Details Updated",
        // Consider adding more details about what changed if needed
    };

    await updateDoc(cultivarDocRef, {
        ...dataToUpdate,
        updatedAt: serverTimestamp(),
        history: arrayUnion(historyEntry)
    });
  } catch (error) {
    console.error(`Error updating cultivar with ID ${id}: `, error);
    throw error;
  }
};

export const updateCultivarStatus = async (id: string, status: CultivarStatus): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
    const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(),
        event: `Status changed to ${status}`,
        details: { newStatus: status }
    };
    await updateDoc(cultivarDocRef, {
        status,
        updatedAt: serverTimestamp(),
        history: arrayUnion(historyEntry)
    });
  } catch (error) {
    console.error(`Error updating status for cultivar with ID ${id}: `, error);
    throw error;
  }
};

export const updateMultipleCultivarStatuses = async (cultivarIds: string[], newStatus: CultivarStatus): Promise<void> => {
  if (cultivarIds.length === 0) return;
  const batch = writeBatch(db);
  const timestamp = new Date().toISOString(); // Use a consistent client-generated timestamp for history

  cultivarIds.forEach(id => {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
    const historyEntry: CultivarHistoryEntry = {
      timestamp,
      event: `Status mass-changed to ${newStatus}`,
      details: { newStatus }
    };
    batch.update(cultivarDocRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      history: arrayUnion(historyEntry)
    });
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error updating multiple cultivar statuses: ", error);
    throw error;
  }
};


export const addReviewToCultivar = async (cultivarId: string, reviewData: Review): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
    const reviewToSave = {
      ...reviewData,
      createdAt: typeof reviewData.createdAt === 'string' ? reviewData.createdAt : new Date().toISOString(),
    };
     const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(),
        event: "Review Added",
        details: { reviewId: reviewToSave.id, rating: reviewToSave.rating }
    };
    await updateDoc(cultivarDocRef, {
      reviews: arrayUnion(reviewToSave),
      updatedAt: serverTimestamp(),
      history: arrayUnion(historyEntry)
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    throw error;
  }
};
