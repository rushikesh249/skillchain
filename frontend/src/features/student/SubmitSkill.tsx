import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useState } from 'react';
import { BookOpen, Github, Globe, Code2 } from 'lucide-react';

const submissionSchema = z.object({
    skillId: z.string().min(1, 'Please select a skill'),
    githubRepoUrl: z.string().url('Must be a valid URL'),
    demoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    leetcodeUsername: z.string().optional(),
});

type SubmissionForm = z.infer<typeof submissionSchema>;

export const SubmitSkill = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Fetch Skills
    const { data: skills, isLoading: skillsLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const res = await api.get('/skills');
            return res.data.data;
        }
    });

    const mutation = useMutation({
        mutationFn: (data: SubmissionForm) => api.post('/submissions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
            navigate('/submissions/my');
        },
        onError: (error: any) => {
            setSubmitError(error.response?.data?.message || 'Submission failed');
        }
    });

    const { register, handleSubmit, formState: { errors } } = useForm<SubmissionForm>({
        resolver: zodResolver(submissionSchema),
    });

    const onSubmit = (data: SubmissionForm) => {
        setSubmitError(null);
        mutation.mutate(data);
    };

    if (skillsLoading) return <Spinner className="mx-auto mt-20" />;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Submit Project for Verification</h1>
                <p className="text-gray-500 mt-2">Our experts review code quality, functionality, and best practices.</p>
            </div>

            <Card className="shadow-strong border-t-4 border-t-indigo-600">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-6 w-6 text-indigo-600" />
                        Project Details
                    </CardTitle>
                    <CardDescription>
                        Provide links to your work. Ensure repositories are public.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {submitError && (
                            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                {submitError}
                            </div>
                        )}

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block">Select Skill Category</label>
                                <div className="relative">
                                    <select
                                        {...register('skillId')}
                                        className="flex h-12 w-full rounded-lg border border-gray-200 bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all appearance-none"
                                    >
                                        <option value="">Select a skill...</option>
                                        {skills?.map((skill: any) => (
                                            <option key={skill._id} value={skill._id}>
                                                {skill.name}
                                            </option>
                                        ))}
                                    </select>
                                    <BookOpen className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.skillId && <p className="text-sm text-red-600">{errors.skillId.message}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <Input
                                        label="GitHub Repository URL"
                                        placeholder="https://github.com/username/project"
                                        {...register('githubRepoUrl')}
                                        error={errors.githubRepoUrl?.message}
                                        className="pl-10"
                                    />
                                    <Github className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
                                </div>

                                <div className="relative">
                                    <Input
                                        label="Live Demo URL (Optional)"
                                        placeholder="https://myproject.com"
                                        {...register('demoUrl')}
                                        error={errors.demoUrl?.message}
                                        className="pl-10"
                                    />
                                    <Globe className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <Input
                                label="LeetCode Username (Optional)"
                                placeholder="leetcode_user"
                                {...register('leetcodeUsername')}
                                error={errors.leetcodeUsername?.message}
                            />
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                            <strong>Note:</strong> Reviews typically take 24-48 hours. You will be notified via email once the verification is complete.
                        </div>

                        <Button type="submit" size="lg" className="w-full" isLoading={mutation.isPending}>
                            Submit for Expert Review
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
