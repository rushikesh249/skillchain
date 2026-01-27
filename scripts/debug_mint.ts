
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import contractAbi from '../src/services/blockchain/abi/SkillChainSBT.json';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function debugMint() {
    console.log('🐞 Starting Mint Debugger...');

    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.ISSUER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        console.error('Missing config');
        process.exit(1);
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, wallet);

        console.log(`Wallet: ${wallet.address}`);
        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

        const student = '0x742d35cc6634c0532925a3b844bc9e7595f1234d'; // John Developer (lowercase)
        const skillSlug = 'debug-skill-' + Date.now();
        const score = 88;
        const ipfsCid = 'ipfs://bafybeigdyrzt5p4c3test'; // Valid dummy

        console.log('\nAttempting estimateGas...');

        try {
            const gas = await contract.mintCredential.estimateGas(student, skillSlug, score, ipfsCid);
            console.log(`Gas Estimate: ${gas.toString()}`);
        } catch (gasError) {
            console.error('❌ Gas Estimation Failed!');
            console.error('Refusal Reason:', gasError);
            if ((gasError as any).revert?.args) {
                console.error('Revert Args:', (gasError as any).revert.args);
            }
            process.exit(1);
        }

        console.log('Attempting Mint Transaction...');
        const tx = await contract.mintCredential(student, skillSlug, score, ipfsCid);
        console.log(`Tx Sent! Hash: ${tx.hash}`);

        console.log('Waiting for confirmation...');
        await tx.wait();
        console.log('✅ Transaction Confirmed!');

    } catch (error) {
        console.error('❌ MINT FAILED WITH ERROR:');
        console.error(error);
    }
}

debugMint();
