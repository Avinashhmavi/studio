
'use server';
/**
 * @fileOverview An AI agent for generating guided legal workflows.
 *
 * - generateWorkflow - A function that generates a step-by-step guide for a legal process.
 * - GenerateWorkflowInput - The input type for the generateWorkflow function.
 * - GenerateWorkflowOutput - The return type for the generateWorkflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorkflowInputSchema = z.object({
  topic: z.string().describe('The legal process to generate a workflow for (e.g., "filing a small claims case").'),
  jurisdiction: z.string().describe('The legal jurisdiction for the workflow.'),
});
export type GenerateWorkflowInput = z.infer<typeof GenerateWorkflowInputSchema>;

const GenerateWorkflowOutputSchema = z.object({
    workflowTitle: z.string().describe('The title of the generated workflow.'),
    steps: z.array(
        z.object({
            title: z.string().describe('The title of the workflow step.'),
            content: z.string().describe('The detailed content of the workflow step.'),
        })
    ).describe('A list of steps for the legal workflow.'),
    suggestedYoutubeSearches: z.array(
        z.string().describe('A relevant and specific search query for finding helpful videos on YouTube.')
    ).optional().describe('A list of suggested YouTube search queries to help the user find relevant videos.'),
});
export type GenerateWorkflowOutput = z.infer<typeof GenerateWorkflowOutputSchema>;

export async function generateWorkflow(input: GenerateWorkflowInput): Promise<GenerateWorkflowOutput> {
  return generateWorkflowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkflowPrompt',
  input: {schema: GenerateWorkflowInputSchema},
  output: {schema: GenerateWorkflowOutputSchema},
  prompt: `You are an AI Legal Assistant that creates step-by-step guides for common legal processes, tailored to a specific jurisdiction.

Your task is to generate a clear, comprehensive, and easy-to-follow workflow for the given topic and jurisdiction. Always include a disclaimer that the information is not legal advice.

Start by creating a title for the workflow. Then, provide a series of steps. Each step must have a clear title and detailed content explaining what to do.

Finally, provide a list of up to 3 helpful and specific search queries that the user can copy and paste into YouTube to find relevant, high-quality videos about the process. Frame these as search terms, not as video titles or URLs. For example: "how to file a small claims case in [Jurisdiction]".

Jurisdiction: {{{jurisdiction}}}
Legal Topic: {{{topic}}}
`,
});

const generateWorkflowFlow = ai.defineFlow(
  {
    name: 'generateWorkflowFlow',
    inputSchema: GenerateWorkflowInputSchema,
    outputSchema: GenerateWorkflowOutputSchema,
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
    throw lastError || new Error('Failed to generate workflow after multiple attempts');
  }
);
