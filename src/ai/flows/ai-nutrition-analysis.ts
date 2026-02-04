'use server';
/**
 * @fileOverview Provides AI-driven nutrition analysis for pet food ingredients.
 *
 * - getNutritionAnalysis - A function that generates a nutritional analysis.
 * - NutritionAnalysisInput - The input type for the function.
 * - NutritionAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { 
    NutritionAnalysisInputSchema, 
    NutritionAnalysisOutputSchema,
    type NutritionAnalysisInput,
    type NutritionAnalysisOutput
} from './schemas';

export async function getNutritionAnalysis(input: NutritionAnalysisInput): Promise<NutritionAnalysisOutput> {
  return nutritionAnalysisFlow(input);
}

const nutritionAnalysisPrompt = ai.definePrompt({
  name: 'nutritionAnalysisPrompt',
  input: {schema: NutritionAnalysisInputSchema},
  output: {schema: NutritionAnalysisOutputSchema},
  prompt: `Analyze this list of ingredients: {{{ingredientsText}}}. Based on the FEDIAF nutritional guide, check if the mineral content is suitable for a {{{species}}} that is {{{age}}} years old. If the {{{species}}} is a senior, ensure the protein intake is of high quality to maintain muscle mass without overloading kidney function.`,
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
