import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    PublicKey
} from '@solana/web3.js';
import { createV1,TokenStandard} from "@metaplex-foundation/mpl-token-metadata";
import {createSignerFromKeypair,signerIdentity,generateSigner,publicKey,percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';

import {
    ExtensionType,
    createInitializeMintInstruction,
    mintTo,
    createAccount,
    getMintLen,
    getTransferFeeAmount,
    unpackAccount,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

import {
    createInitializeTransferFeeConfigInstruction,
    harvestWithheldTokensToMint,
    transferCheckedWithFee,
    withdrawWithheldTokensFromAccounts,
    withdrawWithheldTokensFromMint,
} from '@solana/spl-token';

const secretKeyArray = Uint8Array.from([232,155,56,199,200,75,70,251,151,178,9,61,244,0,244,106,89,238,62,14,11,127,211,119,177,231,126,10,34,103,122,117,69,42,255,221,23,61,86,254,127,243,133,7,56,63,20,130,9,162,19,100,148,97,122,136,236,137,50,206,191,236,191,224]
);
const newKeyPair = Keypair.generate(); 
// const secretKeyArray2 = Uint8Array.from([ 63, 237, 116, 204, 203,   1, 215, 215, 223, 146,  42, 61, 228, 234, 215, 239, 191, 106, 218, 239,  72, 121, 31, 109, 207, 219, 195, 202, 235,  68, 247,  32, 232, 239,  33,  52, 237,  44,   1, 192, 144,  36,  33, 191, 109, 192,  75, 110, 189,  22,  99, 228, 195,  50, 184, 173, 111, 131,  48, 113,  50,  93, 218, 229 ]
// );
const wallet = Keypair.fromSecretKey(secretKeyArray);
const tokenAccount = newKeyPair;//Keypair.fromSecretKey(newKeyPair);

(async () => {
    const payer = wallet;

    const mintAuthority = wallet;
    const updateAuthority = wallet.publicKey;
    const mintKeypair = tokenAccount;
    const mint = mintKeypair.publicKey;
    const transferFeeConfigAuthority = wallet;
    const withdrawWithheldAuthority = wallet;

    const extensions = [ExtensionType.TransferFeeConfig];

    const mintLen = getMintLen(extensions);
    const decimals = 6;
    const feeBasisPoints = 30;
    const maxFee = BigInt(100_000_000);

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
 
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    /* -------------1. CREATE NEW TOKEN-------------------*/

    async function createNewToken() {
        const mintTransaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
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
            createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
        );
        console.log(mintTransaction);
      
        var result = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
        console.log("Transaction Hash: ",result);
    }
    

    /* -------------CREATE NEW TOKEN END-------------------*/


    async function mintToken(tokenAddress,totalSupply) {
 /* ----------------2. CREATE NEW TOKEN ACCOUNT AND MINT START--------------------- */

    const minttoken = new PublicKey(
        tokenAddress
    );

    const mintAmount = BigInt(Number(totalSupply));
    const owner = wallet;
    const sourceAccount = await createAccount(
        connection,
        payer,
        minttoken,
        owner.publicKey,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
    console.log("TOKEN ACCOUNT->",sourceAccount)
    var hash = await mintTo(
        connection,
        payer,
        minttoken,
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
    
async function transferFeesToWallet(tokenAddress,destinationAddress) {
    
/* ----------------3. TRANSFER WITHHELD AMOUNT START--------------------- */
const minttoken = new PublicKey(
    tokenAddress
);

const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
        {
            memcmp: {
                offset: 0,
                bytes: minttoken.toString(),
            },
        },
    ],
});
const accountsToWithdrawFrom = [];
for (const accountInfo of allAccounts) {
    const account = unpackAccount(accountInfo.pubkey, accountInfo.account, TOKEN_2022_PROGRAM_ID);
    const transferFeeAmount = getTransferFeeAmount(account);
    if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
        accountsToWithdrawFrom.push(accountInfo.pubkey);
    }
}

const destinationAccount = new PublicKey(
    destinationAddress
);
    if (accountsToWithdrawFrom.length > 0) {
        var result = await withdrawWithheldTokensFromAccounts(
            connection,
            payer,
            minttoken,
            destinationAccount,
            withdrawWithheldAuthority,
            [],
            accountsToWithdrawFrom,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        console.log(result)
    } else {
        console.log("no Accounts to withdraw")
    }
/* ---------------- END--------------------- */
}


     await  createNewToken();
     //await mintToken("4vaAVbAEm8VGJbZqNpHxw3ZrSzbJznQ7WAv4eqT8iGdw","10000000000");
     //await transferFeesToWallet("HwjgVuQ5M9ur22eRfMSDALeXKp8VXNTEjq6vBMFjgMq4","5f1AHYx8e8xaiCKsPz8daab53sFYuauEd8RJ1j5EpiJT")

})();