# 🍦 NeveriaPOS

Sistema de Punto de Venta para Nevería Artesanal — Full Stack (Flask + React + MySQL)

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python 3.11 + Flask + Flask-JWT-Extended |
| Base de Datos | MySQL 8 + SQLAlchemy ORM |
| Autenticación | JWT (HMAC-SHA256) + bcrypt |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions → Railway / Render |

## Estructura del Proyecto

```
neveriapos/
├── backend/              # API REST Flask
│   ├── app/
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── routes/       # Blueprints (auth, pos, inventory, reports, users)
│   │   ├── schemas/      # Marshmallow schemas (validación)
│   │   ├── services/     # Lógica de negocio
│   │   └── utils/        # JWT helpers, decoradores RBAC, email
│   ├── migrations/       # Flask-Migrate
│   ├── tests/            # Pytest
│   ├── .env.example
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
├── frontend/             # React App
│   ├── src/
│   │   ├── components/   # Componentes reutilizables por módulo
│   │   ├── pages/        # Páginas principales
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Llamadas a la API (axios)
│   │   ├── context/      # AuthContext, CartContext
│   │   └── utils/        # Formatters, helpers
│   ├── public/
│   └── package.json
├── docker/               # Dockerfiles separados
├── docker-compose.yml
├── .github/workflows/    # CI/CD
└── README.md
```

## Inicio Rápido

### Con Docker (recomendado)

```bash
# 1. Clonar y entrar al proyecto
git clone <repo-url> && cd neveriapos

# 2. Copiar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# 3. Levantar todo
docker-compose up --build

# La app estará en:
# Frontend → http://localhost:5173
# Backend API → http://localhost:5000
# MySQL → localhost:3306
```

### Sin Docker (desarrollo local)

```bash
# BACKEND
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Editar con tus credenciales MySQL
flask db upgrade
flask seed-db                   # Carga datos de prueba
python run.py

# FRONTEND (nueva terminal)
cd frontend
npm install
npm run dev
```

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@neveria.mx | admin123 |
| Cajero | cajero@neveria.mx | cajero123 |
| Consultor | consultor@neveria.mx | consultor123 |

## Roles y Permisos (RBAC)

| Módulo | Admin | Cajero | Consultor |
|--------|-------|--------|-----------|
| POS — registrar ventas | ✅ | ✅ | ❌ |
| Inventario — ver | ✅ | ✅ | ✅ |
| Inventario — editar | ✅ | ❌ | ❌ |
| Reportes | ✅ | ❌ | ✅ |
| Administración | ✅ | ❌ | ❌ |

## Endpoints Principales

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/products
POST   /api/products          [admin]
PUT    /api/products/:id      [admin]
DELETE /api/products/:id      [admin]

GET    /api/inventory
POST   /api/inventory/movement [admin, cajero]

POST   /api/sales
GET    /api/sales
GET    /api/sales/:id/ticket   → PDF

GET    /api/reports/summary
GET    /api/reports/sales
GET    /api/reports/inventory

GET    /api/users              [admin]
POST   /api/users              [admin]
```
