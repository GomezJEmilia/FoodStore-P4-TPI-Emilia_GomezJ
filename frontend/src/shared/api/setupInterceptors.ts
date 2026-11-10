import axios from 'axios'
import { axiosInstance } from './axiosInstance'
import { detalleApi } from './handleApiError'

// La infraestructura recibe una función; no importa el store ni crea ciclos.
export function setupInterceptors(alPerderSesion: () => void): () => void {
  const id = axiosInstance.interceptors.response.use(
    (respuesta) => respuesta,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const ruta = (error.config?.url ?? '').split('?')[0].replace(/\/+$/, '')
        const excluida = ruta.endsWith('/auth/token') || ruta.endsWith('/auth/me')
        const expirada = error.response?.status === 401 && !excluida
        const desactivada = error.response?.status === 400
          && detalleApi(error) === 'Cuenta de usuario desactivada'
        if (expirada || desactivada) alPerderSesion()
      }
      return Promise.reject(error)
    },
  )
  return () => axiosInstance.interceptors.response.eject(id)
}
