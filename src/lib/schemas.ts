import { z } from 'zod';

export const petProfileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    species: z.enum(['dog', 'cat']),
    sex: z.enum(['male', 'female'], { required_error: "Please select your pet's sex." }),
    sterilized: z.boolean().default(false),
    breed: z.string().min(2, { message: "Breed must be at least 2 characters." }),
    age: z.number().min(0, { message: "Age must be a positive number." }),
    weight: z.number().min(0, { message: "Weight must be a positive number." }),
    healthGoal: z.enum(['lose_weight', 'maintain_weight', 'improve_joints']),
    allergies: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});
