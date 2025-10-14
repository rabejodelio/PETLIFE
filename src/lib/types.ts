
import type { z } from 'zod';
import type { petProfileSchema } from './schemas';
import type { DocumentData } from 'firebase/firestore';

export type PetProfile = z.infer<typeof petProfileSchema> & { isPro?: boolean };

export type Activity = {
    type: string;
    duration: number;
    completed: boolean;
};

export type ActivityHistory = Record<string, Activity[]>;

// This is the shape of the denormalized user document
export interface UserDoc extends DocumentData {
    email: string;
    isPro?: boolean;
    petName?: string;
    petSpecies?: 'dog' | 'cat';
}
