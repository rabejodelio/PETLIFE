
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { PetProfileContext } from '@/hooks/use-pet-provider';
import { Logo } from '@/components/logo';

// This layout provides the PetProfileContext to the onboarding page.
// It replicates the necessary provider logic from the main DashboardLayout.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  // Minimal state needed for the provider, most values are placeholder
  // as the main goal is to provide the `saveProfile` function.
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  
  useEffect(() => {
    // If the user is not logged in while trying to access onboarding,
    // send them to the login page.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  // The core function needed by the onboarding page.
  const saveProfile = async (newProfileData: Partial<PetProfile>): Promise<void> => {
    if (!user || !firestore) {
      throw new Error("User not authenticated or Firestore not available.");
    }
    
    try {
      // Define a complete default profile
      const defaultProfile: PetProfile = {
        name: '',
        species: 'dog', // default value
        breed: '',
        age: 0,
        weight: 0,
        healthGoal: 'maintain_weight', // default value
        isPro: false,
        avatarUrl: '',
        allergies: '',
      };

      const updatedProfile = { ...defaultProfile, ...newProfileData };
      const petDocRef = doc(firestore, 'users', user.uid, 'pets', 'main-pet');
      await setDoc(petDocRef, updatedProfile, { merge: true });
      setProfile(updatedProfile); // Update local state
    } catch (error) {
      console.error("Firestore write failed:", error);
      // You might want to re-throw or handle this error with a toast
      throw error;
    }
  };

  // Placeholder functions to satisfy the context type
  const clearProfile = () => setProfile(null);
  const saveActivityHistory = (newHistory: ActivityHistory) => setActivityHistory(newHistory);
  const clearActivityHistory = () => setActivityHistory({});

  const contextValue = {
    profile,
    loading: isUserLoading,
    activityHistory,
    saveProfile,
    clearProfile,
    setActivityHistory: saveActivityHistory,
    clearActivityHistory,
  };

  // Show a loading indicator while Firebase auth state is being determined.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo />
      </div>
    );
  }

  // Once the user is confirmed, provide the context and render the page.
  return (
    <PetProfileContext.Provider value={contextValue}>
      {children}
    </PetProfileContext.Provider>
  );
}
