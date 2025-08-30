'use server';
/**
 * @fileOverview An AI-powered contract generation agent.
 *
 * - generateContract - A function that generates a legal contract based on user specifications.
 * - GenerateContractInput - The input type for the generateContract function.
 * - GenerateContractOutput - The return type for the generateContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContractInputSchema = z.object({
  contractType: z.string().describe('The type of legal contract to generate (e.g., NDA, Lease Agreement, Service Agreement).'),
  details: z.string().describe('A detailed description of the contract requirements, including parties involved, key terms, dates, and any specific clauses.'),
});
export type GenerateContractInput = z.infer<typeof GenerateContractInputSchema>;

const GenerateContractOutputSchema = z.object({
  contractText: z.string().describe('The full text of the generated legal contract.'),
});
export type GenerateContractOutput = z.infer<typeof GenerateContractOutputSchema>;

export async function generateContract(input: GenerateContractInput): Promise<GenerateContractOutput> {
  return generateContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContractPrompt',
  input: {schema: GenerateContractInputSchema},
  output: {schema: GenerateContractOutputSchema},
  prompt: `You are an AI Legal Assistant that specializes in drafting legal contracts.

Your task is to generate a complete, professionally formatted legal contract based on the user's specified contract type and detailed requirements. The contract should be comprehensive and ready for use, including standard legal clauses where appropriate.

IMPORTANT: Start the contract with a clear title. Use placeholders like [Name], [Address], [Date], and [Amount] for specific details that the user should fill in.

Contract Type: {{{contractType}}}
Detailed Requirements:
{{{details}}}

Generate the full contract text now.
`,
});

const generateContractFlow = ai.defineFlow(
  {
    name: 'generateContractFlow',
    inputSchema: GenerateContractInputSchema,
    outputSchema: GenerateContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
