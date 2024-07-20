import {
  clusterApiUrl,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

import {
  ExtensionType,
  createInitializeMintInstruction,
  mintTo,
  createAccount,
  getMintLen,
  getTransferFeeAmount,
  unpackAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

import {
  createInitializeTransferFeeConfigInstruction,
  harvestWithheldTokensToMint,
  transferCheckedWithFee,
  withdrawWithheldTokensFromAccounts,
  withdrawWithheldTokensFromMint,
} from '@solana/spl-token';
import {
  PRIVATE_KEY_ADMIN,
  DECIMALS,
  FEES,
  SUPPLY,
  MAX_FEE,
} from "./config.js";
(async () => {
 
  const secretKeyArrayAdmin = Uint8Array.from(PRIVATE_KEY_ADMIN);
  const payer = Keypair.fromSecretKey(secretKeyArrayAdmin);

  const mintAuthority = Keypair.generate();
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  const transferFeeConfigAuthority = Keypair.generate();
  const withdrawWithheldAuthority =payer

  const extensions = [ExtensionType.TransferFeeConfig];

  const mintLen = getMintLen(extensions);
  const decimals = 6;
  const feeBasisPoints = 30;
  const maxFee = BigInt(100_000_000);

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');


  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  // const mintTransaction = new Transaction().add(
  //     SystemProgram.createAccount({
  //         fromPubkey: payer.publicKey,
  //         newAccountPubkey: mint,
  //         space: mintLen,
  //         lamports: mintLamports,
  //         programId: TOKEN_2022_PROGRAM_ID,
  //     }),
  //     createInitializeTransferFeeConfigInstruction(
  //         mint,
  //         payer.publicKey,
  //         payer.publicKey,
  //         feeBasisPoints,
  //         maxFee,
  //         TOKEN_2022_PROGRAM_ID
  //     ),
  //     createInitializeMintInstruction(mint, decimals, payer.publicKey, payer.publicKey, TOKEN_2022_PROGRAM_ID)
  // );
  // await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);












  // var newmint = new PublicKey("4aWAvL52u4YmdiZARSG15hcqtv5tWupvGmUAUgE5QPVq")
  // const mintAmount = BigInt(10_000_000_000_000_000);
  // const sourceAccount = await createAccount(
  //     connection,
  //     payer,
  //     newmint,
  //     payer.publicKey,
  //     undefined,
  //     undefined,
  //     TOKEN_2022_PROGRAM_ID
  // );

  // await mintTo(
  //     connection,
  //     payer,
  //     newmint,
  //     sourceAccount,
  //     payer.publicKey,
  //     mintAmount,
  //     [],
  //     undefined,
  //     TOKEN_2022_PROGRAM_ID
  // );








  // const accountKeypair = Keypair.generate();
  // const destinationAccount = await createAccount(
  //     connection,
  //     payer,
  //     mint,
  //     owner.publicKey,
  //     accountKeypair,
  //     undefined,
  //     TOKEN_2022_PROGRAM_ID
  // );

  // const transferAmount = BigInt(1_000_000);
  // const fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);
  // await transferCheckedWithFee(
  //     connection,
  //     payer,
  //     sourceAccount,
  //     mint,
  //     destinationAccount,
  //     owner,
  //     transferAmount,
  //     decimals,
  //     fee,
  //     [],
  //     undefined,
  //     TOKEN_2022_PROGRAM_ID
  // );









//   const newmint = new PublicKey("4aWAvL52u4YmdiZARSG15hcqtv5tWupvGmUAUgE5QPVq")
//   const destinationAccount = new PublicKey("AVvoq4HTqNZc7YigyzpknNAzU3h9xALZpQQSGbi1531E")
//   const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
//       commitment: 'confirmed',
//       filters: [
//           {
//               memcmp: {
//                   offset: 0,
//                   bytes: newmint.toString(),
//               },
//           },
//       ],
//   });
//   const accountsToWithdrawFrom = [];
//   for (const accountInfo of allAccounts) {
//       const account = unpackAccount(accountInfo.pubkey, accountInfo.account, TOKEN_2022_PROGRAM_ID);
//       const transferFeeAmount = getTransferFeeAmount(account);
//       if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
//           accountsToWithdrawFrom.push(accountInfo.pubkey);
//       }
//   }
// console.log(accountsToWithdrawFrom)
//   await withdrawWithheldTokensFromAccounts(
//       connection,
//       payer,
//       newmint,
//       destinationAccount,
//       withdrawWithheldAuthority,
//       [],
//       accountsToWithdrawFrom,
//       undefined,
//       TOKEN_2022_PROGRAM_ID
//   );






  // await harvestWithheldTokensToMint(connection, payer, mint, [destinationAccount], undefined, TOKEN_2022_PROGRAM_ID);

  // await withdrawWithheldTokensFromMint(
  //     connection,
  //     payer,
  //     mint,
  //     destinationAccount,
  //     withdrawWithheldAuthority,
  //     [],
  //     undefined,
  //     TOKEN_2022_PROGRAM_ID
  // );
})();