import { EmployerUnlockLog, IEmployerUnlockLog } from './employerUnlockLog.model';
import mongoose from 'mongoose';

export class EmployerUnlockLogRepository {
    async create(data: {
        employerId: string;
        studentId: string;
        skillId?: string;
    }): Promise<IEmployerUnlockLog> {
        const log = new EmployerUnlockLog({
            employerId: new mongoose.Types.ObjectId(data.employerId),
            studentId: new mongoose.Types.ObjectId(data.studentId),
            skillId: data.skillId ? new mongoose.Types.ObjectId(data.skillId) : undefined,
            unlockedAt: new Date(),
        });
        return log.save();
    }

    async findByEmployerId(employerId: string): Promise<IEmployerUnlockLog[]> {
        return EmployerUnlockLog.find({ employerId: new mongoose.Types.ObjectId(employerId) })
            .populate('studentId', 'name email')
            .populate('skillId', 'name slug')
            .sort({ unlockedAt: -1 });
    }

    async isUnlocked(employerId: string, studentId: string): Promise<boolean> {
        const count = await EmployerUnlockLog.countDocuments({
            employerId: new mongoose.Types.ObjectId(employerId),
            studentId: new mongoose.Types.ObjectId(studentId),
        });
        return count > 0;
    }
}

export const employerUnlockLogRepository = new EmployerUnlockLogRepository();
