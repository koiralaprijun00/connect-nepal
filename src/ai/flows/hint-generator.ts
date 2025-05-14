'use server';

/**
 * @fileOverview A hint generator AI agent that provides intelligent hints tailored to the user's progress.
 *
 * - generateHint - A function that generates a hint based on the user's progress.
 * - HintGeneratorInput - The input type for the generateHint function.
 * - HintGeneratorOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HintGeneratorInputSchema = z.object({
  currentGuess: z
    .array(z.string())
    .describe('The sequence of districts the user has guessed so far.'),
  shortestPath: z
    .array(z.string())
    .describe('The shortest path of districts for the puzzle.'),
  hintType: z
    .enum(['NEXT_DISTRICT_OUTLINE', 'ALL_DISTRICT_OUTLINES', 'DISTRICT_INITIALS'])
    .optional()
    .describe('The type of hint the user has requested.'),
});
export type HintGeneratorInput = z.infer<typeof HintGeneratorInputSchema>;

const HintGeneratorOutputSchema = z.object({
  hint: z.string().describe('The hint to display to the user.'),
  hintType: z
    .enum(['NEXT_DISTRICT_OUTLINE', 'ALL_DISTRICT_OUTLINES', 'DISTRICT_INITIALS'])
    .describe('The type of hint provided.'),
});
export type HintGeneratorOutput = z.infer<typeof HintGeneratorOutputSchema>;

export async function generateHint(input: HintGeneratorInput): Promise<HintGeneratorOutput> {
  return hintGeneratorFlow(input);
}

const hintGeneratorPrompt = ai.definePrompt({
  name: 'hintGeneratorPrompt',
  input: {schema: HintGeneratorInputSchema},
  output: {schema: HintGeneratorOutputSchema},
  prompt: `You are an intelligent assistant designed to provide hints for a Nepal traversal puzzle.
The user is trying to guess the shortest path between two districts in Nepal.

Given the user's current guess and the actual shortest path, analyze the user's progress and determine the most helpful type of hint to provide.

If the user has not made any progress, suggest revealing the next district outline.
If the user has made some progress but is stuck, suggest revealing the initials of the next district.
If the user is close to the solution, suggest revealing all district outlines.
If the user specifies a hint type, fulfill the request no matter the current progress.

Current Guess: {{currentGuess}}
Shortest Path: {{shortestPath}}

Based on this information, provide a hint to help the user solve the puzzle more efficiently.

Hint Type (if requested): {{hintType}}
`,
});

const hintGeneratorFlow = ai.defineFlow(
  {
    name: 'hintGeneratorFlow',
    inputSchema: HintGeneratorInputSchema,
    outputSchema: HintGeneratorOutputSchema,
  },
  async input => {
    const {output} = await hintGeneratorPrompt(input);
    return output!;
  }
);
