'use server';

import { getSupplementRecommendations, type SupplementRecommendationInput } from "@/ai/flows/ai-supplement-recommendations";

export async function getRecommendations(input: SupplementRecommendationInput) {
    try {
        const result = await getSupplementRecommendations(input);
        return { success: true, data: result.recommendations };
    } catch (error) {
        console.error("Error getting supplement recommendations:", error);
        return { success: false, error: "Failed to generate recommendations." };
    }
}
