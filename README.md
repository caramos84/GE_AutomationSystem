# GE_AutomationSystem

Internal automation ecosystem for **Grupo Éxito Publications**: tools, scripts and products that reduce manual work in data preparation, design workflows and campaign production.

The first product in this ecosystem is:

> **OP DataCleaner v1.0** – a web app to analyse, clean and standardize data files used in publications (DataMerge / InDesign workflows, pricing tables, etc.).

---

# 1. Vision

GE_AutomationSystem aims to:

- Reduce operational friction in the Publications team.
- Standardize data structures across campaigns and suppliers.
- Enable new colleagues to onboard faster through guided tools instead of tribal knowledge.
- Create a reusable technical foundation (backend + frontend + data layer) for future internal products (bots, dashboards, automations, MLOps).

OP DataCleaner v1.0 is the **flagship module** that validates this approach.

---

# 2. Repository structure (monorepo)

This repository is structured as a **monorepo**:

```text

GE_AutomationSystem/
├── backend/          # Python backend (API + DataCleaner engine)
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── frontend/         # React + Fluent UI frontend (web app)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── docs/             # Documentation, diagrams, canvases, UX flows
│   ├── architecture.md
│   ├── datacleaner_flow.md
│   └── ui_mockups/
│
├── .gitignore
└── README.md         # This file

Note: at this stage only the root files may exist; backend/frontend/docs will be populated during the next development sprint.

```
---
# 3. OP DataCleaner v1.0 – Overview

## 3.1 Purpose

OP DataCleaner is a data-preparation assistant for Publications:

* Reads Excel/CSV inputs from Éxito’s commercial systems.
* Detects and displays columns as “categories”.
* Allows the user to choose which categories are relevant for a specific publication.
* Cleans and normalizes data (encodings, delimiters, decimal formats, hidden columns, etc.).
* Optionally generates standardized image file names for creative production.
* Outputs ready-to-use CSV variants (semicolon / comma) for InDesign DataMerge or other tools.
* This replaces the manual use of a config.json and local scripts with a guided web experience.

## 3.2 High level user flow

### Login & Roles
User authenticates in the app.
Role definitions (e.g. Studio, PM, Automation) will control access to advanced settings.

### File upload
Drag & drop or file picker (.xls, .xlsx, .csv).
File is stored temporarily for analysis.
Header detection & preview
First row is parsed as headers; hidden columns are detected.
Detected categories (SUBLINEA, ID CATEGORIA, PLU, PRECIO OFERTA, DESCUENTO, etc.) are displayed as draggable “chips”.

### Category selection
User drags the needed categories into a “Required fields” area (e.g. PLU, DESC PLU, PRECIO OFERTA, DESCUENTO, UNIDADES).
The rest are marked to be dropped from output.

### Optional: image name construction
User enables or disables image-name generation.
The engine builds names based on a chosen pattern (e.g. PLU + DESCRIPCION).

### Processing & output
Backend applies DataCleaner rules.
User sees the cleaned preview table.
User can download:

_SEMI.csv (semicolon delimiter, decimal comma)

_COMMA.csv (comma delimiter, decimal point)

---

# 4. Technology stack (proposed)

The stack is intentionally simple and compatible with IT constraints:

### Backend
Language: Python 3.11+
Framework: FastAPI (or equivalent micro-framework approved by IT)
DataCleaner engine: existing Python module (refactor of current DataMerge Cleaner script)
DB: PostgreSQL (preferred) or MySQL, as confirmed by IT
Auth: to be aligned with corporate SSO / internal auth

### Frontend
Framework: React
UI Library: Fluent UI (Microsoft)
Build: Vite or Create React App (to be defined)
Styling: Fluent UI tokens + custom components for Éxito Publications

### Infrastructure
Containerized services (Docker) wherever possible.
Deployment target to be validated with IT (internal server, Kubernetes cluster, or cloud environment used by OP).

---

# 5. Development workflow (local)

Note: commands below describe the intended workflow; exact scripts will be added as the backend/frontend are implemented.

## 5.1 Backend (FastAPI)
cd backend
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
Default URL: http://localhost:8000

## 5.2 Frontend (React + Fluent UI)
cd frontend
npm install
npm run dev     # or npm start, depending on tooling

``` text
Default URL: http://localhost:5173 (Vite) or http://localhost:3000 (CRA).
```
---

# 6. Configuration & environments

Sensitive configuration is never committed directly:
Each environment uses a .env file (ignored by git):
DB connection strings
Secrets / API keys
Feature flags

Example variables:
```text
APP_ENV=local
DB_ENGINE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ge_automation
DB_USER=ge_user
DB_PASSWORD=********
```

Environment-specific .env files will be managed by IT/DevOps.

---

# 7. Branching & naming convention

* main: stable branch, used for tagged releases / demos.
* dev: integration branch during development.
* feature/*: short-lived feature branches.

Example:
```
- feature/backend-engine-datacleaner
- feature/frontend-upload-screen
- feature/docs-architecture
```
Commit messages follow a simple prefix style:
```
- chore: … – maintenance / config
- feat: … – new features
- fix: … – bug fixes
- docs: … – documentation
```
---

# 8. Roadmap (high level)

Sprint – OP DataCleaner MVP
Create repository and base structure (.gitignore, SSH access).

* Define backend skeleton (FastAPI, routing, service layer).
* Integrate existing DataCleaner Python engine as internal module.
* Implement basic upload → analyze → clean → download flow.
* Create frontend mockups as functional UI (upload + mapping + preview).
* Connect frontend and backend for real file processing.
* Prepare technical demo for IT/Dev and Publications leadership.

Next steps after MVP

* Role-based access and user management.
* Preset management per publication template.
* Audit logging (who processed what/when).
* Integration with future onboarding chatbot (reuse docs & flows).
* Packaging for deployment in OP internal infrastructure.

---

# 9. Ownership

Product owner / domain lead:
OMNICOM PRODUCTION
Grupo Éxito Publications – Automation / Studio

Technical lead & maintainer (initial):
Carlos Andrés Ramos Velásquez (caramos84)

For questions or proposals about this repository or OP DataCleaner v1.0, please open an issue or contact the maintainer.
