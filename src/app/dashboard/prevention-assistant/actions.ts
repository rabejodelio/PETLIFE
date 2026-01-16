'use server';

import { getPreventionAdvice } from "@/ai/flows/ai-prevention-assistant";
import type { PreventionAdviceInput, PreventionAdviceOutput } from "@/ai/flows/schemas";

export async function generatePreventionAdviceAction(input: PreventionAdviceInput): Promise<{ success: boolean; data?: PreventionAdviceOutput; error?: string }> {
    try {
        const result = await getPreventionAdvice(input);
        return { success: true, data: result };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Error generating prevention advice:", error);
        return { success: false, error: "Failed to generate advice." };
    }
}
