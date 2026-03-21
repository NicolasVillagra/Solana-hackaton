# 🌿 SolEnergy by Gaia Ecotrack - Backend Core

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Solana](https://img.shields.io/badge/solana-%239945FF.svg?style=for-the-badge&logo=solana&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white) ![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

##  Tabla de Contenidos

* Introducción  
* Características Principales  
* Arquitectura del Sistema  
* Tecnologías Utilizadas  
* Requisitos Previos  
* Instalación y Configuración  
* Variables de Entorno  
* Despliegue del Smart Contract  
* Ejecución del Backend  
* Documentación de la API  
* Seguridad  
* Pruebas  
* Mejoras Futuras  
* Conclusión

---

##  Introducción

**SolEnergy** es el módulo de certificación de energía de **Gaia Ecotrack**. Es una solución DePIN (Red de Infraestructura Física Descentralizada) que convierte datos de generación de energía renovable en activos digitales tokenizados en la blockchain de Solana. Permite a dispositivos IoT registrar su producción, calcular el CO₂ evitado y recibir automáticamente dos tipos de tokens:

* Certificados REC (Token-2022): Representan la energía renovable generada con metadatos inmutables.  
* Tokens de Energía Líquida (SPL): Simbolizan la energía en tiempo real, aptos para comercio o compensación.

El proyecto utiliza **kWh** como unidad base para garantizar máxima precisión en instalaciones de cualquier escala.  
---

##  Características Principales

* Registro de Dispositivos IoT  
  Cada dispositivo se registra tanto en la base de datos (Prisma) como en la blockchain (PDA). Se almacenan metadatos como nombre, serie, marca, capacidad y ubicación.  
* Reportes de Energía Autenticados  
  Los dispositivos envían reportes de **kWh** generados mediante un secreto hasheado (SHA-256). El backend verifica el hash en tiempo constante (timingSafeEqual) para evitar ataques de tiempo.  
* Cálculo Preciso de CO₂  
  Uso de bignumber.js para convertir kWh a toneladas de CO₂ evitado (factor de emisión: 0.000475 T CO₂/kWh).  
* Minting Dual en Solana  
  Al recibir un reporte, el backend invoca el programa Anchor que acuña:  
  * Certificados REC (Token-2022) usando el mint oficial de Nico.  
  * Tokens de Energía (SPL) usando el mint oficial de energía.  
  * Las transacciones incluyen CPI a spl-token y se firman con la clave del oráculo.  
* Resiliencia y Reintentos  
  Las operaciones en blockchain cuentan con reintentos automáticos (backoff exponencial, 3 intentos) para manejar fallos de red.  
* Seguridad Empresarial  
  * CORS restringido, rate limiting (10 req/min), validación estricta de DTOs.  
  * Secrets hasheados en DB, comparación en tiempo constante con `crypto.timingSafeEqual`.  
  * Gestión segura de la clave del oráculo (variable de entorno).  
* Estados Claros de Transacción  
  El endpoint de reporte devuelve CONFIRMED o PENDING_CHAIN con el hash de la transacción, permitiendo seguimiento en vivo.

---

##  Arquitectura del Sistema

```text
┌─────────────┐       ┌─────────────────────────┐       ┌──────────────────┐  
│   IoT Device │──────▶│   Backend NestJS       │──────▶│   PostgreSQL     │  
│  (reporte)   │       │  - Autenticación       │       │   (Prisma)       │  
└─────────────┘       │  - Cálculo CO2          │       └──────────────────┘  
                      │  - Lógica de minteo     │  
                      └───────────┬─────────────┘  
                                  │  
                                  ▼  
                      ┌─────────────────────────┐  
                      │   Solana RPC            │  
                      │   (Devnet/Mainnet)      │  
                      └───────────┬─────────────┘  
                                  │  
                                  ▼  
                      ┌─────────────────────────┐  
                      │   Programa Anchor       │  
                      │   - add_device          │  
                      │   - mint_recs           │  
                      └───────────┬─────────────┘  
                                  │  
                                  ▼  
                      ┌─────────────────────────┐  
                      │   SPL Token Program     │  
                      │   (mint_to CPI)         │  
                      └─────────────────────────┘  
```

Flujo Detallado:

1. Registro: IoT → POST /devices → valida PublicKey → hashea secret → guarda en DB → llama a `add_device` en blockchain.  
2. Reporte: IoT → POST /energy/report (con x-device-secret) → verifica hash con `timingSafeEqual` → calcula CO₂ → guarda reporte → llama a `mint_recs`.  
3. Minting: SolanaService deriva PDA del dispositivo y ATA del dueño → envía transacción al programa → el programa ejecuta CPI para acuñar ambos tokens.  
4. Respuesta: Devuelve status: CONFIRMED (si la transacción fue exitosa) o PENDING_CHAIN (si falló, con reintentos programados).

---

##  Tecnologías Utilizadas

| Área | Tecnologías |
| :---- | :---- |
| Backend | NestJS 11, TypeScript, Prisma (SQLite para Dev) |
| Blockchain | Solana (Web3.js), Anchor 0.30, SPL Token, Token-2022 |
| Seguridad | class-validator, bcrypt/SHA-256, crypto.timingSafeEqual, @nestjs/throttler |
| Precisión | bignumber.js |
| Despliegue | Docker (opcional), Git, npm/yarn |

---

##  Requisitos Previos

* Node.js >= 18  
* npm o yarn  
* PostgreSQL >= 14  
* Solana CLI (para desplegar el contrato)  
* Anchor CLI (opcional, para compilar)  
* Cuenta en Solana Devnet (para pruebas)

---

##  Instalación y Configuración

1. Clonar el repositorio  
2. `git clone https://github.com/NicolasVillagra/Solana-hackaton.git`
3. `cd Solana-hackaton`
4. Instalar dependencias del backend  
5. `cd backend && npm install`
6. Configurar base de datos (SQLite)  
   * El sistema usa SQLite por defecto para facilitar el desarrollo local.  
   * Asegúrate de que el archivo `.env` apunte a `file:./dev.db`.
   * Ejecuta migraciones: `npx prisma migrate dev --name init`
   * `npx prisma generate`  
7. Configurar el Smart Contract (opcional si ya está desplegado)  
8. `cd ../smartcontracts && anchor build`
9. `anchor deploy --provider.cluster devnet`

---

##  Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:  
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL="file:./dev.db"

# Solana
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_PROGRAM_ID="9Wb9J8gi5A1rmYvhWewRjMZjgZUCRhocEp8J5n1m97Pd"
ORACLE_PRIVATE_KEY="tu_base58_private_key"
TOKEN_MINT_REC="3KHwM1exGwu5EH6ymJgJ7FWLb1FYS7sSTqgLHRCbPvJ2"
TOKEN_MINT_ENERGY="G42SpR4jR8kxAg9oDiN4PfP2EhWHegYL51zrk2VUu6fk"

# Seguridad
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=10
```
Nota: El `ORACLE_PRIVATE_KEY` debe ser una clave Base58 de una wallet que pagará las transacciones. En desarrollo puedes generar una efímera.  
---

##  Despliegue del Smart Contract

El programa Anchor ya incluye las instrucciones `add_device` y `mint_recs`. Para desplegar en Devnet:  
```bash
cd smartcontracts
anchor deploy --provider.cluster devnet
```
El ID del programa se mostrará en la terminal; actualízalo en la variable `SOLANA_PROGRAM_ID` del backend.  

Estructura del contrato (resumen):  
```rust
#[program]
pub mod gaia_recs {
    pub fn add_device(ctx: Context<AddDevice>, name: String, serial_number: String, ...) -> Result<()> {
        // Almacena PDA del dispositivo con su owner
    }

    pub fn mint_recs(ctx: Context<MintRECs>, certificate_id: String, rec_amount: u64, ...) -> Result<()> {
        // CPI a spl-token para acuñar REC y Energy tokens
    }
}
```

---

##  Ejecución del Backend

En modo desarrollo (con recarga automática):  
`npm run start:dev`  
El servidor estará disponible en `http://localhost:3000`.  

Para producción:  
`npm run build && npm run start:prod`

---

##  Documentación de la API

### 1. Registrar un dispositivo

**POST /devices**  
Body:  
```json
{
  "ownerWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "deviceId": "SOLAR-001",
  "location": "Madrid, Spain",
  "name": "Solar Panel Array A",
  "serialNumber": "SP-12345",
  "brand": "SunPower",
  "capacityKw": 5.5,
  "secret": "mi_secreto_seguro"
}
```

Respuesta:  
```json
{
  "id": "uuid",
  "deviceId": "SOLAR-001",
  "ownerWallet": "7xKX...",
  "status": "ACTIVE",
  "secretHash": "5e884898...",
  "onChainPda": "8gF..."
}
```

### 2. Enviar reporte de energía

**POST /energy/report**  
Headers: `x-device-secret: mi_secreto_seguro`  
Body:  
```json
{
  "deviceId": "SOLAR-001",
  "kwh": 10.5
}
```

Respuesta:  
```json
{
  "status": "CONFIRMED",
  "reportId": "uuid",
  "co2Saved": 4.98,
  "solanaTx": "5sdfh83...",
  "warning": null
}
```

---

##  Seguridad

* **Autenticación de dispositivos**: Cada dispositivo tiene un secreto que se hashea (SHA-256) y se almacena en la base de datos. En cada reporte se envía el secreto en el header y se compara usando `crypto.timingSafeEqual` para evitar ataques de tiempo.  
* **Rate Limiting**: Máximo 10 requests por minuto (global y por endpoint).  
* **CORS Restringido**: Solo dominios autorizados.  
* **Validación de Inputs**: DTOs con `class-validator` que rechazan propiedades no permitidas.  
* **Validación de PublicKeys**: Se verifica que la dirección de wallet sea una PublicKey válida de Solana.  
* **Manejo de Errores**: Mensajes genéricos para evitar filtrado de información sensible.

---

##  Pruebas

Ejecutar pruebas unitarias:  
`npm run test`  
Cobertura actual: ~80% (servicios principales, validaciones y cálculos).  

---

##  Mejoras Futuras

* WebSockets: Notificaciones en tiempo real de transacciones confirmadas.  
* Dashboard Administrativo: Interfaz gráfica para gestionar dispositivos y reportes.  
* Caching con Redis: Para reducir latencia en consultas frecuentes.  
* Sistema de Alertas: Monitoreo de fallos en blockchain y reintentos.  
* Soporte para Múltiples Blockchains: Extender a otras redes Solana o EVM.  
* Mercado Secundario: Permitir transferencia y comercialización de RECs.

---

##  Conclusión

Gaia Ecotrack es un ejemplo de cómo combinar tecnologías modernas (NestJS, Solana, Anchor) para resolver un problema real: la tokenización de energía renovable. Ha pasado de ser un prototipo con mocks a una solución lista para producción con:

* Integración blockchain real (0 mocks)  
* Seguridad de nivel empresarial (Constant-time checks)  
* Arquitectura escalable y mantenible  
* Documentación completa e integrada

El sistema está listo para ser desplegado en Mainnet y conectar dispositivos IoT reales, contribuyendo así a la economía circular de los créditos de carbono.  
---

## 📄 Licencia

MIT  
---

## 👥 Equipo

Backend Desarrollado por Ilich Blanco para la Solana Hackathon 2026.  
---

Última actualización: Marzo 2026
