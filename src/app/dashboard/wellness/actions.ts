'use server';

import { getWellnessTipsFlow } from "@/ai/flows/ai-wellness-tips";
import { z } from 'zod';

export const WellnessTipsInputSchema = z.object({
  species: z.enum(['dog', 'cat']),
});
export type WellnessTipsInput = z.infer<typeof WellnessTipsInputSchema>;

const WellnessTipSchema = z.object({
  title: z.string(),
  description: z.string(),
});
export type WellnessTip = z.infer<typeof WellnessTipSchema>;

export const WellnessTipsOutputSchema = z.object({
  tips: z.array(WellnessTipSchema),
});
export type WellnessTipsOutput = z.infer<typeof WellnessTipsOutputSchema>;


export async function getWellnessTipsAction(input: WellnessTipsInput): Promise<{ success: boolean; data?: WellnessTipsOutput; error?: string }> {
    try {
        const result = await getWellnessTipsFlow(input);
        return { success: true, data: result };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Error getting wellness tips:", error);
        return { success: false, error: "Failed to generate wellness tips." };
    }
}
