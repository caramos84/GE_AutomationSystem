import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPreview, processFile, PreviewResponse, ProcessResponse } from "../../api/cleaner";

export const PreviewPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

  const [availableCols, setAvailableCols] = useState<string[]>([]);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  // Cargar preview
  useEffect(() => {
    const load = async () => {
      if (!fileId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getPreview(fileId);
        setPreviewData(data);
        const normalized = data.normalization?.normalized || [];
        setAvailableCols(normalized);
        setSelectedCols([]);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar la vista previa.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fileId]);

  // Añadir columna al orden
  const addCol = (col: string) => {
    if (selectedCols.includes(col)) return;
    setSelectedCols((prev) => [...prev, col]);
    setAvailableCols((prev) => prev.filter((c) => c !== col));
  };

  // Quitar del orden
  const removeCol = (col: string) => {
    setSelectedCols((prev) => prev.filter((c) => c !== col));
    setAvailableCols((prev) => (prev.includes(col) ? prev : [...prev, col]));
  };

  // Drag & drop
  const onDragStart = (index: number) => setDragIndex(index);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setSelectedCols((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    setDragIndex(null);
  };

  // Procesar
  const handleProcess = async () => {
    if (!fileId || selectedCols.length === 0) return;
    try {
      setProcessing(true);
      const result: ProcessResponse = await processFile(fileId, selectedCols);
      navigate(`/download/${fileId}`, {
        state: {
          processResult: result,
          selectedColumns: selectedCols,
        },
      });
    } catch (e) {
      console.error(e);
      setError("Error al procesar el archivo.");
    } finally {
      setProcessing(false);
    }
  };

  if (!fileId) {
    return <div className="text-red-600 text-sm">Falta fileId.</div>;
  }

  if (loading) return <div className="text-sm text-gray-600">Cargando…</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!previewData) {
    return <div className="text-red-600 text-sm">Sin datos de preview.</div>;
  }

  const cols = previewData.preview.columns || [];
  const sample = previewData.preview.sample || {};

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">2. Vista previa y columnas</h2>
        <p className="text-sm text-gray-600">
          Revisa la muestra y define el orden final de columnas.
        </p>
      </header>

      {/* Tabla preview */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between text-sm">
          <span className="font-medium text-gray-800">Vista previa</span>
          <span className="text-xs text-gray-500">
            Columnas: {cols.length} · Filas aprox.: {previewData.preview.rows}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {cols.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                {cols.map((c) => (
                  <td
                    key={c}
                    className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100"
                  >
                    {String(sample[c] ?? "")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Disponibles */}
        <div className="border border-dashed border-gray-300 rounded-lg bg-white p-4 min-h-[160px]">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">
              Categorías detectadas
            </h3>
            <span className="text-xs text-gray-500">Click para añadir</span>
          </div>
          {availableCols.length === 0 ? (
            <p className="text-xs text-gray-400">Sin columnas disponibles.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableCols.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => addCol(c)}
                  className="px-3 py-1 rounded-full border border-gray-300 text-xs bg-gray-50 hover:bg-gray-100 text-gray-800"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orden final */}
        <div className="border border-dashed border-gray-300 rounded-lg bg-white p-4 min-h-[160px]">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">
              Orden para el CSV
            </h3>
            <span className="text-xs text-gray-500">
              Arrastra para reordenar · Click para quitar
            </span>
          </div>
          {selectedCols.length === 0 ? (
            <p className="text-xs text-gray-400">
              Aún no has elegido columnas.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedCols.map((c, i) => (
                <div
                  key={c}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(i)}
                  className="cursor-move"
                >
                  <button
                    type="button"
                    onClick={() => removeCol(c)}
                    className="px-3 py-1 rounded-full border border-blue-400 text-xs bg-blue-50 hover:bg-blue-100 text-blue-800"
                  >
                    {i + 1}. {c}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botón procesar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleProcess}
          disabled={selectedCols.length === 0 || processing}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
            selectedCols.length === 0 || processing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {processing ? "Procesando..." : "Procesar y generar CSV limpio"}
        </button>
      </div>
    </section>
  );
};

