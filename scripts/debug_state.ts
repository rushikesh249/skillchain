import mongoose from 'mongoose';
import { Submission } from '../src/modules/submissions/submission.model';
import dotenv from 'dotenv';
import { employerService } from '../src/modules/employer/employer.service';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillchain';

const debug = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        console.log('--- ALL SUBMISSIONS ---');
        const submissions = await Submission.find({});
        console.log(JSON.stringify(submissions, null, 2));

        console.log('\n--- EMPLOYER SEARCH TEST ---');
        // Simulate search with empty filter (should return everything)
        // We need a valid employer ID. Let's grab one from DB or seed.
        // Assuming seed data: employer@testcorp.com
        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const employer = await User.findOne({ email: 'employer@testcorp.com' });

        if (employer) {
            console.log(`Employer ID: ${employer._id}`);
            try {
                const results = await employerService.searchCandidates({ page: 1, limit: 10, minScore: 0 }, employer._id.toString());
                console.log('Search Results:', JSON.stringify(results, null, 2));
            } catch (e) {
                console.error('Search failed:', e);
            }
        } else {
            console.log('Employer not found in DB');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        await mongoose.disconnect();
    }
};

debug();
