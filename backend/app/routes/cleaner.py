from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import FileUpload
from app.services.clean_preview import generate_preview
from app.services.clean_normalize import build_normalization_preview

router = APIRouter(prefix="/clean", tags=["clean"])


@router.post("/preview")
def preview_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    preview = generate_preview(file.storage_path)
    normalization = build_normalization_preview(file.storage_path)

    return {
        "preview": preview,
        "normalization": normalization,
    }


@router.post("/normalize")
def normalize_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    normalization = build_normalization_preview(file.storage_path)
    return normalization

