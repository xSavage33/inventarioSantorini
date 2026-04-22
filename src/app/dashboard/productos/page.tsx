'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Package, Search, DollarSign } from 'lucide-react'
import type { Categoria, Subcategoria, ProductoConCategoria } from '@/types/database'

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria_id: '',
    subcategoria_id: '',
  })
  const [saving, setSaving] = useState(false)

  const [filteredSubcategorias, setFilteredSubcategorias] = useState<Subcategoria[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.categoria_id) {
      const filtered = subcategorias.filter(
        (sub) => sub.categoria_id === formData.categoria_id
      )
      setFilteredSubcategorias(filtered)
    } else {
      setFilteredSubcategorias([])
    }
  }, [formData.categoria_id, subcategorias])

  const loadData = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        supabase
          .from('productos')
          .select(`
            *,
            categorias (*),
            subcategorias (*)
          `)
          .order('nombre'),
        supabase.from('categorias').select('*').eq('activa', true).order('orden'),
        supabase.from('subcategorias').select('*').eq('activa', true).order('orden'),
      ])

      if (prodRes.error) throw prodRes.error
      if (catRes.error) throw catRes.error
      if (subRes.error) throw subRes.error

      setProductos(prodRes.data || [])
      setCategorias(catRes.data || [])
      setSubcategorias(subRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (producto?: ProductoConCategoria) => {
    if (producto) {
      setEditingId(producto.id)
      setFormData({
        nombre: producto.nombre,
        precio: producto.precio.toString(),
        categoria_id: producto.categoria_id || '',
        subcategoria_id: producto.subcategoria_id || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        nombre: '',
        precio: '',
        categoria_id: '',
        subcategoria_id: '',
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio) || 0,
        categoria_id: formData.categoria_id || null,
        subcategoria_id: formData.subcategoria_id || null,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('productos')
          .update(data)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('productos').insert(data)
        if (error) throw error
      }

      setModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving producto:', error)
      alert('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este producto?')) return

    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const filteredProductos = productos.filter((prod) => {
    const matchSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !filterCategoria || prod.categoria_id === filterCategoria
    return matchSearch && matchCategoria
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
            <p className="text-gray-500 mt-1">
              {filteredProductos.length} productos
            </p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={20} />
            Nuevo Producto
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={[
                  { value: '', label: 'Todas las categorias' },
                  ...categorias.map((cat) => ({
                    value: cat.id,
                    label: cat.nombre,
                  })),
                ]}
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="md:w-64"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Producto
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Categoria
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Subcategoria
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Precio
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProductos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="font-medium text-gray-800">
                            {producto.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {producto.categorias?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {producto.subcategorias?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-green-600">
                          {formatCurrency(producto.precio)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(producto)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(producto.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProductos.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron productos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del producto"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Manzanares 750 ML"
            required
          />

          <div className="relative">
            <Input
              label="Precio"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              placeholder="0"
              min="0"
            />
            <DollarSign className="absolute right-3 top-8 w-5 h-5 text-gray-400" />
          </div>

          <Select
            label="Categoria"
            options={[
              { value: '', label: 'Seleccionar categoria' },
              ...categorias.map((cat) => ({
                value: cat.id,
                label: cat.nombre,
              })),
            ]}
            value={formData.categoria_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                categoria_id: e.target.value,
                subcategoria_id: '',
              })
            }
          />

          {filteredSubcategorias.length > 0 && (
            <Select
              label="Subcategoria (opcional)"
              options={[
                { value: '', label: 'Sin subcategoria' },
                ...filteredSubcategorias.map((sub) => ({
                  value: sub.id,
                  label: sub.nombre,
                })),
              ]}
              value={formData.subcategoria_id}
              onChange={(e) =>
                setFormData({ ...formData, subcategoria_id: e.target.value })
              }
            />
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
