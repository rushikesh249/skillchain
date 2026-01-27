import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export const VerifyPage = () => {
    const { credentialId } = useParams<{ credentialId: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ['verify', credentialId],
        queryFn: async () => {
            const res = await api.get<{ success: boolean; data: any }>(`/verify/${credentialId}`);
            return res.data.data;
        },
        enabled: !!credentialId,
    });

    if (isLoading) return <FullPageSpinner />;

    if (error || !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <ShieldCheck className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Credential Not Found</h2>
                <p className="text-gray-600">The credential ID provided is invalid or does not exist.</p>
            </div>
        );
    }

    // Adapt data - backend returns nested structure
    const { credential: credData, student, skill } = data;

    // Map to flat structure for easier access
    const credential = {
        ...credData,
        studentName: student.name,
        skillName: skill.name,
        confidenceScore: credData.score,
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <Card className="border-t-4 border-t-blue-600 shadow-lg">
                <CardHeader className="text-center border-b border-gray-100 pb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <Badge variant="success" className="mx-auto mb-4 px-3 py-1 text-sm">Verified Credential</Badge>
                    <CardTitle className="text-3xl font-bold text-gray-900">{credential.studentName}</CardTitle>
                    <p className="text-gray-500 mt-2">has successfully demonstrated proficiency in</p>
                    <h2 className="text-2xl font-bold text-blue-600 mt-1">{credential.skillName}</h2>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Confidence Score</p>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">{credential.score}</span>
                                <span className="text-sm text-gray-400 ml-1">/ 100</span>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                            <p className="text-lg font-medium text-gray-900">
                                {credential.issuedAt ? new Date(credential.issuedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Blockchain Verification</h4>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="justify-between h-auto py-3" onClick={() => window.open(credential.ipfsUrl, '_blank')}>
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    View Certificate on IPFS
                                </span>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                            </Button>

                            {credential.blockchainTxHash ? (
                                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 break-all text-xs font-mono text-gray-600">
                                    <span className="block text-gray-400 mb-1 uppercase tracking-wide text-[10px]">Transaction Hash</span>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${credential.blockchainTxHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {credential.blockchainTxHash}
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Blockchain minting pending or skipped.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
