import mongoose, { Document, Schema } from 'mongoose';

export interface ICredential extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    skillId: mongoose.Types.ObjectId;
    score: number;
    ipfsCid: string;
    ipfsUrl: string;
    blockchainTxHash: string | null;
    credentialId: string;
    certificateHash: string;
    issuedAt: Date;
}

interface CredentialDocument {
    __v?: unknown;
    [key: string]: unknown;
}

const credentialSchema = new Schema<ICredential>(
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
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        ipfsCid: {
            type: String,
            required: true,
        },
        ipfsUrl: {
            type: String,
            required: true,
        },
        blockchainTxHash: {
            type: String,
            default: null,
        },
        credentialId: {
            type: String,
            required: true,
            unique: true,
        },
        certificateHash: {
            type: String,
            required: true,
            index: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
        toJSON: {
            transform: (_doc, ret: CredentialDocument) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

credentialSchema.index({ studentId: 1, skillId: 1 });
credentialSchema.index({ skillId: 1, score: -1 });

export const Credential = mongoose.model<ICredential>('Credential', credentialSchema);
