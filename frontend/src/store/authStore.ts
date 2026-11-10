import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cerrarSesion, iniciarSesion, obtenerSesion } from '@/features/auth/api/auth'
import type { Credenciales, Usuario } from '@/features/auth/types/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import { limpiarCacheServidor } from '@/shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  checking: boolean
  cargando: boolean
  errorSesion: string | null
  login: (datos: Credenciales) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

let revision = 0
let comprobacion: Promise<void> | null = null

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  usuario: null, checking: true, cargando: false, errorSesion: null,
  limpiarSesion: () => {
    revision += 1
    limpiarCacheServidor()
    set({ usuario: null, checking: false, cargando: false, errorSesion: null })
  },
  login: async (datos) => {
    const turno = ++revision
    limpiarCacheServidor()
    set({ usuario: null, checking: true, cargando: true, errorSesion: null })
    try {
      await iniciarSesion(datos)
      const usuario = await obtenerSesion()
      if (turno !== revision) return
      if (usuario.disabled) throw new Error('Cuenta de usuario desactivada')
      set({ usuario, checking: false })
    } catch (error: unknown) {
      if (turno === revision) set({ usuario: null, checking: false })
      throw error
    } finally {
      if (turno === revision) set({ cargando: false })
    }
  },
  logout: async () => {
    revision += 1
    set({ cargando: true })
    try {
      await cerrarSesion()
      get().limpiarSesion()
    } finally {
      set({ cargando: false })
    }
  },
  checkSession: () => {
    if (comprobacion) return comprobacion
    const turno = revision
    set({ checking: true, errorSesion: null })
    comprobacion = (async () => {
      try {
        const usuario = await obtenerSesion()
        if (turno !== revision) return
        if (usuario.disabled) { get().limpiarSesion(); return }
        if (get().usuario?.id !== usuario.id) limpiarCacheServidor()
        set({ usuario })
      } catch (error: unknown) {
        if (turno !== revision) return
        if (axios.isAxiosError(error) && [400, 401].includes(error.response?.status ?? 0)) {
          get().limpiarSesion()
        } else {
          limpiarCacheServidor()
          set({ usuario: null, errorSesion: handleApiError(error, 'No se pudo comprobar la sesión') })
        }
      } finally {
        if (turno === revision) set({ checking: false })
        comprobacion = null
      }
    })()
    return comprobacion
  },
}), {
  name: 'foodstore-auth',
  partialize: (estado) => ({ usuario: estado.usuario }),
}))
