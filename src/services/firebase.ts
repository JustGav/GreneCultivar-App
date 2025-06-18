
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
const SUBMITTED_CULTIVARS_COLLECTION = 'submitted_cultivars';

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
      // Attempt to parse if it's a string that might be an ISO string already
      const parsedDate = parseISO(timestamp);
      if (isValidDate(parsedDate)) {
          return parsedDate.toISOString();
      }
    }
    // Fallback for other Firestore Timestamp-like objects from admin SDK or older data
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    // If it's already a valid ISO string from a direct save (less likely with serverTimestamp)
    if (typeof timestamp === 'string' && isValidDate(parseISO(timestamp))) {
        return timestamp;
    }
    // Default to now if unparsable, though this indicates a data issue
    return new Date().toISOString();
  };

  const parseISO = (dateString: string) => new Date(dateString);
  const isValidDate = (date: Date) => !isNaN(date.getTime());

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
      createdAt: mapTimestampToString(review.createdAt || review.timestamp), // Handle older 'timestamp' field
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
      // No delete if empty, rules handle optional fields
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

// For admin use directly into main collection
export const addCultivar = async (cultivarDataInput: Partial<Omit<Cultivar, 'id' | 'reviews' | 'createdAt' | 'updatedAt' | 'history'>>): Promise<Cultivar> => {
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
      // Ensure all nested array fields exist for additionalInfo
       const ai = dataToSave.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
       const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
       expectedAICategories.forEach(catKey => {
         if (ai[catKey] === undefined) {
           (ai[catKey] as any) = [];
         }
       });
    } else if (dataToSave.additionalInfo === undefined) {
      dataToSave.additionalInfo = { geneticCertificate: [], plantPicture: [], cannabinoidInfo: [], terpeneInfo: [] };
    }


    const { userId, details: userDetails } = getCurrentUserHistoryDetails();
    const initialHistoryEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(), // Client-side timestamp, Firestore rule expects server timestamp for createdAt/updatedAt
        event: "Cultivar Created by Admin",
        userId: userId,
        details: { ...userDetails, status: dataToSave.status || 'recentlyAdded', source: dataToSave.source || 'Admin Input' }
    };

    const finalDataForFirestore = {
      ...dataToSave,
      reviews: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [initialHistoryEntry], // Firestore rules will check this structure
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
    console.error("Error adding cultivar (admin): ", error);
    throw error;
  }
};

// For user submissions to the 'submitted_cultivars' collection
export interface SubmittedCultivarData {
  name: string;
  sourceEmail: string; // User's email, will also be used as 'source'
  genetics?: Genetics;
  description?: string;
  effects?: string[];
  flavors?: string[];
  terpeneProfile?: { id: string; name: string; percentage?: undefined }[]; // Percentage not collected from users for simplicity
  primaryImageFile?: File; // For upload
  primaryImageAlt?: string;
  thc?: CannabinoidProfile;
  cbd?: CannabinoidProfile;
  // primaryImageDataAiHint is not part of user submission form
}

export const submitCultivarForReview = async (submissionData: SubmittedCultivarData): Promise<string> => {
  try {
    let imageUrl: string | undefined = undefined;
    if (submissionData.primaryImageFile) {
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${submissionData.primaryImageFile.name.replace(/\s+/g, '_')}`;
      imageUrl = await uploadImage(submissionData.primaryImageFile, `cultivar-images/user-submitted/${uniqueFileName}`);
    }

    const dataForFirestore: any = {
      name: submissionData.name,
      sourceEmail: submissionData.sourceEmail,
      source: submissionData.sourceEmail, // Set source field to the email
      genetics: submissionData.genetics,
      description: submissionData.description,
      effects: submissionData.effects || [],
      flavors: submissionData.flavors || [],
      terpeneProfile: submissionData.terpeneProfile?.map(tp => ({ name: tp.name, id: tp.id || tp.name })) || [],
      images: imageUrl ? [{ id: `img-sub-${Date.now()}`, url: imageUrl, alt: submissionData.primaryImageAlt || `${submissionData.name} submission` }] : [],
      thc: submissionData.thc || {},
      cbd: submissionData.cbd || {},
      status: 'User Submitted' as CultivarStatus,
      submittedAt: serverTimestamp(), // Firestore server-side timestamp
    };
    
    const cleanedData = prepareDataForFirestore(dataForFirestore); // Use the same cleaner for consistency
    const docRef = await addDoc(collection(db, SUBMITTED_CULTIVARS_COLLECTION), cleanedData);
    return docRef.id;
  } catch (error) {
    console.error("Error submitting cultivar for review: ", error);
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
                (ai[catKey] as any) = []; 
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
      // fieldChangesDetails can be large, so only include if truly necessary for audit.
      // detailsForHistory.changes = fieldChangesDetails; 
    }
    
    if (dataToUpdate.status && dataToUpdate.status !== currentCultivarData.status) {
        eventMessage = `Status changed from ${currentCultivarData.status || 'unknown'} to ${dataToUpdate.status}`;
        detailsForHistory.statusChange = { old: currentCultivarData.status, new: dataToUpdate.status };
    }

    const historyEntry: CultivarHistoryEntry = {
        timestamp: new Date().toISOString(), // Client-side, Firestore rule expects server timestamp for updatedAt
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
        timestamp: new Date().toISOString(), // Client-side
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
  const clientTimestamp = new Date().toISOString(); // Client-side timestamp for history entry
  const { userId, details: userDetails } = getCurrentUserHistoryDetails();

  for (const id of cultivarIds) {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
    // Fetch old status for more accurate logging
    const docSnap = await getDoc(cultivarDocRef); // This adds reads, consider if acceptable for large batches
    const oldStatus = docSnap.exists() ? docSnap.data().status : 'unknown';

    const historyEntry: CultivarHistoryEntry = {
      timestamp: clientTimestamp,
      event: `Status mass-changed from ${oldStatus || 'unknown'} to ${newStatus}`,
      userId: userId,
      details: { ...userDetails, newStatus: newStatus, oldStatus: oldStatus, operation: 'batch update' }
    };
    batchWrite.update(cultivarDocRef, {
      status: newStatus,
      updatedAt: serverTimestamp(), // Firestore server-side timestamp
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
        timestamp: new Date().toISOString(), // Client-side
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


    