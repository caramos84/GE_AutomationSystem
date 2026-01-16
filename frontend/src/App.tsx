import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

type Step = 'upload' | 'preview' | 'result'

interface PreviewData {
  columns: string[]
  normalized?: string[]
  columnMap?: { [key: string]: string }
  sample_rows: any[][]
}

// Logo real del proyecto
const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 288.75 231.97" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="144.37" y1="231.97" x2="144.37" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#003a99"/>
        <stop offset="1" stopColor="#004ac6"/>
      </linearGradient>
      <linearGradient id="grad2" x1="124.52" y1="120.64" x2="263.88" y2="120.64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0088FF"/>
        <stop offset="1" stopColor="#72c4ff"/>
      </linearGradient>
    </defs>
    <path fill="url(#grad1)" d="M288.74,206.39c-1.09,13.4-12.14,24.48-25.57,25.57H25.52c-14.43-1.51-24.11-12.54-25.52-26.77V26.77C1.41,13.58,9.41,3.5,22.42.32l241.88-.32c12.81.99,23.38,12.96,24.44,25.57v180.82Z"/>
    <path fill="#a1d7ff" d="M39.18,63.72l151.2-.03c15.56-1.47,14.33-22.05-1.13-22.74l-152.05.26c-13.46,3.83-12.09,20.8,1.99,22.5Z"/>
    <path fill="#72c4ff" d="M39.11,120.74l99.76-.03c15.56-1.47,14.33-22.05-1.13-22.74l-100.61.26c-13.46,3.83-12.09,20.8,1.99,22.5Z"/>
    <path fill="#0088FF" d="M90.94,158.47l-53.82.26c-13.46,3.83-12.09,20.8,1.99,22.5l52.96-.03c15.56-1.47,14.33-22.05-1.13-22.74Z"/>
    <path fill="url(#grad2)" d="M245.75,42.58c-3.42.79-9.97,8.22-12.75,11.11-36.79,38.11-71.69,80.81-106.89,120.43-7.61,16.65,13.88,32.65,27.94,21.12l107.05-130.51c7.63-11.49-1.4-25.37-15.34-22.15Z"/>
  </svg>
)

function App() {
  const [step, setStep] = useState<Step>('upload')
  const [fileId, setFileId] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [generateNames, setGenerateNames] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      
      await loadPreview(data.id)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const loadPreview = async (id: number) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/clean/clean/preview?file_id=${id}`, {
        method: 'POST',
	headers: {
	'Accept': 'application/json; charset=utf-8',
	},
      })

      if (!res.ok) throw new Error('Error al cargar preview')

      const data = await res.json()
      const columnMap: { [key: string]: string } = {}
      data.preview.columns.forEach((col: string, i: number) => {
        columnMap[col] = data.normalization.normalized[i]
      })

      const previewData = { 
        columns: data.preview.columns,
        normalized: data.normalization.normalized,
        columnMap: columnMap,
        sample_rows: [] 
      }
      setPreview(previewData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar preview')
    } finally {
      setLoading(false)
    }
  }

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    )
  }

  const handleProcess = async () => {
    if (!fileId || selectedColumns.length === 0) {
      setError('Debes seleccionar al menos una columna')
      return
    }

    setLoading(true)
    setError(null)

    const columnsToSend = selectedColumns.map(col => preview?.columnMap?.[col] || col)

    console.log('=== DEBUG COLUMNAS ===')
    console.log('selectedColumns:', selectedColumns)
    console.log('columnMap:', preview?.columnMap)
    console.log('columnsToSend:', columnsToSend)
    console.log('generateNames:', generateNames)

    try {
      const res = await fetch(`${API_BASE}/clean/clean/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId,
          columns: columnsToSend,
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

  const handleDownload = (variant: 'semicolon' | 'comma') => {
    if (!fileId) return
    window.open(`${API_BASE}/clean/clean/download?file_id=${fileId}&variant=${variant}`, '_blank')
  }

  const handleReset = () => {
    setStep('upload')
    setFileId(null)
    setFileName('')
    setPreview(null)
    setSelectedColumns([])
    setGenerateNames(false)
    setError(null)
  }

  const baseStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }

  return (
    <div style={{ 
      ...baseStyle,
      minHeight: '100vh', 
      background: '#FFFFFF'
    }}>
      {/* Header */}
      <header style={{
        ...baseStyle,
        background: '#FFFFFF',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo />
          <span style={{ 
            ...baseStyle,
            fontSize: '1.25rem', 
            fontWeight: 600,
            color: '#1A1A1A'
          }}>
            <span style={{ color: '#0088FF' }}>OP</span>DataCleaner
          </span>
        </div>
        <div style={{ 
          ...baseStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.125rem'
        }}>
          <span style={{ 
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#0088FF'
          }}>
            UserName0123
          </span>
          <span style={{ 
            fontSize: '0.75rem',
            color: '#6B7280'
          }}>
            User/Role
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        ...baseStyle,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {error && (
          <div style={{
            ...baseStyle,
            background: '#FEE2E2',
            color: '#991B1B',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            border: '1px solid #FCA5A5'
          }}>
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div style={{
            ...baseStyle,
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '3rem',
            border: '1px solid #E5E7EB'
          }}>
            <h2 style={{ 
              ...baseStyle,
              marginBottom: '2rem', 
              textAlign: 'center',
              color: '#1A1A1A',
              fontSize: '1.5rem',
              fontWeight: 600
            }}>Subir Archivo</h2>
            
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
                ...baseStyle,
                border: '2px dashed #72C4FF',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                marginBottom: '2rem',
                background: '#F8FCFF',
                transition: 'all 0.2s'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                <p style={{ 
                  ...baseStyle,
                  marginBottom: '1rem', 
                  color: '#6B7280',
                  fontSize: '0.9375rem'
                }}>
                  Arrastra y suelta o{' '}
                  <label 
                    htmlFor="file" 
                    style={{ 
                      ...baseStyle,
                      color: '#0088FF', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      fontWeight: 500
                    }}
                  >
                    elige un archivo
                  </label>
                  {' '}para subirlo
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
                <p style={{ 
                  ...baseStyle,
                  fontSize: '0.8125rem', 
                  color: '#9CA3AF', 
                  marginTop: '1rem' 
                }}>
                  Tipos de archivos admitidos: .xls, .xlsx, .csv
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...baseStyle,
                  width: '100%',
                  padding: '1rem',
                  background: loading ? '#E5E7EB' : '#0088FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
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
            ...baseStyle,
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #E5E7EB'
          }}>
            <h2 style={{ 
              ...baseStyle,
              marginBottom: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1A1A1A'
            }}>Resultado de análisis</h2>
            <p style={{ 
              ...baseStyle,
              color: '#6B7280', 
              marginBottom: '2rem',
              fontSize: '0.875rem'
            }}>
              Archivo detectado: <strong style={{ color: '#1A1A1A' }}>{fileName}</strong>
            </p>

            {/* Preview Table */}
            <div style={{ 
              overflowX: 'auto', 
              marginBottom: '2rem',
              border: '1px solid #E5E7EB',
              borderRadius: '12px'
            }}>
              <table style={{
                ...baseStyle,
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem'
              }}>
                <thead>
                  <tr style={{ background: '#F8FCFF' }}>
                    {preview.columns.map(col => (
                      <th key={col} style={{
                        ...baseStyle,
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: 600,
                        color: '#0088FF',
                        fontSize: '0.8125rem'
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sample_rows.slice(0, 15).map((row, i) => (
                    <tr 
                      key={i} 
                      style={{ 
                        borderBottom: '1px solid #F3F4F6',
                        background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC'
                      }}
                    >
                      {row.map((cell, j) => (
                        <td key={j} style={{ 
                          ...baseStyle,
                          padding: '0.75rem', 
                          color: '#6B7280',
                          fontSize: '0.8125rem'
                        }}>
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
              <h3 style={{ 
                ...baseStyle,
                marginBottom: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1A1A1A'
              }}>Categorías detectadas</h3>
              <p style={{ 
                ...baseStyle,
                color: '#6B7280', 
                fontSize: '0.875rem', 
                marginBottom: '1rem' 
              }}>
                Arrastra o haz click en las categorías que necesitas para tu CSV, las demás serán limpiadas por OPDC
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.75rem'
              }}>
                {preview.columns.map(col => (
                  <button
                    key={col}
                    onClick={() => toggleColumn(col)}
                    style={{
                      ...baseStyle,
                      padding: '0.875rem 1rem',
                      border: selectedColumns.includes(col) 
                        ? '2px solid #0088FF' 
                        : '1px solid #E5E7EB',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: selectedColumns.includes(col) ? 600 : 500,
                      color: selectedColumns.includes(col) 
                        ? '#0088FF' 
                        : '#1A1A1A',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem'
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
                ...baseStyle,
                background: '#F8FCFF',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid #A1D7FF'
              }}>
                <h3 style={{ 
                  ...baseStyle,
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#1A1A1A'
                }}>Categorías que necesitas</h3>
                <p style={{ 
                  ...baseStyle,
                  fontSize: '0.8125rem', 
                  color: '#6B7280', 
                  marginBottom: '1rem' 
                }}>
                  Arrastra o haz click aquí las categorías para construir el archivo nuevo
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
                        ...baseStyle,
                        padding: '0.5rem 1rem',
                        background: '#0088FF',
                        color: '#FFFFFF',
                        borderRadius: '9999px',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500
                      }}
                    >
                      {col}
                      <button
                        onClick={() => toggleColumn(col)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '1.125rem',
                          padding: 0,
                          lineHeight: 1,
                          fontWeight: 600
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
              {(() => {
		const required = ['PLU', 'ID MARCA', 'DESC PLU', 'CONTENIDO']
                const missingCols = required.filter(col => !selectedColumns.includes(col))
                const canGenerateNames = missingCols.length === 0
                
                return (
                  <>
                    <label style={{
                      ...baseStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      cursor: canGenerateNames ? 'pointer' : 'not-allowed',
                      opacity: canGenerateNames ? 1 : 0.5
                    }}>
                      <input
                        type="checkbox"
                        checked={generateNames && canGenerateNames}
                        onChange={(e) => canGenerateNames && setGenerateNames(e.target.checked)}
                        disabled={!canGenerateNames}
                        style={{ 
                          width: '18px', 
                          height: '18px',
                          accentColor: '#0088FF',
                          cursor: canGenerateNames ? 'pointer' : 'not-allowed'
                        }}
                      />
                      <span style={{ 
                        ...baseStyle,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#1A1A1A'
                      }}>
                        Crear nombres de imágenes de productos
                      </span>
                    </label>
                    
                    {!canGenerateNames && (
                      <p style={{
                        ...baseStyle,
                        fontSize: '0.8125rem',
                        color: '#991B1B',
                        marginTop: '0.5rem',
                        marginLeft: '1.625rem',
                        background: '#FEE2E2',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #FCA5A5'
                      }}>
                        ⚠️ Para generar nombres necesitas seleccionar: {missingCols.join(', ')}
                      </p>
                    )}
                    
                    {generateNames && canGenerateNames && (
                      <p style={{
                        ...baseStyle,
                        fontSize: '0.8125rem',
                        color: '#6B7280',
                        marginTop: '0.5rem',
                        marginLeft: '1.625rem'
                      }}>
			De estar activa esta casilla se creará el nombre con formato: PLU_ID MARCA_DESC PLU_CONTENIDO.psd
                      </p>
                    )}
                  </>
                )
              })()}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleReset}
                style={{
                  ...baseStyle,
                  flex: 1,
                  padding: '1rem',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  transition: 'all 0.2s',
                  fontSize: '0.9375rem'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleProcess}
                disabled={loading || selectedColumns.length === 0}
                style={{
                  ...baseStyle,
                  flex: 1,
                  padding: '1rem',
                  background: (loading || selectedColumns.length === 0) 
                    ? '#E5E7EB' 
                    : '#0088FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (loading || selectedColumns.length === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  fontSize: '0.9375rem'
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
            ...baseStyle,
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ 
              ...baseStyle,
              marginBottom: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1A1A1A'
            }}>Resultado de limpieza de datos</h2>
            <p style={{ 
              ...baseStyle,
              color: '#6B7280', 
              marginBottom: '3rem',
              fontSize: '0.875rem'
            }}>
              Salida base: <strong style={{ color: '#1A1A1A' }}>{fileName}</strong>
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
                  ...baseStyle,
                  padding: '1.5rem',
                  background: '#0088FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                Descargar_SEMI.CSV
              </button>
              <button
                onClick={() => handleDownload('comma')}
                style={{
                  ...baseStyle,
                  padding: '1.5rem',
                  background: '#004AC6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                Descargar_COMMA.CSV
              </button>
            </div>

            <p style={{
              ...baseStyle,
              fontSize: '0.875rem',
              color: '#6B7280',
              marginBottom: '2rem'
            }}>
              Opciones de descarga: Generadas como archivo .csv en puntos y comas o comas
            </p>

            <button
              onClick={handleReset}
              style={{
                ...baseStyle,
                padding: '1rem 2rem',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#1A1A1A',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
                fontSize: '0.9375rem'
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
