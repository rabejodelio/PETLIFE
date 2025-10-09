'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PetProfile } from '@/lib/types';

const PET_PROFILE_KEY = 'petlife-profile';

export function usePetProfile() {
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(PET_PROFILE_KEY);
      if (item) {
        setProfile(JSON.parse(item));
      }
    } catch (error) {
      console.error('Failed to parse pet profile from localStorage', error);
      setProfile(null);
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

  return { profile, saveProfile, clearProfile, loading };
}
