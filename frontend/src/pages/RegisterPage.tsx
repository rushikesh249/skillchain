import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useState } from 'react';
import type { AuthResponse } from '../types';
import { Building2, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['student', 'employer']),
    walletAddress: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'student',
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<AuthResponse>('/auth/register', data);

            if (response.data.success) {
                const { token, user } = response.data.data;
                login(token, user);

                if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'employer') navigate('/employer/search');
                else navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[90vh] px-4 py-8 relative bg-gray-50/50">
            {/* Background Decor */}
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <Card variant="glass" className="w-full max-w-lg relative z-10 backdrop-blur-xl bg-white/60 border-white/50 shadow-2xl">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-3xl">Create Account</CardTitle>
                    <CardDescription>Join SkillChain to prove your skills or hire talent</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Custom Role Selector */}
                        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100/50 rounded-xl border border-gray-200/50">
                            <button
                                type="button"
                                onClick={() => setValue('role', 'student')}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200 border-2",
                                    selectedRole === 'student'
                                        ? "bg-white border-indigo-600 shadow-md transform scale-[1.02]"
                                        : "bg-transparent border-transparent hover:bg-gray-50 text-gray-500"
                                )}
                            >
                                <GraduationCap className={cn("w-6 h-6", selectedRole === 'student' ? "text-indigo-600" : "text-gray-400")} />
                                <span className={cn("font-semibold text-sm", selectedRole === 'student' ? "text-indigo-900" : "text-gray-500")}>Student</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setValue('role', 'employer')}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200 border-2",
                                    selectedRole === 'employer'
                                        ? "bg-white border-violet-600 shadow-md transform scale-[1.02]"
                                        : "bg-transparent border-transparent hover:bg-gray-50 text-gray-500"
                                )}
                            >
                                <Building2 className={cn("w-6 h-6", selectedRole === 'employer' ? "text-violet-600" : "text-gray-400")} />
                                <span className={cn("font-semibold text-sm", selectedRole === 'employer' ? "text-violet-900" : "text-gray-500")}>Employer</span>
                            </button>
                            <input type="hidden" {...register('role')} />
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                placeholder="Jane Doe"
                                {...register('name')}
                                error={errors.name?.message}
                                className="bg-white/50"
                            />
                            <Input
                                label="Work Email"
                                type="email"
                                placeholder="jane@example.com"
                                {...register('email')}
                                error={errors.email?.message}
                                className="bg-white/50"
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                error={errors.password?.message}
                                className="bg-white/50"
                            />
                            <Input
                                label="Wallet Address (Optional)"
                                placeholder="0x..."
                                {...register('walletAddress')}
                                error={errors.walletAddress?.message}
                                className="bg-white/50 font-mono text-xs"
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col space-y-6 pt-2">
                        <Button type="submit" size="lg" className="w-full shadow-lg hover:shadow-xl transition-all" isLoading={isLoading}>
                            Start {selectedRole === 'student' ? 'Earning' : 'Hiring'} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                                Log in
                            </Link>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-green-600/80 bg-green-50 py-2 px-4 rounded-full w-fit mx-auto border border-green-100">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Your data is stored securely</span>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
