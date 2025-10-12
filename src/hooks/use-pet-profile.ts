'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore, useCollection, WithId } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<WithId<PetProfile> | null>(null);
  
  const petsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'pets');
  }, [user, firestore]);

  const { data: pets, isLoading: firestorePetsLoading } = useCollection<PetProfile>(petsQuery);

  useEffect(() => {
    // Only update profile from Firestore collection changes
    if (!firestorePetsLoading) {
      if (pets && pets.length > 0) {
        setProfile(pets[0]); // Always use the first pet profile
      } else {
        setProfile(null);
      }
    }
  }, [pets, firestorePetsLoading]);


  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [isActivityHistoryLoading, setIsActivityHistoryLoading] = useState(true);

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
    if (isUserLoading) {
      setIsActivityHistoryLoading(true);
      return;
    }
    
    if (user) {
      loadActivityHistory(user.uid);
    } else {
      setActivityHistory({});
      setIsActivityHistoryLoading(false);
    }
  }, [user, isUserLoading, loadActivityHistory]);

  const saveProfile = useCallback(async (newProfileData: Partial<PetProfile>) => {
    if (user && firestore && profile?.id) { // Ensure there is a profile to update
        const petDocRef = doc(firestore, 'users', user.uid, 'pets', profile.id);
        const updatedProfile = { ...profile, ...newProfileData } as WithId<PetProfile>;
        
        try {
            await setDoc(petDocRef, newProfileData, { merge: true });
            setProfile(updatedProfile); // Optimistically update local state
        } catch (error) {
            console.error('Failed to save pet profile', error);
        }
    }
  }, [user, firestore, profile]);
  
  const clearProfile = useCallback(async () => {
    if (user && firestore && profile) {
      try {
        const petDocRef = doc(firestore, 'users', user.uid, 'pets', profile.id);
        await deleteDoc(petDocRef);
        setProfile(null);
      } catch (error) {
        console.error('Failed to clear pet profile from Firestore', error);
      }
    }
  }, [user, firestore, profile]);

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

  const loading = isUserLoading || firestorePetsLoading || isActivityHistoryLoading;

  return { profile, saveProfile, clearProfile, loading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory };
}
