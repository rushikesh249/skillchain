
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testBlockchain() {
    console.log('🔗 Testing Blockchain Configuration...');

    // 1. Check Env Vars
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.ISSUER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        console.error('❌ Missing configuration:');
        if (!rpcUrl) console.error('  - RPC_URL is missing');
        if (!privateKey) console.error('  - ISSUER_PRIVATE_KEY is missing');
        if (!contractAddress) console.error('  - CONTRACT_ADDRESS is missing');
        process.exit(1);
    }

    try {
        // 2. Connect to Provider
        console.log(`\nConnecting to RPC: ${rpcUrl.substring(0, 20)}...`);
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

        // 3. Check Wallet
        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`\nWallet Address: ${wallet.address}`);

        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

        if (balance === BigInt(0)) {
            console.error('❌ ERROR: Wallet has 0 ETH. Cannot mint.');
            process.exit(1);
        }

        // 4. Check Contract
        console.log(`\nChecking Contract at ${contractAddress}...`);
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            console.error('❌ ERROR: No contract found at this address!');
            process.exit(1);
        }
        console.log('✅ Contract found.');

        console.log('\n🎉 Configuration is VALID. You should be able to mint.');

    } catch (error) {
        console.error('\n❌ BLOCKCHAIN ERROR:', error);
        if (typeof error === 'object' && error !== null && 'code' in error) {
            console.error('Error Code:', (error as any).code);
        }
    }
}

testBlockchain();
