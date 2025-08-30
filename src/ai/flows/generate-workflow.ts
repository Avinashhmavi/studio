
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
    youtubeLinks: z.array(
        z.object({
            title: z.string().describe('The title of the YouTube video.'),
            url: z.string().url().describe('The URL of the YouTube video.'),
        })
    ).optional().describe('A list of relevant YouTube videos explaining the process.'),
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

Finally, search for and include up to 3 relevant, high-quality YouTube videos that provide a good visual or detailed explanation of the process.

**CRITICAL INSTRUCTION:** You MUST ensure the video URLs you provide are valid, public, and currently available. Do not under any circumstances provide links to videos that are private, have been deleted, or are region-locked. Double-check that each URL leads to a playable video before including it in the output. Provide the title and the full, valid URL for each video.

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
    const {output} = await prompt(input);
    return output!;
  }
);
