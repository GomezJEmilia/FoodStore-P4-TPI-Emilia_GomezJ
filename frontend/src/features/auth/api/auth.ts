import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Credenciales, RegistroData, Usuario } from '../types/auth'

export async function iniciarSesion(datos: Credenciales): Promise<void> {
  const formulario = new URLSearchParams()
  formulario.set('username', datos.username)
  formulario.set('password', datos.password)
  await axiosInstance.post('/auth/token', formulario)
}

export async function obtenerSesion(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>('/auth/me')
  return data
}

export async function cerrarSesion(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function registrarUsuario(datos: RegistroData): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', datos)
  return data
}
