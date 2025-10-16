'use server';

import { generateMealPlan, type MealPlanInput, type MealPlanOutput } from "@/ai/ai-meal-planning";

export { type MealPlanInput, type MealPlanOutput };

export async function generateMealPlanAction(input: MealPlanInput): Promise<{ success: boolean, data?: MealPlanOutput, error?: string }> {
    try {
        const result = await generateMealPlan(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating meal plan:", error);
        return { success: false, error: "Failed to generate meal plan." };
    }
}
