import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import idl from "./idl/smartcontracts.json";

// Public Network addresses (Devnet)
export const PROGRAM_ID = new PublicKey("9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd");
export const ENERGY_MINT_ADDRESS = new PublicKey("2YuWHezvPqVrGCckV8YcSV4VByzsdKmD4anu8YcQFzoT");
export const REC_MINT_ADDRESS = new PublicKey("57W7NFZj9ysJQYtHRfXGQMPjMFMx3zxYEcs3NHSSSrsb");

// Default RPC Connection
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed"
);

/**
 * Returns a configured Anchor Program instance for the frontend
 */
export const getSmartContractsProgram = (provider: AnchorProvider) => {
  // Ensure the program ID is in the IDL structure compatible with Anchor >= 0.30
  const programIdl = { ...idl, address: PROGRAM_ID.toString() };
  return new Program(programIdl as any, provider);
};
