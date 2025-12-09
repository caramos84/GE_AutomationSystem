import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { ProcessResponse } from "../../api/cleaner";

interface LocationState {
  processResult?: ProcessResponse;
  selectedColumns?: string[];
}

export const DownloadPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const result = state.processResult;
  const selectedColumns = state.selectedColumns || [];

  if (!fileId) {
    return (
      <div className="text-red-600 text-sm">
        No se encontró el identificador de archivo.
      </div>
    );
  }

  const handleDownload = (variant: "semicolon" | "comma") => {
    const url = `${API_BASE_URL}/clean/download?file_id=${encodeURIComponent(
      fileId
    )}&variant=${variant}`;
    window.open(url, "_blank");
  };

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">
          3. Resultados y descarga
        </h2>
        <p className="text-sm text-gray-600">
          Descarga el CSV limpio con el separador que necesites.
        </p>
      </header>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Resumen del procesamiento
        </h3>

        {result ? (
          <>
            <p className="text-sm text-gray-700">
              Filas procesadas:{" "}
              <span className="font-semibold">{result.rows}</span>
            </p>
            <p className="text-sm text-gray-700">
              Columnas en el CSV:{" "}
              <span className="font-semibold">
                {result.columns.length}
              </span>
            </p>

            {selectedColumns.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Orden de columnas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedColumns.map((col, index) => (
                    <span
                      key={col}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs border border-gray-300"
                    >
                      {index + 1}. {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500">
            No hay datos de resumen (probablemente entraste directo a esta
            URL). Aun así puedes descargar los archivos.
          </p>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Descargar CSV limpio
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleDownload("semicolon")}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Descargar CSV ; (punto y coma)
          </button>

          <button
            type="button"
            onClick={() => handleDownload("comma")}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Descargar CSV , (coma)
          </button>
        </div>
      </div>
    </section>
  );
};

