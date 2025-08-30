'use server';

/**
 * @fileOverview Compares two legal documents and highlights the differences.
 *
 * - compareLegalDocuments - A function that handles the legal document comparison process.
 * - CompareLegalDocumentsInput - The input type for the compareLegalDocuments function.
 * - CompareLegalDocumentsOutput - The return type for the compareLegalDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareLegalDocumentsInputSchema = z.object({
  document1DataUri: z
    .string()
    .describe(
      "The first legal document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  document2DataUri: z
    .string()
    .describe(
      "The second legal document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CompareLegalDocumentsInput = z.infer<typeof CompareLegalDocumentsInputSchema>;

const CompareLegalDocumentsOutputSchema = z.object({
  comparisonSummary: z
    .string()
    .describe('A summary of the differences between the two documents.'),
});

export type CompareLegalDocumentsOutput = z.infer<typeof CompareLegalDocumentsOutputSchema>;

export async function compareLegalDocuments(
  input: CompareLegalDocumentsInput
): Promise<CompareLegalDocumentsOutput> {
  return compareLegalDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareLegalDocumentsPrompt',
  input: {schema: CompareLegalDocumentsInputSchema},
  output: {schema: CompareLegalDocumentsOutputSchema},
  prompt: `You are an AI assistant specializing in legal document comparison. Your task is to compare two legal documents and provide a summary of the differences.

  Analyze the following two legal documents and highlight the key differences between them.

  Document 1:
  {{media url=document1DataUri}}

  Document 2:
  {{media url=document2DataUri}}

  Output a summary of the differences.`,
});

const compareLegalDocumentsFlow = ai.defineFlow(
  {
    name: 'compareLegalDocumentsFlow',
    inputSchema: CompareLegalDocumentsInputSchema,
    outputSchema: CompareLegalDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
