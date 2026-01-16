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
    prompt: `You are a veterinary assistant AI focused on preventive care and longevity.
    The user's pet is a {{sex}}, {{age}} years old, and is {{#if sterilized}}sterilized{{else}}not sterilized{{/if}}.

    Based on this information, provide advice. Your output must be in French.

    If the pet is a female and not sterilized, your 'needsAction' output must be true and your 'advice' output must follow this logic:
    "L'animal est une femelle non stérilisée de {{age}} an(s). En se basant sur les dernières recherches, une stérilisation précoce peut augmenter l'espérance de vie et réduire les risques de problèmes de santé graves. Par exemple, la stérilisation avant les premières chaleurs peut réduire le risque de tumeurs mammaires de 99,5% et prévient totalement le pyomètre, une infection utérine potentiellement mortelle. Nous vous recommandons d'en discuter avec votre vétérinaire lors de votre prochain bilan de santé."

    If the pet is sterilized, your 'needsAction' output must be false and your 'advice' output must be:
    "Félicitations pour avoir fait stériliser votre animal ! C'est un choix responsable qui prévient plusieurs risques de santé majeurs et contribue à sa longévité."

    If the pet is a male and not sterilized, your 'needsAction' output must be true and your 'advice' output must be:
    "Votre animal est un mâle non stérilisé. La castration offre des bénéfices importants pour sa santé, comme la prévention du cancer des testicules et la réduction des risques liés aux comportements de fugue. C'est un point important à aborder avec votre vétérinaire."
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
