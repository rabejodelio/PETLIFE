'use server';

import { getSupplementRecommendations, type SupplementRecommendationInput, type SupplementRecommendationOutput } from "@/ai/flows/ai-supplement-recommendations";

export async function getRecommendations(input: SupplementRecommendationInput): Promise<{ success: boolean, data?: SupplementRecommendationOutput, error?: string }> {
    try {
        const result = await getSupplementRecommendations(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting supplement recommendations:", error);
        return { success: false, error: "Failed to generate recommendations." };
    }
}
