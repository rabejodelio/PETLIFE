'use server';

import { getWellnessTips } from "@/ai/flows/ai-wellness-tips";
import type { WellnessTipsInput, WellnessTipsOutput } from "@/ai/flows/schemas";

export { type WellnessTipsInput, type WellnessTipsOutput };

export async function getWellnessTipsAction(input: WellnessTipsInput): Promise<{ success: boolean; data?: WellnessTipsOutput; error?: string }> {
    try {
        const result = await getWellnessTips(input);
        return { success: true, data: result };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Error getting wellness tips:", error);
        return { success: false, error: "Failed to generate wellness tips." };
    }
}
