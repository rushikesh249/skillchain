import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { User, Mail, Calendar, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';

export const UnlockedProfiles = () => {
    const { data: unlocks, isLoading } = useQuery({
        queryKey: ['unlocked-profiles'],
        queryFn: async () => {
            const res = await api.get('/employer/unlocks');
            return res.data.data;
        }
    });

    if (isLoading) return <FullPageSpinner />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Unlocked Profiles</h1>
                <p className="text-gray-500 mt-1">Talent you have previously connected with.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlocks?.map((log: any) => (
                    <Card key={log._id} className="hover:shadow-medium transition-shadow border-0 shadow-soft">
                        <CardHeader className="flex-row gap-4 items-center pb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CardTitle className="text-lg truncate">{log.studentId.name}</CardTitle>
                                <CardDescription className="text-xs flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    Unlocked {format(new Date(log.unlockedAt), 'MMM d, yyyy')}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 group hover:border-indigo-200 transition-colors">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Mail className="h-4 w-4 text-indigo-500" />
                                </div>
                                <span className="font-medium truncate">{log.studentId.email}</span>
                            </div>

                            <Button variant="outline" className="w-full group" onClick={() => window.location.href = `mailto:${log.studentId.email}`}>
                                Contact Candidate
                                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {unlocks?.length === 0 && (
                <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500">You haven't unlocked any profiles yet.</p>
                </div>
            )}
        </div>
    );
};
