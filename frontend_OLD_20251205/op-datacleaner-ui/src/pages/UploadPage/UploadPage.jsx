import React, { useState } from "react";
import { API_BASE_URL } from "../../api/client";

export function UploadPage() {
  const [error, setError] = useState(null);
  const [fileId, setFileId] = useState(null);

  async function handleChange(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError(null);
      setFileId(null);

      const res = await fetch(`${API_BASE_URL}/uploads/`, {
        method: "POST",
        body: formData
      });

      const text = await res.text();            // 👈 debug
      console.log("RAW RESPONSE:", text);       // 👈 debug

      if (!res.ok) {
        throw new Error("Upload error");
      }

      const data = JSON.parse(text);            // 👈 convertimos
      setFileId(data.id || data.file_id || null);

    } catch (e) {
      console.error(e);
      setError("No se pudo subir el archivo");
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>OP DataCleaner · Subir archivo</h1>

      <input type="file" onChange={handleChange} style={{ marginTop: "24px" }} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {fileId && <p style={{ color: "green" }}>ID recibido: {fileId}</p>}
    </div>
  );
}

