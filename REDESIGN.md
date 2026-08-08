# REDESIGN.md - Subs Manager "MonAI" System Plan

## 1. Inventario Real de Pantallas, Componentes y Tokens Actuales

### Pantallas (`src/app/`)
- `app/page.tsx` & `app/DashboardView.tsx`: Dashboard principal con Hero Stats, atención requerida, búsqueda, pestañas de filtro y tarjetas de suscripciones.
- `app/timeline/page.tsx` & `app/timeline/TimelineView.tsx`: Cronograma de renovaciones futuras por ventana temporal (7d, 30d, 90d, 1y).
- `app/insights/page.tsx` & `app/insights/InsightsView.tsx`: Inteligencia financiera, detector de fugas y desglose por categorías.
- `app/cancellation/page.tsx` & `app/cancellation/CancellationView.tsx`: Centro de cancelación con links directos, guías y confirmación verificada.
- `app/settings/page.tsx` & `app/settings/SettingsView.tsx`: Preferencias de cuenta, tema (claro/oscuro), presupuesto, moneda y soberanía de datos (JSON/CSV).
- `app/login/page.tsx` & `app/login/LoginView.tsx`: Autenticación por credenciales NextAuth.

### Componentes Actuales (`src/components/`)
- `components/layout/Navbar.tsx`: Header de navegación con menú desplegable glassmorphism, notificaciones in-app y toggle de tema.
- `components/dashboard/HeroStats.tsx`: Tarjeta central de gasto total mensual y anualizado + tracker de presupuesto.
- `components/dashboard/AttentionSection.tsx`: Sección "Requires Attention" con alertas de renovaciones y trials por vencer + acción 1-tap [✓ Pagado].
- `components/dashboard/SubscriptionFilterTabs.tsx`: Pills de filtro por estado (All, Active, Trials, Low Usage, Paused, Cancelled).
- `components/dashboard/SubscriptionCard.tsx`: Tarjeta individual de suscripción con avatar emoji, detalles, precio, menú contextual ⋮ y botón [✓ Marcar Pagada].
- `components/modals/SubscriptionModal.tsx`: Modal flotante para crear/editar suscripción con selector de emojis y campos React Hook Form + Zod.
- `components/modals/OnboardingModal.tsx`: Modal para nuevos usuarios.
- `components/common/ThemeProvider.tsx` & `Providers.tsx`: Proveedores de contexto `next-themes` y `SessionProvider`.

### Clases y Tokens Actuales (`tailwind.config.ts` y `globals.css`)
- Colores actuales: Paleta `apple.*` (`bg: #FAFAF9`, `card: #FFFFFF`, `text: #1C1C1E`, `secondary: #6E6E73`, `tertiary: #A1A1A6`, `accent: #3B82F6`, `success: #10B981`, `warning: #F59E0B`, `danger: #EF4444`).
- Tipografía actual: `-apple-system`, `SF Pro Display`, `Inter`.
- Bordes actuales: `rounded-xl`, `rounded-2xl`, `rounded-3xl`.

---

## 2. Mapeo: Componente Actual → Patrón MonAI Equivalente

| Componente / Elemento Actual | Patrón MonAI Equivalente a Implementar |
| :--- | :--- |
| **TopBar / Header (`Navbar.tsx`)** | Pill izquierda `‹Periodo/Mes› ⌄` (56px alto, r28, borde sutil) + botones circulares (56px) para búsqueda y settings modal/sheet. |
| **Hero Stats (`HeroStats.tsx`)** | **TotalBlock MonAI**: Label gris centrado, número gigante `w900` (64-72px), badge circular 32px (`⊖` coral / `⊕` verde), sufijo gris de moneda (COP). Presupuesto en `SegmentedPill` (gasto vs presupuesto). |
| **BarChart por Categoría / Fugas** | BarChart scroll horizontal con barras `radius 24` (`#1A1A1C`, activa `#242426`), emoji + valor compacto ($/K/M) abajo. Tap aplica filtro dinámico. |
| **Requires Attention (`AttentionSection.tsx`)** | `ListGroup` MonAI con header pill en ámbar suave + pill derecha con total del grupo 7 días; filas con TagPill coral "Renews Today/Overdue" y botón 1-tap `[✓ Pagado]` como pill clara `⊕`. |
| **Filtros por Estado (`SubscriptionFilterTabs.tsx`)** | `SegmentedPill` horizontal MonAI con borde y cápsulas con fondo `--surface-elevated` al estar activas. |
| **SubscriptionCard (`SubscriptionCard.tsx`)** | **Fila MonAI**: Avatar emoji 64px tintado (+badge `↻` si es recurrente), categoría 14px gris, proveedor 17px `w800`, TagPills `#1E1E20` (`#categoría`, `#estado`, `👻` low usage). Derecha: `AmountPill` oscura `⊖ $X` + `Renews in Xd`. Menú `⋮` → Dropdown MonAI con 5 acciones. Footer con pill clara `[✓ Pagado]`. |
| **Modales Add/Edit (`SubscriptionModal.tsx`)** | **Sheet Fullscreen MonAI**: Fichas con `--bg-sheet` (`#121214`), top radius 32px, título 32px `w900`, ⊗ circular 48px. Placeholders gigantes "Proveedor" y "Monto", chips de fecha renovación y ciclo (`Weekly`, `Monthly`, `Yearly`, etc.), selector de emoji en grid de squircles `22%`, botón `✓ Save` gigante. |
| **Navegación Principal** | **BottomNav MonAI**: Pill flotante oscura en la parte inferior con 4 íconos Lucide (Inicio, Timeline, Insights, Cancelación); activo en blanco, inactivo `--text-secondary`. |
| **Boton Flotante (FAB)** | **FAB MonAI**: Botón flotante circular 76px coral en esquina inferior derecha con `+` para agregar suscripción. |
| **Timeline View (`TimelineView.tsx`)** | Strip superior de meses MonAI (con total proyectado) + `ListGroups` agrupados por fecha con pill de total diario. |
| **Insights View (`InsightsView.tsx`)** | BarChart por categoría + `ListGroup` "Fugas": filas con avatar `👻`, título `w800`, motivo secundario y `AmountPill` coral. |
| **Cancellation View (`CancellationView.tsx`)** | `ListGroup` con filas avatar `✂️`, proveedor `w800`, pasos en secundario numerado, TagPill de estado y pill clara "Abrir URL". |
| **Settings View (`SettingsView.tsx`)** | `SettingsRows`: Ícono circular 56px (emoji 26px sobre `--tag`) + título 17px `w800` + subtítulo 14px + Toggle iOS verde o control segmented. |

---

## 3. Análisis de Riesgos y Reglas Duras

### 🛡️ Reglas Duras de Preservación (PROHIBIDO TOCAR)
1. **Prisma Schema (`prisma/schema.prisma`)**: Ningún cambio a los modelos `User`, `Subscription`, `Notification`.
2. **Server Actions (`src/app/actions/`)**: Preservar 100% de la firma y comportamiento de `createSubscription`, `updateSubscription`, `deleteSubscription`, `markSubscriptionAsPaid`, `toggleLowUsageFlag`, `updateSubscriptionStatus`, `exportUserData`, `deleteAccount`.
3. **Motor Financiero (`src/lib/financials.ts`)**: No alterar `calculateMonthlyEquivalent`, `calculateAnnualEquivalent`, `getDaysUntil`, `formatCurrency`, `calculateSpendSummary`, `detectSubscriptionLeaks`, `getAutoEmoji`.
4. **Validaciones Zod (`src/lib/validations.ts`)**: Mantener intactos los schemas `subscriptionSchema` y `userSettingsSchema`.
5. **Capacitor 7 & PWA**: Mantener `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, scrollbars ocultos, `overscroll-behavior-y: none`.
6. **Autenticación (NextAuth)**: Sesión por credenciales e integración NextAuth sin modificaciones.
7. **Textos e Idioma**: Mantener la terminología actual de los estados y botones.

### ⚠️ Riesgos Identificados y Mitigaciones
- **Transición de Tema (Dark por defecto / Soft Light)**: Garantizar que todos los componentes utilicen variables CSS (`--bg-app`, `--surface`, `--text-primary`, `--border`) para que el toggle de `SettingsView` y `Navbar` funcione sin romper el contraste.
- **Acción 1-Tap `[✓ Pagado]`**: La acción `markSubscriptionAsPaid` debe permanecer visible y accesible inmediatamente en cada fila/tarjeta sin esconderla en menús contextuales profundos.
- **Formateo de Moneda COP**: Asegurar que `formatCurrency` se use consistentemente sin duplicar el símbolo `$`.
