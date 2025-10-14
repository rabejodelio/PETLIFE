
import type { z } from 'zod';
import type { DocumentData } from 'firebase/firestore';

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
}
