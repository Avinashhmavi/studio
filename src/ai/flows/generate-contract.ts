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
  contractText: z.string().describe('The full text of the generated legal contract, formatted with proper line breaks and spacing.'),
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

Your task is to generate a complete, professionally formatted legal contract based on the user's specified contract type and detailed requirements. The contract must be comprehensive, well-structured, and ready for use.

Follow these formatting guidelines strictly:
- The entire output must be a single string.
- Use double line breaks (\\n\\n) to separate paragraphs and sections.
- Start with a clear, centered title for the agreement (e.g., "NON-DISCLOSURE AGREEMENT").
- Use numbered sections for main clauses (e.g., "1. DEFINITION OF CONFIDENTIAL INFORMATION", "2. OBLIGATIONS OF THE RECEIVING PARTY").
- Use ALL CAPS for section headings to make them stand out.
- Use placeholders like [Name], [Address], [Date], and [Amount] for specific details that the user must fill in.
- Do NOT use markdown formatting. Use plain text with proper spacing.
- Use lettered sub-clauses (e.g., a., b., c.) for lists within sections.
- Ensure the language is professional and legally sound.
- Include standard legal clauses where appropriate, such as Governing Law, Severability, and Entire Agreement.
- End with a proper signature block for all parties.
- Use proper indentation and spacing to make the contract easy to read.
- Make sure each section is clearly separated and easy to follow.

Contract Type: {{{contractType}}}
Detailed Requirements:
{{{details}}}

Generate the full contract text now with proper formatting and structure.
`,
});

const generateContractFlow = ai.defineFlow(
  {
    name: 'generateContractFlow',
    inputSchema: GenerateContractInputSchema,
    outputSchema: GenerateContractOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a 503 error (service unavailable)
        if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded')) {
          if (attempt < maxRetries) {
            // Wait with exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Attempt ${attempt} failed with 503 error. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // For non-503 errors or final attempt, throw immediately
        throw error;
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to generate contract after multiple attempts');
  }
);
