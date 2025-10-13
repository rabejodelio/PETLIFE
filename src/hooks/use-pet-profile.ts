'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, DocumentReference, DocumentData } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [isActivityHistoryLoading, setIsActivityHistoryLoading] = useState(true);

  // Memoize the user and pet document references
  const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const petDocRef: DocumentReference<DocumentData> | null = useMemo(() => {
    if (userDocRef) {
      // For simplicity, we'll assume one pet per user and use a fixed ID.
      return doc(userDocRef, 'pets', 'main-pet');
    }
    return null;
  }, [userDocRef]);

  // Effect to subscribe to pet profile changes
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
  
  // Load activity history from localStorage (this can remain local)
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

  const saveProfile = useCallback((newProfileData: PetProfile) => {
    if (!petDocRef || !userDocRef) {
      console.error("User or Firestore not available for saving.");
      return;
    }

    // Save the full pet profile to its own document
    setDocumentNonBlocking(petDocRef, newProfileData, { merge: true });

    // Denormalize key information to the parent user document for easy querying
    const denormalizedPetData = {
      petName: newProfileData.name,
      petSpecies: newProfileData.species,
      isPro: newProfileData.isPro,
    };
    setDocumentNonBlocking(userDocRef, denormalizedPetData, { merge: true });

    // Optimistically update local state
    setProfile(newProfileData);
  }, [petDocRef, userDocRef]);
  
  const clearProfile = useCallback(() => {
    // This would now involve deleting the document in Firestore,
    // which is a destructive action we might not want to expose lightly.
    // For now, we'll just clear the local state.
    setProfile(null);
  }, []);

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

  // Create user document on first sign-in if it doesn't exist
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

  const overallLoading = isUserLoading || loading || isActivityHistoryLoading;

  return { profile, saveProfile, clearProfile, loading: overallLoading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory, user, isUserLoading, petDocRef };
}
