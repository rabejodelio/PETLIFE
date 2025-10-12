'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore, useCollection, WithId } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const petsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'pets');
  }, [user, firestore]);

  const { data: pets, isLoading: arePetsLoading } = useCollection<PetProfile>(petsQuery);
  
  const profile = useMemo(() => {
    if (!pets || pets.length === 0) return null;
    // For now, we'll just use the first pet profile found.
    return pets[0];
  }, [pets]);


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
    if (user && firestore && profile) {
      try {
        const petDocRef = doc(firestore, 'users', user.uid, 'pets', profile.id);
        await updateDoc(petDocRef, newProfileData);
      } catch (error) {
        console.error('Failed to save pet profile to Firestore', error);
      }
    }
  }, [user, firestore, profile]);
  
  const clearProfile = useCallback(async () => {
    if (user && firestore && profile) {
      try {
        const petDocRef = doc(firestore, 'users', user.uid, 'pets', profile.id);
        await deleteDoc(petDocRef);
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

  const loading = isUserLoading || arePetsLoading || isActivityHistoryLoading;

  return { profile, saveProfile, clearProfile, loading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory };
}
