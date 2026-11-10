export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`insignia estado-${estado.toLowerCase()}`}>{etiquetas[estado]}</span>
}
