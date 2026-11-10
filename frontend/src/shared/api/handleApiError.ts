import axios from 'axios'

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

export function detalleApi(error: unknown): unknown {
  if (!axios.isAxiosError<unknown>(error)) return undefined
  const datos = error.response?.data
  return objeto(datos) ? datos.detail : undefined
}

export function handleApiError(error: unknown, mensaje = 'No fue posible completar la operación'): string {
  const detalle = detalleApi(error)
  if (typeof detalle === 'string') return detalle
  if (Array.isArray(detalle)) {
    const mensajes = detalle.flatMap((item: unknown) => {
      if (!objeto(item) || typeof item.msg !== 'string') return []
      const campo = Array.isArray(item.loc)
        ? item.loc.filter((parte: unknown) => parte !== 'body').join('.') : ''
      return [`${campo ? `${campo}: ` : ''}${item.msg}`]
    })
    if (mensajes.length) return mensajes.join('. ')
  }
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Comprobá que el backend esté iniciado.'
    if (error.response.status === 401) return 'No hay una sesión válida'
    if (error.response.status === 403) return 'No tenés permisos para esta operación'
    if (error.response.status >= 500) return 'El servidor no pudo completar la operación. Intentá nuevamente.'
  }
  return mensaje
}
