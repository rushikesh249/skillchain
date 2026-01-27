
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';

// Load env explicitly
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

console.log('RPC_URL:', RPC_URL ? `${RPC_URL.substring(0, 15)}...` : 'MISSING');
console.log('PRIVATE_KEY:', PRIVATE_KEY ? 'Present (Hidden)' : 'MISSING');
console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);

async function testConnection() {
    try {
        if (!RPC_URL) throw new Error('RPC_URL missing');

        console.log('1. Testing Provider Connection...');
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const network = await provider.getNetwork();
        console.log('   ✅ Connected to network:', network.name, 'Wait, actually chainId:', network.chainId.toString());

        if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY missing');
        console.log('2. Testing Wallet...');
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log('   ✅ Wallet address:', wallet.address);

        const balance = await provider.getBalance(wallet.address);
        console.log('   💰 Balance:', ethers.formatEther(balance), 'ETH');

        if (!CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS missing');
        console.log('3. Testing Contract...');
        // Just check if code exists at address
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
            console.error('   ❌ NO CONTRACT FOUND at this address! (Is it deployed?)');
        } else {
            console.log('   ✅ Contract code found at address.');
        }

    } catch (error) {
        console.error('❌ DIAGNOSIS FAILED:', error);
    }
}

testConnection();
