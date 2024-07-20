import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  PRIVATE_KEY_ADMIN,
  DECIMALS,
  FEES,
  SUPPLY,
  MAX_FEE,
} from "./config.js";
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

(async () => {
const secretKeyArray = Uint8Array.from([247,80,41,129,226,94,203,205,11,49,86,219,36,207,213,146,171,13,37,204,108,39,228,113,93,13,235,112,154,64,75,127,233,240,117,227,22,102,126,18,4,97,188,116,236,182,220,212,80,82,90,61,123,222,37,249,122,234,55,131,113,19,233,156]
);
const admin = Keypair.fromSecretKey(secretKeyArray);
  const payer = admin;
  const mint = Keypair.generate();
  const decimals = 6;

  const metadata = {
    mint: mint.publicKey,
    name: 'TOKEN_NAME',
    symbol: 'SMBL',
    uri: 'URI',
    additionalMetadata: [['new-field', 'new-value']],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  // await connection.confirmTransaction({
  //   signature: airdropSignature,
  //   ...(await connection.getLatestBlockhash()),
  // });

  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }),
  );
  await sendAndConfirmTransaction(connection, mintTransaction, [payer, mint]);
})();