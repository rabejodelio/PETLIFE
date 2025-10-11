'use server';
/**
 * @fileOverview Provides AI-driven wellness tips for pets.
 *
 * - getWellnessTipsFlow - The Genkit flow that generates wellness tips.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WellnessTipsInputSchema = z.object({
  species: z.enum(['dog', 'cat']).describe('The species of the pet (dog or cat).'),
});
export type WellnessTipsInput = z.infer<typeof WellnessTipsInputSchema>;

const WellnessTipSchema = z.object({
  title: z.string().describe('The title of the wellness tip.'),
  description: z.string().describe('The detailed description of the tip, providing actionable advice.'),
});

const WellnessTipsOutputSchema = z.object({
  tips: z
    .array(WellnessTipSchema)
    .min(4)
    .max(6)
    .describe('A list of 4 to 6 wellness tips for the specified pet species.'),
});
export type WellnessTipsOutput = z.infer<typeof WellnessTipsOutputSchema>;


const wellnessTipsPrompt = ai.definePrompt({
    name: 'wellnessTipsPrompt',
    input: {schema: WellnessTipsInputSchema},
    output: {schema: WellnessTipsOutputSchema},
    prompt: `You are an expert in pet wellness and behavior. 
    
    Generate a list of 4 to 6 actionable wellness and enrichment tips for the specified pet species: {{{species}}}.

    For each tip, provide a clear title and a concise, helpful description. Focus on topics like mental stimulation, stress reduction, physical health, and bonding.
    
    For example, for a dog, you might suggest "Doga: Yoga with Your Dog". For a cat, "Create a Vertical World".
    
    Return a list of tips.`,
});

export const getWellnessTipsFlow = ai.defineFlow(
    {
        name: 'wellnessTipsFlow',
        inputSchema: WellnessTipsInputSchema,
        outputSchema: WellnessTipsOutputSchema,
    },
    async input => {
        const {output} = await wellnessTipsPrompt(input);
        return output!;
    }
);
