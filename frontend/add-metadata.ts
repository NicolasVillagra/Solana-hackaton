import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { DEVNET_KEYPAIR_SECRET, SHARED_ENERGY_MINT, SHARED_REC_MINT } from './src/lib/devnet-keypair';

async function main() {
  const umi = createUmi('https://api.devnet.solana.com');
  
  // Load the shared generated devnet keypair inside Umi
  const myKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(DEVNET_KEYPAIR_SECRET));
  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  
  // Set our signer as the default identity to authorize the metadata creation
  umi.use(signerIdentity(myKeypairSigner));

  console.log("Enviando Metadata para GAI (Energy)...");
  try {
    const tx1 = createMetadataAccountV3(umi, {
      mint: publicKey(SHARED_ENERGY_MINT.toBase58()),
      mintAuthority: myKeypairSigner,
      payer: myKeypairSigner,
      updateAuthority: myKeypairSigner.publicKey,
      data: {
        name: "Gaia Energy",
        symbol: "GAI",
        uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens-and-minting/token-metadata/assets/metadata.json", // Optional fallback generic URI
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
      collectionDetails: null,
    });
    
    await tx1.sendAndConfirm(umi);
    console.log("✅ Metadatos agregados para GAI:", SHARED_ENERGY_MINT.toBase58());
  } catch (e) {
    console.error("Error GAI:", e);
  }

  console.log("Enviando Metadata para gREC (Certificates)...");
  try {
    const tx2 = createMetadataAccountV3(umi, {
      mint: publicKey(SHARED_REC_MINT.toBase58()),
      mintAuthority: myKeypairSigner,
      payer: myKeypairSigner,
      updateAuthority: myKeypairSigner.publicKey,
      data: {
        name: "Gaia REC",
        symbol: "gREC",
        uri: "",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
      collectionDetails: null,
    });
    
    await tx2.sendAndConfirm(umi);
    console.log("✅ Metadatos agregados para gREC:", SHARED_REC_MINT.toBase58());
  } catch (e) {
    console.error("Error gREC:", e);
  }
}

main().catch(console.error);
