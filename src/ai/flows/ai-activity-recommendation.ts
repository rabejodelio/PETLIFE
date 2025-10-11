'use server';
/**
 * @fileOverview Provides AI-driven activity recommendations tailored to a pet's profile and health goals.
 *
 * - getActivityRecommendations - A function that generates activity recommendations.
 * - ActivityRecommendationInput - The input type for the getActivityRecommendations function.
 * - ActivityRecommendationOutput - The return type for the getActivityRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActivityRecommendationInputSchema = z.object({
  species: z.enum(['dog', 'cat']).describe('The species of the pet (dog or cat).'),
  breed: z.string().describe('The breed of the pet.'),
  age: z.number().describe('The age of the pet in years.'),
  healthGoal: z.enum(['lose_weight', 'maintain_weight', 'improve_joints']).describe('The primary health goal for the pet.'),
});
export type ActivityRecommendationInput = z.infer<typeof ActivityRecommendationInputSchema>;

const ActivityRecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of 3-4 short, actionable activity recommendations tailored to the pet.'),
});
export type ActivityRecommendationOutput = z.infer<typeof ActivityRecommendationOutputSchema>;


export async function getActivityRecommendations(input: ActivityRecommendationInput): Promise<ActivityRecommendationOutput> {
    return activityRecommendationFlow(input);
}


const activityRecommendationPrompt = ai.definePrompt({
    name: 'activityRecommendationPrompt',
    input: {schema: ActivityRecommendationInputSchema},
    output: {schema: ActivityRecommendationOutputSchema},
    prompt: `You are an AI assistant specializing in pet health and wellness.

    Based on the following information, provide a list of 3-4 short, actionable activity recommendations. The recommendations should be tailored to the pet's species, breed, age, and specific health goal.

    Species: {{{species}}}
    Breed: {{{breed}}}
    Age: {{{age}}} years
    Health Goal: {{{healthGoal}}}

    For example, if the goal is "lose_weight" for a dog, you might suggest "Incorporate incline walks (hills) to burn more calories."
    If the goal is "improve_joints" for an older cat, you might suggest "Gentle play with a feather wand for 5-10 minutes, twice a day, to encourage movement without stress."

    Return a list of recommendations.`,
});

const activityRecommendationFlow = ai.defineFlow(
    {
        name: 'activityRecommendationFlow',
        inputSchema: ActivityRecommendationInputSchema,
        outputSchema: ActivityRecommendationOutputSchema,
    },
    async input => {
        const {output} = await activityRecommendationPrompt(input);
        return output!;
    }
);
