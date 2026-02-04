'use server';
/**
 * @fileOverview Calculates a pet's longevity score based on weight and body condition.
 *
 * - getLongevityScore - A function that generates the longevity score analysis.
 * - LongevityScoreInput - The input type for the getLongevityScore function.
 * - LongevityScoreOutput - The return type for the getLongevityScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LongevityScoreInputSchema = z.object({
  currentWeight: z.number().describe("The pet's current weight in kilograms."),
  breed: z.string().describe('The breed of the pet.'),
});
export type LongevityScoreInput = z.infer<typeof LongevityScoreInputSchema>;

const LongevityScoreOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis including BCS assessment, ideal weight comparison, and a caloric restriction plan if necessary.'),
});
export type LongevityScoreOutput = z.infer<typeof LongevityScoreOutputSchema>;

export async function getLongevityScore(input: LongevityScoreInput): Promise<LongevityScoreOutput> {
  return longevityScoreFlow(input);
}

const longevityScorePrompt = ai.definePrompt({
  name: 'longevityScorePrompt',
  input: {schema: LongevityScoreInputSchema},
  output: {schema: LongevityScoreOutputSchema},
  prompt: `Act as a WSAVA veterinary nutrition expert. The user reports a weight of {{{currentWeight}}} kg for a {{{breed}}}. Based on breed standards and the BCS index, calculate the deviation from the optimal weight. If the deviation is >10%, generate an immediate caloric restriction plan to reduce the risk of chronic diseases identified in mortality reports. Provide a detailed and structured analysis.`,
});

const longevityScoreFlow = ai.defineFlow(
  {
    name: 'longevityScoreFlow',
    inputSchema: LongevityScoreInputSchema,
    outputSchema: LongevityScoreOutputSchema,
  },
  async input => {
    const {output} = await longevityScorePrompt(input);
    if (!output) {
        throw new Error('Failed to generate longevity score analysis.');
    }
    return output;
  }
);
