import { Connection, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
  const secretKeyString = fs.readFileSync(keypairPath, 'utf-8');
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const backendKeypair = Keypair.fromSecretKey(secretKey);

  console.log("Creating new Mint for Energy Tokens using developer wallet:", backendKeypair.publicKey.toBase58());

  try {
    const mint = await createMint(
      connection,
      backendKeypair,            // Payer
      backendKeypair.publicKey,  // Mint Authority
      null,                      // Freeze Authority
      6                          // Decimals
    );

    console.log("\n=================================");
    console.log("SUCCESS! NEW ENERGY MINT ADDRESS:");
    console.log(mint.toBase58());
    console.log("=================================\n");
  } catch (err) {
    console.error("Failed to create mint:", err);
  }
}

main();
