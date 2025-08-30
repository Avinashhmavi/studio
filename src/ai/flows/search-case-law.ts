'use server';
/**
 * @fileOverview An AI-powered legal research agent.
 *
 * - searchCaseLaw - A function that searches for relevant case law and statutes.
 * - SearchCaseLawInput - The input type for the searchCaseLaw function.
 * - SearchCaseLawOutput - The return type for the searchCaseLaw function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchCaseLawInputSchema = z.object({
  query: z.string().describe('The legal topic or question to research.'),
  jurisdiction: z.string().describe('The legal jurisdiction to search within.'),
});
export type SearchCaseLawInput = z.infer<typeof SearchCaseLawInputSchema>;

const SearchCaseLawOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the research findings.'),
  caseLaw: z.array(
    z.object({
      title: z.string().describe('The title or name of the case.'),
      citation: z.string().describe('The legal citation for the case.'),
      summary: z.string().describe('A brief summary of the case and its relevance.'),
    })
  ).describe('A list of relevant case laws.'),
  statutes: z.array(
    z.object({
      title: z.string().describe('The title or name of the statute or regulation.'),
      code: z.string().describe('The specific code or section number.'),
      summary: z.string().describe('A brief summary of the statute and its relevance.'),
    })
  ).describe('A list of relevant statutes or regulations.'),
});
export type SearchCaseLawOutput = z.infer<typeof SearchCaseLawOutputSchema>;

export async function searchCaseLaw(input: SearchCaseLawInput): Promise<SearchCaseLawOutput> {
  return searchCaseLawFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchCaseLawPrompt',
  input: {schema: SearchCaseLawInputSchema},
  output: {schema: SearchCaseLawOutputSchema},
  prompt: `You are an AI Legal Research Assistant. Your task is to find relevant case law and statutes based on a user's query within a specific jurisdiction.

Provide a summary of the findings, and then list the most relevant case laws and statutes. For each item, provide a title, citation/code, and a brief summary explaining its relevance to the query.

Jurisdiction: {{{jurisdiction}}}
Research Query: {{{query}}}
`,
});

const searchCaseLawFlow = ai.defineFlow(
  {
    name: 'searchCaseLawFlow',
    inputSchema: SearchCaseLawInputSchema,
    outputSchema: SearchCaseLawOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
