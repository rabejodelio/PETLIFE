
import type { z } from 'zod';
import type { petProfileSchema } from './schemas';
import type { DocumentData } from 'firebase/firestore';

export type PetProfile = z.infer<typeof petProfileSchema>;

export type Activity = {
    type: string;
    duration: number;
    completed: boolean;
};

export type ActivityHistory = Record<string, Activity[]>;

// This is the shape of the denormalized user document
export interface UserDoc extends DocumentData {
    email: string;
    petName?: string;
    petSpecies?: 'dog' | 'cat';
    isPro?: boolean;
}
