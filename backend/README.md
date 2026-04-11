# 🍦 NeveriaPOS — Backend API

API REST para el sistema de punto de venta de una nevería. Construida con **Flask**, **SQLAlchemy** y **JWT**.

---

## Stack

| Capa         | Tecnología                          |
|--------------|-------------------------------------|
| Framework    | Flask 3.x                           |
| ORM          | Flask-SQLAlchemy + Flask-Migrate    |
| Auth         | Flask-JWT-Extended (Bearer tokens)  |
| Validación   | Marshmallow                         |
| Base de datos| MySQL (PyMySQL)                     |
| Tests        | pytest + pytest-flask               |

---

## Estructura

```
backend/
├── app/
│   ├── models/        # Modelos SQLAlchemy (User, Product, Sale, InventoryMovement)
│   ├── routes/        # Blueprints HTTP por dominio
│   ├── schemas/       # Schemas Marshmallow (validación + deserialización)
│   ├── services/      # Lógica de negocio (SaleService, InventoryService)
│   └── utils/
│       ├── auth.py       # Decorador RBAC roles_required
│       ├── responses.py  # Helpers para respuestas JSON consistentes
│       └── seed.py       # Comando flask seed-db
├── tests/
├── config.py          # Configuraciones por entorno
├── run.py             # Punto de entrada
└── init_db.py         # Creación de tablas + datos iniciales
```

---

## Instalación

```bash
# 1. Crear entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Crear base de datos y cargar datos iniciales
python init_db.py

# 5. Iniciar servidor
python run.py
```

---

## Variables de entorno

| Variable                    | Descripción                          | Default              |
|-----------------------------|--------------------------------------|----------------------|
| `DB_HOST`                   | Host de MySQL                        | `localhost`          |
| `DB_PORT`                   | Puerto de MySQL                      | `3306`               |
| `DB_NAME`                   | Nombre de la base de datos           | `neveriapos`         |
| `DB_USER`                   | Usuario de MySQL                     | `root`               |
| `DB_PASSWORD`               | Contraseña de MySQL                  | —                    |
| `JWT_SECRET_KEY`            | Clave secreta para JWT               | —                    |
| `JWT_ACCESS_TOKEN_EXPIRES`  | Duración del access token (segundos) | `3600`               |
| `JWT_REFRESH_TOKEN_EXPIRES` | Duración del refresh token (segundos)| `2592000`            |
| `SECRET_KEY`                | Clave secreta de Flask               | —                    |
| `FLASK_ENV`                 | Entorno (`development`/`production`) | `development`        |
| `MAIL_USERNAME`             | Correo para envío de emails          | —                    |
| `MAIL_PASSWORD`             | App password de Gmail                | —                    |
| `FRONTEND_URL`              | URL del frontend (CORS)              | `http://localhost:5173` |

---

## Endpoints

### Auth — `/api/auth`

| Método | Ruta               | Descripción                    | Roles    |
|--------|--------------------|--------------------------------|----------|
| POST   | `/login`           | Iniciar sesión                 | Público  |
| POST   | `/refresh`         | Renovar access token           | JWT      |
| POST   | `/logout`          | Cerrar sesión                  | JWT      |
| GET    | `/me`              | Perfil del usuario actual      | JWT      |
| POST   | `/forgot-password` | Solicitar reset de contraseña  | Público  |
| POST   | `/reset-password`  | Restablecer contraseña         | Público  |

### Productos — `/api/products`

| Método | Ruta    | Descripción              | Roles        |
|--------|---------|--------------------------|--------------|
| GET    | `/`     | Listar productos         | JWT          |
| GET    | `/:id`  | Obtener producto         | JWT          |
| POST   | `/`     | Crear producto           | admin        |
| PUT    | `/:id`  | Actualizar producto      | admin        |
| DELETE | `/:id`  | Desactivar producto      | admin        |

### Ventas — `/api/sales`

| Método | Ruta    | Descripción              | Roles              |
|--------|---------|--------------------------|--------------------|
| POST   | `/`     | Registrar venta          | admin, cajero      |
| GET    | `/`     | Listar ventas (paginado) | admin, consultor   |
| GET    | `/:id`  | Detalle de venta         | admin, consultor   |

### Inventario — `/api/inventory`

| Método | Ruta          | Descripción                  | Roles  |
|--------|---------------|------------------------------|--------|
| GET    | `/`           | Estado del inventario        | JWT    |
| GET    | `/low-stock`  | Productos con stock bajo     | JWT    |
| POST   | `/movement`   | Registrar movimiento         | admin  |
| GET    | `/movements`  | Historial de movimientos     | admin  |

### Reportes — `/api/reports`

| Método | Ruta             | Descripción                  | Roles            |
|--------|------------------|------------------------------|------------------|
| GET    | `/summary`       | Resumen del día              | admin, consultor |
| GET    | `/sales-by-day`  | Ventas por día (últimos N)   | admin, consultor |
| GET    | `/top-products`  | Top 10 productos más vendidos| admin, consultor |

### Usuarios — `/api/users`

| Método | Ruta    | Descripción         | Roles |
|--------|---------|---------------------|-------|
| GET    | `/`     | Listar usuarios     | admin |
| POST   | `/`     | Crear usuario       | admin |
| PUT    | `/:id`  | Actualizar usuario  | admin |

---

## Roles

| Rol         | Permisos                                              |
|-------------|-------------------------------------------------------|
| `admin`     | Acceso total                                          |
| `cajero`    | Crear ventas, consultar productos e inventario        |
| `consultor` | Solo lectura: ventas, reportes, productos             |

---

## Usuarios de prueba

| Email                    | Contraseña     | Rol         |
|--------------------------|----------------|-------------|
| `admin@neveria.mx`       | `admin123`     | admin       |
| `cajero@neveria.mx`      | `cajero123`    | cajero      |
| `consultor@neveria.mx`   | `consultor123` | consultor   |

---

## Tests

```bash
pytest tests/ -v
```

---

## Migraciones

```bash
flask db init       # Solo la primera vez
flask db migrate -m "descripción"
flask db upgrade
```

---

## Health Check

```
GET /api/health
→ {"status": "ok", "service": "NeveriaPOS API", "version": "1.0.0"}
```
