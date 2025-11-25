# Backend Setup

## Crear entorno virtual
1. Ubica una terminal en el directorio `backend/`.
2. Crea el entorno virtual:
   ```bash
   python3 -m venv .venv
   ```
3. Activa el entorno virtual:
   - En Linux/macOS:
     ```bash
     source .venv/bin/activate
     ```
   - En Windows (PowerShell):
     ```powershell
     .venv\\Scripts\\Activate.ps1
     ```

## Instalar dependencias
Con el entorno virtual activo, instala los requirements:
```bash
pip install -r requirements.txt
```

## Ejecutar la aplicación
Desde el directorio `backend/` con el entorno virtual activo:
```bash
uvicorn app.main:app --reload
```
