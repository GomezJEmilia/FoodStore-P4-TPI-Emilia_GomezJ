import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from '@/App'
import { queryClient } from '@/shared/api/queryClient'
import { setupInterceptors } from '@/shared/api/setupInterceptors'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import './index.css'

const quitarInterceptor = setupInterceptors(() => useAuthStore.getState().limpiarSesion())
function aplicarTema(darkMode: boolean) { document.documentElement.classList.toggle('dark', darkMode) }
aplicarTema(useThemeStore.getState().darkMode)
const cancelarSuscripcion = useThemeStore.subscribe((estado) => aplicarTema(estado.darkMode))
if (import.meta.hot) import.meta.hot.dispose(() => { cancelarSuscripcion(); quitarInterceptor() })

createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={queryClient}><App /></QueryClientProvider></StrictMode>,
)
