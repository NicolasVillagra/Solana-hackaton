# 🌿 Gaia Ecotrack: SolEnergy Module

![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white) ![DePIN](https://img.shields.io/badge/DePIN-FF4500?style=for-the-badge&logo=iot&logoColor=white) ![Status](https://img.shields.io/badge/Status-Production--Ready-green?style=for-the-badge)

## 🌎 Bienvenida a la Era de la Energía Regenerativa

**Gaia Ecotrack** es una plataforma DePIN (Decentralized Physical Infrastructure Network) diseñada para transformar la forma en que el mundo valora la energía limpia. 

A través de nuestro módulo principal, **SolEnergy**, permitimos que cualquier generador de energía renovable (desde un pequeño panel solar de 5.5 kW hasta grandes granjas eólicas) pueda tokenizar su producción de forma segura, inmutable y transparente en la blockchain de Solana.

---

## 🏗️ Estructura del Proyecto

Este repositorio contiene la solución completa de extremo a extremo para la **Solana Hackathon 2026**:

1.  **[Smart Contracts (Solana/Anchor)](file:///home/ilich/Escritorio/Hackathon-solana/smartcontracts)**: 
    *   Lógica on-chain que gestiona el registro de dispositivos.
    *   Acuñación de Certificados de Energía Renovable (REC) mediante el estándar **Token-2022**.
    *   Emisión de tokens de energía líquida para mercados secundarios.

2.  **[Backend (NestJS)](file:///home/ilich/Escritorio/Hackathon-solana/backend)**:
    *   El motor central que actúa como Oráculo de confianza.
    *   Seguridad de grado bancario (Hashed secrets, Constant-time validation).
    *   Gestión de base de datos de alta precisión en **kWh**.
    *   API documentada con Swagger interactivo.

3.  **[Frontend (App)](file:///home/ilich/Escritorio/Hackathon-solana/frontend)**:
    *   Interfaz de usuario para visualizar la generación y los certificados emitidos.

---

## 🚀 Inicio Rápido

Para poner en marcha el sistema completo, por favor sigue la guía detallada en cada carpeta. 

Si deseas probar el **Backend** (el núcleo del sistema) rápidamente:
1.  Entra en `backend/`.
2.  Ejecuta `npm install`.
3.  Sigue las instrucciones de `COMANDOS_INICIO.md`.

---

## 🎖️ Key Features (SolEnergy Module)

- **Alta Precisión:** Operaciones nativas en kWh para soportar dispositivos residenciales.
- **Dual-Token System:** Separación de certificados inmutables (REC) y utilidad líquida.
- **Seguridad Robusta:** Protección contra ataques de tiempo y validación criptográfica de dispositivos.
- **Transparencia Total:** Cada vatio generado es traceable hasta su fuente on-chain.

---

## 👥 Equipo
Proyecto desarrollado para la **Solana Hackathon 2026**.

**Lead Developer:** Ilich Blanco  
**Smart Contract Architect:** Nico Villagra  

---

¡Gracias por revisar Gaia Ecotrack! Juntos estamos construyendo el futuro de la energía descentralizada. ☀️⛓️🏅
