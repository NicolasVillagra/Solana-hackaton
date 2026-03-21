# Solana Energy & RECs Smart Contract

Este repositorio contiene el Smart Contract para el registro de dispositivos generadores de energía solar y la emisión descentralizada de tokens de energía (kW) y Certificados de Energía Renovable (RECs de CO2) en la red de Solana.

## 🔗 Direcciones Oficiales (Solana Devnet)

**Program ID del Smart Contract:**
`9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd`

**Tokens Maestros (Mints):**
Para invocar las funciones de minteo desde tu DApp (Frontend/Backend), debes usar estas direcciones públicas exactas:

1. **Token de Energía (kW) - (SPL Standard):**
   `G42SpR4jR8kxAg9oDiN4PfP2EhWHegYL51zrk2VUu6fk`
2. **Token de Certificados (RECs/CO2) - (SPL Token-2022):**
   `3KHwM1exGwu5EH6ymJgJ7FWLb1FYS7sSTqgLHRCbPvJ2`

*Importante: La autoridad encargada de firmar la emisión (mint_authority) para ambos tokens es tu wallet del Backend actual. Esta capa de seguridad asegura que nadie más que tu aplicación pueda mintear tokens a los usuarios.*

---

## 🛠 Integración e Instrucciones del Contrato

El Smart Contract expone **3 métodos principales** a los que tu Frontend (usando `@coral-xyz/anchor`) debe llamar:

### 1. Registrar un Dispositivo (`addDevice`)
Registra un nuevo dispositivo/panel solar en la blockchain, atado al Dueño y su Número de Serie.

**Argumentos:**
- `name` (String): Ej. "Panel Residencial B3"
- `serialNumber` (String): Ej. "SN-12345"
- `deviceBrand` (String): Ej. "Solaria"
- `location` (String): Ej. "Santiago, Chile"
- `capacityKw` (Integer / `u32`): Ej. `5`

**Cuentas necesarias (.accounts):**
- `device`: La dirección (PDA) del dispositivo *(Se deriva mezclando: la palabra `"device"`, la PublicKey del `owner`, y el `serialNumber`)*.
- `owner`: PublicKey del Dueño.

---

### 2. Emitir Tokens de Energía (`mintEnergy`)
El Backend/Frontend emite tokens líquidos (SPL) cuando confirma la generación de energía reportada por el dispositivo.

**Argumentos:**
- `amount` (Anchor.BN): Cantidad en formato BigNumber.

**Cuentas necesarias (.accounts):**
- `mint`: El Address del "Token de Energía (kW)" detallado más arriba.
- `destination`: La sub-cuenta (Token Account/ATA) del usuario donde van a parar los tokens.
- `mintAuthority`: El Keypair autorizado para imprimir tokens (Tu servidor).
- `tokenProgram`: Usar `TOKEN_PROGRAM_ID` nativo de Solana.

---

### 3. Emitir Certificados de Carbono (`mintRecs`)
Emite tokens sobre el estándar moderno **Token-2022** y, de forma simultánea, almacena permanentemente en la blockchain un `RECertificate` que representa la información inmutable que respalda ese origen de energía.

**Argumentos:**
- `certificateId` (String): Un ID único (Ej. "REC-XX-001").
- `recAmount` (Anchor.BN): Cantidad de RECs minteados.
- `generationDate` (Anchor.BN): Timestamp (Fecha Unix) en que la energía se generó.
- `expiryDate` (Anchor.BN): Timestamp (Fecha Unix) en que expira el certificado.

**Cuentas necesarias (.accounts):**
- `mint`: El Address del "Token de Certificados (RECs/CO2)" (Token-2022).
- `destination`: La sub-cuenta (Token Account) del usuario. Destacar que esta cuenta debe existir usando el estándar `TOKEN_2022_PROGRAM_ID`.
- `mintAuthority`: El Keypair autorizado del Backend.
- `device`: PublicKey del Dispositivo (PDA) que generó la energía.
- `certificate`: La dirección (PDA) donde se leerán los metadatos. *(Se deriva mezclando: `"certificate"`, la PublicKey del `mint`, y el `certificateId`)*.
- `owner`: El destinatario de los certificados.
- `tokenProgram`: Usar `TOKEN_2022_PROGRAM_ID`.

---

## 👩‍💻 Ejemplo de Código Base (TypeScript / Node)

El equipo puede encontrar el código de ejemplo ideal para copiar y pegar en su implementación de Frontend y Backend revisando el archivo de pruebas automáticas:

👉 **[`tests/smartcontracts.ts`](./tests/smartcontracts.ts)**

Ese archivo tiene exactamente el orden en que TypeScript deriva los `PublicKey.findProgramAddressSync`, crea las cuentas bancarias de los usuarios `createAccount` y se comunica con el Smart Contract de Solana.
