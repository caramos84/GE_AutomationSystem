# OP DataCleaner — Backend (FastAPI)

Backend del módulo **OP DataCleaner v1.0**, responsable de:

- Subir y almacenar archivos CSV/XLSX  
- Registrar uploads en base de datos  
- Generar preview de columnas y sample  
- Normalizar columnas  
- Reordenar columnas  
- Generar archivos limpios para DataMerge en InDesign  
- Permitir descarga de los archivos procesados  

---

# 1. Requerimientos

- Python 3.10+  
- macOS / Linux / Windows  
- Git  
- FastAPI + Uvicorn  

---

# 2. Crear y activar entorno virtual

Desde el directorio `backend/`:

```bash
python3 -m venv .venv

