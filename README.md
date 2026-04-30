# 💳 Clarío — Control Financiero Personal

> Registra tus gastos al instante, controla tus tarjetas y nunca más te sorprenda el estado de cuenta.

Clarío es una app web progresiva (PWA) para control financiero personal enfocada en el mercado mexicano. Permite registrar gastos diarios de forma rápida, gestionar múltiples tarjetas de crédito y débito, calcular pagos mensuales considerando compras a **meses sin intereses (MSI)**, y recibir alertas inteligentes cuando los patrones de gasto representan un riesgo.

---

## ✨ Features

- ⚡ **Captura rápida** de gastos en menos de 5 segundos desde el celular
- 💳 **Control de tarjetas** con límite, día de corte y pago
- 📅 **Cálculo MSI** — sabe exactamente cuánto pagar cada mes para no generar intereses
- 📊 **Dashboard** con resumen mensual, alertas y gráficas por categoría
- 🔔 **Alertas inteligentes** cuando te acercas a tu límite de gasto
- 🤖 **Agente IA** con análisis y consejos personalizados (Anthropic Claude)
- 📱 **PWA instalable** en iOS y Android sin App Store
- 👫 **Cuenta compartida** para parejas (Plan Pro)

---

## 🛠 Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.12 + FastAPI |
| Base de datos | PostgreSQL 16 |
| ORM | SQLAlchemy + Alembic |
| Frontend | React 18 + Vite + TailwindCSS |
| Auth | Supabase Auth |
| IA | Anthropic Claude API |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

---

## 📋 Requisitos

- Python 3.12+
- Node.js 18+
- PostgreSQL 16
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Anthropic](https://console.anthropic.com)

---

## 🚀 Instalación local

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/clario.git
cd clario
```

### 2. Crea la base de datos

```bash
sudo -u postgres psql -c "CREATE DATABASE clario;"
sudo -u postgres psql -c "CREATE USER clario_user WITH PASSWORD 'tu_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE clario TO clario_user;"
sudo -u postgres psql -d clario -c "GRANT ALL ON SCHEMA public TO clario_user;"
```

### 3. Configura el backend

```bash
# Crea el entorno virtual
python3 -m venv .venv
source .venv/bin/activate

# Instala dependencias
pip install -r requirements.txt

# Configura las variables de entorno
cp .env.example .env
# Edita .env con tus credenciales reales
```

Variables de entorno requeridas en `.env`:

```env
DATABASE_URL=postgresql://clario_user:tu_password@localhost:5432/clario
ANTHROPIC_API_KEY=sk-...
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
RESEND_API_KEY=re_...
FRONTEND_URL=http://localhost:5173
```

### 4. Ejecuta las migraciones

```bash
alembic upgrade head
```

### 5. Configura el frontend

```bash
cd frontend
npm install

# Configura las variables de entorno del frontend
cp .env.example .env
# Edita frontend/.env
```

Variables de entorno requeridas en `frontend/.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### 6. Levanta el proyecto

```bash
# Terminal 1 — Backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📁 Estructura del proyecto

```
clario/
├── app/
│   ├── main.py               # FastAPI entry point
│   ├── config.py             # Variables de entorno
│   ├── database.py           # Conexión PostgreSQL
│   ├── models/               # Modelos SQLAlchemy
│   ├── schemas/              # Schemas Pydantic
│   ├── services/             # Lógica de negocio
│   ├── routers/              # Endpoints API
│   └── utils/                # Helpers (MSI, categorías)
├── frontend/
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/            # Páginas de la app
│       ├── hooks/            # Custom hooks
│       ├── services/         # Cliente HTTP y Supabase
│       └── context/          # AuthContext
├── alembic/                  # Migraciones de BD
├── CLAUDE.md                 # Contexto del proyecto para Claude Code
└── README.md
```

---

## 🗺 Roadmap MVP

- [x] Setup del proyecto
- [x] Modelos de base de datos y migraciones
- [x] Auth con Supabase
- [x] CRUD de tarjetas
- [x] CRUD de gastos fijos
- [ ] Captura rápida de gastos
- [ ] Registro de ingresos
- [ ] Analytics y dashboard
- [ ] Motor de alertas
- [ ] Agente IA
- [ ] Notificaciones por email
- [ ] Plan Pro (cuenta compartida)

---

## 📄 Licencia

MIT © Fernando Juárez
