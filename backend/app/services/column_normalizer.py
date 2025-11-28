"""Utility functions to normalize column names."""

import re
import unicodedata
from typing import List


def _remove_diacritics(value: str) -> str:
    """Return the string without diacritical marks."""
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def normalize_column_name(name: str) -> str:
    """Normalize a column name to use only uppercase letters, numbers, and underscores."""

    text = _remove_diacritics(name)
    text = re.sub(r"[\r\n]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.upper()
    text = text.replace(" ", "_")
    text = re.sub(r"[^A-Z0-9_]", "", text)
    return text


def normalize_columns(columns: List[str]) -> List[str]:
    """Normalize a list of column names."""
    return [normalize_column_name(column) for column in columns]
