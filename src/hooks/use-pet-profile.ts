'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useFirebase, WithId, useCollection, useUser as useAuthUser, useFirestore as useFirebaseFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { isUserLoading } = useAuthUser();
  const user = useAuthUser().user;
  const firestore = useFirebaseFirestore();
  const [profile, setProfile] = useState<WithId<PetProfile> | null>(null);
  
  const petsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'pets');
  }, [user, firestore]);

  const { data: pets, isLoading: firestorePetsLoading } = useCollection<PetProfile>(petsQuery);

  useEffect(() => {
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
    if (user) {
      loadActivityHistory(user.uid);
    } else if (!isUserLoading) {
      setActivityHistory({});
      setIsActivityHistoryLoading(false);
    }
  }, [user, isUserLoading, loadActivityHistory]);

  const saveProfile = useCallback(async (newProfileData: Partial<PetProfile>) => {
    if (!user || !firestore || !profile?.id) {
      console.error("User, firestore, or profile ID is not available for saving.");
      return;
    }
    
    const petDocRef = doc(firestore, 'users', user.uid, 'pets', profile.id);
    
    const updatedProfile = { ...profile, ...newProfileData };
    
    try {
      await setDoc(petDocRef, newProfileData, { merge: true });
      // Update local state only after successful firestore write
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save pet profile, rolling back optimistic update', error);
      // No rollback needed as we now update state after success
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

  return { profile, saveProfile, clearProfile, loading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory, user, isUserLoading, firestore };
}

export const useUser = useAuthUser;
export const useFirestore = useFirebaseFirestore;
