import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import * as bs58 from 'bs58';
import * as fs from 'fs';
import * as path from 'path';

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
  private program: Program<GaiaRecs> | null = null;

  // 🔗 OFFICIAL ADDRESSES FROM NICO'S README
  public readonly ENERGY_MINT = new PublicKey('G42SpR4jR8kxAg9oDiN4PfP2EhWHegYL51zrk2VUu6fk'); // kW (SPL)
  public readonly REC_MINT = new PublicKey('3KHwM1exGwu5EH6ymJgJ7FWLb1FYS7sSTqgLHRCbPvJ2');    // CO2 (Token-2022)

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    try {
      const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
      this.connection = new Connection(rpcUrl, 'confirmed');
      this.logger.log(`Solana connection established to: ${rpcUrl}`);

      const privateKeyB58 = this.configService.get<string>('ORACLE_PRIVATE_KEY');
      if (privateKeyB58 && privateKeyB58.trim() !== '') {
        try {
          this.oracleKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyB58));
          this.logger.log(`Oracle initialized with Public Key: ${this.oracleKeypair.publicKey.toBase58()}`);
        } catch (e) {
          this.logger.warn(`Invalid ORACLE_PRIVATE_KEY provided in .env, generating new keypair`);
          this.oracleKeypair = Keypair.generate();
          this.logger.log(`Generated new Oracle Keypair: ${this.oracleKeypair.publicKey.toBase58()}`);
        }
      } else {
        this.oracleKeypair = Keypair.generate();
        this.logger.log(`Generated new Oracle Keypair: ${this.oracleKeypair.publicKey.toBase58()}`);
      }

      // Try to load IDL from multiple locations
      let idl: any = null;
      const idlPaths = [
        path.join(__dirname, 'gaia_recs.idl.json'),
        path.join(process.cwd(), 'smartcontracts', 'target', 'idl', 'gaia_recs.json'),
        path.join(process.cwd(), '..', 'smartcontracts', 'target', 'idl', 'gaia_recs.json'),
      ];

      for (const idlPath of idlPaths) {
        try {
          if (fs.existsSync(idlPath)) {
            const idlContent = fs.readFileSync(idlPath, 'utf-8');
            idl = JSON.parse(idlContent);
            this.logger.log(`Loaded IDL from: ${idlPath}`);
            break;
          }
        } catch (error) {
          // Continue to next path
        }
      }

      if (!idl) {
        this.logger.warn('IDL not found, Solana program will not be initialized. Using mock mode.');
        return;
      }

      // 🏁 SYNC: Program ID from Nico's README
      const programId = new PublicKey('9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd');
      const wallet = new anchor.Wallet(this.oracleKeypair);
      const provider = new anchor.AnchorProvider(this.connection, wallet, {
        commitment: 'confirmed',
      });

      this.program = new Program(idl as unknown as GaiaRecs, provider);
      this.logger.log(`Solana Program initialized: ${this.program.programId.toBase58()}`);
    } catch (error) {
      this.logger.error(`Failed to initialize SolanaService: ${error.message}`);
      this.logger.warn('SolanaService running in mock mode - blockchain operations disabled');
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🏁 SYNC CON NICO: Emite Certificados (RECs) en Token-2022
   */
  async mintREC(deviceId: string, kwh: number, recipientWallet: string): Promise<string> {
    if (!this.program) {
      this.logger.warn('Solana program not initialized, returning mock transaction hash');
      return `mock-tx-${deviceId}-${Date.now()}`;
    }

    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkThp9N8z6CqDqG3W9SUnV4at');

    try {
      const recipient = new PublicKey(recipientWallet);
      const certificateId = `REC-${deviceId}-${Date.now()}`;

      const [devicePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('device'), recipient.toBuffer(), Buffer.from(deviceId)],
        this.program.programId
      );

      const [certificatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('certificate'), this.REC_MINT.toBuffer(), Buffer.from(certificateId)],
        this.program.programId
      );

      const [destinationAta] = PublicKey.findProgramAddressSync(
        [recipient.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), this.REC_MINT.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const now = Math.floor(Date.now() / 1000);
      const expiry = now + (365 * 24 * 60 * 60);

      const txHash = await (this.program.methods as any)
        .mintRecs(
          certificateId,
          new anchor.BN(kwh),
          new anchor.BN(now),
          new anchor.BN(expiry),
        )
        .accounts({
          mint: this.REC_MINT,
          destination: destinationAta,
          mintAuthority: this.oracleKeypair.publicKey,
          device: devicePda,
          certificate: certificatePda,
          owner: recipient, // El destinatario es el dueño del certificado
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([this.oracleKeypair])
        .rpc();

      this.logger.log(`REC MINT successful: ${txHash}`);
      return txHash;
    } catch (e) {
      this.logger.error(`REC MINT failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🏁 SYNC CON NICO: Registra el dispositivo ON-CHAIN en Solana
   */
  async registerDeviceOnChain(dto: {
    ownerWallet: string,
    deviceId: string,
    name: string,
    serialNumber: string,
    brand: string,
    location: string,
    capacityKw: number
  }): Promise<string> {
    if (!this.program) {
      this.logger.warn('Solana program not initialized, returning mock transaction hash');
      return `mock-device-tx-${dto.deviceId}-${Date.now()}`;
    }

    try {
      const owner = new PublicKey(dto.ownerWallet);
      const [devicePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('device'), owner.toBuffer(), Buffer.from(dto.deviceId)],
        this.program.programId
      );

      const txHash = await (this.program.methods as any)
        .addDevice(
          dto.name,
          dto.serialNumber,
          dto.brand,
          dto.location,
          dto.capacityKw
        )
        .accounts({
          device: devicePda,
          owner: owner,
          systemProgram: SystemProgram.programId,
        })
        .signers([this.oracleKeypair]) // Note: In Nico's contract, 'owner' is a Signer.
        // If the Oracle is acting as the registrar, it must sign.
        .rpc();

      this.logger.log(`On-chain Registration successful: ${txHash}`);
      return txHash;
    } catch (e) {
      this.logger.error(`On-chain Registration failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🏁 SYNC CON NICO: Emite Tokens líquidos de Energía (kW) en SPL Standard
   */
  async mintEnergy(kwAmount: number, recipientWallet: string): Promise<string> {
    if (!this.program) {
      this.logger.warn('Solana program not initialized, returning mock transaction hash');
      return `mock-energy-tx-${Date.now()}`;
    }

    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

    try {
      const recipient = new PublicKey(recipientWallet);
      const [destinationAta] = PublicKey.findProgramAddressSync(
        [recipient.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), this.ENERGY_MINT.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const txHash = await (this.program.methods as any)
        .mintEnergy(new anchor.BN(kwAmount))
        .accounts({
          mint: this.ENERGY_MINT,
          destination: destinationAta,
          mintAuthority: this.oracleKeypair.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([this.oracleKeypair])
        .rpc();

      this.logger.log(`Energy MINT successful: ${txHash}`);
      return txHash;
    } catch (e) {
      this.logger.error(`Energy MINT failed: ${e.message}`);
      throw e;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}
