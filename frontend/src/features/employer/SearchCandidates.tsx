import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { User, Lock, Unlock, Search, Filter, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';

import { useDebounce } from '../../hooks/useDebounce';

// Define types for better safety
interface Candidate {
    _id: string;
    student: {
        _id: string;
        name: string;
    };
    skill: {
        _id: string;
        name: string;
        slug: string;
    };
    score: number;
    credentialId: string;
    issuedAt: string;
    isUnlocked: boolean;
    // If unlocked, these fields might be available (depending on backend implementation of UnlockedProfile vs CandidateResult)
    // The search endpoint returns basic info + isUnlocked status.
    // The 'unlock' endpoint returns full profile.
    // But our search grid card needs to handle both states.
}

export const SearchCandidates = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [skillFilter, setSkillFilter] = useState('');
    const [minScore, setMinScore] = useState('');

    // Debounce inputs to prevent flashing/refetching on every keystroke
    const debouncedSkill = useDebounce(skillFilter, 500);
    const debouncedScore = useDebounce(minScore, 500);

    const queryParams = new URLSearchParams();
    if (debouncedSkill) queryParams.append('skillSlug', debouncedSkill);
    if (debouncedScore) queryParams.append('minScore', debouncedScore);

    const { data: candidates, isLoading, error } = useQuery({
        queryKey: ['candidates', debouncedSkill, debouncedScore],
        queryFn: async () => {
            console.log('Fetching candidates...');
            const res = await api.get(`/employer/search?${queryParams.toString()}`);
            console.log('Candidates response:', res.data);
            // FIX: Access res.data.data.data instead of res.data.data.results
            // api response is { success: true, data: { data: [], pagination: {} } }
            // so res.data is the wrapper, res.data.data is the paginated result, res.data.data.data is the array
            return res.data.data.data as Candidate[];
        },
        placeholderData: (prev) => prev // Keep previous data while fetching new filter results
    });

    const unlockMutation = useMutation({
        mutationFn: async (studentId: string) => {
            const res = await api.post(`/employer/unlock/${studentId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
        },
    });

    if (isLoading && !candidates) return <FullPageSpinner />;

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-bold">Error loading candidates</h3>
                <p>{(error as Error).message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Find Vetted Engineers</h1>
                    <p className="text-gray-500 mt-1">Search through verified talent with proven skills.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                    <Badge variant="info" className="bg-indigo-600 text-white border-0 text-md px-2">{user?.employerCredits || 0}</Badge>
                    <span className="text-sm font-semibold">Credits Available</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Filter by Skill</label>
                    <div className="relative">
                        <Input
                            placeholder="e.g. react, python, node"
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            className="pl-10 h-10"
                        />
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <Button variant="outline" className="h-10" onClick={() => { setSkillFilter(''); setMinScore(''); }}>
                    <Filter className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates?.map((candidate) => (
                    <Card key={candidate._id || candidate.credentialId} className="flex flex-col overflow-hidden hover:shadow-medium transition-all group border-gray-200 h-full">
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
                                <CardTitle className="text-lg leading-tight mb-1 truncate max-w-[180px]" title={candidate.student.name}>
                                    {candidate.isUnlocked ? candidate.student.name : 'Vetted Candidate'}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Badge variant="neutral" className="bg-gray-100 text-gray-600 border-0">{candidate.skill.name}</Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-5">
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
                                <div className="bg-green-50 rounded-lg border border-green-100 p-3 space-y-2">
                                    <div className="flex items-center text-green-800 text-sm font-medium">
                                        <Unlock className="w-4 h-4 mr-2" />
                                        Profile Unlocked
                                    </div>
                                    {/* Note: Contact info might not be available in search list view, need to click unlock to get full details or if backend sends it. 
                                         Based on service, it sends basic student object. Let's assume email is not sent in search to save privacy unless specific field unlocked.
                                         The current backend searchCandidates does map student.name, but not email.
                                         Email is only in 'unlockStudent' response. 
                                         So we tell user "View in Unlocked Profiles" or something matching the UI flow.
                                     */}
                                    <p className="text-xs text-green-700">
                                        Visit "My Unlocks" to view full contact details and submissions.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-center">
                                    <Lock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">Unlock to view full profile & contact</p>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="pt-0 mt-auto">
                            {candidate.isUnlocked ? (
                                <Button className="w-full bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-default shadow-none" disabled>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Already Unlocked
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                                    isLoading={unlockMutation.isPending}
                                    onClick={() => unlockMutation.mutate(candidate.student._id)}
                                >
                                    Unlock Profile (1 Credit)
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {!isLoading && candidates?.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                        {skillFilter || minScore
                            ? "Try adjusting your filters to find more engineers."
                            : "There are no approved candidates visible at the moment."
                        }
                    </p>
                    {(skillFilter || minScore) && (
                        <Button variant="outline" className="mt-4" onClick={() => { setSkillFilter(''); setMinScore(''); }}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
