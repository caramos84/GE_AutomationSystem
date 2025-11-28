from pathlib import Path
from typing import Dict, List

import pandas as pd


def generate_preview(file_path: str) -> dict:
    """
    Generate a preview of the provided CSV or Excel file.

    Args:
        file_path: Path to a CSV or Excel file.

    Returns:
        A dictionary containing the column names, row count, and the first row as a sample.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the file type is unsupported or the file is empty.
    """

    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()

    if suffix in {".xlsx", ".xls"}:
        data_frame = pd.read_excel(path)
    elif suffix == ".csv":
        data_frame = pd.read_csv(path)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    if data_frame.empty:
        raise ValueError("File is empty")

    columns: List[str] = list(data_frame.columns)
    rows: int = len(data_frame)
    sample: Dict = data_frame.iloc[0].to_dict()

    return {
        "columns": columns,
        "rows": rows,
        "sample": sample,
    }
