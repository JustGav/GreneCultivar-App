
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
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`File not found for deletion (may have already been deleted or never existed): ${imageUrl}`);
    } else {
      console.error(`Error deleting image ${imageUrl}:`, error);
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
      return timestamp; // Already a string
    }
    if (timestamp && typeof timestamp.toDate === 'function') { // Handle older serverTimestamp objects
        return timestamp.toDate().toISOString();
    }
    return new Date().toISOString(); // Fallback, though ideally data should be consistent
  };

  return {
    id,
    name: data.name,
    genetics: data.genetics,
    status: data.status || 'recentlyAdded',
    source: data.source,
    thc: data.thc as CannabinoidProfile,
    cbd: data.cbd as CannabinoidProfile,
    cbc: data.cbc as CannabinoidProfile | undefined,
    cbg: data.cbg as CannabinoidProfile | undefined,
    cbn: data.cbn as CannabinoidProfile | undefined,
    thcv: data.thcv as CannabinoidProfile | undefined,
    effects: data.effects || [],
    medicalEffects: data.medicalEffects || [],
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
    // Order by createdAt descending to get newest first, or name for alphabetical.
    // For now, let's stick to name as per previous logic.
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
  return cleanedData;
};

export const addCultivar = async (cultivarDataInput: Omit<Cultivar, 'id' | 'reviews' | 'status' | 'createdAt' | 'updatedAt' | 'history'> & { source?: string }): Promise<Cultivar> => {
  try {
    const dataToSave: { [key: string]: any } = {};
    for (const key in cultivarDataInput) {
      if (cultivarDataInput[key as keyof typeof cultivarDataInput] !== undefined) {
        dataToSave[key] = cultivarDataInput[key as keyof typeof cultivarDataInput];
      }
    }

    const arrayFields: (keyof (Omit<Cultivar, 'id' | 'reviews' | 'status' | 'createdAt' | 'updatedAt' | 'history'> & { source?: string }))[] = ['images', 'parents', 'children', 'effects', 'medicalEffects', 'terpeneProfile'];
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
    } else {
      dataToSave.additionalInfo = {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
      };
    }
    
    const nowISO = new Date().toISOString();
    const initialHistoryEntry: CultivarHistoryEntry = {
        timestamp: nowISO,
        event: "Cultivar Created",
    };

    const finalDataForFirestore = {
      ...dataToSave,
      status: 'recentlyAdded' as CultivarStatus,
      reviews: [],
      createdAt: nowISO,
      updatedAt: nowISO,
      history: [initialHistoryEntry],
    };

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
    const cleanedData = prepareDataForFirestore(cultivarData);
    
    const arrayFields: (keyof Cultivar)[] = ['images', 'parents', 'children', 'effects', 'medicalEffects', 'terpeneProfile'];
    arrayFields.forEach(field => {
      if (cleanedData[field] === undefined && cultivarData.hasOwnProperty(field)) {
        cleanedData[field] = [];
      }
    });

    if (cultivarData.hasOwnProperty('additionalInfo')) {
      if (cleanedData.additionalInfo === undefined || cleanedData.additionalInfo === null) {
        cleanedData.additionalInfo = {};
      }
      const ai = cleanedData.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
      const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
      expectedAICategories.forEach(catKey => {
        if (ai[catKey] === undefined && cultivarData.additionalInfo?.hasOwnProperty(catKey)) {
          (ai[catKey] as any) = [];
        }
      });
    }
    
    const nowISO = new Date().toISOString();
    const historyEntry: CultivarHistoryEntry = {
        timestamp: nowISO,
        event: "Cultivar Details Updated",
    };

    await updateDoc(cultivarDocRef, {
        ...cleanedData,
        updatedAt: nowISO,
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
    const nowISO = new Date().toISOString();
    const historyEntry: CultivarHistoryEntry = {
        timestamp: nowISO,
        event: `Status changed to ${status}`,
        details: { newStatus: status }
    };
    await updateDoc(cultivarDocRef, { 
        status,
        updatedAt: nowISO,
        history: arrayUnion(historyEntry)
    });
  } catch (error) {
    console.error(`Error updating status for cultivar with ID ${id}: `, error);
    throw error;
  }
};


export const addReviewToCultivar = async (cultivarId: string, reviewData: Review): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, cultivarId);
    const nowISO = new Date().toISOString();
    const reviewToSave = {
      ...reviewData,
      createdAt: typeof reviewData.createdAt === 'string' ? reviewData.createdAt : nowISO,
    };
     const historyEntry: CultivarHistoryEntry = {
        timestamp: nowISO,
        event: "Review Added",
        details: { reviewId: reviewToSave.id, rating: reviewToSave.rating }
    };
    await updateDoc(cultivarDocRef, {
      reviews: arrayUnion(reviewToSave),
      updatedAt: nowISO,
      history: arrayUnion(historyEntry)
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    throw error;
  }
};
