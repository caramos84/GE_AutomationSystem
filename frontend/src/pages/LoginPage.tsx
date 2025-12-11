import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

interface LoginPageProps {
  onLoginSuccess: (token: string) => void
}

const Logo = () => (
  <svg width="64" height="64" viewBox="0 0 288.75 231.97" xmlns="http://www.w3.org/2000/svg">
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

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Error al iniciar sesión')
      }

      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      onLoginSuccess(data.access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      ...baseStyle,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0088FF 0%, #004AC6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '3rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo y título */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <Logo />
          <h1 style={{
            ...baseStyle,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1A1A1A',
            marginTop: '1rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#0088FF' }}>OP</span>DataCleaner
          </h1>
          <p style={{
            ...baseStyle,
            fontSize: '0.875rem',
            color: '#6B7280',
            textAlign: 'center'
          }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            ...baseStyle,
            background: '#FEE2E2',
            color: '#991B1B',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            border: '1px solid #FCA5A5'
          }}>
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              ...baseStyle,
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1A1A1A',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              style={{
                ...baseStyle,
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0088FF'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              ...baseStyle,
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1A1A1A',
              marginBottom: '0.5rem'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                ...baseStyle,
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0088FF'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...baseStyle,
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#E5E7EB' : '#0088FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
