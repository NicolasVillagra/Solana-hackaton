# Gaia Ecotrack: Production Backend - Technical Report

## 1. Goal
The primary objective of the backend was to move from a boilerplate skeleton to a 100% functional, production-grade Oracle system for the Solana Hackathon, strictly adhering to the "no mocks" requirement.

## 2. Hardened Production Features

### Security & Integrity
- **DTO Validation**: Every incoming request for device registration or energy reporting is strictly validated using `class-validator`. We ensure that Wallet Public Keys are valid strings and energy values are positive.
- **Global Validation Pipes**: NestJS is configured with a global pipe to automatically reject any malformed or non-whitelisted data.
- **CORS Configuration**: Enabled to support the team's Next.js frontend, ensuring secure cross-origin communication.

### Persistent Oracle Identity
- **Secure Key Management**: The `SolanaService` is now configured to load the Oracle's Identity from the `ORACLE_PRIVATE_KEY` environment variable. This eliminates ephemeral identities and ensures the Oracle remains consistent across restarts.
- **Persistent Storage**: All on-chain actions are mirrored in a real **Prisma/PostgreSQL** database, providing a transparent and auditable trail of all IoT generation reports.

### Precision & Accuracy
- **High-Precision Calculations**: We use `bignumber.js` to handle all CO2 and REC token calculations, avoiding IEEE 754 floating-point errors which are unacceptable in financial/environmental tokenization systems.

## 3. The Oracle Data Flow
1. **IoT Ingestion**: Validated via `CreateEnergyReportDto`.
2. **Device Verification**: Authenticated against the database via Prisma.
3. **CO2 Proof**: Calculated via `EnergyService` with precision.
4. **Transaction Signing**: `SolanaService` constructs and signs a real transaction using the persistent Oracle Keypair.
5. **On-Chain Audit**: The resulting Transaction Hash is stored alongside the local report record for permanent auditability.
