import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../../shared/types';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    walletAddress?: string;
    employerCredits: number;
    createdAt: Date;
    updatedAt: Date;
}

interface UserDocument {
    passwordHash?: unknown;
    __v?: unknown;
    [key: string]: unknown;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['student', 'employer', 'admin'],
            required: true,
        },
        walletAddress: {
            type: String,
            trim: true,
        },
        employerCredits: {
            type: Number,
            default: function (this: IUser) {
                return this.role === 'employer' ? 5 : 0;
            },
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret: UserDocument) => {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
    }
);

userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
