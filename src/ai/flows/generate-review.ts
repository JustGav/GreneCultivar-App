// src/ai/flows/generate-review.ts
'use server';

/**
 * @fileOverview AI-powered review generation for cannabis cultivars, including sentiment analysis.
 *
 * - generateCultivarReview - Generates a review and sentiment score for a given cultivar.
 * - GenerateCultivarReviewInput - The input type for the generateCultivarReview function.
 * - GenerateCultivarReviewOutput - The return type for the generateCultivarReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCultivarReviewInputSchema = z.object({
  cultivarName: z.string().describe('The name of the cannabis cultivar.'),
  userExperience: z
    .string()
    .describe('A description of the users experience with the cultivar.'),
});
export type GenerateCultivarReviewInput = z.infer<typeof GenerateCultivarReviewInputSchema>;

const GenerateCultivarReviewOutputSchema = z.object({
  review: z.string().describe('The generated review of the cannabis cultivar.'),
  sentimentScore: z
    .number()
    .describe(
      'A sentiment score from -1 (negative) to 1 (positive) indicating the sentiment of the review.'
    ),
});
export type GenerateCultivarReviewOutput = z.infer<typeof GenerateCultivarReviewOutputSchema>;

export async function generateCultivarReview(
  input: GenerateCultivarReviewInput
): Promise<GenerateCultivarReviewOutput> {
  return generateCultivarReviewFlow(input);
}

const analyzeSentiment = ai.defineTool({
  name: 'analyzeSentiment',
  description: 'Analyzes the sentiment of a given text and returns a sentiment score.',
  inputSchema: z.object({
    text: z.string().describe('The text to analyze.'),
  }),
  outputSchema: z.number().describe('Sentiment score from -1 (negative) to 1 (positive).'),
},
async (input) => {
  const sentimentPrompt = ai.definePrompt({
    name: 'sentimentPrompt',
    input: {schema: z.object({text: z.string()})},
    output: {schema: z.object({sentiment: z.number()})},
    prompt: `What is the sentiment of this text? Answer as a number between -1 and 1.

Text: {{{text}}} `,
  });
  const {output} = await sentimentPrompt(input);
  return output!.sentiment;
});

const reviewPrompt = ai.definePrompt({
  name: 'cultivarReviewPrompt',
  tools: [analyzeSentiment],
  input: {schema: GenerateCultivarReviewInputSchema},
  output: {schema: GenerateCultivarReviewOutputSchema},
  prompt: `You are an AI assistant specialized in generating short, user-friendly reviews for cannabis cultivars based on user experiences.

  Generate a review for the cultivar: {{{cultivarName}}}.\n  The review should incorporate details from the user's experience: {{{userExperience}}}.\n  Use the analyzeSentiment tool to get a sentiment score for the generated review.
  \n  Output ONLY a JSON object with the review and sentimentScore fields.
  `,
});

const generateCultivarReviewFlow = ai.defineFlow(
  {
    name: 'generateCultivarReviewFlow',
    inputSchema: GenerateCultivarReviewInputSchema,
    outputSchema: GenerateCultivarReviewOutputSchema,
  },
  async input => {
    const {output} = await reviewPrompt(input);
    return output!;
  }
);
