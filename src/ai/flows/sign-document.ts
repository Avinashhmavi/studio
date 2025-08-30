'use server';

/**
 * @fileOverview An AI agent for signing a document.
 *
 * - signDocument - A function that adds a signature block to a document.
 * - SignDocumentInput - The input type for the signDocument function.
 * - SignDocumentOutput - The return type for the signDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SignDocumentInputSchema = z.object({
  documentContent: z.string().describe('The text content of the document to be signed.'),
  signerName: z.string().describe("The full name of the person signing the document."),
});
export type SignDocumentInput = z.infer<typeof SignDocumentInputSchema>;

const SignDocumentOutputSchema = z.object({
  signedDocumentContent: z.string().describe('The document content with a signature block appended.'),
});
export type SignDocumentOutput = z.infer<typeof SignDocumentOutputSchema>;

export async function signDocument(input: SignDocumentInput): Promise<SignDocumentOutput> {
  return signDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'signDocumentPrompt',
  input: {schema: SignDocumentInputSchema},
  output: {schema: SignDocumentOutputSchema},
  prompt: `You are an AI assistant. A user wants to electronically sign a document.
  
Take the following document content and append a standard electronic signature block at the end. The signature block should include the signer's name and the current date. The format should be clear and professional.

Document Content:
---
{{{documentContent}}}
---

Signer's Name: {{{signerName}}}

Return the entire document content with the signature block added as the 'signedDocumentContent' field.
`,
});

const signDocumentFlow = ai.defineFlow(
  {
    name: 'signDocumentFlow',
    inputSchema: SignDocumentInputSchema,
    outputSchema: SignDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
