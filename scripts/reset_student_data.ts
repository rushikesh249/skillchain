
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillchain';

async function resetStudentData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('connected');

        // Delete all submissions
        await mongoose.connection.collection('submissions').deleteMany({});
        console.log('✅ Deleted all test submissions');

        // Delete all credentials just in case
        await mongoose.connection.collection('credentials').deleteMany({});
        console.log('✅ Deleted all credentials');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetStudentData();
