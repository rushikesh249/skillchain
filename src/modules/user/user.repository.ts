import { User, IUser } from './user.model';
import mongoose from 'mongoose';

export class UserRepository {
    async findById(id: string): Promise<IUser | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return User.findById(id);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email: email.toLowerCase().trim() });
    }

    async create(data: {
        name: string;
        email: string;
        passwordHash: string;
        role: 'student' | 'employer' | 'admin';
        walletAddress?: string;
    }): Promise<IUser> {
        const user = new User({
            ...data,
            email: data.email.toLowerCase().trim(),
            employerCredits: data.role === 'employer' ? 5 : 0,
        });
        return user.save();
    }

    async updateCredits(userId: string, credits: number): Promise<IUser | null> {
        return User.findByIdAndUpdate(userId, { employerCredits: credits }, { new: true });
    }

    async decrementCredits(userId: string): Promise<IUser | null> {
        return User.findOneAndUpdate(
            { _id: userId, employerCredits: { $gt: 0 } },
            { $inc: { employerCredits: -1 } },
            { new: true }
        );
    }

    async findByIdWithPassword(id: string): Promise<IUser | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return User.findById(id).select('+passwordHash');
    }
}

export const userRepository = new UserRepository();
