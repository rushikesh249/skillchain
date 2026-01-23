import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    createdAt: Date;
}

interface SkillDocument {
    __v?: unknown;
    [key: string]: unknown;
}

const skillSchema = new Schema<ISkill>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        toJSON: {
            transform: (_doc, ret: SkillDocument) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
