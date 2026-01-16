'use server';

import { getNutritionAnalysis } from "@/ai/flows/ai-nutrition-analysis";
import { extractTextFromImage, type TextFromImageInput } from "@/ai/flows/ai-text-from-image";
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

export async function extractTextFromImageAction(input: TextFromImageInput): Promise<{ success: boolean, text?: string, error?: string }> {
    try {
        const result = await extractTextFromImage(input);
        return { success: true, text: result.text };
    } catch (error) {
        console.error("Error extracting text from image:", error);
        return { success: false, error: "Failed to extract text." };
    }
}
