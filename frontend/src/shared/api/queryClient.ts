import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: (intentos, error) => {
        if (axios.isAxiosError(error) && error.response && error.response.status < 500) return false
        return intentos < 1
      },
    },
    mutations: { retry: false },
  },
})

export function limpiarCacheServidor(): void {
  void queryClient.cancelQueries()
  queryClient.clear()
}
