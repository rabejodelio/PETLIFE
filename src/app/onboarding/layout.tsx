'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { PetProfile } from '@/lib/types';
import { PetProfileContext } from '@/hooks/use-pet-provider';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';


export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  

  useEffect(() => {
    if (!user || !firestore) {
      if (!isUserLoading) {
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);

    const petDocRef = doc(firestore, 'users', user.uid, 'pets', 'main-pet');

    getDoc(petDocRef).then((docSnap) => {
        if (docSnap.exists()) {
            setProfile(docSnap.data() as PetProfile);
        } else {
            setProfile(null);
        }
    }).catch(error => {
        console.error("Error fetching pet profile:", error);
        setProfile(null);
    }).finally(() => {
        setLoading(false);
    });

  }, [user, firestore, isUserLoading]);


  const saveProfile = async (newProfileData: Partial<PetProfile>): Promise<void> => {
    if (!user || !firestore) {
      throw new Error("User not authenticated or Firestore not available.");
    }
    
    const currentProfile: PetProfile = profile || {
      name: '',
      species: 'dog',
      sex: 'female',
      sterilized: false,
      breed: '',
      age: 0,
      weight: 0,
      healthGoal: 'maintain_weight',
      isPro: false,
      avatarUrl: '',
      allergies: '',
    };
  
    const updatedProfile = { ...currentProfile, ...newProfileData, isPro: profile?.isPro || false };
  
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


  const contextValue = {
    profile,
    loading: loading || isUserLoading,
    saveProfile,
    clearProfile,
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
