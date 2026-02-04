'use server';
/**
 * @fileOverview Generates a stress-reducing enrichment plan for a pet.
 *
 * - getEnrichmentPlan - A function that generates the enrichment plan.
 * - EnrichmentPlanInput - The input type for the function.
 * - EnrichmentPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { 
    EnrichmentPlanInputSchema, 
    EnrichmentPlanOutputSchema,
    type EnrichmentPlanInput,
    type EnrichmentPlanOutput
} from './schemas';

export async function getEnrichmentPlan(input: EnrichmentPlanInput): Promise<EnrichmentPlanOutput> {
  return enrichmentPlanFlow(input);
}

const enrichmentPlanPrompt = ai.definePrompt({
  name: 'enrichmentPlanPrompt',
  input: {schema: EnrichmentPlanInputSchema},
  output: {schema: EnrichmentPlanOutputSchema},
  prompt: `You are an animal behaviorist specializing in environmental enrichment to reduce stress.
  Stress and boredom reduce immunity and longevity.

  Based on the pet's profile:
  - Name: {{{animalName}}}
  - Species: {{{species}}}
  - Breed: {{{breed}}}
  - Age: {{{age}}}
  - Housing: {{{housingType}}}

  Generate a single, short, and actionable enrichment plan for today.
  
  Scientific Rule: For all pets, suggest "scent work" (e.g., food searches) to lower cortisol. For cats, also suggest activities related to "vertical worlds" to reduce anxiety.

  Example Output: "Create a 10-minute scent trail today. This reduces {{{animalName}}}'s cortisol and boosts their immune system."
  
  Your output must be in English.
  Your output should be a single sentence in the 'plan' field.`,
});

const enrichmentPlanFlow = ai.defineFlow(
  {
    name: 'enrichmentPlanFlow',
    inputSchema: EnrichmentPlanInputSchema,
    outputSchema: EnrichmentPlanOutputSchema,
  },
  async input => {
    const {output} = await enrichmentPlanPrompt(input);
    if (!output) {
      throw new Error('Failed to generate enrichment plan.');
    }
    return output;
  }
);
