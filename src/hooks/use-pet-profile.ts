'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore, useCollection, WithId } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;
const getProfileKey = (userId: string) => `petlife-profile-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<WithId<PetProfile> | null>(null);
  const [arePetsLoading, setArePetsLoading] = useState(true);

  const petsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'pets');
  }, [user, firestore]);

  const { data: pets, isLoading: firestorePetsLoading } = useCollection<PetProfile>(petsQuery);

  useEffect(() => {
    if (isUserLoading) {
        setArePetsLoading(true);
        return;
    }
    if (!user) {
        setProfile(null);
        setArePetsLoading(false);
        return;
    }
    
    // Attempt to load from localStorage first for speed
    const localProfileItem = window.localStorage.getItem(getProfileKey(user.uid));
    if (localProfileItem) {
        try {
            const localProfiles = JSON.parse(localProfileItem);
            if (localProfiles && localProfiles.length > 0) {
                setProfile(localProfiles[0]);
                setArePetsLoading(false);
                return; // Exit if we have a local profile
            }
        } catch (e) {
            console.error("Failed to parse local profile", e);
        }
    }

    // If no local profile, use Firestore data
    if (!firestorePetsLoading) {
      if (pets && pets.length > 0) {
        const firstProfile = pets[0];
        setProfile(firstProfile);
        window.localStorage.setItem(getProfileKey(user.uid), JSON.stringify([firstProfile]));
      } else {
        setProfile(null);
      }
      setArePetsLoading(false);
    }

  }, [user, isUserLoading, pets, firestorePetsLoading]);


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

  const saveProfile = useCallback(async (newProfileData: Partial<PetProfile> & { id: string }) => {
    if (user && firestore && newProfileData.id) {
        const petDocRef = doc(firestore, 'users', user.uid, 'pets', newProfileData.id);
        const fullProfile = { ...profile, ...newProfileData } as WithId<PetProfile>;
        
        try {
            await setDoc(petDocRef, newProfileData, { merge: true });
            setProfile(fullProfile);
            window.localStorage.setItem(getProfileKey(user.uid), JSON.stringify([fullProfile]));
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
        window.localStorage.removeItem(getProfileKey(user.uid));
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

  const loading = arePetsLoading || isActivityHistoryLoading;

  return { profile, saveProfile, clearProfile, loading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory };
}
