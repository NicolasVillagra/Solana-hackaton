import { NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import idl from "@/lib/idl/smartcontracts.json";

import * as os from "os";

const PROGRAM_ID = new PublicKey("9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd");
const ENERGY_MINT_ADDRESS = new PublicKey("9Xi8otRyHxhyy5MjbgeeVzwP452Qiq3dtw9uxzhhtDGt");

export async function POST(req: Request) {
  try {
    const { destinationPubkey, amount } = await req.json();
    if (!destinationPubkey || !amount) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const recipient = new PublicKey(destinationPubkey);
    
    // For local dev, read the original dev keypair that deployed the contract
    const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
    if (!fs.existsSync(keypairPath)) {
      return NextResponse.json({ error: "Backend keypair not found for local dev" }, { status: 500 });
    }
    
    const secretKeyString = fs.readFileSync(keypairPath, 'utf-8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const backendKeypair = Keypair.fromSecretKey(secretKey);

    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    const wallet = {
      publicKey: backendKeypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(backendKeypair);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        return txs.map((tx) => {
          tx.partialSign(backendKeypair);
          return tx;
        });
      }
    };
    const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    
    const programIdl = { ...idl, address: PROGRAM_ID.toString() };
    const program = new Program(programIdl as any, provider);

    const ata = getAssociatedTokenAddressSync(ENERGY_MINT_ADDRESS, recipient);
    const preIxs: TransactionInstruction[] = [];

    const ataInfo = await connection.getAccountInfo(ata);
    if (!ataInfo) {
      preIxs.push(
        createAssociatedTokenAccountInstruction(
          backendKeypair.publicKey, // Payer (backend)
          ata,
          recipient, // Owner (connected user)
          ENERGY_MINT_ADDRESS
        )
      );
    }

    const signature = await program.methods
      .mintEnergy(new BN(amount))
      .accounts({
        mint: ENERGY_MINT_ADDRESS,
        destination: ata,
        mintAuthority: backendKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(preIxs)
      .rpc();

    return NextResponse.json({ signature });
  } catch (error: any) {
    console.error("Mint API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
