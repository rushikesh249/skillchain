import mongoose, { Document, Schema } from 'mongoose';
import { SubmissionStatus, VerificationReport } from '../../shared/types';

export interface ISubmission extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    skillId: mongoose.Types.ObjectId;
    githubRepoUrl: string;
    demoUrl?: string;
    leetcodeUsername?: string;
    status: SubmissionStatus;
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
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        verificationReport: {
            type: Schema.Types.Mixed,
            default: null,
        },
        confidenceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
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
