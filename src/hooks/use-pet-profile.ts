'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';

const PET_PROFILE_KEY = 'petlife-profile';
const ACTIVITY_HISTORY_KEY = 'petlife-activity-history';


export function usePetProfile() {
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const profileItem = window.localStorage.getItem(PET_PROFILE_KEY);
      if (profileItem) {
        setProfile(JSON.parse(profileItem));
      }
      const historyItem = window.localStorage.getItem(ACTIVITY_HISTORY_KEY);
       if (historyItem) {
        setActivityHistory(JSON.parse(historyItem));
      }

    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      setProfile(null);
      setActivityHistory({});
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback((newProfile: PetProfile) => {
    try {
      window.localStorage.setItem(PET_PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save pet profile to localStorage', error);
    }
  }, []);
  
  const clearProfile = useCallback(() => {
    try {
      window.localStorage.removeItem(PET_PROFILE_KEY);
      setProfile(null);
    } catch (error) {
      console.error('Failed to clear pet profile from localStorage', error);
    }
  }, []);

  const saveActivityHistory = useCallback((newHistory: ActivityHistory) => {
    try {
        window.localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(newHistory));
        setActivityHistory(newHistory);
    } catch (error) {
        console.error('Failed to save activity history to localStorage', error);
    }
  }, []);

  const clearActivityHistory = useCallback(() => {
    try {
        window.localStorage.removeItem(ACTIVITY_HISTORY_KEY);
        setActivityHistory({});
    } catch (error) {
        console.error('Failed to clear activity history from localStorage', error);
    }
  }, []);

  return { profile, saveProfile, clearProfile, loading, activityHistory, setActivityHistory: saveActivityHistory, clearActivityHistory };
}
