import mongoose from 'mongoose';
import { Skill } from '../src/modules/skills/skill.model';
import { User } from '../src/modules/user/user.model';
import { hashPassword } from '../src/shared/utils/password';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillchain';

const skills = [
    { name: 'SQL', slug: 'sql', description: 'Structured Query Language for database management' },
    {
        name: 'Python',
        slug: 'python',
        description: 'General purpose programming language for data science and web development',
    },
    {
        name: 'React',
        slug: 'react',
        description: 'JavaScript library for building user interfaces',
    },
    {
        name: 'Node.js',
        slug: 'nodejs',
        description: 'JavaScript runtime built on Chrome V8 engine',
    },
];

const seed = async (): Promise<void> => {
    try {
        console.log('🌱 Starting seed...');
        console.log(`📦 Connecting to MongoDB: ${MONGODB_URI}`);

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out in production)
        console.log('🧹 Clearing existing skills...');
        await Skill.deleteMany({});

        // Seed skills
        console.log('📚 Seeding skills...');
        for (const skill of skills) {
            const existing = await Skill.findOne({ slug: skill.slug });
            if (!existing) {
                await Skill.create(skill);
                console.log(`  ✅ Created skill: ${skill.name}`);
            } else {
                console.log(`  ⏭️  Skill exists: ${skill.name}`);
            }
        }

        // Create admin user
        console.log('👤 Creating admin user...');
        const adminEmail = 'admin@skillchain.io';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const adminPasswordHash = await hashPassword('Admin@123456');
            await User.create({
                name: 'SkillChain Admin',
                email: adminEmail,
                passwordHash: adminPasswordHash,
                role: 'admin',
            });
            console.log(`  ✅ Created admin: ${adminEmail} (password: Admin@123456)`);
        } else {
            console.log(`  ⏭️  Admin exists: ${adminEmail}`);
        }

        // Create sample employer
        console.log('🏢 Creating sample employer...');
        const employerEmail = 'employer@testcorp.com';
        const existingEmployer = await User.findOne({ email: employerEmail });
        if (!existingEmployer) {
            const employerPasswordHash = await hashPassword('Employer@123');
            await User.create({
                name: 'Test Corp HR',
                email: employerEmail,
                passwordHash: employerPasswordHash,
                role: 'employer',
                employerCredits: 5,
            });
            console.log(`  ✅ Created employer: ${employerEmail} (password: Employer@123, credits: 5)`);
        } else {
            console.log(`  ⏭️  Employer exists: ${employerEmail}`);
        }

        // Create sample student
        console.log('🎓 Creating sample student...');
        const studentEmail = 'student@example.com';
        const existingStudent = await User.findOne({ email: studentEmail });
        if (!existingStudent) {
            const studentPasswordHash = await hashPassword('Student@123');
            await User.create({
                name: 'John Developer',
                email: studentEmail,
                passwordHash: studentPasswordHash,
                role: 'student',
                walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1234D',
            });
            console.log(`  ✅ Created student: ${studentEmail} (password: Student@123)`);
        } else {
            console.log(`  ⏭️  Student exists: ${studentEmail}`);
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`  - Skills: ${skills.length}`);
        console.log('  - Users: admin, employer, student');
        console.log('\n🔐 Credentials:');
        console.log('  Admin: admin@skillchain.io / Admin@123456');
        console.log('  Employer: employer@testcorp.com / Employer@123');
        console.log('  Student: student@example.com / Student@123');

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed().catch(console.error);
