// src/ai/flows/analyze-legal-documents.ts
'use server';

/**
 * @fileOverview Analyzes legal documents to extract key terms and potential risks, highlighting areas that require attention.
 *
 * - analyzeLegalDocument - A function that handles the legal document analysis process.
 * - AnalyzeLegalDocumentInput - The input type for the analyzeLegalDocument function.
 * - AnalyzeLegalDocumentOutput - The return type for the analyzeLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLegalDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A legal document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLegalDocumentInput = z.infer<typeof AnalyzeLegalDocumentInputSchema>;

const AnalyzeLegalDocumentOutputSchema = z.object({
  summary: z.string().describe('A summary of the legal document.'),
  keyTerms: z.array(z.string()).describe('Key terms extracted from the document.'),
  potentialRisks: z
    .array(z.string())
    .describe('Potential risks identified in the document.'),
  areasRequiringAttention: z
    .array(z.string())
    .describe('Areas in the document that require attention.'),
});

export type AnalyzeLegalDocumentOutput = z.infer<typeof AnalyzeLegalDocumentOutputSchema>;

export async function analyzeLegalDocument(
  input: AnalyzeLegalDocumentInput
): Promise<AnalyzeLegalDocumentOutput> {
  return analyzeLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLegalDocumentPrompt',
  input: {schema: AnalyzeLegalDocumentInputSchema},
  output: {schema: AnalyzeLegalDocumentOutputSchema},
  prompt: `You are an AI assistant specializing in legal document analysis. Your task is to extract key terms, identify potential risks, and highlight areas that require attention from a legal document.

  Analyze the following legal document:
  {{media url=documentDataUri}}

  Output a summary of the document, a list of key terms, potential risks, and areas requiring attention.

  Summary:
  Key Terms:
  Potential Risks:
  Areas Requiring Attention:`,
});

const analyzeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeLegalDocumentFlow',
    inputSchema: AnalyzeLegalDocumentInputSchema,
    outputSchema: AnalyzeLegalDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
