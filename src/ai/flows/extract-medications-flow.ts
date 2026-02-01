'use server';

/**
 * @fileOverview A Genkit flow for extracting medication details from an image of a prescription.
 *
 * - extractMedicationsFromImage - Analyzes an image and extracts a list of medications and their dosages.
 * - ExtractMedicationsInput - The input type for the flow.
 * - ExtractMedicationsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractMedicationsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractMedicationsInput = z.infer<typeof ExtractMedicationsInputSchema>;


const MedicationSchema = z.object({
    name: z.string().describe("The name of the medication."),
    dosage: z.string().optional().describe("The dosage instructions (e.g., '500mg', '1 tablet twice a day').")
});

const ExtractMedicationsOutputSchema = z.object({
  medications: z.array(MedicationSchema).describe('A list of medications extracted from the prescription.'),
});
export type ExtractMedicationsOutput = z.infer<typeof ExtractMedicationsOutputSchema>;

export async function extractMedicationsFromImage(input: ExtractMedicationsInput): Promise<ExtractMedicationsOutput> {
  return extractMedicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMedicationsPrompt',
  input: { schema: ExtractMedicationsInputSchema },
  output: { schema: ExtractMedicationsOutputSchema },
  prompt: `You are an OCR expert specializing in reading handwritten and printed prescriptions.

Your task is to analyze the provided image of a prescription and extract all medication names and their corresponding dosages.

- Carefully identify each medication listed.
- For each medication, determine the dosage information. This may include strength (e.g., 500mg), frequency (e.g., twice daily), and form (e.g., tablet).
- If a dosage is not clearly specified for a medication, you can leave it blank.
- Return the data in the specified JSON format.

Image to analyze: {{media url=imageDataUri}}`,
});

const extractMedicationsFlow = ai.defineFlow(
  {
    name: 'extractMedicationsFlow',
    inputSchema: ExtractMedicationsInputSchema,
    outputSchema: ExtractMedicationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
