import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployerUnlockLog extends Document {
    _id: mongoose.Types.ObjectId;
    employerId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    skillId?: mongoose.Types.ObjectId;
    unlockedAt: Date;
}

interface UnlockLogDocument {
    __v?: unknown;
    [key: string]: unknown;
}

const employerUnlockLogSchema = new Schema<IEmployerUnlockLog>(
    {
        employerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        skillId: {
            type: Schema.Types.ObjectId,
            ref: 'Skill',
        },
        unlockedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
        toJSON: {
            transform: (_doc, ret: UnlockLogDocument) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

employerUnlockLogSchema.index({ employerId: 1, studentId: 1 });

export const EmployerUnlockLog = mongoose.model<IEmployerUnlockLog>(
    'EmployerUnlockLog',
    employerUnlockLogSchema
);
