'use server';
/**
 * @fileOverview Provides AI-driven nutrition analysis for pet food ingredients.
 *
 * - getNutritionAnalysis - A function that generates a nutritional analysis.
 * - NutritionAnalysisInput - The input type for the function.
 * - NutritionAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const NutritionAnalysisInputSchema = z.object({
  ingredientsText: z.string().describe("The list of ingredients from the pet food label."),
  age: z.number().describe("The pet's age in years."),
  species: z.enum(['dog', 'cat']).describe("The species of the pet (dog or cat)."),
});
export type NutritionAnalysisInput = z.infer<typeof NutritionAnalysisInputSchema>;

export const NutritionAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed nutritional analysis based on FEDIAF guidelines.'),
});
export type NutritionAnalysisOutput = z.infer<typeof NutritionAnalysisOutputSchema>;

export async function getNutritionAnalysis(input: NutritionAnalysisInput): Promise<NutritionAnalysisOutput> {
  return nutritionAnalysisFlow(input);
}

const nutritionAnalysisPrompt = ai.definePrompt({
  name: 'nutritionAnalysisPrompt',
  input: {schema: NutritionAnalysisInputSchema},
  output: {schema: NutritionAnalysisOutputSchema},
  prompt: `Analyse cette liste d'ingrédients : {{{ingredientsText}}}. En te basant sur le guide nutritionnel FEDIAF, vérifie si le taux de minéraux est adapté pour un {{{species}}} de {{{age}}} ans. Si le {{{species}}} est senior, assure-toi que l'apport en protéines est de haute qualité pour maintenir la masse musculaire sans surcharger la fonction rénale.`,
});

const nutritionAnalysisFlow = ai.defineFlow(
  {
    name: 'nutritionAnalysisFlow',
    inputSchema: NutritionAnalysisInputSchema,
    outputSchema: NutritionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await nutritionAnalysisPrompt(input);
    if (!output) {
        throw new Error('Failed to generate nutrition analysis.');
    }
    return output;
  }
);
