'use server';
/**
 * @fileOverview Provides AI-driven wellness tips for pets.
 *
 * - getWellnessTips - A function that generates wellness tips based on pet species.
 */

import {ai} from '@/ai/genkit';
import { 
    WellnessTipsInputSchema, 
    WellnessTipsOutputSchema, 
    type WellnessTipsInput, 
    type WellnessTipsOutput 
} from './schemas';


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

const wellnessTipsFlow = ai.defineFlow(
    {
        name: 'wellnessTipsFlow',
        inputSchema: WellnessTipsInputSchema,
        outputSchema: WellnessTipsOutputSchema,
    },
    async input => {
        const {output} = await wellnessTipsPrompt(input);
        if (!output) {
            throw new Error('Failed to generate wellness tips.');
        }
        return output;
    }
);

export async function getWellnessTips(input: WellnessTipsInput): Promise<WellnessTipsOutput> {
    return wellnessTipsFlow(input);
}
