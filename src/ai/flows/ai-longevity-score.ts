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
  prompt: `Agis en tant qu'expert en nutrition vétérinaire WSAVA. L'utilisateur rapporte un poids de {{{currentWeight}}} kg pour un {{{breed}}}. Basé sur les standards de la race et l'indice BCS, calcule l'écart par rapport au poids optimal. Si l'écart est > 10%, génère un plan de restriction calorique immédiat pour réduire les risques de maladies chroniques identifiées dans les rapports de mortalité. Fournis une analyse détaillée et structurée.`,
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
