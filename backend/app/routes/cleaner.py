from pathlib import Path
from typing import List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import FileUpload
from app.services.clean_preview import generate_preview
from app.services.clean_normalize import build_normalization_preview
from app.services.column_normalizer import normalize_column_name

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

    path = Path(file.storage_path)
    if not path.exists():
        raise HTTPException(
            status_code=500, detail="Stored file not found on disk"
        )

    # 2) Cargar el archivo con pandas
    suffix = path.suffix.lower()
    if suffix in {".xlsx", ".xls"}:
        df = pd.read_excel(path)
    elif suffix == ".csv":
        df = pd.read_csv(path)
    else:
        raise HTTPException(
            status_code=400, detail=f"Unsupported file type: {suffix}"
        )

    if df.empty:
        raise HTTPException(status_code=400, detail="Source file is empty")

    # 3) Mapear columnas del archivo -> nombres normalizados
    normalized_map = {}
    for col in df.columns:
        norm = normalize_column_name(str(col))
        if norm not in normalized_map:
            normalized_map[norm] = col

    # 4) Verificar que todas las columnas pedidas existen
    missing = [name for name in payload.columns if name not in normalized_map]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Columns not present in source file: {', '.join(missing)}",
        )

    # 5) Construir DataFrame de salida, con cabeceras NORMALIZADAS
    result_columns = []
    result_data = {}
    for norm_name in payload.columns:
        source_col = normalized_map[norm_name]
        result_columns.append(norm_name)
        result_data[norm_name] = df[source_col]

    result_df = pd.DataFrame(result_data, columns=result_columns)

    # 6) (Opcional) Crear columna de nombre de imagen
    if payload.generate_image_names:
        required = ["PLU", "DESC_PLU", "DESC_MARCA"]
        if all(col in result_df.columns for col in required):
            result_df["IMAGEN"] = (
                result_df["PLU"].astype(str).str.zfill(6)
                + "_"
                + result_df["DESC_PLU"]
                .astype(str)
                .str.replace(r"\s+", "", regex=True)
                + "_"
                + result_df["DESC_MARCA"]
                .astype(str)
                .str.replace(r"\s+", "", regex=True)
                + ".PSD"
            )

    # 7) Guardar CSVs de salida
    outputs_dir = Path("outputs")
    outputs_dir.mkdir(exist_ok=True)

    base_name = path.stem
    semicolon_path = outputs_dir / f"{base_name}_SEMICOLON.csv"
    comma_path = outputs_dir / f"{base_name}_COMMA.csv"

    result_df.to_csv(semicolon_path, sep=";", index=False)
    result_df.to_csv(comma_path, sep=",", index=False)

    # 8) Respuesta para que el frontend pinte la Screen 03
    return {
        "rows": int(result_df.shape[0]),
        "columns": result_columns,
        "download_semicolon_path": str(semicolon_path),
        "download_comma_path": str(comma_path),
    }

