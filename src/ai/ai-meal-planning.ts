'use server';
/**
 * @fileOverview Generates personalized meal plans for pets based on their profile using AI.
 *
 * - generateMealPlan - A function that generates a personalized meal plan for a pet.
 * - MealPlanInput - The input type for the generateMealPlan function.
 * - MealPlanOutput - The return type for the generateMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealPlanInputSchema = z.object({
  animalName: z.string().describe('The name of the animal.'),
  species: z.enum(['dog', 'cat']).describe('The species of the animal (dog or cat).'),
  age: z.number().describe('The age of the animal in years.'),
  breed: z.string().describe('The breed of the animal.'),
  weight: z.number().describe('The weight of the animal in kilograms.'),
  allergies: z.string().describe('Any known allergies of the animal.'),
  healthObjective: z
    .string()
    .describe(
      'The primary health objective for the animal (e.g., lose weight, maintain weight, improve joints).'
    ),
});
export type MealPlanInput = z.infer<typeof MealPlanInputSchema>;

const MealPlanOutputSchema = z.object({
  mealPlan: z.string().describe('A personalized 7-day meal plan for the pet, with each day on a new line. For each day, include "Breakfast:" and "Dinner:" labels.'),
  supplementRecommendation: z
    .string()
    .describe('A recommendation for specific supplements based on the pet profile.'),
});
export type MealPlanOutput = z.infer<typeof MealPlanOutputSchema>;

export async function generateMealPlan(input: MealPlanInput): Promise<MealPlanOutput> {
  return generateMealPlanFlow(input);
}

const mealPlanPrompt = ai.definePrompt({
  name: 'mealPlanPrompt',
  input: {schema: MealPlanInputSchema},
  output: {schema: MealPlanOutputSchema},
  prompt: `You are an AI assistant specialized in creating personalized meal plans and supplement recommendations for pets.

  Based on the following information about the pet, generate a 7-day meal plan and a supplement recommendation.

  Animal Name: {{{animalName}}}
  Species: {{{species}}}
  Age: {{{age}}} years
  Breed: {{{breed}}}
  Weight: {{{weight}}} kg
  Allergies: {{{allergies}}}
  Health Objective: {{{healthObjective}}}

  Provide a detailed 7-day meal plan, considering the pet's specific needs and health goals.
  Each day of the meal plan should be on a new line, starting with "Day X:".
  For each day, provide a "Breakfast:" and a "Dinner:" meal.
  Also, suggest relevant supplements that can support their overall health and well-being.
  Return both the meal plan and supplement recommendations.
  `,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: MealPlanInputSchema,
    outputSchema: MealPlanOutputSchema,
  },
  async input => {
    const {output} = await mealPlanPrompt(input);
    return output!;
  }
);
