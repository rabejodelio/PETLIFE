'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import type { PetProfile } from '@/lib/types';

// 1. Définition du type pour le contexte
// C'est la "forme" des données que notre contexte va fournir.
interface PetProfileContextType {
  profile: PetProfile | null;
  loading: boolean;
  saveProfile: (newProfileData: Partial<PetProfile>) => Promise<void>;
  clearProfile: () => void;
}

// 2. Création du Contexte
// Nous créons un contexte avec une valeur initiale de `undefined`.
// C'est pourquoi nous devons toujours vérifier si le contexte est utilisé à l'intérieur d'un Provider.
export const PetProfileContext = createContext<PetProfileContextType | undefined>(undefined);


// 3. Création du Hook personnalisé `usePetProfile`
// Ce hook simplifie l'accès au contexte pour les composants enfants.
export function usePetProfile(): PetProfileContextType {
  const context = useContext(PetProfileContext);
  if (context === undefined) {
    // Si un composant essaie d'utiliser ce hook sans être enveloppé par le Provider,
    // nous lançons une erreur claire pour le développeur.
    throw new Error('usePetProfile doit être utilisé à l’intérieur d’un PetProfileProvider');
  }
  return context;
}
