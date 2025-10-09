'use server';
/**
 * @fileOverview Provides AI-driven supplement recommendations tailored to a pet's profile.
 *
 * - getSupplementRecommendations - A function that generates supplement recommendations based on pet data.
 * - SupplementRecommendationInput - The input type for the getSupplementRecommendations function.
 * - SupplementRecommendationOutput - The return type for the getSupplementRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupplementRecommendationInputSchema = z.object({
  species: z.enum(['dog', 'cat']).describe('The species of the pet (dog or cat).'),
  age: z.number().describe('The age of the pet in years.'),
  breed: z.string().describe('The breed of the pet.'),
  weight: z.number().describe('The weight of the pet in kilograms.'),
  allergies: z.string().describe('Any known allergies of the pet.'),
  healthNeeds: z.string().describe('Specific health needs or concerns (e.g., joint support, skin/coat health).'),
});
export type SupplementRecommendationInput = z.infer<typeof SupplementRecommendationInputSchema>;

const SupplementRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of supplement recommendations tailored to the pet.'),
});
export type SupplementRecommendationOutput = z.infer<typeof SupplementRecommendationOutputSchema>;

export async function getSupplementRecommendations(input: SupplementRecommendationInput): Promise<SupplementRecommendationOutput> {
  return supplementRecommendationFlow(input);
}

const supplementRecommendationPrompt = ai.definePrompt({
  name: 'supplementRecommendationPrompt',
  input: {schema: SupplementRecommendationInputSchema},
  output: {schema: SupplementRecommendationOutputSchema},
  prompt: `You are an AI assistant specializing in providing supplement recommendations for pets.

  Based on the following information about the pet, provide a list of supplement recommendations tailored to their specific needs. Consider the pet's species, age, breed, weight, allergies, and any specified health needs.

  Species: {{{species}}}
  Age: {{{age}}} years
  Breed: {{{breed}}}
  Weight: {{{weight}}} kg
  Allergies: {{{allergies}}}
  Health Needs: {{{healthNeeds}}}

  Provide the recommendations as a list of supplement names.`, 
});

const supplementRecommendationFlow = ai.defineFlow(
  {
    name: 'supplementRecommendationFlow',
    inputSchema: SupplementRecommendationInputSchema,
    outputSchema: SupplementRecommendationOutputSchema,
  },
  async input => {
    const {output} = await supplementRecommendationPrompt(input);
    return output!;
  }
);
