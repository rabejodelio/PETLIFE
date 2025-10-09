import type { z } from 'zod';
import type { petProfileSchema } from './schemas';

export type PetProfile = z.infer<typeof petProfileSchema>;
