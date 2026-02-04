'use server';
/**
 * @fileOverview Provides preventive health advice for pets, focusing on sterilization benefits.
 *
 * - getPreventionAdvice - Generates advice based on pet's sex, age, and sterilization status.
 */

import {ai} from '@/ai/genkit';
import {
    PreventionAdviceInputSchema,
    PreventionAdviceOutputSchema,
    type PreventionAdviceInput,
    type PreventionAdviceOutput,
} from './schemas';

export async function getPreventionAdvice(input: PreventionAdviceInput): Promise<PreventionAdviceOutput> {
    return preventionAdviceFlow(input);
}

const preventionAdvicePrompt = ai.definePrompt({
    name: 'preventionAdvicePrompt',
    input: {schema: PreventionAdviceInputSchema},
    output: {schema: PreventionAdviceOutputSchema},
    prompt: `You are a veterinary assistant focused on preventive care and longevity.
    The user's pet is a {{sex}}, {{age}} years old, and is {{#if sterilized}}sterilized{{else}}not sterilized{{/if}}.

    Based on this information, provide advice. Your output must be in English.

    If the pet is a female and not sterilized, your 'needsAction' output must be true and your 'advice' output must follow this logic:
    "The pet is an unsterilized female of {{age}} year(s). Based on the latest research, early sterilization can increase life expectancy and reduce the risk of serious health problems. For example, sterilization before the first heat can reduce the risk of mammary tumors by 99.5% and completely prevents pyometra, a potentially fatal uterine infection. We recommend discussing this with your veterinarian at your next health check-up."

    If the pet is sterilized, your 'needsAction' output must be false and your 'advice' output must be:
    "Congratulations on having your pet sterilized! It's a responsible choice that prevents several major health risks and contributes to its longevity."

    If the pet is a male and not sterilized, your 'needsAction' output must be true and your 'advice' output must be:
    "Your pet is an unsterilized male. Neutering offers significant health benefits, such as preventing testicular cancer and reducing the risks associated with roaming behaviors. This is an important point to discuss with your veterinarian."
    `,
});

const preventionAdviceFlow = ai.defineFlow({
        name: 'preventionAdviceFlow',
        inputSchema: PreventionAdviceInputSchema,
        outputSchema: PreventionAdviceOutputSchema,
    },
    async (input) => {
        const {output} = await preventionAdvicePrompt(input);
        if (!output) {
            throw new Error('Failed to generate prevention advice.');
        }
        return output;
    }
);
