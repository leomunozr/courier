# Sistema Courier - Esquema de Despacho Simplificado (Full-Stack)

Este proyecto es una plataforma logística de grado empresarial diseñada de cero bajo el esquema de despacho aduanero simplificado. Proporciona una solución Full-Stack robusta, escalable y auditable, separada en dos módulos principales (Frontend y Backend) que operan asíncronamente para gestionar la trazabilidad a nivel de paquete, facilitar la generación y envío de manifiestos, asegurar el almacenamiento documental, y cumplir con los requerimientos de la Autoridad Aduanera y las auditorías corporativas.

## 🏗️ Arquitectura y Topología del Sistema

El sistema utiliza una arquitectura cliente-servidor, modernizada y modular, lista para escalar:

- **Frontend (Cliente):** Aplicación de una sola página (SPA) construida con React, Next.js (App Router), y TailwindCSS. Su propósito es proveer interfaces ágiles, seguras (basadas en roles JWT) y reactivas (usando Zustand para el estado global de sesión).
- **Backend (API Core):** Aplicación monolítica en Node.js y Express con TypeScript, diseñada de forma modular para convertirse en microservicios en el futuro si la demanda de volumen crece. Se expone como una API RESTful que alimenta al Frontend.
- **Base de Datos:** Controlada mediante Prisma ORM. Aunque el código y los modelos están preparados para PostgreSQL (`docker-compose.yml`), **se emplea SQLite para el desarrollo rápido**, lo cual permite un inicio limpio, con tipos estrictos (Type-Safety) y previene bloqueos por cuotas externas (Docker Rate Limits) al probar en local.
- **Servicios Externos Emulados (Infraestructura de Apoyo):**
  - **MinIO:** Servicio S3 compatible (levantado mediante `docker-compose.yml`) que actúa como bóveda inmutable para facturas comerciales y documentos, guardando las referencias `s3Key` cifradas y los hash de integridad SHA-256 en la base de datos.
  - **Redis:** Servidor de caché en memoria conectado al Backend. Cuando el Frontend hace una consulta de Tracking Público, el Backend responde a través de Redis en lugar de saturar la base de datos principal, auto-invalidando el registro si el paquete cambia de estado.

## 🔗 Relación Frontend / Backend (Flujo de Datos Asíncrono)

La interacción entre módulos sigue flujos controlados y seguros:

1. **Sesiones y Seguridad:** El Frontend recolecta credenciales y hace un POST asíncrono vía `Axios` a la API (`/api/auth/login`). El Backend (usando `bcrypt`) valida en la BD y firma un token `JWT`. Este token es almacenado en el Local Storage del navegador y administrado mediante Zustand, inyectándose en el encabezado `Authorization: Bearer <token>` de todas las peticiones subsecuentes al Backend.
2. **Núcleo Logístico:** Desde el Dashboard (Frontend), un usuario despachador envía payloads en formato JSON al Backend (`/api/shipments`), donde Prisma genera el número de rastreo, escribe el evento inmutable (append-only) y devuelve la respuesta.
3. **Auditoría (Capa Intermedia Oculta):** El Frontend *no sabe* que existe la auditoría al hacer peticiones a recursos aduaneros o logísticos. En el Backend, un middleware de intercepción global en Express escucha todas las respuestas HTTP (200-299) emitidas por las acciones protegidas. Captura el usuario, método, endpoint, payload e IP y graba automáticamente una bitácora en la base de datos antes de enviar la respuesta final a Next.js. El Panel de Auditoría de Next.js lee estos logs.
4. **Módulo Aduanero:** Cuando el usuario selecciona crear/enviar Manifiestos, el Backend genera asíncronamente una simulación (Mock) de un XML (`<Manifest>...</Manifest>`), le inyecta una simulación de firma de sello digital (certificado), y "finge" recibir una respuesta WS del SAT con un ACUSE, marcando todos los paquetes del Frontend como `CUSTOMS_CLEARED`.
5. **Caché (Frontend Público vs Backend Interno):** Cuando un usuario ajeno a la empresa busca su paquete, el Frontend consulta (`GET /api/shipments/track/:id`). El Backend intercepta la solicitud; si existe en Redis, no entra al ORM de la BD. Si se añade un nuevo estado al paquete (desde el Dashboard), el Backend borra esa llave específica de Redis y el Frontend mostrará instantáneamente la nueva versión al refrescar la pantalla.

## 🚀 Instrucciones Generales de Inicialización

Asegúrate de tener instalado **Node.js (v18+)** y **Docker / Docker Compose** (opcional para MinIO y Redis).

### Paso 1: Levantar Servicios Adicionales (Caché y Documentos)
Usa el archivo de configuración para levantar la infraestructura de MinIO y Redis en tu máquina local:
```bash
docker compose up -d redis minio
```
*(Nota: El servidor PostgreSQL está comentado en este archivo. El sistema se conectará a la base de datos emulada SQLite).*

### Paso 2: Ejecutar Backend (El Servidor)
Ve al directorio respectivo, instala y arranca la máquina:
```bash
cd backend
npm install
npx prisma db push     # Crea la base local dev.db
npx prisma generate    # Crea los tipos del cliente
npm run start          # Inicia Express en el puerto 4000
```
> Opcional: Haz un POST vacío a `http://localhost:4000/api/auth/seed` para crear tu usuario Admin de pruebas.

### Paso 3: Ejecutar Frontend (La Interfaz Web)
En una terminal paralela, ejecuta el proyecto React:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web empresarial te espera en `http://localhost:3000`. Usa `admin@courier.com` y clave `admin123`.

---
*Para ver las arquitecturas profundas, los flujos aduaneros en específico o las configuraciones de puerto, revisa los archivos `README.md` ubicados en las carpetas `/backend` y `/frontend` respectivamente.*