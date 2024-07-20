import {
  clusterApiUrl,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";

import {
  createUpdateFieldInstruction,
  createInitializeInstruction,
  createInitializeMetadataPointerInstruction,
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
  withdrawWithheldTokensFromAccounts,
} from "@solana/spl-token";
import {
  PRIVATE_KEY_ADMIN,
  DECIMALS,
  FEES,
  SUPPLY,
  MAX_FEE,
} from "./config.js";
const secretKeyArrayAdmin = Uint8Array.from(PRIVATE_KEY_ADMIN);
const adminAccount = Keypair.fromSecretKey(secretKeyArrayAdmin);

(async () => {
  const mintAuthority = adminAccount;
  const transferFeeConfigAuthority = adminAccount;
  const withdrawWithheldAuthority = adminAccount;

  const extensions = [ExtensionType.TransferFeeConfig];

  const mintLen = getMintLen(extensions);
  const decimals = DECIMALS;
  const feeBasisPoints = FEES;
  const maxFee = BigInt(MAX_FEE);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen
  );

  /* -------------1. CREATE NEW TOKEN-------------------*/

    async function createNewToken() {
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log("Your Token Mint Address: ",mint)
    const mintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: adminAccount.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeTransferFeeConfigInstruction(
        mint,
        transferFeeConfigAuthority.publicKey,
        withdrawWithheldAuthority.publicKey,
        feeBasisPoints,
        maxFee,
        TOKEN_2022_PROGRAM_ID
      ),

      createInitializeMintInstruction(
        mint,
        decimals,
        mintAuthority.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),

  createInitializeMetadataPointerInstruction(
    mint, // Mint Account address
    adminAccount.publicKey, // Authority that can set the metadata address
    mint, // Account address that holds the metadata
    TOKEN_2022_PROGRAM_ID,
  ),
      // Instruction to initialize Metadata Account data
       createInitializeInstruction({
  programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
  metadata: mint, // Account address that holds the metadata
  updateAuthority: adminAccount.publicKey, // Authority that can update the metadata
  mint: mint, // Mint Account address
  mintAuthority: adminAccount.publicKey, // Designated Mint Authority
  name: "metaData.name",
  symbol: "metaData.symbol",
  uri: "metaData.uri",
})
    );
      
    var result = await sendAndConfirmTransaction(
      connection,
      mintTransaction,
      [adminAccount, mintKeypair],
      undefined
    );
      
      
    console.log("Transaction Hash: ", result);
    }
  
  

    /* ----------------2. CREATE NEW TOKEN ACCOUNT AND MINT START--------------------- */
    async function mintToken(mintAddress) {
     const  mint = new PublicKey(mintAddress)
    const mintAmount = BigInt(Number(SUPPLY));
    const sourceAccount = await createAccount(
      connection,
      adminAccount,
      mint,
      adminAccount.publicKey,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
      
    var hash = await mintTo(
      connection,
      adminAccount,
      mint,
      sourceAccount,
      mintAuthority,
      mintAmount,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    console.log(hash);
    /* ----------------CREATE NEW TOKEN ACCOUNT AND MINT END--------------------- */
  }

  async function transferFeesToWallet(tokenAddress, destinationAddress) {
    /* ----------------3. TRANSFER WITHHELD AMOUNT START--------------------- */
    const mint = new PublicKey(tokenAddress);
    const allAccounts = await connection.getProgramAccounts(
      TOKEN_2022_PROGRAM_ID,
      {
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: mint.toString(),
            },
          },
        ],
      }
    );
    const accountsToWithdrawFrom = [];
    for (const accountInfo of allAccounts) {
      const account = unpackAccount(
        accountInfo.pubkey,
        accountInfo.account,
        TOKEN_2022_PROGRAM_ID
      );
      const transferFeeAmount = getTransferFeeAmount(account);
      if (
        transferFeeAmount !== null &&
        transferFeeAmount.withheldAmount > BigInt(0)
      ) {
        accountsToWithdrawFrom.push(accountInfo.pubkey);
      }
    }

    console.log(accountsToWithdrawFrom)

    const destinationAccount = new PublicKey(destinationAddress);
    if (accountsToWithdrawFrom.length > 0) {
      var result = await withdrawWithheldTokensFromAccounts(
        connection,
        adminAccount,
        mint,
        destinationAccount,
        withdrawWithheldAuthority,
        [],
        accountsToWithdrawFrom,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      console.log(result);
    } else {
      console.log("no Accounts to withdraw");
    }
    /* ---------------- END--------------------- */
  }

//   const mintTransaction = new Transaction().add(
//  createInitializeMetadataPointerInstruction(
//     new PublicKey("79CWSLY8aqCwevdPzVSDNdTKGyDnoVjViTLZfCWFTuJc") ,
//     adminAccount.publicKey,
//     new PublicKey("79CWSLY8aqCwevdPzVSDNdTKGyDnoVjViTLZfCWFTuJc"),
//     TOKEN_2022_PROGRAM_ID
// )
// ,
// createInitializeMintInstruction(new PublicKey("79CWSLY8aqCwevdPzVSDNdTKGyDnoVjViTLZfCWFTuJc"), decimals, adminAccount.publicKey, null, TOKEN_2022_PROGRAM_ID),
// createInitializeInstruction({
//       programId: TOKEN_2022_PROGRAM_ID,
//       mint: new PublicKey("79CWSLY8aqCwevdPzVSDNdTKGyDnoVjViTLZfCWFTuJc"),
//       metadata: new PublicKey("79CWSLY8aqCwevdPzVSDNdTKGyDnoVjViTLZfCWFTuJc"),
//       name: "metadata.name",
//       symbol: "metadata.symbol",
//       uri: "metadata.uri",
//       mintAuthority: adminAccount.publicKey,
//       updateAuthority: adminAccount.publicKey,
// })
  // )
  // console.log(mintTransaction)

  // var result = await sendAndConfirmTransaction(
  //   connection,
  //   mintTransaction,
  //   [adminAccount, adminAccount],
  //   undefined
  // );

  // console.log(result)

    await createNewToken();
    //await mintToken("4Ko4EF9mBQC43pwAzCvzXhWAPYbjvvZB6tmJd78LDtax");
    /** args: tokenAddress, TokenAccountOfdestinationWallet */ 
   //await transferFeesToWallet("EAKvyjeg6Tf58jx9qvoBxMw4T2mLUj1Q7q4jEsuSHavH","zDrt4ygSTEXwYRGYaQACvPiYtEdqruixDeJKUbQPZpa")
  //await updateMetadata(PRIVATE_KEY_ADMIN,"HwjgVuQ5M9ur22eRfMSDALeXKp8VXNTEjq6vBMFjgMq4");
})();
