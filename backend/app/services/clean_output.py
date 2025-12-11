from pathlib import Path
from typing import Dict, List

import pandas as pd
import unicodedata

from app.services.column_normalizer import normalize_column_name


class OutputEngineError(Exception):
    """Errores propios del motor de salida (clean output)."""
    pass


def generate_clean_outputs(
    file_path: str,
    selected_columns: List[str],
    generate_image_names: bool = False,
) -> Dict:
    """
    Genera archivos CSV limpios (semicolon y comma) a partir del archivo origen.

    - file_path: ruta al archivo original (por ejemplo 'uploads/uuid.xlsx')
    - selected_columns: lista de nombres NORMALIZADOS que el usuario eligió
      (por ejemplo ['PLU', 'DESC_PLU', 'PRECIO_OFERTA'])
    - generate_image_names: si True, intenta crear columna IMAGEN.

    Retorna:
      {
        "rows": <int>,
        "columns": [lista de columnas finales],
        "semicolon_path": "outputs/..._SEMICOLON.csv",
        "comma_path": "outputs/..._COMMA.csv",
      }

    Lanza:
      FileNotFoundError, OutputEngineError
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Source file not found: {file_path}")

    # 1) Cargar archivo con pandas
    suffix = path.suffix.lower()
    if suffix in {".xlsx", ".xls"}:
        df = pd.read_excel(path)
    elif suffix == ".csv":
        df = pd.read_csv(path)
    else:
        raise OutputEngineError(f"Unsupported file type: {suffix}")

    if df.empty:
        raise OutputEngineError("Source file is empty")

    # 2) Mapa de columnas normalizadas -> nombre original
    normalized_map: Dict[str, str] = {}
    for col in df.columns:
        norm = normalize_column_name(str(col))
        # si se repite una normalización, conservamos la primera
        if norm not in normalized_map:
            normalized_map[norm] = col

    # 3) Verificar que todas las columnas seleccionadas existen
    missing = [name for name in selected_columns if name not in normalized_map]
    if missing:
        raise OutputEngineError(
            f"Columns not present in source file: {', '.join(missing)}"
        )

    # 4) Construir DataFrame de salida con cabeceras NORMALIZADAS
    result_columns: List[str] = []
    result_data: Dict[str, pd.Series] = {}

    for norm_name in selected_columns:
        source_col = normalized_map[norm_name]
        result_columns.append(norm_name)
        result_data[norm_name] = df[source_col]

    result_df = pd.DataFrame(result_data, columns=result_columns)

# 5) (Opcional) Columna de nombre de imagen
    if generate_image_names:
        required = ["PLU", "ID_MARCA", "DESC_PLU", "CONTENIDO"]
        if all(col in result_df.columns for col in required):
            # Función auxiliar para quitar acentos
            def remove_accents(text):
                import unicodedata
                nfkd = unicodedata.normalize('NFKD', str(text))
                return ''.join([c for c in nfkd if not unicodedata.combining(c)])
            
            result_df["IMAGEN"] = (
                result_df["PLU"].astype(str).str.zfill(6)
                + "_"
                + result_df["ID_MARCA"]
                .astype(str)
                .apply(remove_accents)
                .str.replace(r"\s+", "_", regex=True)
                .str.upper()
                + "_"
                + result_df["DESC_PLU"]
                .astype(str)
                .apply(remove_accents)
                .str.replace(r"\s+", "_", regex=True)
                .str.upper()
                + "_"
                + result_df["CONTENIDO"]
                .astype(str)
                .apply(remove_accents)
                .str.replace(r"\s+", "_", regex=True)
                .str.upper()
                + ".psd"
            )
            if "IMAGEN" not in result_columns:
                result_columns.append("IMAGEN")

    # 6) Guardar CSVs de salida
    outputs_dir = Path("outputs")
    outputs_dir.mkdir(exist_ok=True)

    base_name = path.stem
    semicolon_path = outputs_dir / f"{base_name}_SEMICOLON.csv"
    comma_path = outputs_dir / f"{base_name}_COMMA.csv"

    result_df.to_csv(semicolon_path, sep=";", index=False)
    result_df.to_csv(comma_path, sep=",", index=False)

    return {
        "rows": int(result_df.shape[0]),
        "columns": result_columns,
        "semicolon_path": str(semicolon_path),
        "comma_path": str(comma_path),
    }

