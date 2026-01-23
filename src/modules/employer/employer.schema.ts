import { z } from 'zod';

export const searchCandidatesSchema = z.object({
    skillSlug: z.string().optional(),
    minScore: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0))
        .pipe(z.number().min(0).max(100)),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .pipe(z.number().min(1)),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .pipe(z.number().min(1).max(100)),
});

export const unlockStudentSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
});

export type SearchCandidatesInput = z.infer<typeof searchCandidatesSchema>;
export type UnlockStudentInput = z.infer<typeof unlockStudentSchema>;
