import type { Rol } from './types/auth'

export function validarUsername(valor: string): string | undefined {
  const limpio = valor.trim()
  if (!limpio) return 'Ingresá tu nombre de usuario'
  if (limpio.length > 50) return 'Usá hasta 50 caracteres'
}

export function validarNombre(valor: string): string | undefined {
  if (!valor.trim()) return 'Ingresá tu nombre completo'
  if (valor.trim().length > 200) return 'Usá hasta 200 caracteres'
}

export function validarEmail(valor: string): string | undefined {
  const limpio = valor.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return 'Ingresá un correo válido'
  if (limpio.length > 254) return 'El correo es demasiado largo'
}

export function validarPassword(valor: string): string | undefined {
  if ([...valor].length < 8) return 'La contraseña debe tener al menos ocho caracteres'
  if (new TextEncoder().encode(valor).length > 72) return 'La contraseña no puede superar 72 bytes UTF-8'
}

export function destinoTrasLogin(rol: Rol, desde: unknown): string {
  const cliente = ['/checkout', '/mis-pedidos']
  const admin = ['/admin/resumen', '/admin/categorias', '/admin/productos', '/admin/pedidos', '/admin/usuarios']
  if (typeof desde === 'string' && (cliente.includes(desde) || (rol === 'admin' && admin.includes(desde)))) return desde
  return rol === 'admin' ? '/admin/resumen' : '/'
}
