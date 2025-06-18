
import { db } from '@/lib/firebase-config';
import type { Cultivar, Review, CannabinoidProfile, PlantCharacteristics, AdditionalFileInfo, AdditionalInfoCategoryKey, Terpene, PricingProfile, YieldProfile } from '@/types';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  DocumentData,
  query,
  orderBy,
  where
} from 'firebase/firestore';

const CULTIVARS_COLLECTION = 'cultivars';

const mapDocToCultivar = (docData: DocumentData, id: string): Cultivar => {
  const data = docData as any; 
  return {
    id,
    name: data.name,
    genetics: data.genetics,
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
    const q = query(cultivarsCol, orderBy('name')); // Default sort by name
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

export const addCultivar = async (cultivarDataInput: Omit<Cultivar, 'id' | 'reviews'>): Promise<Cultivar> => {
  try {
    const dataToSave: { [key: string]: any } = {};
    // Filter out undefined top-level properties from the input
    for (const key in cultivarDataInput) {
      if (cultivarDataInput[key as keyof typeof cultivarDataInput] !== undefined) {
        dataToSave[key] = cultivarDataInput[key as keyof typeof cultivarDataInput];
      }
    }

    // Ensure specific fields that should be arrays are at least empty arrays if not present/defined in dataToSave
    const arrayFields: (keyof Omit<Cultivar, 'id' | 'reviews'>)[] = ['images', 'parents', 'children', 'effects', 'medicalEffects', 'terpeneProfile'];
    arrayFields.forEach(field => {
      if (dataToSave[field] === undefined) {
        dataToSave[field] = [];
      }
    });

    // Ensure additionalInfo and its sub-arrays are structured, defaulting to empty arrays
    if (dataToSave.additionalInfo && typeof dataToSave.additionalInfo === 'object') {
      const ai = dataToSave.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
      // Ensure each category under additionalInfo defaults to an empty array if undefined
      (Object.keys(ai) as (keyof NonNullable<Cultivar['additionalInfo']>)[]).forEach(catKey => {
        if (ai[catKey] === undefined) {
          (ai[catKey] as any) = [];
        }
      });
      // Also ensure all expected categories exist, even if not in cultivarDataInput
      const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
      expectedAICategories.forEach(catKey => {
        if (ai[catKey] === undefined) {
          (ai[catKey] as any) = [];
        }
      });

    } else {
      // If additionalInfo is missing or not an object from cultivarDataInput, initialize it fully
      dataToSave.additionalInfo = {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
      };
    }
    
    // Explicitly ensure reviews are initialized here as they are not part of cultivarDataInput type
    const finalDataForFirestore = {
      ...dataToSave,
      reviews: [], 
    };

    const docRef = await addDoc(collection(db, CULTIVARS_COLLECTION), finalDataForFirestore);

    // Fetch the just-saved document to ensure the returned object matches what's in DB
    const savedDoc = await getDoc(docRef);
    if (!savedDoc.exists()) {
        throw new Error("Failed to retrieve saved cultivar post-creation.");
    }
    return mapDocToCultivar(savedDoc.data(), savedDoc.id);

  } catch (error) {
    console.error("Error adding cultivar: ", error);
    throw error; // Re-throw to allow UI to handle it
  }
};

export const addReviewToCultivar = async (cultivarId: string, reviewData: Review): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, cultivarId);
    await updateDoc(cultivarDocRef, {
      reviews: arrayUnion({
        ...reviewData,
      })
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    throw error;
  }
};
