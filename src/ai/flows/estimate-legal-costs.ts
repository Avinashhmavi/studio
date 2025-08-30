
'use server';
/**
 * @fileOverview An AI-powered legal cost estimation agent.
 *
 * - estimateLegalCosts - A function that estimates legal costs for a case.
 * - EstimateLegalCostsInput - The input type for the estimateLegalCosts function.
 * - EstimateLegalCostsOutput - The return type for the estimateLegalCosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateLegalCostsInputSchema = z.object({
  caseDescription: z.string().describe('A detailed description of the legal case.'),
  jurisdiction: z.string().describe('The legal jurisdiction for the case.'),
  attorneyExperience: z.enum(['Junior', 'Senior', 'Partner']).describe('The experience level of the attorney.'),
});
export type EstimateLegalCostsInput = z.infer<typeof EstimateLegalCostsInputSchema>;

const EstimateLegalCostsOutputSchema = z.object({
  estimatedCostRange: z.string().describe('The estimated total cost range for the legal case (e.g., "$5,000 - $10,000").'),
  costBreakdown: z.array(
    z.object({
      item: z.string().describe('The specific cost item (e.g., Attorney Fees, Filing Fees).'),
      cost: z.string().describe('The estimated cost for this item.'),
      description: z.string().describe('A brief description of what this cost item covers.'),
    })
  ).describe('A breakdown of the estimated costs.'),
  disclaimer: z.string().describe('A disclaimer stating that this is an estimate and not a formal quote.'),
});
export type EstimateLegalCostsOutput = z.infer<typeof EstimateLegalCostsOutputSchema>;

export async function estimateLegalCosts(input: EstimateLegalCostsInput): Promise<EstimateLegalCostsOutput> {
  return estimateLegalCostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateLegalCostsPrompt',
  input: {schema: EstimateLegalCostsInputSchema},
  output: {schema: EstimateLegalCostsOutputSchema},
  prompt: `You are an AI Legal Cost Estimator. Your task is to provide a realistic cost estimate for a legal case based on its complexity, jurisdiction, and the experience level of the attorney.

Provide the following:
1.  An "estimatedCostRange" which is a string representing the likely total cost (e.g., "$5,000 - $8,000").
2.  A "costBreakdown" array detailing the components of the total cost. Include items like attorney fees, filing fees, expert witness fees, etc., where applicable. For each item, provide the estimated cost and a brief description.
3.  A clear "disclaimer" stating that this is an estimate, not a quote, and actual costs may vary.

Jurisdiction: {{{jurisdiction}}}
Attorney Experience Level: {{{attorneyExperience}}}
Case Description: {{{caseDescription}}}
`,
});

const estimateLegalCostsFlow = ai.defineFlow(
  {
    name: 'estimateLegalCostsFlow',
    inputSchema: EstimateLegalCostsInputSchema,
    outputSchema: EstimateLegalCostsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
