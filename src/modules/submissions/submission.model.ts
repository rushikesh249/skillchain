import mongoose, { Document, Schema } from 'mongoose';
import { VerificationReport } from '../../shared/types';

export interface ISubmission extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    skillId: mongoose.Types.ObjectId;
    githubRepoUrl: string;
    demoUrl?: string;
    leetcodeUsername?: string;
    status: 'pending' | 'approved' | 'rejected' | 'verified'; // Keeping verified for back-compat if needed, but logic will use approved
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    reviewNotes?: string;
    isVisibleToEmployers: boolean;
    blockchainStatus: 'not_started' | 'minted' | 'failed';
    tokenId?: string;
    transactionHash?: string;
    verificationReport: VerificationReport | null;
    confidenceScore: number;
    flags: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface SubmissionDocument {
    __v?: unknown;
    [key: string]: unknown;
}

const submissionSchema = new Schema<ISubmission>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        skillId: {
            type: Schema.Types.ObjectId,
            ref: 'Skill',
            required: true,
        },
        githubRepoUrl: {
            type: String,
            required: true,
            trim: true,
        },
        demoUrl: {
            type: String,
            trim: true,
        },
        leetcodeUsername: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'verified', 'approved', 'rejected'],
            default: 'pending',
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
        reviewNotes: {
            type: String,
            trim: true,
        },
        isVisibleToEmployers: {
            type: Boolean,
            default: false,
        },
        blockchainStatus: {
            type: String,
            enum: ['not_started', 'minted', 'failed'],
            default: 'not_started',
        },
        tokenId: {
            type: String,
            trim: true,
        },
        transactionHash: {
            type: String,
            trim: true,
        },
        verificationReport: {
            type: Schema.Types.Mixed, // Or specific sub-schema
            default: null,
        },
        confidenceScore: {
            type: Number,
            default: 0,
            index: true,
        },
        flags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret: SubmissionDocument) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

submissionSchema.index({ studentId: 1, skillId: 1 });
submissionSchema.index({ status: 1, createdAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
