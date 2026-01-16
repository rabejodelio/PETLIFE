'use server';

import { getLongevityScore, type LongevityScoreInput, type LongevityScoreOutput } from "@/ai/flows/ai-longevity-score";

export async function getLongevityScoreAction(input: LongevityScoreInput): Promise<{ success: boolean, data?: LongevityScoreOutput, error?: string }> {
    try {
        const result = await getLongevityScore(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting longevity score:", error);
        return { success: false, error: "Failed to generate analysis." };
    }
}
