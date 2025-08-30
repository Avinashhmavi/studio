'use server';
/**
 * @fileOverview An AI-powered negotiation support agent.
 *
 * - negotiateContract - A function that provides negotiation strategies for a contract.
 * - NegotiateContractInput - The input type for the negotiateContract function.
 * - NegotiateContractOutput - The return type for the negotiateContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NegotiateContractInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      "A legal contract document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  negotiationGoals: z.string().describe('The user specified goals for the negotiation.'),
});
export type NegotiateContractInput = z.infer<typeof NegotiateContractInputSchema>;

const NegotiateContractOutputSchema = z.object({
  negotiationStrategies: z
    .string()
    .describe('A list of negotiation strategies based on the contract and user goals.'),
});
export type NegotiateContractOutput = z.infer<typeof NegotiateContractOutputSchema>;

export async function negotiateContract(input: NegotiateContractInput): Promise<NegotiateContractOutput> {
  return negotiateContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'negotiateContractPrompt',
  input: {schema: NegotiateContractInputSchema},
  output: {schema: NegotiateContractOutputSchema},
  prompt: `You are an AI-powered legal assistant that provides negotiation strategies for contracts.

  A user will upload a contract and specify goals for the negotiation. You will review the contract and generate a list of negotiation strategies based on the contract contents and user specified goals.

  Contract: {{media url=contractDataUri}}
  Negotiation Goals: {{{negotiationGoals}}}
  `,
});

const negotiateContractFlow = ai.defineFlow(
  {
    name: 'negotiateContractFlow',
    inputSchema: NegotiateContractInputSchema,
    outputSchema: NegotiateContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
