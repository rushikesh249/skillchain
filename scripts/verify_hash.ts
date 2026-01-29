import { blockchainService } from '../src/services/blockchain/blockchain.service';

const testHashing = () => {
    console.log('Testing BlockchainService Hashing...');

    const obj1 = { a: 1, b: 2, c: { d: 3, e: 4 } };
    const obj2 = { b: 2, a: 1, c: { e: 4, d: 3 } };

    const hash1 = blockchainService.calculateHash(obj1);
    const hash2 = blockchainService.calculateHash(obj2);

    console.log(`Hash1: ${hash1}`);
    console.log(`Hash2: ${hash2}`);

    if (hash1 === hash2) {
        console.log('✅ SUCCESS: Deterministic Hashing works!');
    } else {
        console.error('❌ FAILED: Hashes do not match!');
        process.exit(1);
    }
};

testHashing();
