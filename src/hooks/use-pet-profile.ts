
'use client';

import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

// 1. Définir la forme du contexte
interface PetProfileContextType {
  profile: PetProfile | null;
  loading: boolean;
  activityHistory: ActivityHistory;
  saveProfile: (newProfileData: Partial<PetProfile>) => Promise<void>;
  clearProfile: () => void;
  setActivityHistory: (newHistory: ActivityHistory) => void;
  clearActivityHistory: () => void;
}

// 2. Créer le contexte avec une valeur par défaut
const PetProfileContext = createContext<PetProfileContextType | undefined>(undefined);

// 3. Créer le composant Provider
export function PetProfileProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Mémoriser les références Firestore pour éviter les re-créations inutiles
  const userDocRef = useMemo(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const petDocRef = useMemo(() => (userDocRef ? doc(userDocRef, 'pets', 'main-pet') : null), [userDocRef]);

  // Effet pour charger et écouter le profil de l'animal
  useEffect(() => {
    if (!petDocRef) {
      if (!isUserLoading) {
        setProfile(null);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(petDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PetProfile;
        setProfile(data);
        if (userDocRef) {
          setDoc(userDocRef, { petName: data.name, petSpecies: data.species, isPro: data.isPro }, { merge: true });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erreur de chargement du profil depuis Firestore :", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [petDocRef, userDocRef, isUserLoading]);

  // Effet pour charger l'historique d'activité depuis le localStorage
  useEffect(() => {
    if (user) {
      setIsHistoryLoading(true);
      const key = getActivityHistoryKey(user.uid);
      try {
        const storedHistory = localStorage.getItem(key);
        setActivityHistory(storedHistory ? JSON.parse(storedHistory) : {});
      } catch (e) {
        console.error("Impossible de lire l'historique d'activité :", e);
        setActivityHistory({});
      }
      setIsHistoryLoading(false);
    } else if (!isUserLoading) {
      setActivityHistory({});
      setIsHistoryLoading(false);
    }
  }, [user, isUserLoading]);

  const clearProfile = useCallback(() => {
    setProfile(null);
  }, []);

  const clearActivityHistory = useCallback(() => {
    if (user) {
      setActivityHistory({});
      localStorage.removeItem(getActivityHistoryKey(user.uid));
    }
  }, [user]);

  const saveProfile = useCallback(async (newProfileData: Partial<PetProfile>) => {
    if (!petDocRef || !userDocRef) {
      console.error("Sauvegarde impossible : utilisateur non connecté ou références non prêtes.");
      return;
    }
    
    // Mise à jour optimiste de l'UI
    const updatedProfile = { ...(profile || {} as PetProfile), ...newProfileData } as PetProfile;
    setProfile(updatedProfile);

    // Sauvegarde dans Firestore
    await setDoc(petDocRef, newProfileData, { merge: true });
    await setDoc(userDocRef, { petName: updatedProfile.name, petSpecies: updatedProfile.species, isPro: updatedProfile.isPro }, { merge: true });

  }, [petDocRef, userDocRef, profile]);
  
  const saveActivityHistory = useCallback((newHistory: ActivityHistory) => {
    if (user) {
      setActivityHistory(newHistory);
      localStorage.setItem(getActivityHistoryKey(user.uid), JSON.stringify(newHistory));
    }
  }, [user]);

  // Assurer l'existence du document utilisateur
  useEffect(() => {
    if (user && userDocRef) {
      getDoc(userDocRef).then(docSnap => {
        if (!docSnap.exists()) {
          setDoc(userDocRef, { email: user.email, id: user.uid });
        }
      });
    }
  }, [user, userDocRef]);

  const contextValue = useMemo(() => ({
    profile,
    loading: loading || isUserLoading || isHistoryLoading,
    activityHistory,
    saveProfile,
    clearProfile,
    setActivityHistory: saveActivityHistory,
    clearActivityHistory,
  }), [profile, loading, isUserLoading, isHistoryLoading, activityHistory, saveProfile, clearProfile, saveActivityHistory, clearActivityHistory]);

  return (
    <PetProfileContext.Provider value={contextValue}>
      {children}
    </PetProfileContext.Provider>
  );
}

// 4. Créer le hook personnalisé pour utiliser le contexte
export function usePetProfile(): PetProfileContextType {
  const context = useContext(PetProfileContext);
  if (context === undefined) {
    throw new Error('usePetProfile doit être utilisé à l\'intérieur d\'un PetProfileProvider');
  }
  return context;
}
