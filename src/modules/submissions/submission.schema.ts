import { z } from 'zod';

export const createSubmissionSchema = z.object({
    skillId: z.string().min(1, 'Skill ID is required'),
    githubRepoUrl: z
        .string()
        .url('Invalid GitHub URL')
        .refine((url) => url.includes('github.com'), {
            message: 'URL must be a GitHub repository URL',
        }),
    demoUrl: z.string().url('Invalid demo URL').optional().or(z.literal('')),
    leetcodeUsername: z.string().optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
