import type { z } from 'zod';
import type { petProfileSchema } from './schemas';

export type PetProfile = z.infer<typeof petProfileSchema>;

export type Activity = {
    type: string;
    duration: number;
    completed: boolean;
};

export type ActivityHistory = Record<string, Activity[]>;
