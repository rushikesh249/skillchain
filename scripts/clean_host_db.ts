
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillchain';

async function cleanHostDb() {
    try {
        console.log('🧹 Starting Host DB Cleanup...');
        console.log(`📦 Connecting to: ${MONGODB_URI}`);

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // 1. Delete all credentials
        const credDeleteResult = await mongoose.connection.collection('credentials').deleteMany({});
        console.log(`Deleted ${credDeleteResult.deletedCount} credentials.`);

        // 2. Reset submissions to pending
        const subUpdateResult = await mongoose.connection.collection('submissions').updateMany(
            { status: 'approved' },
            { $set: { status: 'pending', blockchainStatus: 'not_started' } }
        );
        console.log(`Reset ${subUpdateResult.modifiedCount} submissions to pending.`);

        // 3. Check for any remaining 'bafybeistub' strings
        // This is a sanity check
        const remaining = await mongoose.connection.collection('credentials').countDocuments({
            ipfsCid: { $regex: 'bafybeistub' }
        });

        if (remaining > 0) {
            console.error('❌ WARNING: Still found bad CIDs after delete!');
        } else {
            console.log('✅ Verified: No broken CIDs remain.');
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Done.');
        process.exit(0);
    }
}

cleanHostDb();
