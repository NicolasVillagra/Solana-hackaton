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

## ⚡ Solana Minting Compartido (Flujo de Demo Devnet)

Para facilitar la evaluación y uso interactivo durante la Hackathon, la lógica de emisión (Minting) está centralizada usando una **Mint Authority compartida** embebida en el código fuente.

### ¿Cómo funciona para los Evaluadores y el Equipo?
¡No se requiere ninguna configuración de CLI ni de llaves locales! Cualquier persona que clone este repositorio y ejecute `npm run dev` puede probar el minteo de tokens inmediatamente en la Devnet de Solana.
El proyecto incluye un Keypair de prueba pre-financiado internamente (`src/lib/devnet-keypair.ts`) que es reconocido automáticamente como el Oráculo de Emisión y la Autoridad de los tokens configurados.

### Flujo de los botones "Mint Tokens"
1. El visitante interactúa con el Dashboard y conecta su billetera (Phantom, Solflare, etc.).
2. Al mintear (ej: reclamando energía o certificados), el frontend realiza un llamado seguro a nuestro backend en Next.js (`/api/mint`).
3. El servidor recibe la petición, carga la **llave compartida**, se comunica con la Blockchain para generar la cuenta de tokens (ATA) si el usuario es nuevo, y **firma y paga el minteo de los tokens hacia la billetera conectada.**
4. ¡El usuario recibe tokens exitosamente sin fricción, sin tener que pagar "gas", ni firmar transacciones de red intrusivas!

---

## 👥 Equipo
Parte del ecosistema **Gaia Ecotrack** para la Solana Hackathon 2026.
🏁🚀
