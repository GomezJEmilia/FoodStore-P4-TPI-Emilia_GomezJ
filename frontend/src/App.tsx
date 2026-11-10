import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const checkSession = useAuthStore((estado) => estado.checkSession)
  useEffect(() => { void checkSession() }, [checkSession])
  return <AppRouter />
}
