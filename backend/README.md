# Backend: Sistema Courier (Módulo Central API)

Este directorio contiene el "cerebro" del Sistema de Despacho Simplificado Aduanero. Construido con una arquitectura monolítica modular en **Node.js, Express y TypeScript**, este backend es responsable de gestionar toda la lógica de negocio logística, generar la bitácora inmutable de auditoría, comunicarse con el servicio de almacenamiento (MinIO) y simular el ecosistema de comunicaciones y firmas digitales de los Web Services del SAT/Aduana.

## ⚙️ Arquitectura Técnica y Patrones Implementados

El proyecto se diseñó con miras a evolucionar hacia una arquitectura de **microservicios**, separando responsabilidades lógicas y asegurando escalabilidad mediante capas de abstracción.

- **`src/config/`**: Controladores de conexiones externas (Prisma, Redis, MinIO).
- **`src/controllers/`**: La capa de lógica de negocio, consumiendo modelos de Prisma y devolviendo respuestas HTTP al cliente web.
- **`src/middlewares/`**: Funciones críticas interceptoras para controlar la seguridad y trazabilidad en el ciclo de vida de la petición:
  - **`auth.middleware.ts`**: Verificación JWT y Control de Acceso Basado en Roles (RBAC).
  - **`audit.middleware.ts`**: Un proxy en línea que secuestra `res.json` para capturar asíncronamente qué hizo un operador en el sistema, extrayendo el ID de la entidad tocada y guardando una traza (timestamp, método, URL, cuerpo de la petición) en `AuditLog`.
- **`src/routes/`**: Enrutador Express que conecta URLs públicas y privadas a controladores y middlewares.
- **`src/utils/`**: Funciones puras (ej. generación aleatoria de Tracking).

## 🗄️ Esquema de la Base de Datos (Prisma ORM)

En el archivo `prisma/schema.prisma` reside el corazón estructurado del proyecto, manejando la integridad relacional de todos los registros:
- **`Shipment` & `ShipmentEvent`**: Relación 1-a-N para el histórico append-only de cada paquete en el sistema.
- **`Manifest` & `CustomsTransmission`**: Para agrupamiento y emulación de acuses.
- **`Document`**: Contiene la referencia a un objeto del bucket S3 (MinIO) de la empresa, y el *Hash SHA-256* de integridad para las auditorías.
- **`AuditLog`**: Registros de actividad inmutables amarrados a las identidades de la tabla `User`.

*Nota:* Actualmente, la variable `provider` del datasource es `sqlite` por razones operativas de despliegue rápido, lo que significa que la base de datos es un archivo local `dev.db`.

## 🔒 Detalles de Seguridad y Auditoría
1. **Contraseñas:** Encriptadas mediante `bcrypt`.
2. **Tokens JWT:** Todas las acciones mutables del sistema (`POST`, `PUT`, `DELETE`, y lectura privada) validan tokens.
3. **Rol (RBAC):** Se exige un nivel mínimo para operar (por ejemplo, el módulo aduanero exige el rol `CUSTOMS` o `ADMIN`).
4. **Firmas y Trazabilidad:** Al subir un documento (Facturas), el backend usa el módulo `crypto` de Node.js en memoria para crear una firma SHA-256 del Buffer antes de pasarlo a MinIO, confirmando que la imagen del comprobante subido jamás fue alterada a futuro.

## 🤝 Módulo Aduanero (Interfaces Mock)
La ruta `/api/manifests/:manifestId/transmit` aloja la simulación del comportamiento de un Agente Aduanal / Autoridad.
1. Emite un payload estructurado simulado como XML: `<Manifest>...</Manifest>`.
2. Emite una cadena simulada de firma digital: `MOCK_SIGNATURE_DATA_AABBCC112233` simulando que se consumió un certificado vigente `.cer`.
3. Devuelve al frontend una respuesta aceptada (`ACCEPTED` y un acuse `ACUSE-X`), y avanza todos los envíos vinculados al estado logístico final `CUSTOMS_CLEARED`.

## ⚡ Caché en Memoria (Redis)
El backend inicializa una conexión a Redis al arrancar `src/index.ts`. La capa de caché se utiliza principalmente en la ruta GET `/api/shipments/track/:trackingNumber`:
1. El controlador pregunta a la RAM local de Redis si la llave del tracking existe.
2. Si es así, la devuelve instantáneamente sin consultar el ORM.
3. El caché sobre un paquete específico se "purga" asíncronamente (invalidación) cada vez que un administrador usa el controlador `POST /events` para sumarle un nuevo estado logístico a la DB.

## 🚀 Inicialización

```bash
# 1. Instalar dependencias puras y de desarrollo de typescript
npm install

# 2. Reconstruir la base de datos vacía y los tipos
npx prisma db push
npx prisma generate

# 3. Compilar Typescript puro para verificar integridad (Opcional)
npx tsc --noEmit

# 4. Iniciar (En modo desarrollo auto-recarga)
npx ts-node src/index.ts
```

*Endpoints Principales:*
- `/api/auth/login`
- `/api/shipments`
- `/api/shipments/track/:id`
- `/api/audit`
- `/api/documents/:shipmentId`
- `/api/manifests`