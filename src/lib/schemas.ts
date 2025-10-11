import { z } from 'zod';

export const petProfileSchema = z.object({
  name: z.string().min(1, 'Pet name is required.'),
  species: z.enum(['dog', 'cat'], { required_error: 'Please select a species.' }),
  breed: z.string().min(1, 'Breed is required.'),
  age: z.coerce.number().min(0, 'Age must be a positive number.').max(30, 'Age seems a bit high!'),
  weight: z.coerce.number().min(0.1, 'Weight must be a positive number.').max(100, 'Weight seems a bit high!'),
  allergies: z.string().optional(),
  healthGoal: z.enum(['lose_weight', 'maintain_weight', 'improve_joints'], { required_error: 'Please select a health goal.' }),
  avatarUrl: z.string().url().optional(),
  isPro: z.boolean().optional().default(false),
});
