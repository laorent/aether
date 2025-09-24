'use server';

/**
 * @fileOverview Analyzes an image and provides follow-up questions.
 *
 * - analyzeImageAndSuggestFollowUp - A function that handles the image analysis and follow-up question generation.
 * - AnalyzeImageAndSuggestFollowUpInput - The input type for the analyzeImageAndSuggestFollowUp function.
 * - AnalyzeImageAndSuggestFollowUpOutput - The return type for the analyzeImageAndSuggestFollowUp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageAndSuggestFollowUpInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageAndSuggestFollowUpInput = z.infer<
  typeof AnalyzeImageAndSuggestFollowUpInputSchema
>;

const AnalyzeImageAndSuggestFollowUpOutputSchema = z.object({
  analysis: z.string().describe('The analysis of the image.'),
  followUpQuestions: z
    .array(z.string())
    .describe('A list of follow-up questions to explore the image further.'),
});
export type AnalyzeImageAndSuggestFollowUpOutput = z.infer<
  typeof AnalyzeImageAndSuggestFollowUpOutputSchema
>;

export async function analyzeImageAndSuggestFollowUp(
  input: AnalyzeImageAndSuggestFollowUpInput
): Promise<AnalyzeImageAndSuggestFollowUpOutput> {
  return analyzeImageAndSuggestFollowUpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImageAndSuggestFollowUpPrompt',
  input: {schema: AnalyzeImageAndSuggestFollowUpInputSchema},
  output: {schema: AnalyzeImageAndSuggestFollowUpOutputSchema},
  prompt: `You are an expert image analyst. Analyze the given image and provide a detailed description of its contents. Also, suggest three follow-up questions that a user might ask to further explore the image.\n\nImage: {{media url=photoDataUri}}\n\nOutput the analysis and the follow up questions in JSON format.`,
});

const analyzeImageAndSuggestFollowUpFlow = ai.defineFlow(
  {
    name: 'analyzeImageAndSuggestFollowUpFlow',
    inputSchema: AnalyzeImageAndSuggestFollowUpInputSchema,
    outputSchema: AnalyzeImageAndSuggestFollowUpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
