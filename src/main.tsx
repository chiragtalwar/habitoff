import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { HabitsProvider } from './contexts/HabitsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <HabitsProvider>
        <App />
      </HabitsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
