export type Rol = 'user' | 'admin'

export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface Credenciales { username: string; password: string }
export interface RegistroData extends Credenciales { full_name: string; email: string }
