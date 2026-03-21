import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as os from "os";


const keypairPath = `${os.homedir()}/.config/solana/id.json`;
const secretKeyString = fs.readFileSync(keypairPath, "utf-8");
const secretKey = JSON.parse(secretKeyString);
const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));


const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function main() {
    console.log("🚀 Conectando a Solana Devnet...");
    console.log("Tu Wallet Pública es:", payer.publicKey.toBase58());

    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Tu saldo actual es: ${balance / LAMPORTS_PER_SOL} SOL\n`);

    if (balance === 0) {
        console.error("❌ No tienes saldo para pagar la transacción.");
        console.error("Primero ejecuta: `solana airdrop 2` en tu terminal para obtener dev-SOL gratuíto.\n");
        return;
    }

    console.log("1. Creando el Token Maestro de Energía (kW)...");
    const energyMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        9,
        Keypair.generate(),
        undefined,
        TOKEN_PROGRAM_ID
    );
    console.log("✅ Token de Energía (kW) CREADO!");
    console.log("👉 GUARDA ESTA DIRECCIÓN: ", energyMint.toBase58());
    console.log("--------------------------------------------------\n");

    console.log("2. Creando el Token Maestro de RECs (Certificados CO2)...");
    const recMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        0,
        Keypair.generate(),
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
    console.log("✅ Token de RECs (CO2) CREADO!");
    console.log("👉 GUARDA ESTA DIRECCIÓN: ", recMint.toBase58());
    console.log("--------------------------------------------------\n");

    console.log("¡Todo listo! Guárdate esos dos Hash (Direcciones Mint).");
    console.log("Son las que usarás como parámetros en tu Frontend/DApp cada vez que llames a tu contrato.");
}

main().catch(err => {
    console.error(err);
});
