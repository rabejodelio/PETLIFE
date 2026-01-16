'use server';

import { getNutritionAnalysis, type NutritionAnalysisInput, type NutritionAnalysisOutput } from "@/ai/flows/ai-nutrition-analysis";

export { type NutritionAnalysisInput, type NutritionAnalysisOutput };

export async function getNutritionAnalysisAction(input: NutritionAnalysisInput): Promise<{ success: boolean, data?: NutritionAnalysisOutput, error?: string }> {
    try {
        const result = await getNutritionAnalysis(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting nutrition analysis:", error);
        return { success: false, error: "Failed to generate analysis." };
    }
}
