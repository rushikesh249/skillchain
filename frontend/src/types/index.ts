export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'employer' | 'admin';
    employerCredits?: number;
    walletAddress?: string;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: {
        code: string;
        details?: unknown;
    };
}
