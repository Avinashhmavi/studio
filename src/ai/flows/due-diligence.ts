
'use server';

/**
 * @fileOverview Conducts due diligence by analyzing a set of legal and financial documents.
 *
 * - performDueDiligence - A function that handles the due diligence process.
 * - DueDiligenceInput - The input type for the performDueDiligence function.
 * - DueDiligenceOutput - The return type for the performDueDiligence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DueDiligenceInputSchema = z.object({
  documentDataUris: z
    .array(z.string())
    .describe(
      "An array of documents (e.g., contracts, financial statements) as data URIs. Each URI must include a MIME type and use Base64 encoding."
    ),
  transactionDetails: z.string().describe('A description of the transaction, such as a merger, acquisition, or partnership, including the roles of the parties involved.'),
});
export type DueDiligenceInput = z.infer<typeof DueDiligenceInputSchema>;

const DueDiligenceOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level summary of the due diligence findings.'),
  keyFindings: z
    .array(z.object({
        area: z.string().describe('The area of due diligence (e.g., Financial, Legal, IP, HR).'),
        finding: z.string().describe('A specific finding or observation.'),
        riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The assessed level of risk for the finding.'),
        recommendation: z.string().describe('A recommended action or mitigation step.'),
    }))
    .describe('A list of key findings and identified risks from the documents.'),
});

export type DueDiligenceOutput = z.infer<typeof DueDiligenceOutputSchema>;

export async function performDueDiligence(
  input: DueDiligenceInput
): Promise<DueDiligenceOutput> {
  return dueDiligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dueDiligencePrompt',
  input: {schema: DueDiligenceInputSchema},
  output: {schema: DueDiligenceOutputSchema},
  prompt: `You are an AI assistant specializing in legal and financial due diligence for business transactions.

Your task is to analyze a set of documents related to a specific transaction and produce a concise due diligence report.

Transaction Context:
{{{transactionDetails}}}

Analyze the following documents:
{{#each documentDataUris}}
- Document: {{media url=this}}
{{/each}}

Based on your analysis, provide:
1.  An "Executive Summary" of the overall findings.
2.  A list of "Key Findings & Risks". For each finding, specify the area (e.g., Financial, Legal, IP), describe the finding, assess the risk level (Low, Medium, High), and provide a clear recommendation.
`,
});

const dueDiligenceFlow = ai.defineFlow(
  {
    name: 'dueDiligenceFlow',
    inputSchema: DueDiligenceInputSchema,
    outputSchema: DueDiligenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
