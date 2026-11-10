import { useState } from 'react'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Input } from '@/shared/ui/Input'
import { Paginacion } from './Paginacion'

export function TablaAdmin<T>({ datos, columnas, titulo }: { datos: T[]; columnas: ColumnDef<T>[]; titulo: string }) {
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<SortingState>([])
  // eslint-disable-next-line react-hooks/incompatible-library -- Table administra su propio estado; no se memoizan sus funciones.
  const tabla = useReactTable({ data: datos, columns: columnas, state: { globalFilter: busqueda, sorting: orden },
    onGlobalFilterChange: setBusqueda, onSortingChange: setOrden, getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } } })
  return <><div className="mb-5 max-w-md"><Input etiqueta={`Buscar en ${titulo}`} value={busqueda} onChange={(evento) => { setBusqueda(evento.target.value); tabla.setPageIndex(0) }} /></div>
    <div className="superficie overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><caption className="sr-only">{titulo}</caption>
      <thead>{tabla.getHeaderGroups().map((grupo) => <tr key={grupo.id}>{grupo.headers.map((cabecera) => <th key={cabecera.id} scope="col" className="border-tema border-b p-4"
        aria-sort={cabecera.column.getIsSorted() === 'asc' ? 'ascending' : cabecera.column.getIsSorted() === 'desc' ? 'descending' : undefined}>
        {cabecera.isPlaceholder ? null : cabecera.column.getCanSort()
          ? <button type="button" className="font-bold" onClick={cabecera.column.getToggleSortingHandler()}>{flexRender(cabecera.column.columnDef.header, cabecera.getContext())} {cabecera.column.getIsSorted() === 'asc' ? '↑' : cabecera.column.getIsSorted() === 'desc' ? '↓' : '↕'}</button>
          : flexRender(cabecera.column.columnDef.header, cabecera.getContext())}</th>)}</tr>)}</thead>
      <tbody>{tabla.getRowModel().rows.length === 0 ? <tr><td colSpan={columnas.length} className="texto-secundario p-8 text-center">No hay registros que coincidan.</td></tr>
        : tabla.getRowModel().rows.map((fila) => <tr key={fila.id}>{fila.getVisibleCells().map((celda) => <td key={celda.id} className="border-tema border-b p-4">{flexRender(celda.column.columnDef.cell, celda.getContext())}</td>)}</tr>)}</tbody>
    </table></div>
    <Paginacion pagina={tabla.getState().pagination.pageIndex} porPagina={10} total={tabla.getFilteredRowModel().rows.length} onCambiar={(pagina) => tabla.setPageIndex(pagina)} />
  </>
}
