'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { PetProfileContext } from '@/hooks/use-pet-provider';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const { toast } = useToast();

  const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;
  
  useEffect(() => {
    if (!user || !firestore) {
      if (!isUserLoading) {
        setLoading(false);
      }
      return;
    }
    setLoading(false);
  }, [user, firestore, isUserLoading]);


  const saveProfile = async (newProfileData: Partial<PetProfile>): Promise<void> => {
    if (!user || !firestore) {
      throw new Error("User not authenticated or Firestore not available.");
    }
    
    const currentProfile: PetProfile = {
      name: '',
      species: 'dog',
      breed: '',
      age: 0,
      weight: 0,
      healthGoal: 'maintain_weight',
      isPro: false,
      avatarUrl: '',
      allergies: '',
      ...profile, // existing profile data
    };
  
    const updatedProfile = { ...currentProfile, ...newProfileData };
  
    try {
      const petDocRef = doc(firestore, 'users', user.uid, 'pets', 'main-pet');
      await setDoc(petDocRef, updatedProfile, { merge: true });
      setProfile(updatedProfile); // Optimistic update
    } catch (error) {
      console.error("Firestore write failed:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the pet profile to the database.",
      });
      throw error; 
    }
  };

  const clearProfile = () => setProfile(null);

  const saveActivityHistory = (newHistory: ActivityHistory) => {
    if (user) {
      setActivityHistory(newHistory);
      localStorage.setItem(getActivityHistoryKey(user.uid), JSON.stringify(newHistory));
    }
  };

  const clearActivityHistory = () => {
    if (user) {
      setActivityHistory({});
      localStorage.removeItem(getActivityHistoryKey(user.uid));
    }
  };

  const contextValue = {
    profile,
    loading: loading || isUserLoading,
    activityHistory,
    saveProfile,
    clearProfile,
    setActivityHistory: saveActivityHistory,
    clearActivityHistory,
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo />
      </div>
    );
  }

  return (
    <PetProfileContext.Provider value={contextValue}>
      {children}
    </PetProfileContext.Provider>
  );
}