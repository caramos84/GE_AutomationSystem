from app.services.clean_preview import generate_preview
from app.services.column_normalizer import normalize_columns


def build_normalization_preview(file_path: str) -> dict:
    preview = generate_preview(file_path)
    original_columns = preview["columns"]
    normalized_columns = normalize_columns(original_columns)

    return {
        "original": original_columns,
        "normalized": normalized_columns,
    }

