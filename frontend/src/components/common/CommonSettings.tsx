
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { User, Mail, Shield, Wallet } from 'lucide-react';

export const CommonSettings = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account preferences and view profile details.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Display Name</label>
                            <div className="relative">
                                <Input value={user?.name || ''} readOnly className="pl-10 bg-gray-50 border-gray-200" />
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Input value={user?.email || ''} readOnly className="pl-10 bg-gray-50 border-gray-200" />
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Role</label>
                            <div className="flex items-center h-10 px-3 rounded-lg border border-gray-200 bg-gray-50">
                                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="capitalize text-gray-700 font-medium">{user?.role}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                            <div className="relative">
                                <Input value={user?.walletAddress || 'Not connected'} readOnly className="pl-10 bg-gray-50 border-gray-200 font-mono text-sm" />
                                <Wallet className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <h4 className="font-medium text-gray-900">Password</h4>
                            <p className="text-sm text-gray-500">Last changed recently</p>
                        </div>
                        <Button variant="outline" disabled>Change Password</Button>
                    </div>
                </CardContent>
            </Card>

            {user?.role === 'employer' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Billing & Credits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div>
                                <h4 className="font-medium text-indigo-900">Available Credits</h4>
                                <p className="text-sm text-indigo-700">Use credits to unlock candidate profiles</p>
                            </div>
                            <Badge variant="info" className="text-lg px-4 py-1.5">{user?.employerCredits}</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
