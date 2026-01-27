
import mongoose from 'mongoose';
import { adminService } from '../src/modules/admin/admin.service';
import { Submission } from '../src/modules/submissions/submission.model';
import { User } from '../src/modules/user/user.model';
import { Skill } from '../src/modules/skills/skill.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillchain';

async function simulateApproval() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Setup Test Data (Create if missing)
        let student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('Creating test student...');
            student = await User.create({
                name: 'Test Student',
                email: 'teststudent_' + Date.now() + '@example.com',
                passwordHash: 'hash',
                role: 'student',
                walletAddress: '0x0000000000000000000000000000000000000000'
            });
        }

        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Creating test admin...');
            admin = await User.create({
                name: 'Test Admin',
                email: 'testadmin_' + Date.now() + '@example.com',
                passwordHash: 'hash',
                role: 'admin'
            });
        }

        let skill = await Skill.findOne();
        if (!skill) {
            console.log('Creating test skill...');
            skill = await Skill.create({
                name: 'Test Skill',
                slug: 'test-skill-' + Date.now(),
                description: 'Test Description'
            });
        }

        // Create a dummy submission
        const submission = await Submission.create({
            studentId: student._id,
            skillId: skill._id,
            githubRepoUrl: 'https://github.com/test/repo',
            repoOwner: 'test',    // Added potential missing field
            repoName: 'repo',     // Added potential missing field
            status: 'pending',
            confidenceScore: 88,
            flags: [],
            analysisReport: {
                repoValid: true,
                repoAgeDays: 10,
                lastPushDaysAgo: 1,
                commitCountEstimate: 50,
                languages: { typescript: 100 },
                hasReadme: true,
                contributorsCountEstimate: 1,
                suspiciousPatterns: []
            }
        });

        console.log('Created test submission:', submission._id);

        // 2. Call Approve Submission
        console.log('Approving submission via AdminService...');
        const result = await adminService.approveSubmission(submission._id.toString(), admin._id.toString());

        console.log('\n--- APPROVAL RESULT ---');
        console.log('Status:', result.status);

        // 3. Verify Credential Created
        const credential = await mongoose.connection.collection('credentials').findOne({
            // Query by the newly created IDs to be specific
            studentId: student._id,
            skillId: skill._id,
            score: 88
        });

        if (credential) {
            console.log('FINAL_RESULT_JSON:' + JSON.stringify({
                success: true,
                cid: credential.ipfsCid,
                url: credential.ipfsUrl,
                txHash: credential.blockchainTxHash
            }));
        } else {
            throw new Error('Credential not found in DB after approval');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

simulateApproval();
