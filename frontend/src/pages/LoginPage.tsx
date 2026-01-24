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
import { LockKeyhole } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<AuthResponse>('/auth/login', data);

            if (response.data.success) {
                const { token, user } = response.data.data;
                login(token, user);
                // Redirect logic
                if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'employer') navigate('/employer/search');
                else if (user.role === 'admin') navigate('/admin/submissions');
                else navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[90vh] px-4 relative overflow-hidden bg-gray-50/50">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <Card variant="glass" className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/60 border-white/50 shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <LockKeyhole className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your SkillChain account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg animate-fade-in flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email')}
                            error={errors.email?.message}
                            className="bg-white/50"
                        />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot?</a>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    className={`flex h-12 w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-6 pt-2">
                        <Button type="submit" size="lg" className="w-full shadow-lg hover:shadow-xl transition-all" isLoading={isLoading}>
                            Sign In
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                                Create Account
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <LockKeyhole className="w-3 h-3" />
                            <span>Secure, encrypted connection</span>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
