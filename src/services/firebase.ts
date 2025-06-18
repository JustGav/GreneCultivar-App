
import { db, storage } from '@/lib/firebase-config';
import type { Cultivar, Review, CannabinoidProfile, PlantCharacteristics, AdditionalFileInfo, AdditionalInfoCategoryKey, Terpene, PricingProfile, YieldProfile, CultivarImage, CultivarStatus } from '@/types';
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
  return {
    id,
    name: data.name,
    genetics: data.genetics,
    status: data.status || 'recentlyAdded', // Default status if not present
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
      createdAt: review.createdAt instanceof Timestamp ? review.createdAt.toDate().toISOString() : review.createdAt,
    })),
    cultivationPhases: data.cultivationPhases,
    plantCharacteristics: data.plantCharacteristics as PlantCharacteristics | undefined,
    additionalInfo: data.additionalInfo,
    terpeneProfile: data.terpeneProfile || [],
    pricing: data.pricing as PricingProfile | undefined,
    supplierUrl: data.supplierUrl,
    parents: data.parents || [],
    children: data.children || [],
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
  return cleanedData;
};

export const addCultivar = async (cultivarDataInput: Omit<Cultivar, 'id' | 'reviews' | 'status'> & { source?: string }): Promise<Cultivar> => {
  try {
    const dataToSave: { [key: string]: any } = {};
    for (const key in cultivarDataInput) {
      if (cultivarDataInput[key as keyof typeof cultivarDataInput] !== undefined) {
        dataToSave[key] = cultivarDataInput[key as keyof typeof cultivarDataInput];
      }
    }

    const arrayFields: (keyof (Omit<Cultivar, 'id' | 'reviews' | 'status'> & { source?: string }))[] = ['images', 'parents', 'children', 'effects', 'medicalEffects', 'terpeneProfile'];
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

    const finalDataForFirestore = {
      ...dataToSave,
      status: 'recentlyAdded' as CultivarStatus, // Default status for new cultivars
      reviews: [], 
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


export const updateCultivar = async (id: string, cultivarData: Partial<Cultivar>): Promise<void> => {
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

    await updateDoc(cultivarDocRef, cleanedData);
  } catch (error) {
    console.error(`Error updating cultivar with ID ${id}: `, error);
    throw error;
  }
};

export const updateCultivarStatus = async (id: string, status: CultivarStatus): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, id);
    await updateDoc(cultivarDocRef, { status });
  } catch (error) {
    console.error(`Error updating status for cultivar with ID ${id}: `, error);
    throw error;
  }
};


export const addReviewToCultivar = async (cultivarId: string, reviewData: Review): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, cultivarId);
    const reviewToSave = {
      ...reviewData,
      createdAt: typeof reviewData.createdAt === 'string' ? reviewData.createdAt : new Date(reviewData.createdAt).toISOString(),
    };
    await updateDoc(cultivarDocRef, {
      reviews: arrayUnion(reviewToSave)
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    throw error;
  }
};
