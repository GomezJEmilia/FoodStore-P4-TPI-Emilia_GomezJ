import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useAuth } from '@/features/auth'
import type { Usuario } from '@/features/auth'
import { Button } from '@/shared/ui/Button'
import { TablaAdmin } from '@/shared/components/TablaAdmin'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'
import { useUsuarios } from '../hooks/useUsuarios'

export function AdminUsuariosPage() {
  const { usuario } = useAuth(), { consulta, acceso } = useUsuarios()
  const [error, setError] = useState<string | null>(null)
  async function cambiar(cuenta: Usuario) {
    if (acceso.isPending || cuenta.id === usuario?.id || !window.confirm(`¿${cuenta.disabled ? 'Activar' : 'Desactivar'} la cuenta "${cuenta.username}"?`)) return
    setError(null)
    try { await acceso.mutateAsync({ id: cuenta.id, disabled: !cuenta.disabled }) } catch (error: unknown) { setError(handleApiError(error)) }
  }
  const columnas: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario' }, { accessorKey: 'full_name', header: 'Nombre' }, { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'role', header: 'Rol' }, { id: 'estado', accessorFn: (cuenta) => cuenta.disabled ? 'Desactivado' : 'Activo', header: 'Estado' },
    { id: 'acciones', header: 'Acciones', enableSorting: false, cell: ({ row }) => row.original.id === usuario?.id
      ? <span className="texto-secundario">Tu cuenta</span> : <Button variante={row.original.disabled ? 'secundario' : 'peligro'} disabled={acceso.isPending} onClick={() => { void cambiar(row.original) }}>{row.original.disabled ? 'Activar' : 'Desactivar'} {row.original.username}</Button> },
  ]
  return <><h1 className="mb-6 text-3xl font-black">Administrar usuarios</h1>
    {error && <div className="mb-5"><EstadoError mensaje={error} /></div>}
    {consulta.isPending ? <Skeleton /> : consulta.isError ? <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => { void consulta.refetch() }} />
      : <TablaAdmin datos={consulta.data} columnas={columnas} titulo="usuarios" />}
  </>
}
