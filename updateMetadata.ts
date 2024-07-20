
import {Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';

const INITIALIZE = false;

    async function main(){
    const mintAddress = "ABpH9szrGfd8YGYfobhrufqPhAMH4KNZe4bsCf8hhXc2";
    const PRIVATE_KEY_ADMIN= [232, 155, 56, 199, 200, 75, 70, 251, 151, 178, 9, 61, 244, 0, 244, 106, 89, 238, 62, 14, 11, 127, 211, 119, 177, 231, 126, 10, 34, 103, 122, 117, 69, 42, 255, 221, 23, 61, 86, 254, 127, 243, 133, 7, 56, 63, 20, 130, 9, 162, 19, 100, 148, 97, 122, 136, 236, 137, 50, 206, 191, 236, 191, 224]
    const secretKeyArray = Uint8Array.from(PRIVATE_KEY_ADMIN);
    const myKeypair = web3.Keypair.fromSecretKey(secretKeyArray);
    console.log("let's name some tokens in 2024!");

    const mint = new web3.PublicKey(mintAddress);
    console.log("-----------")
    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))

    umi.use(signerIdentity(signer, true))
   
    const ourMetadata = {
        name: "SLAP", 
        symbol: "SLAP",
        uri: "https://raw.githubusercontent.com/cryptonexum/SLAPP/main/metadata.json",
    }
   
    const onChainData = {
        ...ourMetadata,
        sellerFeeBasisPoints: 30,
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
    }
    if (INITIALIZE) {
       
        const accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            mintAuthority: signer,
        }
        const data: CreateMetadataAccountV3InstructionDataArgs = {
            isMutable: true,
            collectionDetails: null,
            data: onChainData
        }
        const txid = await createMetadataAccountV3(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(txid)
    } else { 
        const data: UpdateMetadataAccountV2InstructionData = {
            data: some(onChainData),
            discriminator: 0,
            isMutable: some(true),
            newUpdateAuthority: none<PublicKey>(),
            primarySaleHappened: none<boolean>()
        }
       
        const accounts: UpdateMetadataAccountV2InstructionAccounts = {
            metadata: findMetadataPda(umi,{mint: fromWeb3JsPublicKey(mint)}),
            updateAuthority: signer
        }
      
        const txid = await updateMetadataAccountV2(umi, {...accounts, ...data} ).sendAndConfirm(umi);
        console.log(txid)
    }

}

main();