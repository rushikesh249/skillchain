import jwt from 'jsonwebtoken';
import { userRepository } from '../user/user.repository';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError } from '../../shared/errors/AppError';
import { RegisterInput, LoginInput } from './auth.schema';
import { IUser } from '../user/user.model';
import { JwtPayload } from '../../shared/types';

export class AuthService {
    generateToken(user: IUser): string {
        const payload: JwtPayload = {
            id: user._id.toString(),
            role: user.role,
        };

        const options: jwt.SignOptions = {
            expiresIn: env.JWT_EXPIRES_IN as any, // Cast to any to satisfy the complex StringValue union from 'ms' library
        };

        return jwt.sign(payload as object, env.JWT_SECRET, options);
    }

    async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
        // Check if user exists
        const existingUser = await userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create user
        const user = await userRepository.create({
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
            walletAddress: input.walletAddress,
        });

        const token = this.generateToken(user);

        return { user, token };
    }

    async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
        // Find user
        const user = await userRepository.findByEmail(input.email);
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check password
        const isValid = await comparePassword(input.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const token = this.generateToken(user);

        return { user, token };
    }

    async getCurrentUser(userId: string): Promise<IUser | null> {
        return userRepository.findById(userId);
    }
}

export const authService = new AuthService();
