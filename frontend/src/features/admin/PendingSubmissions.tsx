import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { format } from 'date-fns';
import { Clock, Github, Globe, CheckCircle } from 'lucide-react';

export const PendingSubmissions = () => {
    const queryClient = useQueryClient();

    const { data: submissions, isLoading } = useQuery({
        queryKey: ['admin-pending'],
        queryFn: async () => {
            const res = await api.get('/admin/submissions/pending');
            return res.data.data;
        }
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => api.post(`/admin/submissions/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending'] });
            alert('Submission verified and visible to employers');
        },
        onError: () => {
            alert('Failed to approve');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            api.post(`/admin/submissions/${id}/reject`, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending'] });
            alert('Submission rejected');
        },
        onError: () => {
            alert('Failed to reject');
        }
    });

    if (isLoading) return <FullPageSpinner />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Verification Queue</h1>
                    <p className="text-gray-500 mt-1">Review and validate student project submissions.</p>
                </div>
            </div>

            <Card className="shadow-medium border-0 overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gray-50/30">
                    <CardTitle className="text-lg">Needs Review <span className="ml-2 inline-flex items-center justify-center bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{submissions?.length || 0}</span></CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-gray-50/50">
                                <tr className="">
                                    <th className="h-12 px-6 align-middle font-medium text-gray-500 uppercase tracking-wider text-xs">Candidate</th>
                                    <th className="h-12 px-6 align-middle font-medium text-gray-500 uppercase tracking-wider text-xs">Skill</th>
                                    <th className="h-12 px-6 align-middle font-medium text-gray-500 uppercase tracking-wider text-xs">Evidence</th>
                                    <th className="h-12 px-6 align-middle font-medium text-gray-500 uppercase tracking-wider text-xs">AI Confidence</th>
                                    <th className="h-12 px-6 align-middle font-medium text-gray-500 uppercase tracking-wider text-xs">Submitted</th>
                                    <th className="h-12 px-6 align-middle font-medium text-gray-500 uppercase tracking-wider text-xs text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {submissions?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle className="h-8 w-8 text-green-500/50" />
                                                <p>All caught up! No pending submissions.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    submissions?.map((submission: any) => (
                                        <tr key={submission._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-6 align-middle">
                                                <div className="font-semibold text-gray-900">{submission.studentId?.name || 'Unknown Student'}</div>
                                                <div className="text-xs text-gray-500">{submission.studentId?.email || 'N/A'}</div>
                                            </td>
                                            <td className="p-6 align-middle">
                                                <Badge variant="neutral" className="bg-gray-100 text-gray-700 border-0">{submission.skillId?.name || 'Unknown Skill'}</Badge>
                                            </td>
                                            <td className="p-6 align-middle space-y-2">
                                                <a href={submission.githubRepoUrl} target="_blank" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-xs font-medium bg-indigo-50 px-2 py-1 rounded w-fit">
                                                    <Github className="w-3 h-3" /> Repository
                                                </a>
                                                {submission.demoUrl && (
                                                    <a href={submission.demoUrl} target="_blank" className="flex items-center gap-2 text-violet-600 hover:text-violet-800 text-xs font-medium bg-violet-50 px-2 py-1 rounded w-fit">
                                                        <Globe className="w-3 h-3" /> Live Demo
                                                    </a>
                                                )}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${submission.confidenceScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${submission.confidenceScore}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold">{submission.confidenceScore ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle text-xs text-gray-500">
                                                {format(new Date(submission.createdAt), 'MMM d, HH:mm')}
                                            </td>
                                            <td className="p-6 align-middle text-right space-x-2">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        isLoading={rejectMutation.isPending && rejectMutation.variables?.id === submission._id}
                                                        onClick={() => {
                                                            const reason = prompt('Enter rejection reason:');
                                                            if (reason) {
                                                                rejectMutation.mutate({ id: submission._id, reason });
                                                            }
                                                        }}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                        isLoading={approveMutation.isPending && approveMutation.variables === submission._id}
                                                        onClick={() => approveMutation.mutate(submission._id)}
                                                        disabled={rejectMutation.isPending}
                                                    >
                                                        Approve
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

