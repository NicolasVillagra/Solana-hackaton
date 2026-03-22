# 💻 SolEnergy Frontend (Gaia Ecotrack)

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## 🎨 Visualizando la Energía del Futuro

Este es el portal de usuario de **Gaia Ecotrack**, donde los propietarios de dispositivos generadores pueden visualizar su producción de energía en tiempo real, rastrear sus ahorros de CO₂ y gestionar sus certificados **SolEnergy** tokenizados.

---

## 🚀 Tecnologías

- **Framework:** [Next.js 15](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** Radix UI / Shadcn
- **Blockchain Integration:** Solana Wallet Adapter & Web3.js
- **Database (Auth/Cache):** Prisma

---

## 🛠️ Instalación

1.  Navega a la carpeta:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura las variables de entorno en un archivo `.env` (usa `.env.example` como base).
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

El portal estará disponible en `http://localhost:3000`.

---

## 📊 Características

- **Dashboard Real-Time:** Gráficos de generación de energía.
- **Certificados Inmutables:** Galería de RECs emitidos on-chain.
- **Wallet Integration:** Conexión segura con Phantom, Solflare, etc.
- **Responsive Design:** Optimizado para móviles y escritorio.

---

## ⚡ Solana Minting (Flujo de Demo)

Para la demostración interactiva del Hackathon, la lógica de emisión (Minting) está desacoplada de la firma del usuario final para garantizar máxima seguridad y replicar un ecosistema DePIN real. Contamos con un Endpoint interno (`/api/mint`) que actúa como Oráculo.

### Requisitos Funcionales para probar localmente
Asegúrate de que tu PC Windows o WSL tenga alojada tu llave de desarrollador original (con la cual desplegaste el contrato) en alguno de los siguientes paths base:
* WSL/Linux: `~/.config/solana/id.json`
* Windows: `C:\Users\<usuario>\.config\solana\id.json`

> **Nota para Evaluadores**: Si levantan este proyecto desde cero en su máquina, asegúrense de usar el script `create-energy-mint.ts` para asignar la autoridad a su propia billetera, y tener fondos de gas (`solana airdrop 1`).

### ¿Cómo funciona el botón de "Mint Tokens"?
1. El usuario conecta su Phantom.
2. Al dar click, el frontend llama internamente al backend de NextJS (`/api/mint`) de manera silenciosa.
3. Node.js carga tu `id.json` maestra, construye la transacción usando Anchor, genera la cuenta (ATA) si es necesaria y **firma los tokens directamente hacia la billetera conectada.**
4. ¡El usuario recibe "Energy Tokens" sin tener que aprobar ni gastar gas de su lado!

---

## 👥 Equipo
Parte del ecosistema **Gaia Ecotrack** para la Solana Hackathon 2026.
🏁🚀
