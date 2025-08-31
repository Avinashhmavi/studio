'use server';

/**
 * @fileOverview An AI agent for answering common legal questions, with optional document context.
 *
 * - answerLegalQuestions - A function that answers legal questions.
 * - AnswerLegalQuestionsInput - The input type for the answerLegalQuestions function.
 * - AnswerLegalQuestionsOutput - The return type for the answerLegalQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerLegalQuestionsInputSchema = z.object({
  question: z.string().describe('The legal question to be answered.'),
  documentDataUri: z
    .string()
    .optional()
    .describe(
      "An optional legal document as a data URI for context. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnswerLegalQuestionsInput = z.infer<typeof AnswerLegalQuestionsInputSchema>;

const AnswerLegalQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the legal question.'),
});
export type AnswerLegalQuestionsOutput = z.infer<typeof AnswerLegalQuestionsOutputSchema>;

export async function answerLegalQuestions(input: AnswerLegalQuestionsInput): Promise<AnswerLegalQuestionsOutput> {
  return answerLegalQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerLegalQuestionsPrompt',
  input: {schema: AnswerLegalQuestionsInputSchema},
  output: {schema: AnswerLegalQuestionsOutputSchema},
  prompt: `You are a helpful legal assistant. Answer the following legal question.

{{#if documentDataUri}}
Base your answer primarily on the content of the following document.
Document:
{{media url=documentDataUri}}
---
{{/if}}

Question: {{{question}}}

Answer: `,
});

const answerLegalQuestionsFlow = ai.defineFlow(
  {
    name: 'answerLegalQuestionsFlow',
    inputSchema: AnswerLegalQuestionsInputSchema,
    outputSchema: AnswerLegalQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
