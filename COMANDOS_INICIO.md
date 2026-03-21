# COMANDOS PARA INICIAR Y PROBAR EL SISTEMA

## 📋 PRIMERO: VERIFICAR QUE EL SERVIDOR NO ESTÁ CORRIENDO
```bash
# Verificar si hay procesos de Node corriendo
ps aux | grep "node dist/main" | grep -v grep

# Si hay procesos, detenerlos
pkill -f "node dist/main" 2>/dev/null || true
```

## 🚀 SEGUNDO: INICIAR EL BACKEND

### Opción 1: Desarrollo (recomendado para pruebas)
```bash
cd /home/ilich/Escritorio/Hackathon-solana/backend
npm run dev
```

### Opción 2: Producción
```bash
cd /home/ilich/Escritorio/Hackathon-solana/backend
npm run start:prod
```

### Opción 3: Limpiar y reiniciar completamente
```bash
cd /home/ilich/Escritorio/Hackathon-solana/backend
npm run clean:build && npm run start:prod
```

## ✅ TERCERO: VERIFICAR QUE EL SERVIDOR ESTÁ FUNCIONANDO

### Comando 1: Verificar health check
```bash
curl -v http://localhost:3000/
```

**Respuesta esperada:**
```
HTTP/1.1 200 OK
"Hello World!"
```

### Comando 2: Verificar Swagger UI
Abre tu navegador y visita:
```
http://localhost:3000/api
```

### Comando 3: Verificar JSON de Swagger
```bash
curl -s http://localhost:3000/api-json | python3 -c "import json, sys; print(json.dumps(json.load(sys.stdin), indent=2))" | head -50
```

## 🔧 CUARTO: PROBAR LOS ENDPOINTS

### 1. Registrar un dispositivo
```bash
curl -X POST http://localhost:3000/devices \
  -H "Content-Type: application/json" \
  -d '{
    "ownerWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "deviceId": "SOLAR-PANEL-001",
    "location": "Caracas, Venezuela",
    "name": "Solar Panel Array",
    "serialNumber": "SN-2024-001",
    "brand": "SunPower",
    "capacityKw": 5.5,
    "secret": "device-secret-key-123"
  }'
```

### 2. Consultar el dispositivo registrado
```bash
curl -X GET http://localhost:3000/devices/SOLAR-PANEL-001
```

### 3. Reportar energía generada (con header de seguridad)
```bash
curl -X POST http://localhost:3000/energy/report \
  -H "Content-Type: application/json" \
  -H "x-device-secret: device-secret-key-123" \
  -d '{
    "deviceId": "SOLAR-PANEL-001",
    "mwh": 1.5
  }'
```

## 🗄️ QUINTO: VERIFICAR BASE DE DATOS

### 1. Verificar archivo de base de datos
```bash
ls -la /home/ilich/Escritorio/Hackathon-solana/backend/dev.db
```

### 2. Consultar dispositivos en la base de datos
```bash
cd /home/ilich/Escritorio/Hackathon-solana/backend
npx prisma studio
```
Luego abre: http://localhost:5555

### 3. Consultar SQLite directamente
```bash
sqlite3 /home/ilich/Escritorio/Hackathon-solana/backend/dev.db "SELECT * FROM Device;"
sqlite3 /home/ilich/Escritorio/Hackathon-solana/backend/dev.db "SELECT * FROM EnergyReport;"
```

## 🐛 SEXTO: SOLUCIÓN DE PROBLEMAS

### Si el servidor no inicia:
```bash
# 1. Verificar dependencias
cd /home/ilich/Escritorio/Hackathon-solana/backend
npm install

# 2. Verificar variables de entorno
cat /home/ilich/Escritorio/Hackathon-solana/backend/.env

# 3. Verificar logs de error
cd /home/ilich/Escritorio/Hackathon-solana/backend
npm run start:prod 2>&1
```

### Si hay problemas con Prisma:
```bash
# 1. Generar cliente Prisma
cd /home/ilich/Escritorio/Hackathon-solana/backend
npx prisma generate

# 2. Ejecutar migraciones
npx prisma migrate dev --name init

# 3. Verificar esquema
cat prisma/schema.prisma
```

## 📊 SÉPTIMO: VERIFICACIÓN COMPLETA DEL SISTEMA

### Script de verificación automática
```bash
#!/bin/bash
echo "=== VERIFICACIÓN DEL SISTEMA HACKATHON SOLANA ==="

# 1. Verificar servidor
echo "1. Verificando servidor..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ && echo " ✓ Servidor funcionando" || echo " ✗ Servidor no responde"

# 2. Verificar Swagger
echo "2. Verificando Swagger..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api && echo " ✓ Swagger disponible" || echo " ✗ Swagger no disponible"

# 3. Verificar base de datos
echo "3. Verificando base de datos..."
if [ -f "dev.db" ]; then
    echo " ✓ Base de datos existe"
    size=$(stat -c%s dev.db)
    echo "   Tamaño: $size bytes"
else
    echo " ✗ Base de datos no encontrada"
fi

# 4. Verificar DTOs en Swagger
echo "4. Verificando DTOs en Swagger..."
curl -s http://localhost:3000/api-json | grep -q "RegisterDeviceDto" && echo " ✓ RegisterDeviceDto disponible" || echo " ✗ RegisterDeviceDto no disponible"
curl -s http://localhost:3000/api-json | grep -q "CreateEnergyReportDto" && echo " ✓ CreateEnergyReportDto disponible" || echo " ✗ CreateEnergyReportDto no disponible"

echo "=== VERIFICACIÓN COMPLETADA ==="
```

## 🎯 RESUMEN DE COMANDOS ESENCIALES

```bash
# Iniciar todo desde cero
cd /home/ilich/Escritorio/Hackathon-solana/backend
pkill -f "node dist/main" 2>/dev/null || true
npm run clean:build
npm run start:prod

# En otra terminal, probar endpoints
curl http://localhost:3000/
curl -X POST http://localhost:3000/devices -H "Content-Type: application/json" -d '{"ownerWallet":"7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU","deviceId":"TEST-001","location":"Test","name":"Test","serialNumber":"TEST","brand":"Test","capacityKw":1,"secret":"test"}'
```

## 🔗 ENLACES IMPORTANTES

1. **Swagger UI**: http://localhost:3000/api
2. **Health Check**: http://localhost:3000/
3. **Prisma Studio**: http://localhost:5555 (después de ejecutar `npx prisma studio`)
4. **Documentación**: Revisa `SOLUCION_COMPLETA.md` para detalles técnicos

## ⚠️ NOTAS IMPORTANTES

1. **El servidor se ejecuta en el puerto 3000**
2. **La base de datos es SQLite (dev.db)**
3. **El modo Solana está en "mock"** - devuelve transacciones simuladas
4. **Los DTOs ahora muestran campos completos en Swagger**
5. **Requiere header `x-device-secret` para reportar energía**

¡El sistema está listo para usar! 🚀