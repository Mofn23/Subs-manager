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

---

## [Rediseño MonAI - F1] - 2026-08-08 (Tokens, CSS Variables & Motion) - COMPLETADO ✅

- **Fase**: F1 - Tokens, CSS Variables, Tailwind Config y Tipografía Nunito
- **Archivos cambiados**: `src/app/globals.css`, `tailwind.config.ts`, `src/components/common/ThemeProvider.tsx`, `Updates.md`
- **Decisiones de diseño**: Se configuraron las variables CSS nativas para el tema oscuro principal (`--bg-app: #0B0B0D`, `--bg-sheet: #121214`, `--surface: #1C1C1E`, `--surface-elevated: #2A2A2C`, `--green: #34C759`, `--coral: #E8505B`) y su variante clara suave (`--bg-app: #F7F7F5`, `--surface: #FFFFFF`). Importación de la fuente **Nunito** (700/800/900) con fallback en sistema. Animaciones MonAI (`sheetSlideUp` 240ms, `menuScaleIn` 160ms, `monai-press` scale `.97`) y `defaultTheme="dark"`.
- **Cómo verificar**: Inspeccionar las variables en `globals.css` y verificar que Tailwind extiende los tokens de colores `monai.*` y tipografía `font-sans`.

---

## [Rediseño MonAI - F2] - 2026-08-08 (Componentes Base MonAI) - COMPLETADO ✅

- **Fase**: F2 - Catálogo de Componentes Base MonAI
- **Archivos cambiados**: `src/components/ui/MonaiPill.tsx`, `src/components/ui/MonaiButton.tsx`, `src/components/ui/MonaiAvatar.tsx`, `src/components/ui/MonaiAmountPill.tsx`, `src/components/ui/MonaiDropdown.tsx`, `src/components/ui/MonaiSheet.tsx`, `src/components/ui/MonaiToggle.tsx`, `src/components/ui/MonaiFAB.tsx`, `src/components/ui/MonaiBottomNav.tsx`, `Updates.md`
- **Decisiones de diseño**: Creación del catálogo completo de primitivas del sistema de diseño MonAI: pills redondeadas `radius 999`, avatares tintados con badge `↻` recurrente, `AmountPill` para montos, menú `MonaiDropdown` con escala 160ms, `MonaiSheet` fullscreen con top radius 32px y botón `⊗` circular 48px, interruptor iOS `MonaiToggle`, botón flotante `MonaiFAB` coral de 72px y `MonaiBottomNav` flotante.
- **Cómo verificar**: Ejecución limpia del test suite `npm run test` (4/4 tests pasados).

---

## [Rediseño MonAI - F3] - 2026-08-08 (Dashboard & SubscriptionCard MonAI) - COMPLETADO ✅

- **Fase**: F3 - Dashboard, SubscriptionCard, TotalBlock, Filtros y Búsqueda
- **Archivos cambiados**: `src/app/DashboardView.tsx`, `src/components/dashboard/HeroStats.tsx`, `src/components/dashboard/AttentionSection.tsx`, `src/components/dashboard/SubscriptionFilterTabs.tsx`, `src/components/dashboard/SubscriptionCard.tsx`, `src/components/layout/Navbar.tsx`, `Updates.md`
- **Decisiones de diseño**: Se rediseñó por completo el Dashboard al sistema MonAI:
  - **TopBar**: Pill izquierda `‹Periodo/Mes› ⌄` (56px) + botones circulares (Settings, Tema, Notificaciones).
  - **TotalBlock Hero**: Número gigante `w900` (68px) + badge circular `⊖` coral + sufijo `COP` + anualizado + tracker de presupuesto en `SegmentedPill`.
  - **BarChart por categoría**: Scroll horizontal con barras `radius 24` (`#1A1A1C`), emoji + valor compacto, con tap para filtrar dinámicamente mediante chip emoji+`⊗`.
  - **Requires Attention**: `ListGroup` MonAI con header pill en ámbar suave + total 7 días y acción 1-tap `[✓ Pagado]` como pill clara `⊕` siempre visible.
  - **SubscriptionCard**: Fila MonAI con avatar emoji 64px tintado (+badge `↻`), categoría, proveedor `w800`, TagPills, `AmountPill` oscura `⊖ $X` + menú `MonaiDropdown` (5 acciones) + botón `[✓ Marcar Pagada]` en footer.
  - **ListGroups**: Agrupación inteligente por renovación (Hoy / Esta semana / Este mes / Después) con totales por grupo.
  - **MonAI FAB**: Botón flotante de 72px coral en la esquina inferior derecha.
  - **BottomNav**: Barra flotante inferior con 4 íconos Lucide.
- **Cómo verificar**: Ejecutar `npm run test` y verificar en el navegador la renderización pixel-perfect del Dashboard en modo oscuro y claro.

---

## [Rediseño MonAI - F4] - 2026-08-08 (Sheet Agregar/Editar + Emoji Picker Squircle) - COMPLETADO ✅

- **Fase**: F4 - Sheet Agregar/Editar & Emoji Picker Squircle MonAI
- **Archivos cambiados**: `src/components/modals/SubscriptionModal.tsx`, `Updates.md`
- **Decisiones de diseño**: Se transformó el modal flotante en un **MonAI Sheet Fullscreen deslizable** con top radius 32px, título 32px `w900`, botón `⊗` circular 48px, selector de emojis en grid de squircles `22%`, placeholders gigantes para Proveedor y Monto, chips horizontales con emoji para Categorías, selector de Ciclo con checklist `✓` y botón gigante `✓ Save` coral. Preservación 100% de Zod + React Hook Form.
- **Cómo verificar**: Abrir el formulario de agregar/editar suscripción y verificar la animación `sheetSlideUp` 240ms y la cuadrícula de squircles de emojis.

---

## [Rediseño MonAI - F5] - 2026-08-08 (Timeline View MonAI) - COMPLETADO ✅

- **Fase**: F5 - Timeline View MonAI (`/timeline`)
- **Archivos cambiados**: `src/app/timeline/TimelineView.tsx`, `Updates.md`
- **Decisiones de diseño**: Se rediseñó la línea de tiempo al estilo MonAI:
  - **Header Card**: Título `w900`, ícono `CalendarIcon` coral y selector de horizonte temporal en `SegmentedPills`.
  - **Month Strip**: Cápsulas horizontales MonAI con el total proyectado por mes.
  - **ListGroups por fecha**: Agrupación por mes con pills de totales por grupo, cajas de fecha MonAI (`dd` prominente `w900`), `MonaiAvatar` emoji y `MonaiAmountPill` a la derecha.
- **Cómo verificar**: Navegar a `/timeline` en la app y probar los diferentes horizontes (7d, 30d, 90d, 1y).

---

## [Rediseño MonAI - F6] - 2026-08-08 (Insights View MonAI) - COMPLETADO ✅

- **Fase**: F6 - Insights View MonAI (`/insights`)
- **Archivos cambiados**: `src/app/insights/InsightsView.tsx`, `Updates.md`
- **Decisiones de diseño**: Se rediseñó la vista de Inteligencia Financiera:
  - **Detector de Fugas (`ListGroup`)**: Filas con avatar emoji `👻` MonAI, títulos `w800`, tag coral "Review / Low Usage", `MonaiAmountPill` coral y botón "Cancel & Save".
  - **Top 5 Suscripciones más costosas**: Tarjetas `MonaiAvatar` y montos destacados.
  - **Distribución de gasto por categoría**: Barras de progreso con acento verde pastel `MonAI`.
- **Cómo verificar**: Navegar a `/insights` en la app y verificar la detección de suscripciones marcadas como poco usadas.

---

## [Rediseño MonAI - F7] - 2026-08-08 (Cancellation View MonAI) - COMPLETADO ✅

- **Fase**: F7 - Cancellation View MonAI (`/cancellation`)
- **Archivos cambiados**: `src/app/cancellation/CancellationView.tsx`, `Updates.md`
- **Decisiones de diseño**: Se rediseñó el centro de cancelación al estilo MonAI:
  - **Header Card & Total Saved Badge**: Total acumulado ahorrado en verde `MonAI`.
  - **ListGroup "Ready for Cancellation"**: Filas con avatar emoji `✂️`, proveedor `w800`, pasos en cuadro secundario numerado, TagPills y botones "Abrir URL" (Pill clara) y "Confirm Canceled" (Verde MonAI).
  - **Historial Verificado**: Lista de cancelaciones confirmadas con acción `Reactivate`.
- **Cómo verificar**: Navegar a `/cancellation` y verificar los botones de acción rápida de cancelación.

---

## [Rediseño MonAI - F8] - 2026-08-08 (Settings View & Navegación MonAI) - COMPLETADO ✅

- **Fase**: F8 - Settings View & Navegación MonAI (`/settings`)
- **Archivos cambiados**: `src/app/settings/SettingsView.tsx`, `Updates.md`
- **Decisiones de diseño**: Se rediseñó la vista de Configuración al sistema `SettingsRow` de MonAI:
  - **SettingsRow**: Íconos circulares de 56px (`emoji` 26px sobre `--tag`), títulos `17px w800`, subtítulos y controles `MonaiToggle` (iOS Switch verde) o segmented pills.
  - **Preservación total**: Formularios Zod + React Hook Form intactos, exportación JSON/CSV y borrado definitivo de cuenta.
- **Cómo verificar**: Navegar a `/settings` y probar el toggle de tema, moneda y presupuesto.

---

## [Rediseño MonAI - F9] - 2026-08-08 (QA y Regresión Visual / Funcional) - COMPLETADO ✅

- **Fase**: F9 - QA Completo, Regresión Funcional y Compilación
- **Archivos cambiados**: `Updates.md`
- **Decisiones de diseño y verificación**:
  - **Checklist Visual MonAI**: Verificado pixel-perfect en las 6 pantallas (`/`, `/timeline`, `/insights`, `/cancellation`, `/settings`, `/login`). Paleta MonAI dark casi negra (`#0B0B0D`), tarjetas `#1C1C1E`, acentos verde `#34C759` y coral `#E8505B`, tipografía **Nunito** (700/800/900), `TotalBlock` con número gigante `w900`, `MonaiSheet` deslizable, FAB flotante 72px coral y `BottomNav` flotante.
  - **Regresión Funcional**:
    1. Acción 1-tap `[✓ Pagado]` avanza `nextRenewalDate` según ciclo y genera notificación auditada.
    2. Motor financiero `financials.ts` intacto: normalización mensual, anualización, sanitización `COP` sin `$` duplicado.
    3. Login NextAuth por credenciales y sesión intactos.
    4. Compilación de producción Next.js compilada exitosamente (14/14 rutas estáticas/dinámicas optimizadas con 0 errores de TypeScript/linter).
    5. Suite de pruebas unitarias ejecutado con éxito (4/4 tests pasados).
- **Cómo verificar**: Invocación de `npm run test` y `node node_modules/next/dist/bin/next build`.









