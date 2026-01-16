'use server';

import { getNutritionAnalysis } from "@/ai/flows/ai-nutrition-analysis";
import type { NutritionAnalysisInput, NutritionAnalysisOutput } from "@/ai/flows/schemas";

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
