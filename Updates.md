# Updates & Changelog - Subs Manager

Documento oficial de registro de versiones, cambios, nuevas funciones, mejoras de UI/UX y correcciones de la aplicación **Subs Manager**.

---

## [v1.1.0] - 2026-08-05 (Cloud Persistence, GitHub & iOS PWA Release) - COMPLETADO ✅

### 🌟 Visión del Release
Integración con **Vercel Postgres** para sincronización multi-dispositivo en tiempo real (móvil, PC y tablets), empaquetado de PWA y configuración del flujo de integración continua GitHub Actions para la generación del ejecutable `.ipa` de iOS para Sideloadly.

### ✨ Funcionalidades y Mejoras

#### 1. Sincronización Multi-Dispositivo Permanente en la Nube
- **Migración a PostgreSQL**: Configuración de `POSTGRES_PRISMA_DATABASE_URL` para almacenamiento persistente de datos en Vercel Postgres.
- **Sincronización en Tiempo Real**: Los datos creados o modificados en la PWA del iPhone se reflejan al instante en cualquier navegador de PC o tablet.

#### 2. Publicación en GitHub y CI/CD de iOS
- **Repositorio Oficial**: Código fuente publicado en `https://github.com/Mofn23/Subs-manager.git`.
- **Compilación Automatizada `.ipa`**: Workflow en GitHub Actions (`.github/workflows/build-ios.yml`) ejecutado en runners de macOS para empaquetar la app iOS e instalarla mediante Sideloadly.

#### 3. Reactividad y Manejo de Errores
- **Manejo Robusto de Excepciones**: Bloques `try/catch` envolventes en Server Actions de suscripciones con mensajes de error amigables al usuario.
- **Refresco Automático de Interfaz**: Invocación de `router.refresh()` cliente al crear, actualizar o eliminar suscripciones para actualización instantánea del Dashboard.

#### 4. Rediseño Ultraminimalista Apple Glassmorphism de la Barra de Navegación
- **Eliminación del Desastre Visual**: Se eliminaron las barras de 5 pestañas saturadas tanto en escritorio como en móvil.
- **Botón Único selector estilo Apple**: Botón flotante tipo píldora con efecto cristal (`Dashboard ˅`) que muestra la vista activa actual.
- **Menú Desplegable Flotante Translúcido**: Menú emergente con estética **Apple Glassmorphism** (`backdrop-blur-2xl`, bordes suaves, fondo translúcido oscuro, checklist `✓` de elemento activo e íconos alineados).

#### 5. Limpieza Dinámica del Dashboard y Bloqueo de Zoom
- **Ocultamiento Total del Presupuesto Vacío**: Si el presupuesto mensual (*Monthly Budget*) está vacío o es cero en Configuración, todo el enunciado, barra de progreso y avisos del presupuesto se eliminan del DOM por completo para una vista limpia sin ruido visual.
- **Bloqueo Completo de Zoom y Escalado**: Configuración del `viewport` con `userScalable: false`, `maximumScale: 1` y `touch-action: manipulation` para impedir el zoom táctil/doble tap y mantener la app firme como una aplicación iOS nativa.

#### 6. Depuración Visual y Formateo Ultraminimalista
- **Logo Único Superior**: Eliminación del nombre `SubsManager` en el encabezado superior izquierdo, dejando únicamente el ícono del logo.
- **Rediseño Centrado del Hero Card**: Alineación centrada del total mensual con una cifra prominente y en negrita (`text-5xl font-extrabold`), eliminación del texto innecesario `month across subs`, y adición del gasto anual justo debajo de forma sutil (`2,618,400 Annual`).
- **Sanitización del Código de Moneda (`COP`)**: Filtrado automático de la cadena de moneda almacenada en base de datos (`COP $` -> `COP`) mediante `replace(/[^a-zA-Z]/g, "")`, garantizando la remoción absoluta del símbolo `$` al lado de `COP` en la tarjeta principal (`218,200 COP`).
- **Remoción Absoluta de Decimales Innecesarios (`.00`)**: Formateo de todos los montos enteros sin decimales (`218,200` y `35,000` en lugar de `218,200.00`), conservando la precisión únicamente en números con centavos reales (ej: `22.99`).
- **Sección "Requires Attention" Simplificada con Relieve Amarillo Sutil**: Rediseño de las alertas en píldoras con un contorno de relieve amarillo ámbar delicado (`border-amber-300/80`) y un suave resplandor de fondo (`shadow-[0_2px_10px_rgba(251,191,36,0.12)]`), con el formato exacto: `Datos mama $35,000 (In 2 days)`.

#### 7. Emojis de Apple para Suscripciones
- **Selector de Emoji en el Formulario**: Botón avatar circular `w-16 h-16` en la parte superior central del modal de agregar/editar suscripciones para escoger emojis estilo Apple (🍿, 🎵, 🎬, 🤖, 💻, 📱, ☁️, 🎮, 🏋️‍♂️, ⚡, 🍕, 💳, 🚗, etc.).
- **Detección e Inferencia Inteligente (Auto-Emoji)**: Sugerencia automática e instantánea del emoji al escribir el nombre de la suscripción (*Netflix* -> 🍿, *Spotify* -> 🎵, *ChatGPT* -> 🤖, *iCloud* -> ☁️, *Movistar* -> 📱, *Gimnasio* -> 🏋️‍♂️).
- **Íconos en el Dashboard**: Reemplazo de las 2 letras iniciales dentro del círculo avatar de cada tarjeta por el emoji seleccionado, conservando exactamente la forma, tamaño y estética de la tarjeta.

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
- Pruebas Unitarias: Test suite nativo ejecutado con éxito (4/4 tests pasados).
- Compilación: Next.js build compilado con éxito (7/7 rutas estáticas y dinámicas optimizadas).

---

## [Rediseño MonAI - F0] - 2026-08-08 (Inventario y Plan de Mapeo) - COMPLETADO ✅

- **Fase**: F0 - Inventario Completo & REDESIGN.md
- **Archivos cambiados**: `REDESIGN.md`, `Updates.md`
- **Decisiones de diseño**: Se realizó un inventario completo de las 6 vistas principales (`/`, `/timeline`, `/insights`, `/cancellation`, `/settings`, `/login`), componentes del dashboard, modales, layout y servidor. Se trazó la matriz de equivalencias hacia el sistema visual MonAI (dark mode principal `#0B0B0D`, tarjetas `#1C1C1E`, acentos verde `#34C759` y coral `#E8505B`, tipografía Nunito 700/800/900, pills redondeadas, TotalBlock con número gigante `w900`, FABs flotantes y bottom nav).
- **Cómo verificar**: Consultar `REDESIGN.md` en la raíz del proyecto para la matriz de componentes y reglas duras de preservación.
