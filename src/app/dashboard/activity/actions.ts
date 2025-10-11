'use server';

import { getActivityRecommendations, type ActivityRecommendationInput, type ActivityRecommendationOutput } from "@/ai/flows/ai-activity-recommendation";

export async function getRecommendations(input: ActivityRecommendationInput): Promise<{ success: boolean, data?: ActivityRecommendationOutput, error?: string }> {
    try {
        const result = await getActivityRecommendations(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting activity recommendations:", error);
        return { success: false, error: "Failed to generate recommendations." };
    }
}
