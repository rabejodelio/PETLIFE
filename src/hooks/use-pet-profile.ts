'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [isActivityHistoryLoading, setIsActivityHistoryLoading] = useState(true);

  // Memoize the pet document reference
  const petDocRef = useMemo(() => {
    if (user && firestore) {
      // For simplicity, we'll assume one pet per user and use a fixed ID.
      // In a real multi-pet app, you'd manage multiple pet IDs.
      return doc(firestore, 'users', user.uid, 'pets', 'main-pet');
    }
    return null;
  }, [user, firestore]);

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
    if (!petDocRef) {
      console.error("User or Firestore not available for saving.");
      return;
    }
    // Use non-blocking write for better UX
    setDocumentNonBlocking(petDocRef, newProfileData, { merge: true });
    // Optimistically update local state
    setProfile(newProfileData);
  }, [petDocRef]);
  
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

  return { profile, saveProfile, clearProfile, loading: overallLoading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory, user, isUserLoading };
}
