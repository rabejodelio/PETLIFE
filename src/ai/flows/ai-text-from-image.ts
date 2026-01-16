'use server';
/**
 * @fileOverview Extracts text from an image.
 *
 * - extractTextFromImage - A function that extracts text from an image.
 * - TextFromImageInput - The input type for the function.
 * - TextFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TextFromImageInput = z.infer<typeof TextFromImageInputSchema>;

const TextFromImageOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
});
export type TextFromImageOutput = z.infer<typeof TextFromImageOutputSchema>;

export async function extractTextFromImage(input: TextFromImageInput): Promise<TextFromImageOutput> {
  return textFromImageFlow(input);
}

const textFromImagePrompt = ai.definePrompt({
  name: 'textFromImagePrompt',
  input: {schema: TextFromImageInputSchema},
  output: {schema: TextFromImageOutputSchema},
  prompt: `You are an Optical Character Recognition (OCR) expert. Extract all text from the following image. The image contains a list of ingredients from a pet food product. Be as accurate as possible.

Image: {{media url=imageDataUri}}`,
});

const textFromImageFlow = ai.defineFlow(
  {
    name: 'textFromImageFlow',
    inputSchema: TextFromImageInputSchema,
    outputSchema: TextFromImageOutputSchema,
  },
  async input => {
    const {output} = await textFromImagePrompt(input);
    if (!output) {
      throw new Error('Failed to extract text from image.');
    }
    return output;
  }
);
