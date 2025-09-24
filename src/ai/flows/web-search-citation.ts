'use server';

/**
 * @fileOverview An AI agent that uses web search to answer questions and cites sources.
 *
 * - webSearchAndCitation - A function that handles the web search and citation process.
 * - WebSearchAndCitationInput - The input type for the webSearchAndCitation function.
 * - WebSearchAndCitationOutput - The return type for the webSearchAndCitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WebSearchAndCitationInputSchema = z.object({
  query: z.string().describe('The user query to answer using web search.'),
});
export type WebSearchAndCitationInput = z.infer<typeof WebSearchAndCitationInputSchema>;

const WebSearchAndCitationOutputSchema = z.object({
  response: z.string().describe('The chatbot response with citations.'),
  citations: z.array(
    z.object({
      title: z.string().describe('The title of the cited web page.'),
      url: z.string().url().describe('The URL of the cited web page.'),
      snippet: z.string().describe('A snippet from the cited web page.'),
    })
  ).optional().describe('Citations for the response.'),
});
export type WebSearchAndCitationOutput = z.infer<typeof WebSearchAndCitationOutputSchema>;

export async function webSearchAndCitation(input: WebSearchAndCitationInput): Promise<WebSearchAndCitationOutput> {
  return webSearchAndCitationFlow(input);
}

const webSearchCitationPrompt = ai.definePrompt({
  name: 'webSearchCitationPrompt',
  input: {schema: WebSearchAndCitationInputSchema},
  output: {schema: WebSearchAndCitationOutputSchema},
  prompt: `You are a helpful chatbot that answers questions using web search and provides citations.

  Answer the following question, and cite your sources:
  {{query}}
  `,
  tools: [
    {
      name: 'web_search',
    }
  ],
});

const webSearchAndCitationFlow = ai.defineFlow(
  {
    name: 'webSearchAndCitationFlow',
    inputSchema: WebSearchAndCitationInputSchema,
    outputSchema: WebSearchAndCitationOutputSchema,
  },
  async input => {
    const {output} = await webSearchCitationPrompt(input);
    return output!;
  }
);
