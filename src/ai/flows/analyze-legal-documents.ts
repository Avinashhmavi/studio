
// src/ai/flows/analyze-legal-documents.ts
'use server';

/**
 * @fileOverview Analyzes legal documents to extract key terms, potential risks, and check for compliance with specified regulations.
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
  regulations: z.array(z.string()).optional().describe('A list of regulations to check compliance against (e.g., GDPR, HIPAA).'),
});
export type AnalyzeLegalDocumentInput = z.infer<typeof AnalyzeLegalDocumentInputSchema>;

const AnalyzeLegalDocumentOutputSchema = z.object({
  summary: z.string().describe('A summary of the legal document.'),
  keyTerms: z.array(z.string()).describe('Key terms extracted from the document.'),
  potentialRisks: z
    .array(z.object({
        risk: z.string().describe('A description of the potential risk.'),
        severity: z.enum(['Low', 'Medium', 'High']).describe('The severity of the risk.'),
        recommendation: z.string().describe('A recommendation to mitigate the risk.'),
    }))
    .describe('Potential risks identified in the document.'),
  clauseAnalysis: z.array(z.object({
      clauseType: z.string().describe('The type of clause identified (e.g., "Arbitration Clause", "Auto-Renewal").'),
      explanation: z.string().describe('An explanation of what the clause is and why it matters.'),
      riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The assessed risk level of this clause.'),
      isPresent: z.boolean().describe('Whether the clause was detected in the document.'),
  })).describe('An analysis of specific high-risk clauses.'),
  complianceAnalysis: z.array(z.object({
      regulation: z.string().describe('The regulation that was checked.'),
      isCompliant: z.boolean().describe('Whether the document appears to be compliant.'),
      reasoning: z.string().describe('The reasoning behind the compliance assessment.'),
  })).optional().describe('An analysis of the document against specified regulations.'),
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
  prompt: `You are an AI assistant specializing in legal document analysis, risk assessment, and regulatory compliance.

Your task is to analyze a legal document and provide a comprehensive report covering:
1. A concise summary of the document.
2. A list of key terms.
3. A list of potential legal risks, each with a severity rating (Low, Medium, High) and a recommendation for mitigation.
4. A detailed "Clause Analysis" for the following specific clauses:
   - Arbitration Clause
   - Class-Action Waiver
   - Confession of Judgment
   - Auto-Renewal Terms
   - Hidden/Mandatory Fees
   - Penalty Clauses & Obligations
   For each of these clauses, determine if it is present in the document. If it is, provide an explanation of "why it matters" and assess its risk level (Low, Medium, High). If it is not present, mark it as not present.
5. {{#if regulations}}A compliance analysis for the following regulations: {{{regulations}}}. For each regulation, state whether the document appears compliant and provide your reasoning.{{/if}}

Analyze the following legal document:
{{media url=documentDataUri}}

{{#if regulations}}
Regulations to check for compliance: {{{regulations}}}
{{/if}}
`,
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
