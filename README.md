# Subs Manager 

**Subs Manager** es una aplicación PWA / Web de gestión de suscripciones personales y familiares inspirada en la filosofía de diseño ultraminimalista de Apple.

---

## ✨ Características Principales

- **Dashboard Apple-Inspired**: Resumen visual de gasto mensual actual vs proyección anualizada, barra de presupuesto calmada y alertas de atención.
- **Requiere Atención**: Notificaciones en tiempo real para trials que vencen en menos de 7 días y renovaciones inminentes.
- **CRUD de Suscripciones**: Registro de proveedor, categoría, precio, ciclo de facturación (semanal, mensual, trimestral, anual, personalizado), fecha de renovación y fecha de trial.
- **Línea de Tiempo de Renovaciones (`/timeline`)**: Vista cronológica con filtros por horizonte temporal (7 días, 30 días, 90 días, 1 año).
- **Insights & Detector de Fugas (`/insights`)**: Detección de pruebas gratuitas olvidadas y suscripciones marcadas como poco usadas, calculando el dinero a ahorrar.
- **Centro de Cancelación (`/cancellation`)**: Enlaces oficiales de cancelación, instrucciones paso a paso e historial del **dinero total recuperado/ahorrado**.
- **Soberanía de Datos (`/settings`)**: Exportación completa de datos en formato **JSON** y **CSV** con 1 clic.
- **PWA Instalable**: Preparada para instalarse directamente en iOS Safari ("Agregar a inicio").

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React.
- **Backend & DB**: Server Actions, Auth.js (NextAuth), Prisma ORM, SQLite / PostgreSQL.
- **Validación & Fechas**: Zod, `date-fns`.

---

## 🚀 Instalación y Desarrollo Local

1. **Clonar repositorio e instalar dependencias**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd "Subscription Manager"
   npm install
   ```

2. **Configurar variables de entorno (`.env`)**:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="subs-manager-super-secret-key-2026-apple-style"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Migrar base de datos e insertar datos de prueba**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Ejecutar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

   **Credenciales Demo**:
   - Email: `demo@subsmanager.app`
   - Password: `demo1234`

5. **Pruebas y Build de Producción**:
   ```bash
   npm run test
   npm run build
   ```

---

## 📱 Instalación en iPhone (iOS)

### Opción A: PWA Novedosa (Recomendada)
1. Despliega la app en Vercel, Render, VPS o ejecútala en tu red local.
2. Abre la URL en **Safari** en tu iPhone.
3. Presiona el botón **Compartir** (icono con cuadrado y flecha arriba).
4. Selecciona **"Agregar a inicio"** (Add to Home Screen).
5. ¡Listo! La app se ejecutará en pantalla completa con ícono nativo y respuesta fluida.

### Opción B: Compilación `.ipa` con GitHub Actions (Sideloadly)
El flujo automatizado `.github/workflows/build-ios.yml` compila el paquete `.ipa` automáticamente usando macOS cloud runners de GitHub Actions al hacer push a la rama `main`.
