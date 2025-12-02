import datetime
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.db import SessionLocal
from app.models import FileUpload

# Asegurar que la carpeta de uploads exista
if not os.path.exists(settings.upload_dir):
    os.makedirs(settings.upload_dir, exist_ok=True)

router = APIRouter(prefix="/uploads", tags=["uploads"])


# -------------------------------
# Dependency de DB
# -------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------
# POST /uploads/ → Subir archivo
# -------------------------------

@router.post("/")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    allowed_extensions = {"csv", "xls", "xlsx"}
    filename = file.filename or ""
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Generar nombre único
    unique_name = f"{uuid.uuid4()}.{extension}"
    storage_path = os.path.join(settings.upload_dir, unique_name)

    # Guardar archivo
    with open(storage_path, "wb") as buffer:
        contents = await file.read()
        buffer.write(contents)

    # Registrar archivo en DB
    upload_record = FileUpload(
        filename_original=filename,
        storage_path=storage_path,
        uploaded_by_user_id=None,
        uploaded_at=datetime.datetime.now(datetime.timezone.utc),
    )

    db.add(upload_record)
    db.commit()
    db.refresh(upload_record)

    return {"id": upload_record.id, "filename": filename}


# -------------------------------
# GET /uploads/ → Listar archivos subidos
# -------------------------------

@router.get("/", summary="List uploaded files")
def list_uploads(db: Session = Depends(get_db)):
    """
    Devuelve los últimos archivos subidos al sistema.
    El frontend usará esta ruta para permitir seleccionar un archivo ya cargado.
    """
    files = (
        db.query(FileUpload)
        .order_by(FileUpload.uploaded_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": f.id,
            "filename_original": f.filename_original,
            "storage_path": f.storage_path,
            "uploaded_at": f.uploaded_at,
        }
        for f in files
    ]

