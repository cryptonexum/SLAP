
import { createV1, updateV1 ,Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda, CreateV1InstructionAccounts, CreateV1InstructionData, TokenStandard, CollectionDetails, PrintSupply, UpdateV1InstructionData, UpdateV1InstructionAccounts, Data} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, keypairPayer, none, percentAmount, publicKey, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
);
const PRIVATE_KEY_ADMIN= [232, 155, 56, 199, 200, 75, 70, 251, 151, 178, 9, 61, 244, 0, 244, 106, 89, 238, 62, 14, 11, 127, 211, 119, 177, 231, 126, 10, 34, 103, 122, 117, 69, 42, 255, 221, 23, 61, 86, 254, 127, 243, 133, 7, 56, 63, 20, 130, 9, 162, 19, 100, 148, 97, 122, 136, 236, 137, 50, 206, 191, 236, 191, 224]
const secretKeyArray = Uint8Array.from(PRIVATE_KEY_ADMIN);
const myKeypair = web3.Keypair.fromSecretKey(secretKeyArray);

  

const INITIALIZE = false;

async function main(){
    console.log("let's name some token-22 tokens in 2024!");
    const mint = new web3.PublicKey("8WE37Gg57AeuM9E7V23BrEHm8Je1CSo9vF8yhKWpqYAU");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "Silly Dragon Token Extended", 
        symbol: "SDT",
        uri: "https://raw.githubusercontent.com/loopcreativeandy/video-tutorial-resources/main/metadataUpdate/metadata.json",
    }
    if(INITIALIZE){
        const onChainData = {
            ...ourMetadata,
            // we don't need that
            sellerFeeBasisPoints: percentAmount(0,2),
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: CreateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
        }
        const data: CreateV1InstructionData = {
            ...onChainData,
            isMutable: true,
            discriminator: 0,
            tokenStandard: TokenStandard.Fungible,
            collectionDetails: none<CollectionDetails>(),
            ruleSet: none<PublicKey>(),
            createV1Discriminator: 0,
            primarySaleHappened: true,
            decimals: none<number>(),
            printSupply: none<PrintSupply>(),
        }
        const txid = await createV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(txid.signature)
    } else {
        
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: 0,
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: UpdateV1InstructionAccounts = {
            mint: publicKey(signer)
        }
        const data = {
            discriminator: 0,
            data: some<Data>(onChainData),
            updateV1Discriminator: 0,
        }
        const txid = await updateV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(txid.signature)
    }


}

main();