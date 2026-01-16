'use server';

import { getCognitiveStimulationProgram, type CognitiveStimulationInput, type CognitiveStimulationOutput } from "@/ai/flows/ai-cognitive-stimulation";

export async function generateProgramAction(input: CognitiveStimulationInput): Promise<{ success: boolean, data?: CognitiveStimulationOutput, error?: string }> {
    try {
        const result = await getCognitiveStimulationProgram(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating cognitive stimulation program:", error);
        return { success: false, error: "Failed to generate program." };
    }
}
