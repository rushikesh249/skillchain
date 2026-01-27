
import mongoose from 'mongoose';
import { User } from '../src/modules/user/user.model';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function setupDemoUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rift');
        console.log('Connected.');

        const password = 'password123';
        const passwordHash = await bcrypt.hash(password, 10);

        const users = [
            {
                name: 'Demo Employer',
                email: 'employer@demo.com',
                role: 'employer',
                employerCredits: 100,
                walletAddress: '0x0000000000000000000000000000000000000001'
            },
            {
                name: 'Demo Student',
                email: 'student@demo.com',
                role: 'student',
                employerCredits: 0,
                walletAddress: '0x0000000000000000000000000000000000000002'
            },
            {
                name: 'Demo Admin',
                email: 'admin@demo.com',
                role: 'admin',
                employerCredits: 0,
                walletAddress: '0x0000000000000000000000000000000000000003'
            }
        ];

        console.log('--- CREATING USERS ---');

        for (const userData of users) {
            let user = await User.findOne({ email: userData.email });

            if (user) {
                console.log(`Updated ${userData.role}: ${userData.email}`);
                user.passwordHash = passwordHash;
                user.role = userData.role as any;
                user.employerCredits = userData.employerCredits;
                await user.save();
            } else {
                console.log(`Created ${userData.role}: ${userData.email}`);
                await User.create({
                    ...userData,
                    passwordHash
                });
            }
        }

        console.log('--- CREDENTIALS ---');
        console.log('Password for all accounts:', password);
        users.forEach(u => console.log(`${u.role.toUpperCase()}: ${u.email}`));
        console.log('-------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

setupDemoUsers();
