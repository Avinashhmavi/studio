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
  caseStrategy: z.string().describe('Potential strategies and solutions for how to navigate the case.'),
  arrestPreventionMeasures: z.array(z.string()).describe('Legal considerations and actions to help avoid arrest.'),
  rightsDuringArrest: z.array(z.string()).describe('Key legal rights to be aware of during an arrest scenario.'),
});
export type AnalyzePrecedentsOutput = z.infer<typeof AnalyzePrecedentsOutputSchema>;

export async function analyzePrecedents(input: AnalyzePrecedentsInput): Promise<AnalyzePrecedentsOutput> {
  return analyzePrecedentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrecedentsPrompt',
  input: {schema: AnalyzePrecedentsInputSchema},
  output: {schema: AnalyzePrecedentsOutputSchema},
  prompt: `You are an AI Legal Research Assistant. Your task is to provide a comprehensive analysis of a user's case, including relevant precedents, strategic advice, and critical legal information.

IMPORTANT: You are not a lawyer and this is not legal advice. Start every analysis with a clear disclaimer stating this.

For the given case details and jurisdiction, provide the following:
1.  A summary of your analysis.
2.  The most relevant legal precedents. For each, include its title, citation, relevance, and potential outcome.
3.  A detailed "Case Strategy" section with potential solutions and steps on how to approach the case.
4.  A list of "Arrest Prevention Measures" outlining laws and actions to consider to avoid arrest.
5.  A list of "Rights During Arrest" detailing the legal rights an individual has if they are arrested.

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
