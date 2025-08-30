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
  documentDataUri: z
    .string()
    .describe(
      "A document (PDF, DOCX, image, or TXT) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  
Your task is to first extract all the text content from the provided document. The document can be a PDF, DOCX, image, or plain text file. After extracting the text, append a standard electronic signature block at the end. The signature block should include the signer's name and the current date. The format should be clear and professional.

Document:
---
{{media url=documentDataUri}}
---

Signer's Name: {{{signerName}}}

Return the entire extracted document content with the signature block added as the 'signedDocumentContent' field.
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
