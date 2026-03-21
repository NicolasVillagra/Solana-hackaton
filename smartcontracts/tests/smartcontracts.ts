import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Smartcontracts } from "../target/types/smartcontracts";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { createMint, createAccount, getAccount, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

describe("smartcontracts", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.smartcontracts as Program<Smartcontracts>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test data
  const serialNumber = "SN-123456789";
  const certId = "REC-2024-001";
  let devicePda: PublicKey;
  let certificatePda: PublicKey;

  // Mint references
  let energyMint: PublicKey;
  let recMint: PublicKey;
  let energyTokenAccount: PublicKey;
  let recTokenAccount: PublicKey;

  // Use a separate keypair for mint authorities or just wallet.payer
  const mintAuthority = wallet.payer;

  before(async () => {
    // Generate device PDA
    [devicePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("device"), wallet.publicKey.toBuffer(), Buffer.from(serialNumber)],
      program.programId
    );

    // Create SPL Token (Energy - Standard)
    energyMint = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 9);
    energyTokenAccount = await createAccount(provider.connection, wallet.payer, energyMint, wallet.publicKey);

    // Create SPL Token 2022 (RECs)
    recMint = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 9, Keypair.generate(), undefined, TOKEN_2022_PROGRAM_ID);
    recTokenAccount = await createAccount(provider.connection, wallet.payer, recMint, wallet.publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);

    // Generate certificate PDA
    [certificatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("certificate"), recMint.toBuffer(), Buffer.from(certId)],
      program.programId
    );
  });

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
  });

  it("Adds a Device successfully", async () => {
    await program.methods
      .addDevice("Solar Panel Model X", serialNumber, "SunCorp", "Coordinates: -33.4, -70.6", 5)
      .accounts({
        device: devicePda,
        owner: wallet.publicKey,
        // systemProgram implicitly handled by Anchor in newer versions, but we can pass it
      })
      .rpc();

    // Verify
    const deviceState = await program.account.device.fetch(devicePda);
    assert.equal(deviceState.name, "Solar Panel Model X");
    assert.equal(deviceState.serialNumber, serialNumber);
    assert.equal(deviceState.capacityKw, 5);
    assert.equal(deviceState.owner.toBase58(), wallet.publicKey.toBase58());
  });

  it("Mints standard energy tokens (kW)", async () => {
    const mintAmount = new anchor.BN(100);

    await program.methods
      .mintEnergy(mintAmount)
      .accounts({
        mint: energyMint,
        destination: energyTokenAccount,
        mintAuthority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const accountInfo = await getAccount(provider.connection, energyTokenAccount);
    assert.equal(accountInfo.amount.toString(), mintAmount.toString());
  });

  it("Mints RECs (Token-2022) and initializes Certificate", async () => {
    const mintAmount = new anchor.BN(50);
    const generationDate = new anchor.BN(Math.floor(Date.now() / 1000));
    const expiryDate = new anchor.BN(Math.floor(Date.now() / 1000) + 31536000); // 1 year

    await program.methods
      .mintRecs(certId, mintAmount, generationDate, expiryDate)
      .accounts({
        mint: recMint,
        destination: recTokenAccount,
        mintAuthority: wallet.publicKey,
        device: devicePda,
        certificate: certificatePda,
        owner: wallet.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    // Verify token balance
    const accountInfo = await getAccount(provider.connection, recTokenAccount, undefined, TOKEN_2022_PROGRAM_ID);
    assert.equal(accountInfo.amount.toString(), mintAmount.toString());

    // Verify Certificate state
    const certState = await program.account.reCertificate.fetch(certificatePda);
    assert.equal(certState.certificateId, certId);
    assert.equal(certState.recAmount.toString(), mintAmount.toString());
    assert.equal(certState.device.toBase58(), devicePda.toBase58());
    assert.equal(certState.tokenAccount.toBase58(), recTokenAccount.toBase58());
  });
});
