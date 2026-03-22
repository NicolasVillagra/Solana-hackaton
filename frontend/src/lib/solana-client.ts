import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import idl from "./idl/smartcontracts.json";

// Public Network addresses (Devnet)
export const PROGRAM_ID = new PublicKey("9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd");
export const ENERGY_MINT_ADDRESS = new PublicKey("9Xi8otRyHxhyy5MjbgeeVzwP452Qiq3dtw9uxzhhtDGt");
export const REC_MINT_ADDRESS = new PublicKey("3KHwM1exGwu5EH6ymJgJ7FWLb1FYS7sSTqgLHRCbPvJ2");

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
