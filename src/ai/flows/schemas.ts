import {z} from 'genkit';

// Wellness Tips Schemas
export const WellnessTipsInputSchema = z.object({
  species: z.enum(['dog', 'cat']).describe('The species of the pet (dog or cat).'),
});
export type WellnessTipsInput = z.infer<typeof WellnessTipsInputSchema>;

const WellnessTipSchema = z.object({
  title: z.string().describe('The title of the wellness tip.'),
  description: z.string().describe('The detailed description of the tip, providing actionable advice.'),
});

export const WellnessTipsOutputSchema = z.object({
  tips: z
    .array(WellnessTipSchema)
    .min(4)
    .max(6)
    .describe('A list of 4 to 6 wellness tips for the specified pet species.'),
});
export type WellnessTipsOutput = z.infer<typeof WellnessTipsOutputSchema>;


// Nutrition Analysis Schemas
export const NutritionAnalysisInputSchema = z.object({
  ingredientsText: z.string().describe("The list of ingredients from the pet food label."),
  age: z.number().describe("The pet's age in years."),
  species: z.enum(['dog', 'cat']).describe("The species of the pet (dog or cat)."),
});
export type NutritionAnalysisInput = z.infer<typeof NutritionAnalysisInputSchema>;

export const NutritionAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed nutritional analysis based on FEDIAF guidelines.'),
});
export type NutritionAnalysisOutput = z.infer<typeof NutritionAnalysisOutputSchema>;
