'use server';
/**
 * @fileOverview Generates a personalized one-day meal plan for a pet, including images for each meal.
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
  image: z
    .string()
    .describe("A data URI of a generated image of the final prepared meal. Expected format: 'data:image/png;base64,<encoded_data>'."),
});

const MealPlanOutputSchema = z.object({
  breakfast: MealSchema,
  dinner: MealSchema,
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
        breakfast: z.object({
          title: z.string(),
          recipe: z.string(),
          imagePrompt: z.string().describe("A short, descriptive prompt for an image generation model to create a photo of the final prepared breakfast. e.g., 'A bowl of cooked chicken and rice with chopped carrots for a dog, in a clean, photorealistic style.'"),
        }),
        dinner: z.object({
          title: z.string(),
          recipe: z.string(),
          imagePrompt: z.string().describe("A short, descriptive prompt for an image generation model to create a photo of the final prepared dinner."),
        }),
        supplementRecommendation: z.string(),
      }),
    },
    prompt: `You are an expert veterinary nutritionist AI. Your task is to create a detailed, safe, and nutritionally balanced **one-day meal plan** (breakfast and dinner) for a pet.

  Based on the following pet profile, generate a breakfast and dinner recipe.

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
  1.  **Detailed Recipes**: For "Breakfast" and "Dinner", provide a complete homemade recipe. Do not suggest commercial products. Each recipe must include:
      - **Title**: A creative name for the meal.
      - **Recipe**: A string containing ingredients with precise quantities (e.g., in grams, cups) and clear, step-by-step preparation instructions.
  2.  **Image Prompt**: For each meal, create a short, vivid, and descriptive prompt for a text-to-image model to generate a photorealistic image of the final prepared dish.
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
    // 1. Generate the recipes and image prompts
    const { output: recipeOutput } = await mealPlanPrompt(input);
    if (!recipeOutput) {
        throw new Error('Failed to generate meal plan recipes.');
    }
    
    // 2. Generate images in parallel
    const [breakfastImage, dinnerImage] = await Promise.all([
        ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: recipeOutput.breakfast.imagePrompt,
        }),
        ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: recipeOutput.dinner.imagePrompt,
        }),
    ]);

    if (!breakfastImage.media.url || !dinnerImage.media.url) {
        throw new Error('Failed to generate meal images.');
    }

    // 3. Combine recipes and images into the final output
    return {
        breakfast: {
            title: recipeOutput.breakfast.title,
            recipe: recipeOutput.breakfast.recipe,
            image: breakfastImage.media.url,
        },
        dinner: {
            title: recipeOutput.dinner.title,
            recipe: recipeOutput.dinner.recipe,
            image: dinnerImage.media.url,
        },
        supplementRecommendation: recipeOutput.supplementRecommendation,
        disclaimer: "Important: Always consult your veterinarian before making any changes to your pet's diet. This meal plan is a suggestion and may need adjustments based on your pet's specific health condition."
    };
  }
);
