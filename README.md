# OP DataCleaner (GE_AutomationSystem)

## 1) Arquitectura e instalación

Este repo es un monorepo (no “monolito” en el sentido de un solo binario), con 2 apps separadas:

- `backend/` → API (FastAPI)
- `frontend/` → UI (React)

Se corren por separado en local y se conectan por HTTP (CORS habilitado).

## 2) Tech Stack

### Frontend
- React + TypeScript
- Vite (dev server)
- Fetch API para consumir el backend
- Rutas: React Router DOM

### Backend
- Python + FastAPI
- SQLAlchemy (ORM)
- DB: MySQL (configurable por variables de entorno)
- Auth: OAuth2 password flow + JWT (python-jose)
- CORS middleware habilitado

## 3) Servicios del Backend (API)

Principales endpoints expuestos:

- `GET /health` → healthcheck
- `POST /uploads/` → subir archivo
- `GET /uploads/` → listar uploads (debug/soporte)
- `POST /clean/clean/preview?file_id=...` → previsualización / normalización
- `POST /clean/clean/process` → ejecutar limpieza
- `GET /clean/clean/download?file_id=...&variant=...` → descargar resultado

Auth (cuando el router está habilitado en `main.py`):

- `POST /auth/login` → devuelve `access_token`
- `POST /auth/users` → crear usuario (si está implementado en `auth.py`)
- `GET /auth/users/me` → usuario actual (requiere token)

## 4) Conexión Frontend ↔ Backend

El frontend consume el backend por HTTP usando una base URL:

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

En el frontend existe una constante `API_BASE` (ej. en `src/App.tsx`) que apunta a la URL del backend.

## 5) Comandos para correr el proyecto (local)

### Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# variables de entorno (ver sección 6)
uvicorn app.main:app --reload
```

Backend en:

- http://127.0.0.1:8000
- OpenAPI/Swagger: http://127.0.0.1:8000/docs

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Frontend en:

- http://localhost:5173

## 6) Variables de entorno (ya previstas)

### Backend
Se recomienda usar un `.env` (NO versionado). Ejemplo:

```bash
# Entorno
ENV=dev

# Seguridad
SECRET_KEY=change_me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Base de datos (MySQL)
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:3306/DB_NAME
```

Nota: si no hay `DATABASE_URL`, el backend puede quedar en modo local (dependiendo de `app/db.py`).

### Frontend
En local normalmente basta con `API_BASE` en código. Si se pasa a `.env` de Vite:

```bash
VITE_API_BASE=http://127.0.0.1:8000
```

## 7) “Embedded” y estado de producción

Este proyecto se pensó como servicio interno embebible (UI + API dentro del ecosistema interno de OP). Producción: aún depende de:

- definición del target (server interno / Kubernetes)
- variables de entorno definitivas (secrets/DB)
- hardening de auth (protección de endpoints y token en todas las llamadas)
- pipeline de build/deploy (Vite build + ASGI server)

En este punto el proyecto está operativo en local (MVP) y listo para que Desarrollo lo empaquete para producción.

## 8) Migraciones y “localización” (carpetas/condiciones)

### Migraciones de DB
Estado actual: el backend crea tablas desde modelos (SQLAlchemy) al arrancar (según `Base.metadata.create_all`).

Pendiente recomendado para producción: Alembic para migraciones versionadas.

Estructura sugerida (si se implementa):

```
backend/alembic/
backend/alembic.ini
backend/app/models.py
```

### Localización
Si se requieren textos multi-idioma (UI):

```
frontend/src/i18n/
frontend/src/locales/es.json
frontend/src/locales/en.json
```

## 9) Estructura del repo

```
GE_AutomationSystem/
  backend/
    app/
      routes/
      services/
      db.py
      main.py
      models.py
      schemas.py
  frontend/
    src/
      pages/
      App.tsx
      main.tsx
      Router.tsx
```
