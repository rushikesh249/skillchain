import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ExternalLink, Share2, CheckCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const MyCredentials = () => {
    const { data: credentials, isLoading } = useQuery({
        queryKey: ['my-credentials'],
        queryFn: async () => {
            const res = await api.get('/credentials/my');
            return res.data.data;
        }
    });

    if (isLoading) return <FullPageSpinner />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Verified Credentials</h1>
                    <p className="text-gray-500 mt-1">Your blockchain-verified proof of skills.</p>
                </div>
            </div>

            {credentials?.length === 0 ? (
                <Card className="text-center p-12 border-dashed bg-gray-50/50 shadow-none">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No credentials yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Complete a project and submit it for verification to earn your first on-chain credential.</p>
                    <Link to="/submissions/new">
                        <Button>Submit Your First Project</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {credentials?.map((cred: any) => (
                        <Card key={cred._id} className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border-0 shadow-medium hover:shadow-strong">
                            {/* Top Gradient Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 to-emerald-600"></div>

                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-sm border border-green-100">
                                        Verified
                                    </span>
                                </div>
                                <CardTitle className="text-xl">
                                    {cred.skillId?.name}
                                </CardTitle>
                                <CardDescription>
                                    Issued on {format(new Date(cred.issuedAt), 'MMM d, yyyy')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Proficiency Score</span>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{cred.score}/100</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Credential ID</span>
                                        <span className="font-mono text-xs text-gray-400">{cred.credentialId.substring(0, 8)}...</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-4 border-t border-gray-100 bg-gray-50/30">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600" onClick={() => window.open(cred.ipfsUrl, '_blank')}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    IPFS
                                </Button>
                                <Link to={`/verify/${cred.credentialId}`} target="_blank">
                                    <Button variant="outline" size="sm" className="bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Verify
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
