
'use server';
/**
 * @fileOverview An AI agent for detecting hidden "junk fees" in rental leases.
 *
 * - detectJunkFees - A function that analyzes a lease and identifies potential junk fees.
 * - DetectJunkFeesInput - The input type for the detectJunkFees function.
 * - DetectJunkFeesOutput - The return type for the detectJunkFees function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectJunkFeesInputSchema = z.object({
  leaseDocumentDataUri: z
    .string()
    .describe(
      "A rental lease agreement as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    baseRent: z.number().describe('The advertised monthly base rent amount.'),
});
export type DetectJunkFeesInput = z.infer<typeof DetectJunkFeesInputSchema>;

const DetectJunkFeesOutputSchema = z.object({
  identifiedFees: z.array(z.object({
    feeName: z.string().describe('The name of the identified fee (e.g., "Administrative Fee").'),
    amount: z.number().describe('The monetary amount of the fee.'),
    description: z.string().describe('A brief explanation of the fee and why it might be considered a "junk fee".'),
  })).describe('A list of potential junk fees found in the lease.'),
  trueTotalMonthlyCost: z.number().describe('The calculated true total monthly cost, including the base rent and all identified mandatory monthly fees.'),
  summary: z.string().describe('A summary of the findings, explaining the impact of the junk fees on the total cost of the lease.'),
});
export type DetectJunkFeesOutput = z.infer<typeof DetectJunkFeesOutputSchema>;

export async function detectJunkFees(input: DetectJunkFeesInput): Promise<DetectJunkFeesOutput> {
  return detectJunkFeesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectJunkFeesPrompt',
  input: {schema: DetectJunkFeesInputSchema},
  output: {schema: DetectJunkFeesOutputSchema},
  prompt: `You are an AI assistant specializing in tenant rights and rental agreements. Your task is to analyze a rental lease agreement to identify hidden "junk fees". These are mandatory charges that are not part of the advertised base rent, making the true cost of living opaque.

Examples of junk fees include, but are not limited to:
- Administrative fees
- Smart lock fees
- Valet trash service fees
- Pest control fees
- Amenity fees
- Community fees
- Package handling fees

Analyze the provided lease document. Identify all mandatory monthly fees besides the base rent. For each fee, provide its name, amount, and a brief description.

Then, calculate the "true" total monthly cost by adding the base rent to all the identified monthly junk fees.

Finally, provide a summary of your findings.

Base Rent: \${{baseRent}}
Lease Document:
{{media url=leaseDocumentDataUri}}
`,
});

const detectJunkFeesFlow = ai.defineFlow(
  {
    name: 'detectJunkFeesFlow',
    inputSchema: DetectJunkFeesInputSchema,
    outputSchema: DetectJunkFeesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
