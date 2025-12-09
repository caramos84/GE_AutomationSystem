import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [step, setStep] = useState("upload"); // "upload" | "preview"
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const backendBaseUrl = "http://127.0.0.1:8000";

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadToBackend = async () => {
    if (!selectedFile) {
      setUploadError("Selecciona un archivo antes de continuar.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${backendBaseUrl}/uploads/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error al subir archivo: ${response.status}`);
      }

      const data = await response.json();
      // El backend devuelve algo como { "id": 2, "filename": "Test_01.xlsx" }
      setFileId(data.id);
      setStep("preview");
    } catch (err) {
      console.error(err);
      setUploadError("No se pudo subir el archivo. Revisa el backend y vuelve a intentar.");
    } finally {
      setIsUploading(false);
    }
  };

  if (step === "preview" && fileId != null) {
    // Placeholder de pantalla 2 (la llenamos en el siguiente paso)
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h1 className="text-lg font-semibold text-slate-800 mb-2">
            Preview de archivo
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            Aquí vamos a consumir <code>/clean/preview?file_id={fileId}</code> y mostrar
            las columnas originales + normalizadas.
          </p>
          <p className="text-sm">
            <span className="font-medium text-slate-700">file_id:</span>{" "}
            <span className="font-mono text-sky-600">{fileId}</span>
          </p>

          <button
            type="button"
            className="mt-6 inline-flex items-center px-4 py-2 rounded-full border border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => setStep("upload")}
          >
            ← Volver a carga de archivo
          </button>
        </div>
      </div>
    );
  }

  // Pantalla 1: Upload
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-6xl aspect-[16/9] bg-white shadow-xl rounded-3xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>

          <div className="text-sky-700 font-semibold text-sm">
            OPDataCleaner — Ingreso de archivo
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="text-right leading-tight">
              <div className="font-semibold text-slate-700">UserName0123</div>
              <div className="text-[10px] uppercase tracking-wide">UserRole</div>
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500">
              👤
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 gap-6">
          {/* Dropzone */}
          <div
            className={`w-full h-52 max-w-3xl border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition
              ${
                isDragging
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-300 bg-slate-50"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-10 h-10 rounded-full border border-sky-500 flex items-center justify-center mb-3">
              <span className="text-sky-500 text-xl">⬆️</span>
            </div>

            <p className="text-sm text-slate-600">
              Arrastra y suelta un archivo o{" "}
              <label className="text-sky-600 font-semibold cursor-pointer underline-offset-2 hover:underline">
                elige un archivo
                <input
                  type="file"
                  className="hidden"
                  accept=".xls,.xlsx,.csv"
                  onChange={handleFileChange}
                />
              </label>{" "}
              para subirlo
            </p>

            <p className="mt-2 text-[11px] tracking-wide text-slate-400 uppercase">
              Tipos de archivos admitidos: .xls, .xlsx, .csv
            </p>

            {selectedFile && (
              <div className="mt-4 text-xs text-slate-500">
                Archivo seleccionado:{" "}
                <span className="font-semibold text-slate-700">
                  {selectedFile.name}
                </span>
              </div>
            )}
          </div>

          {/* Errores y botón de continuar */}
          {uploadError && (
            <p className="text-xs text-red-500">{uploadError}</p>
          )}

          <button
            type="button"
            onClick={handleUploadToBackend}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? "Subiendo..." : "Continuar a preview"}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 bg-slate-50">
          <span>© Omnicom Production</span>
          <span>OPDataCleaner — Módulo de ingreso de archivos</span>
        </div>
      </div>
    </div>
  );
}

export default App;

