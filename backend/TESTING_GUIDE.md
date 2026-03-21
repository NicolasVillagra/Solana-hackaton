# Gaia Ecotrack: Testing Guide (Production-Ready)

Este documento detalla cómo verificar que todos los endpoints del backend están funcionando correctamente y comunicándose con la blockchain de Solana (Devnet).

## 🛠 1. Interactive Testing (Swagger)

La forma más sencilla de probar los endpoints es a través de la interfaz interactiva de Swagger:

1. Inicia el servidor: `npm run start:dev`
2. Abre tu navegador en: [http://localhost:3000/api](http://localhost:3000/api)
3. Podrás ver todos los DTOs, requisitos y botones "Try it out" para ejecutar pruebas reales.

---

## 💻 2. Terminal Testing (cURL)

Si prefieres usar la terminal, aquí tienes los comandos exactos para el flujo completo:

### A. Registrar un Nuevo Dispositivo
Este comando guarda el dispositivo en la base de datos y lo registra **On-Chain** en Solana.

```bash
curl -X POST http://localhost:3000/devices \
  -H "Content-Type: application/json" \
  -d '{
    "ownerWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "deviceId": "IOT-DEVICE-PROD-001",
    "location": "Santiago, Chile",
    "name": "Panel Solar Premium A",
    "serialNumber": "SN-SOLAR-2026-XYZ",
    "brand": "GaiaTech",
    "capacityKw": 500,
    "secret": "super-secreto-123"
  }'
```

### B. Enviar un Reporte de Energía (Minting Dual)
Este comando calcula el CO2, lo guarda localmente y dispara el minteo de **RECs** (Token-2022) y **kW** (SPL) on-chain.

```bash
curl -X POST http://localhost:3000/energy/report \
  -H "Content-Type: application/json" \
  -H "x-device-secret: super-secreto-123" \
  -d '{
    "deviceId": "IOT-DEVICE-PROD-001",
    "mwh": 10.5
  }'
```

### C. Verificar Reportes del Dispositivo
```bash
curl http://localhost:3000/devices/IOT-DEVICE-PROD-001
```

---

## 🔍 3. Verificación On-Chain (Solana Explorer)

Cuando recibas el `solanaTx` del comando de reporte, puedes verificarlo en el explorador:

1. Copia el hash de la transacción.
2. Ve a [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
3. Pega el hash para ver los logs del contrato `gaia_recs` y la confirmación del minteo.

---

## 🆘 Solución de Problemas (Dependencies)

Si el servidor no inicia debido a la falta de Swagger, ejecuta:
`npm install @nestjs/swagger swagger-ui-express`
