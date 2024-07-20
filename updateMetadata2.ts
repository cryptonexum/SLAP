import {
    generateSigner,
    percentAmount,
  publicKey,
  PublicKey,
    createSignerFromKeypair, none, signerIdentity, some
  } from '@metaplex-foundation/umi'
  import {
    createV1,
    mintV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata'
import * as web3 from "@solana/web3.js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox'

const INITIALIZE = false;

async function main() {
  
    const secretKeyArrayAdmin = Uint8Array.from([232, 155, 56, 199, 200, 75, 70, 251, 151, 178, 9, 61, 244, 0, 244, 106, 89, 238, 62, 14, 11, 127, 211, 119, 177, 231, 126, 10, 34, 103, 122, 117, 69, 42, 255, 221, 23, 61, 86, 254, 127, 243, 133, 7, 56, 63, 20, 130, 9, 162, 19, 100, 148, 97, 122, 136, 236, 137, 50, 206, 191, 236, 191, 224]);
    const payer = web3.Keypair.fromSecretKey(secretKeyArrayAdmin);
    const admin = payer.publicKey
    console.log("let's name some tokens in 2024!",admin);

    console.log("-----------")
    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer))

    umi.use(signerIdentity(signer, true))
   
      
      const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
        'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
      )
      const xx: PublicKey = publicKey(
        'EBhhEPNgQRNSLfnX5rsbjRMeNG8uZPo8d2G5iKmKKmv6'
      )
    
    const result = await createV1(umi, {
        mint: xx,
        authority: signer,
        name: 'SLOT',
        uri:'https://raw.githubusercontent.com/cryptonexum/SLAPP/main/metadata.json',
        sellerFeeBasisPoints: percentAmount(0.3),
        splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
        tokenStandard: 2,
      }).sendAndConfirm(umi)
    console.log(result)


}


(async () => await main())
  ();

