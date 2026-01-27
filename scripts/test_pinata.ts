
import { ipfsService } from '../src/services/ipfs/ipfs.service';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

// Load env explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testPinataUpload() {
    console.log('🧪 Starting Pinata IPFS Upload Test...');
    console.log('----------------------------------------');

    // 1. Check Configuration
    console.log('Checking configuration...');
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
        console.error('❌ FAILED: Pinata API keys missing in .env');
        process.exit(1);
    }
    console.log('✅ Keys present in .env');

    if (!ipfsService.isConfigured()) {
        console.error('❌ FAILED: ipfsService reports not configured');
        process.exit(1);
    }
    console.log('✅ ipfsService configured');

    // 2. Create Test Metadata
    const testId = uuidv4();
    const metadata = {
        name: 'Test Credential - ' + testId,
        description: 'Automated test credential for Pinata verification',
        image: 'ipfs://bafybeigdyrzt5p4c3testimagelink', // Placeholder
        attributes: [
            { trait_type: 'Test ID', value: testId },
            { trait_type: 'Timestamp', value: new Date().toISOString() },
            { trait_type: 'Status', value: 'Verification Test' }
        ]
    };

    console.log('\n2. Uploading Test Metadata...');
    console.log(JSON.stringify(metadata, null, 2));

    try {
        const result = await ipfsService.uploadMetadata(metadata);

        console.log('PINATA_TEST_RESULT:' + JSON.stringify({
            success: true,
            cid: result.cid,
            url: result.url
        }));
    } catch (error) {
        console.log('PINATA_TEST_RESULT:' + JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
        process.exit(1);
    }
}

testPinataUpload();
