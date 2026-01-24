import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { User, Lock, Unlock, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';

export const SearchCandidates = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [skillFilter, setSkillFilter] = useState('');
    const [minScore, setMinScore] = useState('');

    const queryParams = new URLSearchParams();
    if (skillFilter) queryParams.append('skillSlug', skillFilter);
    if (minScore) queryParams.append('minScore', minScore);

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['candidates', skillFilter, minScore],
        queryFn: async () => {
            const res = await api.get(`/employer/search?${queryParams.toString()}`);
            return res.data.data.results;
        }
    });

    const unlockMutation = useMutation({
        mutationFn: (studentId: string) => api.post(`/employer/unlock/${studentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
        },
    });

    if (isLoading) return <FullPageSpinner />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Find Vetted Engineers</h1>
                    <p className="text-gray-500 mt-1">Search through verified talent with proven skills.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                    <Badge variant="info" className="bg-indigo-600 text-white border-0">{user?.employerCredits || 0}</Badge>
                    <span className="text-sm font-semibold">Credits Available</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Skill</label>
                    <div className="relative">
                        <Input
                            placeholder="e.g. react, python, node"
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            className="pl-10 h-10" // Tweak height for filter
                        />
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <div className="w-full md:w-48">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Min Score</label>
                    <Input
                        type="number"
                        placeholder="80"
                        value={minScore}
                        onChange={(e) => setMinScore(e.target.value)}
                        className="h-10"
                    />
                </div>
                <Button variant="outline" className="h-11" onClick={() => { setSkillFilter(''); setMinScore(''); }}>
                    <Filter className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates?.map((candidate: any) => (
                    <Card key={candidate.studentId._id} className="flex flex-col overflow-hidden hover:shadow-medium transition-all group border-gray-200">
                        {/* Card Badge */}
                        {candidate.isUnlocked ? (
                            <div className="h-1 bg-green-500 w-full"></div>
                        ) : (
                            <div className="h-1 bg-gray-200 w-full group-hover:bg-indigo-500 transition-colors"></div>
                        )}

                        <CardHeader className="flex-row gap-4 items-start pb-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-md ${candidate.isUnlocked ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                                <User className="h-7 w-7" />
                            </div>
                            <div>
                                <CardTitle className="text-lg leading-tight mb-1">
                                    {candidate.isUnlocked ? candidate.studentId.name : 'Vetted Candidate'}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Badge variant="neutral" className="bg-gray-100 text-gray-600 border-0">{candidate.skillId.name}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            {/* Score Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Skill Score</span>
                                    <span className={candidate.score >= 90 ? "text-green-600" : "text-indigo-600"}>{candidate.score}/100</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${candidate.score >= 90 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${candidate.score}%` }}
                                    ></div>
                                </div>
                            </div>

                            {candidate.isUnlocked ? (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Contact Info</p>
                                    <p className="text-sm text-gray-900 font-medium truncate">{candidate.studentId.email}</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-center">
                                    <Lock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">Unlock to view full profile & contact</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            {candidate.isUnlocked ? (
                                <Button className="w-full bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-default shadow-none" disabled>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Profile Unlocked
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                                    isLoading={unlockMutation.isPending}
                                    onClick={() => unlockMutation.mutate(candidate.studentId._id)}
                                >
                                    Unlock Profile (1 Credit)
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {candidates?.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                    <p className="text-gray-500">Try adjusting your filters to find more engineers.</p>
                </div>
            )}
        </div>
    );
};
