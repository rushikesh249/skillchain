import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Award, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
    const { user } = useAuth();
    const { data: submissions, isLoading: subLoading } = useQuery({
        queryKey: ['my-submissions'],
        queryFn: async () => {
            const res = await api.get('/submissions/my');
            return res.data.data;
        }
    });

    const { data: credentials, isLoading: credLoading } = useQuery({
        queryKey: ['my-credentials'],
        queryFn: async () => {
            const res = await api.get('/credentials/my');
            return res.data.data;
        }
    });

    if (subLoading || credLoading) return <FullPageSpinner />;

    // Calculate stats
    const totalSubmissions = submissions?.length || 0;
    const pendingReviews = submissions?.filter((s: any) => s.status === 'pending').length || 0;
    const earnedCredentials = credentials?.length || 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-glow p-8 md:p-12 text-white">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
                    <p className="text-indigo-100 text-lg max-w-2xl">
                        You're on track! You have {pendingReviews} submissions under review and have earned {earnedCredentials} verified credentials so far.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Link to="/submissions/new">
                            <Button className="bg-white text-indigo-600 hover:bg-white/90 border-0 shadow-lg">
                                Submit New Project <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/credentials/my">
                            <Button variant="glass" className="text-white border-white/30 hover:bg-white/10">
                                View Credentials
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="hover:border-indigo-200 transition-colors cursor-default group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/50 rounded-full blur-xl -mr-6 -mt-6 group-hover:bg-blue-100/50 transition-colors"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Submissions</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-gray-900">{totalSubmissions}</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            All time
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-yellow-200 transition-colors cursor-default group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50/50 rounded-full blur-xl -mr-6 -mt-6 group-hover:bg-yellow-100/50 transition-colors"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Reviews</CardTitle>
                        <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-gray-900">{pendingReviews}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting expert verification</p>
                    </CardContent>
                </Card>

                <Card className="hover:border-green-200 transition-colors cursor-default group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-50/50 rounded-full blur-xl -mr-6 -mt-6 group-hover:bg-green-100/50 transition-colors"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Verified Credentials</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <Award className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold text-gray-900">{earnedCredentials}</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            Blockchain verified
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ACTIVITY FEED (Simplified) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                {submissions && submissions.length > 0 ? (
                    <div className="space-y-4">
                        {submissions.slice(0, 3).map((sub: any) => (
                            <Card key={sub._id} className="border-l-4 border-l-transparent hover:border-l-indigo-600 transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.status === 'verified' ? 'bg-green-100 text-green-600' :
                                            sub.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {sub.status === 'verified' ? <Award className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{sub.skillId.name} Submission</p>
                                            <p className="text-sm text-gray-500">Status: <span className="capitalize">{sub.status}</span></p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => { }}>View</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 border-dashed bg-gray-50/50 shadow-none">
                        <p className="text-gray-500">No recent activity. Submit your first project today!</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
