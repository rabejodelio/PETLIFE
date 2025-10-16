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
  ingredientPreferences: z.string().describe("The user's current food brands/types for nutritional adjustments."),
});
export type MealPlanInput = z.infer<typeof MealPlanInputSchema>;

const MealPlanOutputSchema = z.object({
  mealPlan: z.string().describe('A personalized 7-day meal plan for the pet. For each day, include "Breakfast:" and "Dinner:" labels.'),
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
  prompt: `You are an expert veterinary nutritionist AI. Your task is to create a detailed, safe, and nutritionally balanced 7-day meal plan for a pet.

  Based on the following pet profile, generate a 7-day meal plan.
  
  **Pet Profile:**
  - Animal Name: {{{animalName}}}
  - Species: {{{species}}}
  - Age: {{{age}}} years
  - Breed: {{{breed}}}
  - Weight: {{{weight}}} kg
  - Allergies: {{{allergies}}}
  - Health Objective: {{{healthObjective}}}
  - Current Food/Ingredient Preferences: {{{ingredientPreferences}}}

  **Instructions:**
  1.  **Generate a 7-Day Plan**: Create a meal plan for a full week. Start each day with "Day X:", for example, "Day 1:", "Day 2:", etc.
  2.  **Detailed Recipes**: For each "Breakfast:" and "Dinner:", provide a complete homemade recipe. Do not suggest commercial products. Each recipe must include:
      - **Ingredients**: List all ingredients with precise quantities (e.g., in grams, cups).
      - **Preparation**: Provide clear, step-by-step instructions on how to prepare the meal (e.g., "Finely chop the carrots," "Cook the chicken until no longer pink").
  3.  **Safety First**: Ensure all ingredients are safe for the specified species (dog or cat). Explicitly exclude toxic ingredients like onions, garlic, grapes, chocolate, etc.
  4.  **Nutritional Goal**: The recipes must align with the pet's health objective. For example, for weight loss, use lean proteins and fiber-rich vegetables.
  5.  **Supplement Advice**: In addition to the meal plan, provide a separate, concise recommendation for relevant supplements.
  6.  **Disclaimer**: At the very end of the meal plan, include this exact disclaimer: "Important: Always consult your veterinarian before making any changes to your pet's diet. This meal plan is a suggestion and may need adjustments based on your pet's specific health condition."
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
