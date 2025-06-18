
import { db, storage, auth } from '@/lib/firebase-config';
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
    name: typeof data.name === 'string' && data.name.trim() ? data.name : 'Unnamed Cultivar',
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
      }
    } else if (cleanedData[fieldName] !== undefined) {
    }
  });
  return cleanedData;
};

const getCurrentUserHistoryDetails = (): { userId?: string; details: Record<string, any> } => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return {
      userId: currentUser.uid,
      details: {
        userEmail: currentUser.email,
        userName: currentUser.displayName,
      }
    };
  }
  return { details: { userSource: 'Anonymous or System' } };
};


export const addCultivar = async (cultivarDataInput: Partial<Omit<Cultivar, 'id' | 'reviews' | 'createdAt' | 'updatedAt' | 'history'>> & { source?: string; status?: CultivarStatus }): Promise<Cultivar> => {
  try {
    const dataToSave: { [key: string]: any } = {};
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
    } else if (dataToSave.additionalInfo === undefined) {
      dataToSave.additionalInfo = {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
      };
    }

    const { userId, details: userDetails } = getCurrentUserHistoryDetails();
    let eventType = cultivarDataInput.status === 'User Submitted' ? "Cultivar Submitted by User" : "Cultivar Created";
    const sourceInfo = cultivarDataInput.source || (userId ? 'Authenticated User Submission' : 'System Generated');
    
    // If 'source' is an email, we treat it as a user submission even if status isn't 'User Submitted' yet
    if (cultivarDataInput.source && cultivarDataInput.source.includes('@')) {
        eventType = "Cultivar Submitted by User";
    }

    const initialHistoryEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(),
        event: eventType,
        userId: userId,
        details: { 
          ...userDetails,
          status: cultivarDataInput.status || 'recentlyAdded', 
          source: sourceInfo // Use the passed source, which could be an email
        }
    };

    const finalDataForFirestore = {
      ...dataToSave,
      reviews: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [initialHistoryEntry],
    };
    
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
    
    const currentDocSnap = await getDoc(cultivarDocRef);
    if (!currentDocSnap.exists()) {
      throw new Error(`Cultivar with ID ${id} not found for update.`);
    }
    const currentCultivarData = currentDocSnap.data();

    const dataToUpdate = prepareDataForFirestore(cultivarData);

    if (dataToUpdate.additionalInfo && typeof dataToUpdate.additionalInfo === 'object') {
        const ai = dataToUpdate.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
        const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
        expectedAICategories.forEach(catKey => {
            if (ai[catKey] === undefined) {
                (ai[catKey] as any) = []; // Ensure all AI categories are arrays if parent exists
            }
        });
    }

    const changedFields: string[] = [];
    const fieldChangesDetails: Record<string, {old: any; new: any}> = {};

    for (const key in dataToUpdate) {
      if (key === 'updatedAt' || key === 'history' || key === 'reviews' || key === 'createdAt') continue;

      const oldValue = currentCultivarData[key];
      const newValue = dataToUpdate[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields.push(key);
        fieldChangesDetails[key] = { old: oldValue, new: newValue };
      }
    }

    const { userId, details: userDetails } = getCurrentUserHistoryDetails();
    
    let eventMessage = "Cultivar Details Updated";
    const detailsForHistory: Record<string, any> = { ...userDetails };

    if (changedFields.length > 0) {
      detailsForHistory.updatedFields = changedFields; 
      detailsForHistory.changes = fieldChangesDetails; 
    } else {
      // If dataToUpdate.status has changed, it would be caught above.
      // If no *other* fields changed, and status didn't change, this block might not be hit often
      // unless an update is triggered with identical data.
      detailsForHistory.message = 'Update triggered, but no specific field changes detected by comparison.';
    }
    
    if (dataToUpdate.status && dataToUpdate.status !== currentCultivarData.status) {
        eventMessage = `Status changed from ${currentCultivarData.status || 'unknown'} to ${dataToUpdate.status}`;
        detailsForHistory.statusChange = { old: currentCultivarData.status, new: dataToUpdate.status };
        if (Array.isArray(detailsForHistory.updatedFields)) {
           detailsForHistory.updatedFields = detailsForHistory.updatedFields.filter((f: string) => f !== 'status');
           if (detailsForHistory.updatedFields.length === 0 && Object.keys(fieldChangesDetails).filter(k => k !== 'status').length === 0) {
             delete detailsForHistory.updatedFields;
             // If status was the *only* change, the eventMessage covers it.
             // We might not need to repeat it in updatedFields.
           }
        }
    }

    const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(),
        event: eventMessage,
        userId: userId,
        details: detailsForHistory
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
    const { userId, details: userDetails } = getCurrentUserHistoryDetails();

    const docSnap = await getDoc(cultivarDocRef);
    const oldStatus = docSnap.exists() ? docSnap.data().status : 'unknown';

    const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(),
        event: `Status changed from ${oldStatus || 'unknown'} to ${status}`,
        userId: userId,
        details: { ...userDetails, newStatus: status, oldStatus: oldStatus }
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
  const batchWrite = writeBatch(db);
  const timestamp = new Date().toISOString();
  const { userId, details: userDetails } = getCurrentUserHistoryDetails();

  // To get oldStatus for each, we'd need to fetch them first. 
  // For now, we'll mark oldStatus as 'batch-updated' or fetch if critical.
  // For simplicity, let's just indicate it's a batch update.
  for (const id of cultivarIds) {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
     // Fetching old status for each item in batch for more accurate logging
    const docSnap = await getDoc(cultivarDocRef);
    const oldStatus = docSnap.exists() ? docSnap.data().status : 'unknown';

    const historyEntry: CultivarHistoryEntry = {
      timestamp,
      event: `Status mass-changed from ${oldStatus || 'unknown'} to ${newStatus}`,
      userId: userId,
      details: { ...userDetails, newStatus: newStatus, oldStatus: oldStatus, operation: 'batch update' }
    };
    batchWrite.update(cultivarDocRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      history: arrayUnion(historyEntry)
    });
  }

  try {
    await batchWrite.commit();
  } catch (error) {
    console.error("Error updating multiple cultivar statuses: ", error);
    throw error;
  }
};


export const addReviewToCultivar = async (cultivarId: string, reviewData: Review): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, cultivarId); 
    const reviewToSave = {
      ...reviewData,
      createdAt: typeof reviewData.createdAt === 'string' ? reviewData.createdAt : new Date().toISOString(),
    };
    const { userId, details: userDetails } = getCurrentUserHistoryDetails();
    const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(),
        event: "Review Added",
        userId: userId, 
        details: { ...userDetails, reviewId: reviewToSave.id, rating: reviewToSave.rating, reviewerName: reviewData.user }
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

