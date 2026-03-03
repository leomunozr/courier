# Frontend: Sistema Courier (Módulo Web Cliente)

Este directorio es el módulo cliente que forma la interfaz empresarial del **Sistema Courier de Despacho Simplificado**. Desarrollado enteramente sobre el framework moderno de React, Next.js (utilizando la nueva topología `App Router`), esta aplicación de una sola página (SPA) asegura una experiencia gráfica de grado corporativo mediante **TailwindCSS**, gestión dinámica de variables y estados, y comunicación asíncrona segura con el Backend a través de Axios y Zustand.

## 🎨 Tema Corporativo y Estilizado (TailwindCSS)
El sistema ha sido estructurado usando un diseño corporativo moderno basado en una paleta confiable de colores verdes (`green-700`, `green-900`) que transmite la idea de un despacho aduanero y logístico seguro y estable.
Los elementos clave incluyen:
- Uso de variables CSS dinámicas en `src/app/globals.css`.
- Soporte base inyectado en la jerarquía del DOM para transiciones fáciles hacia un *Dark Mode*.
- Estructura limpia de componentes (botones interactivos, animaciones de hover en estado de carga y tablas con diseño en modo 'Card').
- Configuración y configuración estrictas mediante `tailwind.config.ts`.

## 🛠️ Herramientas de Estado y Conectividad

### **Zustand (Gestor de Sesión)**
La aplicación no utiliza contextos pesados (`Context API`) ni el complejo boilerplate de Redux. Emplea un almacén global (`src/store/authStore.ts`) creado con **Zustand** que gestiona sincrónicamente la carga y el vaciado del usuario autenticado (ID, email y rol), así como su Token JWT para mantener persistencia dentro de la aplicación.

### **Axios Interceptors (Comunicación Asíncrona Seguro)**
Todos los llamados a los microservicios del Backend se centralizan en la instancia dinámica `src/lib/api.ts`. En este archivo existe un **Interceptor**. Si el estado global de Zustand tiene una sesión JWT grabada (persistida vía `localStorage`), cada petición POST, GET o PUT es pre-firmada como `Authorization: Bearer <Token>` automáticamente antes de salir hacia la API Express. Esto remueve la necesidad de programar tokens manualmente en cada vista.

## 🧭 Estructura de Páginas Clave

Las rutas base del portal Next.js son:
- **`src/app/page.tsx`:** Landing público. Permite acceso directo a empleados (Login) y clientes finales (Tracking).
- **`src/app/login/page.tsx`:** Acceso corporativo protegido. Controla la captura segura de credenciales e inicializa los tokens.
- **`src/app/dashboard/page.tsx`:** Panel Operativo Logístico. Reservado para empleados y despachadores autorizados (ADMIN, OPERATOR). Presenta una tabla con la consulta asíncrona de los envíos más recientes o no resueltos.
- **`src/app/track/page.tsx`:** Tracking Público interactivo. Captura el número único y extrae los detalles del "Timeline" inyectados directamente por la Base de Datos a través de la Caché en Redis.
- **`src/app/audit/page.tsx`:** Panel Inmutable de Auditoría. Diseñado solo para roles directivos/aduaneros (`ADMIN`, `AUDITOR`). Provee la visión integral y visual en JSON de todas las trazas ocultas interceptadas por el Middleware del Backend (IP, cuerpo HTTP, entidad afectada, timestamp, acción real).

## 🚀 Inicialización

Asegúrate de que el backend (Express/Prisma) en `localhost:4000` esté levantado y expuesto.

```bash
# 1. Instalar dependencias del proyecto (Next.js 14+, Tailwind, Axios)
npm install

# 2. Inicializar el Servidor en Desarrollo
npm run dev
```

*Nota:* Visita `http://localhost:3000` en tu navegador. Puedes crear un script `npm run build` después de verificar que todo TypeScript haya sido transpilado sin errores para optimizar los estáticos en un entorno productivo Vercel / Nginx.