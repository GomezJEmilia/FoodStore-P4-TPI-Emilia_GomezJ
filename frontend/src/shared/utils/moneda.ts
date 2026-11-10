const formato = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
export function moneda(valor: number): string { return formato.format(valor) }
export function subtotal(precio: number, cantidad: number): number { return Math.round(precio * 100) * cantidad / 100 }
