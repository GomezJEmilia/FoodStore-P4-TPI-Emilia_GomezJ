export function nombreObligatorio(valor: string): string | undefined { if (!valor.trim()) return 'El nombre es obligatorio' }
export function validarStock(valor: string): string | undefined {
  if (!/^\d+$/.test(valor) || !Number.isSafeInteger(Number(valor))) return 'El stock debe ser un entero no negativo'
}
export function validarPrecio(valor: string): string | undefined {
  if (!/^\d+(\.\d{1,2})?$/.test(valor) || !Number.isFinite(Number(valor))) return 'Ingresá un precio no negativo con hasta dos decimales'
}
export function validarImagen(valor: string): string | undefined {
  if (!valor.trim()) return
  try { const url = new URL(valor.trim()); if (!['http:', 'https:'].includes(url.protocol)) return 'Usá una URL HTTP o HTTPS' }
  catch { return 'Ingresá una URL HTTP o HTTPS válida' }
}
