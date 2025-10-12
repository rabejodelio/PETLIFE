'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser as useAuthUser } from '@/firebase';

const getProfileKey = (userId: string) => `petlife-profile-${userId}`;
const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

export function usePetProfile() {
  const { user, isUserLoading } = useAuthUser();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [isActivityHistoryLoading, setIsActivityHistoryLoading] = useState(true);

  const loadProfile = useCallback((userId: string) => {
    setLoading(true);
    try {
      const profileItem = window.localStorage.getItem(getProfileKey(userId));
      if (profileItem) {
        setProfile(JSON.parse(profileItem));
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to parse profile from localStorage', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
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
      loadProfile(user.uid);
      loadActivityHistory(user.uid);
    } else if (!isUserLoading) {
      setProfile(null);
      setActivityHistory({});
      setLoading(false);
      setIsActivityHistoryLoading(false);
    }
  }, [user, isUserLoading, loadProfile, loadActivityHistory]);

  const saveProfile = useCallback((newProfileData: PetProfile) => {
    if (!user) {
      console.error("User is not available for saving.");
      return;
    }
    try {
        window.localStorage.setItem(getProfileKey(user.uid), JSON.stringify(newProfileData));
        setProfile(newProfileData);
    } catch (error) {
        console.error('Failed to save pet profile to localStorage', error);
    }
  }, [user]);
  
  const clearProfile = useCallback(() => {
    if (user) {
      try {
        window.localStorage.removeItem(getProfileKey(user.uid));
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

  const overallLoading = isUserLoading || loading || isActivityHistoryLoading;

  return { profile, saveProfile, clearProfile, loading: overallLoading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory, user, isUserLoading };
}

export const useUser = useAuthUser;
export const useFirestore = () => null;
