from fastapi import APIRouter, HTTPException
from app.services.clean_preview import generate_preview
from app.db import SessionLocal
from app.models import FileUpload

router = APIRouter()

@router.post("/preview")
def preview_file(file_id: int):
    db = SessionLocal()

    # Buscar el archivo en la DB
    record = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    # Obtener la ruta real del archivo
    file_path = record.storage_path

    # Llamar al motor de preview
    try:
        preview = generate_preview(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return preview

