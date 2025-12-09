import { API_BASE_URL } from "./client";

export interface PreviewResponse {
  preview: {
    columns: string[];
    rows: number;
    sample: Record<string, any>;
  };
  normalization: {
    original: string[];
    normalized: string[];
  };
}

export interface ProcessResponse {
  rows: number;
  columns: string[];
  download_semicolon_path: string;
  download_comma_path: string;
}

export async function getPreview(fileId: string): Promise<PreviewResponse> {
  const res = await fetch(
    `${API_BASE_URL}/clean/preview?file_id=${encodeURIComponent(fileId)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Error preview");
  return res.json();
}

export async function processFile(
  fileId: string,
  columns: string[]
): Promise<ProcessResponse> {
  const res = await fetch(
    `${API_BASE_URL}/clean/process?file_id=${encodeURIComponent(fileId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columns }),
    }
  );
  if (!res.ok) throw new Error("Error process");
  return res.json();
}

