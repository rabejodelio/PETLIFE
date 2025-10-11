'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser } from '@/firebase';

const getPetProfileKey = (userId: string) => `petlife-profile-${userId}`;
const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useUser();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback((userId: string) => {
    try {
      const profileItem = window.localStorage.getItem(getPetProfileKey(userId));
      setProfile(profileItem ? JSON.parse(profileItem) : null);
      
      const historyItem = window.localStorage.getItem(getActivityHistoryKey(userId));
      setActivityHistory(historyItem ? JSON.parse(historyItem) : {});
    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      setProfile(null);
      setActivityHistory({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUserLoading) {
      setLoading(true);
      return;
    }
    
    if (user) {
      loadData(user.uid);
    } else {
      setProfile(null);
      setActivityHistory({});
      setLoading(false);
    }
  }, [user, isUserLoading, loadData]);

  const saveProfile = useCallback((newProfile: PetProfile) => {
    if(user) {
      try {
        window.localStorage.setItem(getPetProfileKey(user.uid), JSON.stringify(newProfile));
        setProfile(newProfile);
      } catch (error) {
        console.error('Failed to save pet profile to localStorage', error);
      }
    }
  }, [user]);
  
  const clearProfile = useCallback(() => {
    if(user) {
      try {
        window.localStorage.removeItem(getPetProfileKey(user.uid));
        setProfile(null);
      } catch (error) {
        console.error('Failed to clear pet profile from localStorage', error);
      }
    }
  }, [user]);

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

  return { profile, saveProfile, clearProfile, loading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory };
}
