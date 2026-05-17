import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Wake up Render free-tier backend on every page load (fire-and-forget)
const _backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
fetch(`${_backendBase}/health`).catch(() => {});

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <App />
  </GoogleOAuthProvider>,
)
