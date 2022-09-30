import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import { readFileSync } from 'fs';

(async () => {
  // Step 1: Connect to cluster and generate a new Keypair
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const localWallet = JSON.parse(readFileSync('/Users/mkisk/.config/solana/id.json', 'utf8'));
  const SECRET_KEY = new Uint8Array(localWallet);
  const fromWallet = Keypair.fromSecretKey(SECRET_KEY);
  const toWallet = process.argv[2];

  if (!toWallet) {
    console.log('Please Add To Wallet Address');
    return;
  }

  // Step 2: Airdrop SOL into your from wallet
  const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
  // Wait for airdrop confirmation
  await connection.confirmTransaction(fromAirdropSignature, { commitment: 'confirmed' });
  // Step 3: Create new token mint and get the token account of the fromWallet address
  //If the token account does not exist, create it
  const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey);
  //Step 4: Mint a new token to the from account
  let signature = await mintTo(connection, fromWallet, mint, fromTokenAccount.address, fromWallet.publicKey, 10000000000000, []);
  console.log('mint tx:', signature);
  //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
  // const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, new PublicKey(toWallet));
  //Step 6: Transfer the new token to the to-wallet's token account that was just created
  // Transfer the new token to the "toTokenAccount" we just created
  signature = await transfer(connection, fromWallet, fromTokenAccount.address, toTokenAccount.address, fromWallet.publicKey, 100000000000, []);
  console.log('transfer tx:', signature);
})();
