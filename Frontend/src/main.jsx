import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './Routes'
import './index.css'
import { ThemeProvider } from "next-themes"
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { NotificationProvider } from './components/ui/notification'
import { ConfirmDialogProvider } from './components/ui/confirm-dialog'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="light">
          <NotificationProvider>
            <ConfirmDialogProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </ConfirmDialogProvider>
          </NotificationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
