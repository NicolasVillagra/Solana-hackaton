import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

async function main() {
  const umi = createUmi("https://api.devnet.solana.com");
  
  const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf-8')));
  const myKeypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  umi.use(keypairIdentity(myKeypair));

  const mint = publicKey("9Xi8otRyHxhyy5MjbgeeVzwP452Qiq3dtw9uxzhhtDGt");

  console.log("Sending metadata transaction...");
  try {
    const tx = createMetadataAccountV3(umi, {
      mint,
      mintAuthority: umi.identity,
      data: {
        name: "Energy Token",
        symbol: "ENT",
        uri: "",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
      collectionDetails: null,
    });

    const result = await tx.sendAndConfirm(umi);
    const bs58 = await import('bs58');
    console.log("Success! Metaplex Tx Hash:", bs58.default.encode(result.signature));
  } catch (err) {
    console.error("Metaplex Error:", err);
  }
}

main();
