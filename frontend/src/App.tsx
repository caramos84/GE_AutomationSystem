import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

type Step = 'upload' | 'preview' | 'result'

interface PreviewData {
  columns: string[]
  normalized?: string[]
  sample_rows: any[][]
}

interface ProcessedData {
  file_id: number
  filename: string
}

function App() {
  const [step, setStep] = useState<Step>('upload')
  const [fileId, setFileId] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [generateNames, setGenerateNames] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PASO 1: Subir archivo
  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File
    
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/uploads/`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al subir el archivo')

      const data = await res.json()
      setFileId(data.id)
      setFileName(data.original_filename)
      
      // Obtener preview
      await loadPreview(data.id)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Cargar preview del archivo
  const loadPreview = async (id: number) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/clean/clean/preview?file_id=${id}`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Error al cargar preview')

	const data = await res.json()
	const previewData = { 
 	 columns: data.preview.columns,
 	 normalized: data.normalization.normalized,
 	 sample_rows: [] 
}
setPreview(previewData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar preview')
    } finally {
      setLoading(false)
    }
  }

  // Seleccionar/deseleccionar columna
  const toggleColumn = (col: string) => {
    setSelectedColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    )
  }

  // PASO 2: Procesar archivo
  const handleProcess = async () => {
    if (!fileId || selectedColumns.length === 0) {
      setError('Debes seleccionar al menos una columna')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/clean/clean/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId,
	  columns: preview?.normalized || selectedColumns,
          generate_image_names: generateNames,
        }),
      })

      if (!res.ok) throw new Error('Error al procesar el archivo')

      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  // PASO 3: Descargar CSV
  const handleDownload = (variant: 'semicolon' | 'comma') => {
    if (!fileId) return
    window.open(`${API_BASE}/clean/clean/download?file_id=${fileId}&variant=${variant}`, '_blank')
  }

  // Reiniciar app
  const handleReset = () => {
    setStep('upload')
    setFileId(null)
    setFileName('')
    setPreview(null)
    setSelectedColumns([])
    setGenerateNames(false)
    setError(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: '#667eea',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            OP
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>DataCleaner</span>
        </div>
        <div style={{ color: '#666' }}>
          <span style={{ fontSize: '0.9rem' }}>UserName0123</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Subir Archivo</h2>

<form 
  onSubmit={handleFileUpload}
  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
  onDrop={(e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const label = document.querySelector('label[for="file"]');
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(files[0]);
        input.files = dt.files;
        if (label) label.textContent = files[0].name;
      }
    }
  }}
>            
              <div style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '3rem',
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Arrastra y suelta o <label htmlFor="file" style={{ color: '#667eea', cursor: 'pointer', textDecoration: 'underline' }}>elige un archivo</label> para subirlo
                </p>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".xls,.xlsx,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const label = document.querySelector('label[for="file"]')
                    if (label && e.target.files?.[0]) {
                      label.textContent = e.target.files[0].name
                    }
                  }}
                />
                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem' }}>
                  Tipos de archivos admitidos: .xls, .xlsx, .csv
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Subiendo...' : 'Subir y Analizar'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PREVIEW Y MAPEO */}
        {step === 'preview' && preview && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Resultado de análisis</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Archivo detectado: <strong>{fileName}</strong>
            </p>

            {/* Preview Table */}
            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem'
              }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    {preview.columns.map(col => (
                      <th key={col} style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '2px solid #ddd',
                        fontWeight: 'bold'
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sample_rows.slice(0, 15).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: '0.75rem', color: '#666' }}>
                          {cell || 'Dato Celda'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Categorías Detectadas */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Categorías detectadas</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Arrastra o haz click en las categorías que necesitas para tu CSV, las demás serán limpiadas por OPDC
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                {preview.columns.map(col => (
                  <button
                    key={col}
                    onClick={() => toggleColumn(col)}
                    style={{
                      padding: '0.75rem',
                      border: selectedColumns.includes(col) ? '2px solid #667eea' : '2px solid #ddd',
                      borderRadius: '8px',
                      background: selectedColumns.includes(col) ? '#f0f4ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: selectedColumns.includes(col) ? 'bold' : 'normal',
                      color: selectedColumns.includes(col) ? '#667eea' : '#333'
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Columnas Seleccionadas */}
            {selectedColumns.length > 0 && (
              <div style={{
                background: '#f9f9f9',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Categorías que necesitas</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Arrastra o haz click aquí las categorías para construir el archivo nuevo, de estar vacío, no se activará la opción de "Procesar"
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {selectedColumns.map(col => (
                    <span
                      key={col}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {col}
                      <button
                        onClick={() => toggleColumn(col)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Opción de Generar Nombres */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={generateNames}
                  onChange={(e) => setGenerateNames(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Crear nombres de imágenes de productos</span>
              </label>
              {generateNames && (
                <p style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginTop: '0.5rem',
                  marginLeft: '1.5rem'
                }}>
                  De estar activa esta casilla se creará el nombre, basado en PLU, Descripción subcategoría y Marca.
                </p>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'white',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleProcess}
                disabled={loading || selectedColumns.length === 0}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: (loading || selectedColumns.length === 0) ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (loading || selectedColumns.length === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Procesando...' : 'PROCESAR'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTADO Y DESCARGA */}
        {step === 'result' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '1rem' }}>Resultado de limpieza de datos</h2>
            <p style={{ color: '#666', marginBottom: '3rem' }}>
              Salida base: <strong>{fileName}</strong>
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => handleDownload('semicolon')}
                style={{
                  padding: '1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Descargar_SEMI.CSV
              </button>
              <button
                onClick={() => handleDownload('comma')}
                style={{
                  padding: '1.5rem',
                  background: '#764ba2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Descargar_COMMA.CSV
              </button>
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '2rem'
            }}>
              Opciones de descarga: Generadas como archivo .csv en puntos y comas o comas
            </p>

            <button
              onClick={handleReset}
              style={{
                padding: '1rem 2rem',
                background: 'white',
                border: '2px solid #667eea',
                color: '#667eea',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Subir Otro Archivo
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
