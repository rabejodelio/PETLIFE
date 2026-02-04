'use server';
/**
 * @fileOverview Provides AI-driven cognitive stimulation programs for senior pets.
 *
 * - getCognitiveStimulationProgram - A function that generates the program.
 * - CognitiveStimulationInput - The input type for the function.
 * - CognitiveStimulationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveStimulationInputSchema = z.object({
  species: z.enum(['dog', 'cat']).describe('The species of the pet.'),
  age: z.number().describe('The age of the pet in years.'),
  observedSigns: z.array(z.string()).describe('A list of observed signs of cognitive decline.'),
});
export type CognitiveStimulationInput = z.infer<typeof CognitiveStimulationInputSchema>;

const CognitiveStimulationOutputSchema = z.object({
  program: z.string().describe('A detailed weekly cognitive stimulation program with a variety of activities.'),
});
export type CognitiveStimulationOutput = z.infer<typeof CognitiveStimulationOutputSchema>;

export async function getCognitiveStimulationProgram(input: CognitiveStimulationInput): Promise<CognitiveStimulationOutput> {
  return cognitiveStimulationFlow(input);
}

const cognitiveStimulationPrompt = ai.definePrompt({
  name: 'cognitiveStimulationPrompt',
  input: {schema: CognitiveStimulationInputSchema},
  output: {schema: CognitiveStimulationOutputSchema},
  prompt: `You are a veterinary behaviorist specializing in senior pet care. Your goal is to provide a practical, easy-to-follow cognitive stimulation program in English.

  Based on the pet's species ({{{species}}}), age ({{{age}}}), and the following observed signs of cognitive decline, generate a detailed weekly cognitive stimulation program.

  Observed Signs:
  {{#each observedSigns}}
  - {{{this}}}
  {{/each}}

  The program should include a variety of activities to engage the pet's mind, such as puzzle toys, new tricks to learn, and sensory enrichment exercises. Structure the output in Markdown. Provide clear, step-by-step instructions for each activity, organized by day. Make it sound encouraging and supportive for the pet owner.`,
});

const cognitiveStimulationFlow = ai.defineFlow(
  {
    name: 'cognitiveStimulationFlow',
    inputSchema: CognitiveStimulationInputSchema,
    outputSchema: CognitiveStimulationOutputSchema,
  },
  async input => {
    const {output} = await cognitiveStimulationPrompt(input);
    if (!output) {
        throw new Error('Failed to generate cognitive stimulation program.');
    }
    return output;
  }
);
