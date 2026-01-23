import { Credential, ICredential } from './credential.model';
import mongoose from 'mongoose';

export class CredentialRepository {
    async create(data: {
        studentId: string;
        skillId: string;
        score: number;
        ipfsCid: string;
        ipfsUrl: string;
        blockchainTxHash: string | null;
        credentialId: string;
    }): Promise<ICredential> {
        const credential = new Credential({
            studentId: new mongoose.Types.ObjectId(data.studentId),
            skillId: new mongoose.Types.ObjectId(data.skillId),
            score: data.score,
            ipfsCid: data.ipfsCid,
            ipfsUrl: data.ipfsUrl,
            blockchainTxHash: data.blockchainTxHash,
            credentialId: data.credentialId,
            issuedAt: new Date(),
        });
        return credential.save();
    }

    async findByStudentId(studentId: string): Promise<ICredential[]> {
        return Credential.find({ studentId: new mongoose.Types.ObjectId(studentId) })
            .populate('skillId', 'name slug')
            .sort({ issuedAt: -1 });
    }

    async findByCredentialId(credentialId: string): Promise<ICredential | null> {
        return Credential.findOne({ credentialId })
            .populate('skillId', 'name slug description')
            .populate('studentId', 'name email');
    }

    async findBySkillWithMinScore(
        skillId: string,
        minScore: number,
        skip: number,
        limit: number
    ): Promise<ICredential[]> {
        return Credential.find({
            skillId: new mongoose.Types.ObjectId(skillId),
            score: { $gte: minScore },
        })
            .populate('studentId', 'name email')
            .populate('skillId', 'name slug')
            .sort({ score: -1 })
            .skip(skip)
            .limit(limit);
    }

    async countBySkillWithMinScore(skillId: string, minScore: number): Promise<number> {
        return Credential.countDocuments({
            skillId: new mongoose.Types.ObjectId(skillId),
            score: { $gte: minScore },
        });
    }

    async findById(id: string): Promise<ICredential | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return Credential.findById(id)
            .populate('skillId', 'name slug')
            .populate('studentId', 'name email walletAddress');
    }

    async existsForStudentAndSkill(studentId: string, skillId: string): Promise<boolean> {
        const count = await Credential.countDocuments({
            studentId: new mongoose.Types.ObjectId(studentId),
            skillId: new mongoose.Types.ObjectId(skillId),
        });
        return count > 0;
    }
}

export const credentialRepository = new CredentialRepository();
