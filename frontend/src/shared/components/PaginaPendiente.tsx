import { useState } from 'react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'

export function PaginaPendiente({ titulo }: { titulo: string }) {
  const [modal, setModal] = useState(false)
  return <Card><p className="texto-secundario text-sm font-semibold">Base del frontend · Fase 9</p>
    <h1 className="mt-2 text-3xl font-black">{titulo}</h1>
    <p className="texto-secundario mt-4">La ruta está preparada. La pantalla del negocio se implementará en las próximas fases.</p>
    <div className="mt-5 flex flex-wrap gap-2">{(['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'] as const).map((estado) => <BadgeEstado key={estado} estado={estado} />)}</div>
    <Button className="mt-6" onClick={() => setModal(true)}>Ver componentes base</Button>
    {modal && <Modal titulo="Vista de componentes" onCerrar={() => setModal(false)}>
      <p className="texto-secundario mb-5">Esta vista permite comprobar estilos, foco y tema. No guarda datos.</p>
      <Input etiqueta="Campo de ejemplo" placeholder="Escribí para probar el estilo" ayuda="Los formularios se implementarán después." />
      <div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => setModal(false)}>Cerrar</Button><Button variante="secundario" onClick={() => setModal(false)}>Cancelar</Button></div>
    </Modal>}
  </Card>
}
