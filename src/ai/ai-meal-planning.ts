'use server';
/**
 * @fileOverview Generates a personalized 7-day meal plan for a pet.
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

const MealSchema = z.object({
  title: z.string().describe('The title of the meal (e.g., "Chicken and Rice Delight").'),
  recipe: z.string().describe('A detailed recipe including ingredients with precise quantities and step-by-step preparation instructions.'),
});

const DailyMealPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., "Monday").'),
  breakfast: MealSchema,
  dinner: MealSchema,
});

const MealPlanOutputSchema = z.object({
  weeklyPlan: z.array(DailyMealPlanSchema).length(7).describe('A full 7-day meal plan, with a breakfast and dinner for each day.'),
  supplementRecommendation: z
    .string()
    .describe('A recommendation for specific supplements based on the pet profile.'),
  disclaimer: z.string().describe('A standard disclaimer about consulting a veterinarian.'),
});
export type MealPlanOutput = z.infer<typeof MealPlanOutputSchema>;


export async function generateMealPlan(input: MealPlanInput): Promise<MealPlanOutput> {
  return generateMealPlanFlow(input);
}

const mealPlanPrompt = ai.definePrompt({
    name: 'mealPlanRecipePrompt',
    input: {schema: MealPlanInputSchema},
    output: {
      schema: z.object({
        weeklyPlan: z.array(DailyMealPlanSchema).length(7),
        supplementRecommendation: z.string(),
      }),
    },
    prompt: `You are an expert veterinary nutritionist AI. Your task is to create a detailed, safe, and nutritionally balanced **7-day meal plan** for a pet.

  Based on a pet's profile, generate a breakfast and dinner recipe for each of the 7 days of the week.

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
  1.  **Variety is Key**: The recipes for each day should be different to ensure a varied diet.
  2.  **Detailed Recipes**: For "Breakfast" and "Dinner" of each day, provide a complete homemade recipe. Do not suggest commercial products. Each recipe must include:
      - **Title**: A creative name for the meal.
      - **Recipe**: A string containing ingredients with precise quantities (e.g., in grams, cups) and clear, step-by-step preparation instructions.
  3.  **Safety First**: Ensure all ingredients are safe for the specified species (dog or cat). Explicitly exclude toxic ingredients like onions, garlic, grapes, chocolate, etc.
  4.  **Nutritional Goal**: The recipes must align with the pet's health objective. For example, for weight loss, use lean proteins and fiber-rich vegetables.
  5.  **Supplement Advice**: Provide a separate, concise recommendation for relevant supplements.
  `,
});


const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: MealPlanInputSchema,
    outputSchema: MealPlanOutputSchema,
  },
  async input => {
    const { output } = await mealPlanPrompt(input);
    if (!output) {
        throw new Error('Failed to generate meal plan recipes.');
    }

    return {
        weeklyPlan: output.weeklyPlan,
        supplementRecommendation: output.supplementRecommendation,
        disclaimer: "Important: Always consult your veterinarian before making any changes to your pet's diet. This meal plan is a suggestion and may need adjustments based on your pet's specific health condition."
    };
  }
);
