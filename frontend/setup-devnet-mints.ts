import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  const idJsonPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
  const secretKeyString = fs.readFileSync(idJsonPath, 'utf-8');
  const localKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyString)));
  
  const devnetKeypair = Keypair.generate();
  const secretKeyArray = Array.from(devnetKeypair.secretKey);
  
  const transferAmount = 0.2 * LAMPORTS_PER_SOL;
  const transferTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: localKeypair.publicKey,
      toPubkey: devnetKeypair.publicKey,
      lamports: transferAmount,
    })
  );
  
  await sendAndConfirmTransaction(connection, transferTx, [localKeypair]);

  const energyMint = await createMint(
    connection,
    devnetKeypair,            // Payer
    devnetKeypair.publicKey,  // Mint Authority
    null,                     // Freeze Authority
    6                         // Decimals
  );

  const recMint = await createMint(
    connection,
    devnetKeypair,            // Payer
    devnetKeypair.publicKey,  // Mint Authority
    null,                     // Freeze Authority
    6                         // Decimals
  );

  const outputContent = `// Auto-generated shared devnet keypair and mints
import { PublicKey } from "@solana/web3.js";

// DO NOT USE ON MAINNET! This is purely for hackathon ease-of-use so all devs share the same token state
export const DEVNET_KEYPAIR_SECRET = [${secretKeyArray.join(",")}];

export const SHARED_ENERGY_MINT = new PublicKey("${energyMint.toBase58()}");
export const SHARED_REC_MINT = new PublicKey("${recMint.toBase58()}");
`;

  const libDir = path.join(__dirname, 'src', 'lib');
  fs.writeFileSync(path.join(libDir, 'devnet-keypair.ts'), outputContent);
  console.log("Successfully wrote src/lib/devnet-keypair.ts");
}

main().catch(console.error);
