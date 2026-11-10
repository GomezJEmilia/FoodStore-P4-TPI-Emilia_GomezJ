import { useMutation } from '@tanstack/react-query'
import { registrarUsuario } from '../api/auth'

export function useRegistro() {
  return useMutation({ mutationFn: registrarUsuario })
}
