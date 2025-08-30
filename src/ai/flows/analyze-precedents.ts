'use server';
/**
 * @fileOverview An AI-powered precedent analysis agent.
 *
 * - analyzePrecedents - A function that suggests relevant legal precedents.
 * - AnalyzePrecedentsInput - The input type for the analyzePrecedents function.
 * - AnalyzePrecedentsOutput - The return type for the analyzePrecedents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePrecedentsInputSchema = z.object({
  caseDetails: z.string().describe('A detailed description of the case, including facts and legal questions.'),
  jurisdiction: z.string().describe('The legal jurisdiction for the analysis.'),
});
export type AnalyzePrecedentsInput = z.infer<typeof AnalyzePrecedentsInputSchema>;

const AnalyzePrecedentsOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the precedent analysis.'),
  precedents: z.array(
    z.object({
      title: z.string().describe('The title or name of the precedent case.'),
      citation: z.string().describe('The legal citation for the case.'),
      relevance: z.string().describe('Explanation of why the case is relevant.'),
      outcome: z.string().describe('The likely outcome based on this precedent.'),
    })
  ).describe('A list of relevant legal precedents.'),
});
export type AnalyzePrecedentsOutput = z.infer<typeof AnalyzePrecedentsOutputSchema>;

export async function analyzePrecedents(input: AnalyzePrecedentsInput): Promise<AnalyzePrecedentsOutput> {
  return analyzePrecedentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrecedentsPrompt',
  input: {schema: AnalyzePrecedentsInputSchema},
  output: {schema: AnalyzePrecedentsOutputSchema},
  prompt: `You are an AI Legal Research Assistant specializing in precedent analysis. Your task is to identify relevant legal precedents based on the user's case details and suggest potential outcomes.

For the given case details and jurisdiction, find the most relevant legal precedents. For each precedent, provide its title, citation, a brief explanation of its relevance, and a potential outcome based on that precedent.

Jurisdiction: {{{jurisdiction}}}
Case Details: {{{caseDetails}}}
`,
});

const analyzePrecedentsFlow = ai.defineFlow(
  {
    name: 'analyzePrecedentsFlow',
    inputSchema: AnalyzePrecedentsInputSchema,
    outputSchema: AnalyzePrecedentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
