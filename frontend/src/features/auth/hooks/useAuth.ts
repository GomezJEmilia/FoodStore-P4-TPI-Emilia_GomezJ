import type { Credenciales } from '../types/auth'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const estado = useAuthStore()
  const autenticado = !estado.checking && estado.errorSesion === null
    && estado.usuario !== null && !estado.usuario.disabled
  async function login(datos: Credenciales) {
    await estado.login(datos)
    return useAuthStore.getState().usuario
  }
  return { ...estado, login, autenticado, esAdmin: autenticado && estado.usuario?.role === 'admin' }
}
