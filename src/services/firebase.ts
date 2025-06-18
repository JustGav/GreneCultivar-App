
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

export const addCultivar = async (cultivarData: Omit<Cultivar, 'id' | 'reviews'>): Promise<Cultivar> => {
  try {
    const docRef = await addDoc(collection(db, CULTIVARS_COLLECTION), {
      ...cultivarData,
      reviews: [], // Initialize with empty reviews array
    });
    return { ...cultivarData, id: docRef.id, reviews: [] };
  } catch (error) {
    console.error("Error adding cultivar: ", error);
    throw error;
  }
};

export const addReviewToCultivar = async (cultivarId: string, reviewData: Review): Promise<void> => {
  try {
    const cultivarDocRef = doc(db, CULTIVARS_COLLECTION, cultivarId);
    // Ensure createdAt is a Firestore compatible format or a server timestamp
    // For client-side date, ensure it's an ISO string or convert to Timestamp if needed.
    // Firebase's arrayUnion will add the review object to the reviews array.
    await updateDoc(cultivarDocRef, {
      reviews: arrayUnion({
        ...reviewData,
        // createdAt is already an ISO string from ReviewForm
      })
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    throw error;
  }
};
