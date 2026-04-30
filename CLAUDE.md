# 💳 Clarío — Contexto del Proyecto para Claude Code

## ¿Qué es Clarío?

SaaS de control financiero personal que permite registrar gastos diarios de forma rápida desde el celular, gestionar múltiples tarjetas de crédito y débito, calcular pagos mensuales considerando compras a **meses sin intereses (MSI)**, y recibir alertas inteligentes cuando los patrones de gasto representan un riesgo. El usuario accede desde el navegador (web o PWA instalable en móvil), sin necesidad de descargar nada.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Lenguaje backend | Python 3.12+ |
| Framework API | FastAPI |
| Base de datos | PostgreSQL 16 |
| ORM | SQLAlchemy + Alembic |
| Frontend | React + Vite + TailwindCSS |
| App móvil | PWA (Progressive Web App) |
| Auth | Supabase Auth |
| IA | Anthropic Claude API (claude-sonnet) |
| Notificaciones | Resend (email) |
| Servidor | Uvicorn |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

---

## Estructura de Carpetas Esperada

```
clario/
├── CLAUDE.md
├── README.md
├── requirements.txt
├── .env.example
├── alembic.ini
├── alembic/
│   └── versions/
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Variables de entorno
│   ├── database.py                # Conexión PostgreSQL / SQLAlchemy
│   ├── models/
│   │   ├── user.py                # Modelo User
│   │   ├── card.py                # Modelo Card
│   │   ├── expense.py             # Modelo Expense
│   │   ├── income.py              # Modelo Income
│   │   ├── fixed_expense.py       # Modelo FixedExpense
│   │   └── alert.py               # Modelo Alert
│   ├── services/
│   │   ├── expenses.py            # CRUD gastos
│   │   ├── incomes.py             # CRUD ingresos
│   │   ├── cards.py               # CRUD tarjetas
│   │   ├── fixed_expenses.py      # CRUD gastos fijos
│   │   ├── analytics.py           # Cálculos: MSI, proyecciones, totales por tarjeta
│   │   ├── alerts.py              # Motor de alertas por reglas
│   │   └── agent.py               # Agente IA (análisis y consejos personalizados)
│   ├── routers/
│   │   ├── expenses.py            # CRUD /expenses
│   │   ├── incomes.py             # CRUD /incomes
│   │   ├── cards.py               # CRUD /cards
│   │   ├── fixed_expenses.py      # CRUD /fixed-expenses
│   │   ├── analytics.py           # GET /analytics/*
│   │   └── agent.py               # POST /agent/advice
│   └── utils/
│       ├── msi.py                 # Helpers para calcular pagos MSI
│       └── categories.py          # Categorías de gasto predefinidas
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── public/
│   │   └── manifest.json          # PWA manifest
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── QuickAdd/          # Captura rápida de gasto (móvil-first)
│       │   ├── Dashboard/         # Resumen mensual, tarjetas, alertas
│       │   ├── Cards/             # Gestión de tarjetas
│       │   └── Charts/            # Gráficas por categoría y tarjeta
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Expenses.tsx
│       │   ├── Incomes.tsx
│       │   └── Settings.tsx
│       └── services/
│           └── api.ts             # Cliente HTTP hacia FastAPI
└── tests/
```

---

## Modelo de Datos

### users
```sql
id              UUID PRIMARY KEY
email           VARCHAR UNIQUE
name            VARCHAR
monthly_income  DECIMAL(12,2) NULLABLE   -- ingreso fijo mensual declarado
currency        VARCHAR DEFAULT 'MXN'
plan            VARCHAR DEFAULT 'basic'  -- basic | pro
created_at      TIMESTAMP
```

### cards
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
name            VARCHAR          -- ej: "BBVA Azul", "Rappicard"
type            VARCHAR          -- credit | debit
credit_limit    DECIMAL(12,2) NULLABLE
closing_day     INT NULLABLE     -- día de cierre del período
due_day         INT NULLABLE     -- día límite de pago
color            VARCHAR          -- color hex para UI
current_balance  DECIMAL(12,2) DEFAULT 0.00  -- saldo usado al registrar la tarjeta (onboarding)
balance_date     DATE NULLABLE               -- fecha en que se capturó ese saldo inicial
is_active        BOOLEAN DEFAULT true
created_at       TIMESTAMP
```

### expenses
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
card_id         UUID REFERENCES cards(id) NULLABLE
amount          DECIMAL(12,2)
description     VARCHAR
category        VARCHAR          -- ver categorías predefinidas
payment_type    VARCHAR          -- contado | msi
msi_months      INT NULLABLE     -- número de meses (3, 6, 9, 12, 18)
msi_start_date  DATE NULLABLE
expense_date    DATE
created_at      TIMESTAMP
```

### incomes
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
amount          DECIMAL(12,2)
description     VARCHAR
type            VARCHAR          -- fixed | variable
income_date     DATE
created_at      TIMESTAMP
```

### fixed_expenses
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
name            VARCHAR          -- ej: "Renta", "Internet", "Netflix"
amount          DECIMAL(12,2)
category        VARCHAR
due_day         INT              -- día del mes en que vence
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP
```

### alerts
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
type            VARCHAR          -- spending_limit | high_category | msi_due | balance_risk
message         TEXT
severity        VARCHAR          -- info | warning | danger
is_read         BOOLEAN DEFAULT false
created_at      TIMESTAMP
```

---

## Flujo de Captura de Gasto (móvil-first)

1. Usuario abre PWA → botón flotante "+" prominente en pantalla principal
2. Ingresa monto → descripción (opcional) → selecciona tarjeta → selecciona categoría
3. Elige tipo de pago: ¿contado o MSI? → si MSI: selecciona número de meses
4. Confirma → gasto guardado → motor de alertas evalúa → notificación si hay alerta activa

## Flujo del Dashboard Principal

1. Barra de progreso: ingreso mensual vs gasto acumulado del mes
2. Resumen por tarjeta: gasto del corte actual + pago sugerido (contado + MSI del mes)
3. Gastos fijos: cuáles ya pasaron, cuáles faltan en el mes
4. Alertas activas ordenadas por severidad (danger → warning → info)
5. Gráfica de gasto por categoría (dona o barras horizontales)

---

## Lógica de Cálculo MSI

```python
# Al registrar un gasto a meses sin intereses:
pago_mensual_msi = amount / msi_months

# Este monto se suma al "compromiso mensual" de la tarjeta
# durante los próximos N meses desde msi_start_date

# Pago sugerido por tarjeta para no generar intereses:
pago_sugerido = total_contado_del_corte + sum(MSI activos del mes)
```

## Reglas del Motor de Alertas

```python
# Evaluadas después de cada gasto registrado (o diariamente para MSI)

if gasto_mensual > ingreso_mensual * 0.80:   → severity: "warning"
if gasto_mensual > ingreso_mensual * 0.95:   → severity: "danger"
if gasto_categoria > gasto_total * 0.30:     → severity: "warning"  # semanal
if uso_tarjeta > credit_limit * 0.70:        → severity: "warning"
if uso_tarjeta > credit_limit * 0.90:        → severity: "danger"
if msi_vence_en_menos_de_7_dias:             → severity: "info"     # diario
```

## Reglas del Agente IA

- Recibe como contexto: resumen de gastos del mes por categoría, ingresos, historial de 3 meses y alertas activas
- Responde con: análisis breve del patrón de gasto, 2-3 consejos concretos y proyección del cierre del mes
- Tono **claro, cercano y sin tecnicismos**
- Plan basic: 1 análisis por semana — Plan pro: ilimitados

---

## Endpoints Principales

```
# Gastos
POST   /expenses              → registrar gasto
GET    /expenses              → listar gastos (filtros: mes, tarjeta, categoría)
DELETE /expenses/{id}         → eliminar gasto

# Tarjetas
GET    /cards                 → listar tarjetas del usuario
POST   /cards                 → agregar tarjeta
PATCH  /cards/{id}            → actualizar tarjeta
DELETE /cards/{id}            → eliminar tarjeta

# Ingresos
POST   /incomes               → registrar ingreso
GET    /incomes               → listar ingresos del mes

# Gastos fijos
GET    /fixed-expenses        → listar gastos fijos
POST   /fixed-expenses        → agregar gasto fijo
PATCH  /fixed-expenses/{id}   → actualizar gasto fijo

# Analytics
GET    /analytics/summary     → resumen mensual (ingresos vs gastos)
GET    /analytics/cards       → detalle por tarjeta con pago sugerido MSI
GET    /analytics/categories  → gasto por categoría del mes

# Agente IA
POST   /agent/advice          → obtener análisis y consejos personalizados

# Alertas
GET    /alerts                → alertas activas del usuario
PATCH  /alerts/{id}/read      → marcar como leída
```

---

## Categorías de Gasto Predefinidas

```python
CATEGORIES = [
    "alimentacion",    # supermercado, restaurantes, comida a domicilio
    "transporte",      # gasolina, uber, transporte público
    "entretenimiento", # salidas, streaming, hobbies
    "salud",           # farmacia, médico, gym
    "servicios",       # renta, luz, agua, gas, internet, suscripciones
    "ropa",            # ropa, calzado, accesorios
    "educacion",       # cursos, libros, escuela
    "viajes",          # vuelos, hoteles, vacaciones
    "otro",            # cualquier cosa fuera de categoría
]
```

---

## Variables de Entorno Necesarias (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/clario
ANTHROPIC_API_KEY=sk-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...
FRONTEND_URL=http://localhost:5173
```

---

## Prioridades del MVP (construir en este orden)

1. [ ] Setup del proyecto (FastAPI + PostgreSQL + Alembic + React/Vite)
2. [ ] Modelos de base de datos y migraciones
3. [ ] Auth con Supabase (registro, login, JWT)
4. [ ] CRUD de tarjetas
5. [ ] CRUD de gastos fijos
6. [ ] Captura rápida de gastos (endpoint + UI móvil-first)
7. [ ] Registro de ingresos (fijos y variables)
8. [ ] Analytics: resumen mensual + desglose por tarjeta con cálculo MSI
9. [ ] Motor de alertas por reglas
10. [ ] Dashboard principal (web + PWA)
11. [ ] Agente IA (análisis + consejos)
12. [ ] Notificaciones por email (Resend)
13. [ ] Plan Pro: cuenta compartida (pareja)
14. [ ] Tests básicos

---

## Notas Importantes

- **Captura móvil es prioridad**: el flujo de agregar un gasto debe completarse en menos de 5 segundos desde el celular
- **MSI es el diferenciador core** para el mercado mexicano: el cálculo de pago sugerido debe ser siempre visible y preciso
- Trabajar siempre en **MXN** por defecto; el campo `currency` en `users` está preparado para internacionalización futura
- Configurar `manifest.json` y service worker desde el inicio para que la PWA sea instalable en iOS y Android sin App Store
- Usar el **JWT de Supabase** como token de autenticación en todos los endpoints de FastAPI
- El agente IA **no tiene acceso directo a la BD**: recibe un resumen serializado como contexto en cada llamada
- **Onboarding de tarjetas**: al agregar una tarjeta de crédito, preguntar saldo usado actual (`current_balance`) — campo opcional, permite que los cálculos de pago sugerido sean correctos desde el día 1; MSI preexistentes se agregarán en v2
- **Sin integración bancaria en MVP**: captura 100% manual; arquitectura preparada para agregar Belvo como fuente opcional en v2
- Para desarrollo local usar **ngrok** para pruebas de notificaciones push: `ngrok http 8000`
