import { Routes, Route, Navigate } from 'react-router-dom'
import App from './App'

import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'

const isLogged = () => localStorage.getItem('isLogged') === 'true'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/app"
        element={isLogged() ? <App /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}
