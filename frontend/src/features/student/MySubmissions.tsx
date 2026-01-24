import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { format } from 'date-fns';
import { FileCode2 } from 'lucide-react';

export const MySubmissions = () => {
    const { data: submissions, isLoading } = useQuery({
        queryKey: ['my-submissions'],
        queryFn: async () => {
            const res = await api.get('/submissions/my');
            return res.data.data;
        }
    });

    if (isLoading) return <FullPageSpinner />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Submissions</h1>
                    <p className="text-gray-500 mt-1">Track the status of your verification requests.</p>
                </div>
            </div>

            <Card className="shadow-medium border-0 overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr className="">
                                    <th className="h-12 px-6 text-left align-middle font-semibold text-gray-600">Skill</th>
                                    <th className="h-12 px-6 text-left align-middle font-semibold text-gray-600">Date Submitted</th>
                                    <th className="h-12 px-6 text-left align-middle font-semibold text-gray-600">Repository</th>
                                    <th className="h-12 px-6 text-left align-middle font-semibold text-gray-600">Score</th>
                                    <th className="h-12 px-6 text-left align-middle font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {submissions?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No submissions yet. Start building your portfolio!
                                        </td>
                                    </tr>
                                ) : (
                                    submissions?.map((submission: any) => (
                                        <tr key={submission._id} className="transition-colors hover:bg-gray-50/30 group">
                                            <td className="p-6 align-middle font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {submission.skillId?.name || 'Unknown Skill'}
                                            </td>
                                            <td className="p-6 align-middle text-gray-500">
                                                {format(new Date(submission.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <a
                                                    href={submission.githubRepoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors gap-1.5"
                                                >
                                                    <FileCode2 className="w-4 h-4" />
                                                    View Code
                                                </a>
                                            </td>
                                            <td className="p-6 align-middle font-mono font-medium">
                                                {submission.confidenceScore > 0 ? (
                                                    <span className={submission.confidenceScore >= 80 ? "text-green-600" : "text-yellow-600"}>
                                                        {submission.confidenceScore}
                                                    </span>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <Badge variant={
                                                    submission.status === 'verified' ? 'success' :
                                                        submission.status === 'rejected' ? 'destructive' : 'warning'
                                                } className="capitalize px-3 py-1">
                                                    {submission.status}
                                                </Badge>
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
