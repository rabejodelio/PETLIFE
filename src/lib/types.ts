import type { z } from 'zod';
import type { petProfileSchema } from './schemas';
import type { DocumentData } from 'firebase/firestore';

export type PetProfile = z.infer<typeof petProfileSchema> & { isPro?: boolean };

export type Activity = {
    type: string;
    duration: number;
    completed: boolean;
};

// This is the shape of the denormalized user document
export interface UserDoc extends DocumentData {
    email: string;
    isPro: boolean;
}
