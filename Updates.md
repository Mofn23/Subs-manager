# Updates & Changelog - Subs Manager

Documento oficial de registro de versiones, cambios, nuevas funciones, mejoras de UI/UX y correcciones de la aplicación **Subs Manager**.

---

## [v1.0.0] - 2026-08-05 (MVP Initial Release) - COMPLETADO ✅

### 🌟 Visión del Release
Lanzamiento inicial de **Subs Manager**, la aplicación de gestión de suscripciones personales y familiares inspirada en la filosofía de diseño ultraminimalista de Apple. La versión 1.0.0 establece las bases para el control de gastos recurrentes, alertas de vencimiento de trials, línea de tiempo de renovaciones, detección de fugas de dinero y centro de cancelación.

### ✨ Funcionalidades Entregadas

#### 1. Onboarding y Autenticación
- **Sistema de Auth Seguro**: Registro e inicio de sesión por credenciales con hash bcrypt y sesiones por JWT vía NextAuth.js.
- **Onboarding Guiado**: Selección de moneda base (USD $, EUR €, GBP £, COP $, MXN $, etc.) y definición de presupuesto mensual opcional.

#### 2. Dashboard Minimalista Apple-Inspired
- **Hero Stats**: Métricas claras de gasto total mensual actual, proyección anualizada y potencial de ahorro estimado.
- **Barra de Presupuesto Calmada**: Progreso visual suave de consumo de presupuesto mensual sin elementos estresantes.
- **Sección "Requiere Atención"**: Alertas prioritarias para pruebas gratuitas (trials) que vencen en menos de 7 días y renovaciones inminentes.
- **Filtros por Pestañas**: Segmentación rápida de suscripciones por Estado (Todas, Activas, Trials, Revisar/Poco Usadas, Pausadas, Canceladas).

#### 3. CRUD Completo de Suscripciones
- Formulario refinado con validación Zod en tiempo real y React Hook Form.
- Registro de proveedor, categoría, precio, ciclo de facturación (semanal, mensual, trimestral, anual, personalizado).
- Fecha de próxima renovación, fecha de fin de trial, estado (Activa, Pausada, Cancelada, Trial, Vencida).
- Enlace directo a gestión/cancelación, notas e instrucciones paso a paso.
- Etiqueta "Poco usada / Revisar" para detección inteligente de fugas de presupuesto.

#### 4. Línea de Tiempo de Renovaciones (`/timeline`)
- Vista cronológica limpia de cobros futuros.
- Filtros por ventana temporal: 7 días, 30 días, 90 días y 1 año.
- Distintivos visuales suaves para suscripciones de alto valor y trials por vencer.

#### 5. Insights y Detector de Fugas (`/insights`)
- Distribución visual de gasto por categoría (Streaming, IA, Productividad, Fitness, etc.).
- Clasificación de las 5 suscripciones más costosas.
- Conversión automática de planes anuales a su equivalente mensual.
- **Proyección de Ahorro**: Cálculo dinámico del ahorro mensual y anual si se cancelan suscripciones marcadas como "Poco usadas" o "En revisión".

#### 6. Centro de Cancelación (`/cancellation`)
- Flujo dedicado para suscripciones en proceso de cancelación.
- Visualización de pasos personalizados, notas, fecha límite de renovación y link oficial de baja.
- Botón "Confirmar Cancelación Verificada" con historial e indicador del **total de dinero recuperado/ahorrado**.

#### 7. Centro de Notificaciones In-App
- Panel desplegable de notificaciones minimal.
- Generación de alertas por renovaciones próximas, vencimiento de trials y exceso de presupuesto.

#### 8. Configuración y Soberanía de Datos (`/settings`)
- Ajuste de moneda base y límite presupuestario.
- **Exportación Completa**: Descarga de todos los datos en formato **JSON** o **CSV**.
- **Eliminación Definitiva**: Opción de borrado de cuenta y purgado completo de datos en cascada.

---

### 🎨 Diseño y Sistema Visual Apple HIG
- **Paleta de Colores Pasteles Tranquilos**: Fondo canvas `#FAFAF9`, tarjetas `#FFFFFF`, bordes ultra suaves `rgba(0,0,0,0.05)`.
- **Acentos Muted**: Azul sutil `#3B82F6`/`#EAF2FF`, Verde pastel `#D8F0DF` (Éxito), Ámbar pastel `#FBF0D9` (Advertencia), Rosa pastel `#F9E3E1` (Peligro).
- **Tipografía y Microinteracciones**: Tipografía SF Pro / Inter, espaciado generoso, bordes `rounded-2xl` y `rounded-3xl`.

### 🛠️ Arquitectura Técnica y Verificación
- **Frontend**: Next.js 14+ App Router, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend & Database**: Server Actions, Prisma ORM, SQLite en desarrollo local / PostgreSQL ready.
- **Validación & Fechas**: Zod, `date-fns`.
- **Pruebas Unitarias**: Test suite nativo ejecutado con éxito (4/4 tests pasados).
- **Compilación**: Next.js build compilado con éxito (7/7 rutas estáticas y dinámicas optimizadas).
