
'use client';

import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

// Define the shape of the context
interface PetProfileContextType {
  profile: PetProfile | null;
  loading: boolean;
  activityHistory: ActivityHistory;
  isUserLoading: boolean;
  petDocRef: DocumentReference<DocumentData> | null;
  saveProfile: (newProfileData: PetProfile) => void;
  clearProfile: () => void;
  setActivityHistory: (newHistory: ActivityHistory) => void;
  clearActivityHistory: () => void;
}

// Create the context with a default undefined value
const PetProfileContext = createContext<PetProfileContextType | undefined>(undefined);


// Create the Provider component
export function PetProfileProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [isActivityHistoryLoading, setIsActivityHistoryLoading] = useState(true);

  const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const petDocRef: DocumentReference<DocumentData> | null = useMemo(() => {
    if (userDocRef) {
      // All pets are stored under a 'pets' subcollection with a static ID for simplicity
      return doc(userDocRef, 'pets', 'main-pet');
    }
    return null;
  }, [userDocRef]);

  // Effect to listen for pet profile changes from Firestore
  useEffect(() => {
    if (!petDocRef) {
      if (!isUserLoading) {
        setProfile(null);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(petDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as PetProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, 
      (error) => {
        console.error("Failed to fetch pet profile from Firestore", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [petDocRef, isUserLoading]);
  
  // Load activity history from local storage
  const loadActivityHistory = useCallback((userId: string) => {
    setIsActivityHistoryLoading(true);
    try {
      const historyItem = window.localStorage.getItem(getActivityHistoryKey(userId));
      setActivityHistory(historyItem ? JSON.parse(historyItem) : {});
    } catch (error) {
      console.error('Failed to parse activity history from localStorage', error);
      setActivityHistory({});
    } finally {
      setIsActivityHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadActivityHistory(user.uid);
    } else if (!isUserLoading) {
      setActivityHistory({});
      setIsActivityHistoryLoading(false);
    }
  }, [user, isUserLoading, loadActivityHistory]);


  // Save profile data to Firestore and update local state
  const saveProfile = useCallback((newProfileData: PetProfile) => {
    if (!petDocRef || !userDocRef) {
      console.error("User or Firestore not available for saving.");
      return;
    }
    
    // Directly update the state to ensure UI reactivity
    setProfile(newProfileData);

    const denormalizedPetData = {
      petName: newProfileData.name,
      petSpecies: newProfileData.species,
      isPro: newProfileData.isPro,
    };
    
    // Perform writes without making the UI wait
    setDoc(petDocRef, newProfileData, { merge: true });
    setDoc(userDocRef, denormalizedPetData, { merge: true });

  }, [petDocRef, userDocRef]);
  
  // Clear local profile state
  const clearProfile = useCallback(() => {
    setProfile(null);
  }, []);

  // Save activity history to local storage
  const saveActivityHistory = useCallback((newHistory: ActivityHistory) => {
    if(user) {
      try {
          window.localStorage.setItem(getActivityHistoryKey(user.uid), JSON.stringify(newHistory));
          setActivityHistory(newHistory);
      } catch (error) {
          console.error('Failed to save activity history to localStorage', error);
      }
    }
  }, [user]);

  // Clear activity history from local storage
  const clearActivityHistory = useCallback(() => {
    if (user) {
      try {
          window.localStorage.removeItem(getActivityHistoryKey(user.uid));
          setActivityHistory({});
      } catch (error) {
          console.error('Failed to clear activity history from localStorage', error);
      }
    }
  }, [user]);

  // Ensure user document exists on user load
  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (!docSnap.exists()) {
          setDoc(userDocRef, { email: user.email, id: user.uid });
        }
      });
    }
  }, [user, firestore]);


  // Combine loading states
  const overallLoading = isUserLoading || loading || isActivityHistoryLoading;

  // Memoize the context value
  const value = useMemo(() => ({
    profile,
    loading: overallLoading,
    activityHistory,
    isUserLoading,
    petDocRef,
    saveProfile,
    clearProfile,
    setActivityHistory: saveActivityHistory,
    clearActivityHistory
  }), [profile, overallLoading, activityHistory, isUserLoading, petDocRef, saveProfile, clearProfile, saveActivityHistory, clearActivityHistory]);

  return (
    <PetProfileContext.Provider value={value}>
      {children}
    </PetProfileContext.Provider>
  );
}

// Create the custom hook to use the context
export function usePetProfile(): PetProfileContextType {
  const context = useContext(PetProfileContext);
  if (context === undefined) {
    throw new Error('usePetProfile must be used within a PetProfileProvider');
  }
  return context;
}
