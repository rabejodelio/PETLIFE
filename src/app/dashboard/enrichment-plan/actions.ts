'use server';

import { getEnrichmentPlan } from "@/ai/flows/ai-enrichment-plan";
import type { EnrichmentPlanInput, EnrichmentPlanOutput } from "@/ai/flows/schemas";

export async function generateEnrichmentPlanAction(input: EnrichmentPlanInput): Promise<{ success: boolean; data?: EnrichmentPlanOutput; error?: string }> {
    try {
        const result = await getEnrichmentPlan(input);
        return { success: true, data: result };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        console.error("Error generating enrichment plan:", error);
        return { success: false, error: "Failed to generate enrichment plan." };
    }
}
