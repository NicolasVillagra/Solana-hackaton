import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import * as bs58 from 'bs58';
import idl from '../../../smartcontracts/target/idl/gaia_recs.json';

// Simple type representing the IDL structure since types/ are not 100% available
type GaiaRecs = anchor.Idl & {
  version: "0.1.0";
  name: "gaia_recs";
};

@Injectable()
export class SolanaService implements OnModuleInit {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;
  private oracleKeypair: Keypair;
  private program: Program<GaiaRecs>;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    const privateKeyB58 = this.configService.get<string>('ORACLE_PRIVATE_KEY');
    if (privateKeyB58) {
      try {
        this.oracleKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyB58));
        this.logger.log(`Oracle initialized with Public Key: ${this.oracleKeypair.publicKey.toBase58()}`);
      } catch (e) {
        this.logger.error(`Invalid ORACLE_PRIVATE_KEY provided in .env`);
        throw e;
      }
    } else {
      this.oracleKeypair = Keypair.generate();
    }

    const programIdStr = this.configService.get<string>('SOLANA_PROGRAM_ID') || '9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd';
    const programId = new PublicKey(programIdStr);
    const wallet = new anchor.Wallet(this.oracleKeypair);
    const provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });

    this.program = new Program(idl as unknown as GaiaRecs, provider);
    this.logger.log(`Solana Program initialized: ${this.program.programId.toBase58()}`);
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async mintREC(deviceId: string, mwh: number, co2Saved: number, recipientWallet: string): Promise<string> {
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkThp9N8z6CqDqG3W9SUnV4at');
    
    const maxRetries = 3;
    let lastError: Error = new Error('Unknown RPC error');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const tokenMintStr = this.configService.get<string>('TOKEN_MINT_PUBLIC_KEY');
        if (!tokenMintStr) throw new Error('TOKEN_MINT_PUBLIC_KEY not configured');
        
        const tokenMint = new PublicKey(tokenMintStr);
        const recipient = new PublicKey(recipientWallet);
        
        // 🏁 SYNC WITH NICO: Device PDA derivation
        const [devicePda] = PublicKey.findProgramAddressSync(
          [Buffer.from('device'), recipient.toBuffer(), Buffer.from(deviceId)],
          this.program.programId
        );

        // 🏁 SYNC WITH NICO: Certificate PDA derivation
        const certificateId = `REC-${deviceId}-${Date.now()}`;
        const [certificatePda] = PublicKey.findProgramAddressSync(
          [Buffer.from('certificate'), tokenMint.toBuffer(), Buffer.from(certificateId)],
          this.program.programId
        );

        // Derive Associated Token Account (ATA) for Token-2022
        const [destinationAta] = PublicKey.findProgramAddressSync(
          [recipient.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const now = Math.floor(Date.now() / 1000);
        const expiry = now + (365 * 24 * 60 * 60);

        // 🏁 SYNC WITH NICO: Call mintRecs exactly
        const txHash = await (this.program.methods as any)
          .mintRecs(
            certificateId,
            new anchor.BN(mwh),
            new anchor.BN(now),
            new anchor.BN(expiry),
          )
          .accounts({
            mint: tokenMint,
            destination: destinationAta,
            mintAuthority: this.oracleKeypair.publicKey,
            device: devicePda,
            certificate: certificatePda,
            owner: this.oracleKeypair.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([this.oracleKeypair])
          .rpc();
        
        this.logger.log(`On-chain MINT successful: ${txHash}`);
        return txHash;

      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) await this.sleep(1000 * attempt);
      }
    }
    throw lastError;
  }

  getConnection(): Connection {
    return this.connection;
  }
}
