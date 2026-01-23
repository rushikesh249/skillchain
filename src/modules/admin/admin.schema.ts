import { z } from 'zod';

export const submissionIdSchema = z.object({
    id: z.string().min(1, 'Submission ID is required'),
});

export type SubmissionIdInput = z.infer<typeof submissionIdSchema>;
