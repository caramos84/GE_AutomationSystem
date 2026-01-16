import os
from pathlib import Path
from typing import List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import FileUpload
from app.services.clean_preview import generate_preview
from app.services.clean_normalize import build_normalization_preview
from app.services.column_normalizer import normalize_column_name
from app.services.clean_output import generate_clean_outputs, OutputEngineError

router = APIRouter(prefix="/clean", tags=["clean"])


# ---------- Modelo de entrada para el procesado ----------


class CleanProcessRequest(BaseModel):
    file_id: int
    # nombres NORMALIZADOS (PLU, DESC_PLU, PRECIO_OFERTA, etc.)
    columns: List[str]
    generate_image_names: bool = False


# ---------- Preview (lo que ya teníamos) ----------


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


# ---------- Process: genera CSV limpio + rutas de descarga ----------


@router.post("/process")
def process_file(payload: CleanProcessRequest, db: Session = Depends(get_db)):
    # 1) Buscar archivo en la DB
    file = db.query(FileUpload).filter(FileUpload.id == payload.file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # 2) Llamar al motor de salida
    try:
        result = generate_clean_outputs(
            file_path=file.storage_path,
            selected_columns=payload.columns,
            generate_image_names=payload.generate_image_names,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=500, detail="Stored file not found on disk"
        )
    except OutputEngineError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    # 3) Adaptar la respuesta al formato que ya usábamos
    return {
        "rows": result["rows"],
        "columns": result["columns"],
        "download_semicolon_path": result["semicolon_path"],
        "download_comma_path": result["comma_path"],
    }

@router.get("/download", summary="Download cleaned output CSV")
def download_clean(
    file_id: int,
    variant: str = "semicolon",
    db: Session = Depends(get_db),
):
    """
    Devuelve el CSV limpio para descarga.

    - file_id: ID del FileUpload original
    - variant: 'semicolon' o 'comma'
    """
    file = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    inputs_path = Path(file.storage_path)
    stem = inputs_path.stem  # mismo que usamos en generate_clean_outputs

    outputs_dir = Path("outputs")

    if variant == "semicolon":
        output_path = outputs_dir / f"{stem}_SEMICOLON.csv"
    elif variant == "comma":
        output_path = outputs_dir / f"{stem}_COMMA.csv"
    else:
        raise HTTPException(
            status_code=400,
            detail="variant must be 'semicolon' or 'comma'",
        )

    if not output_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Cleaned file not found. Did you run /clean/process?",
        )

    return FileResponse(
        path=str(output_path),
        media_type="text/csv; charset=utf-8",
        filename=os.path.basename(output_path),
    )

