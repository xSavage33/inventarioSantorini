'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase'
import { Save, MapPin, Package, Search, Minus, Plus, Check } from 'lucide-react'
import type { Ubicacion, Categoria, ProductoConCategoria } from '@/types/database'

interface InventarioItem {
  producto_id: string
  ubicacion_id: string
  cantidad: number
}

export default function InventarioPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<ProductoConCategoria[]>([])
  const [inventario, setInventario] = useState<Record<string, number>>({})
  const [originalInventario, setOriginalInventario] = useState<Record<string, number>>({})

  const [selectedUbicacion, setSelectedUbicacion] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedUbicacion) {
      loadInventarioForUbicacion(selectedUbicacion)
    }
  }, [selectedUbicacion])

  const loadInitialData = async () => {
    try {
      const [ubicRes, catRes, prodRes] = await Promise.all([
        supabase.from('ubicaciones').select('*').eq('activa', true).order('nombre'),
        supabase.from('categorias').select('*').eq('activa', true).order('orden'),
        supabase
          .from('productos')
          .select(`*, categorias (*), subcategorias (*)`)
          .eq('activo', true)
          .order('nombre'),
      ])

      if (ubicRes.error) throw ubicRes.error
      if (catRes.error) throw catRes.error
      if (prodRes.error) throw prodRes.error

      setUbicaciones(ubicRes.data || [])
      setCategorias(catRes.data || [])
      setProductos(prodRes.data || [])

      if (ubicRes.data && ubicRes.data.length > 0) {
        setSelectedUbicacion(ubicRes.data[0].id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInventarioForUbicacion = async (ubicacionId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .eq('ubicacion_id', ubicacionId)

      if (error) throw error

      const inv: Record<string, number> = {}
      ;(data || []).forEach((item) => {
        inv[item.producto_id] = item.cantidad
      })

      setInventario(inv)
      setOriginalInventario(inv)
    } catch (error) {
      console.error('Error loading inventario:', error)
    }
  }

  const handleCantidadChange = (productoId: string, cantidad: number) => {
    setInventario((prev) => ({
      ...prev,
      [productoId]: Math.max(0, cantidad),
    }))
    setSaved(false)
  }

  const incrementar = (productoId: string) => {
    const current = inventario[productoId] || 0
    handleCantidadChange(productoId, current + 1)
  }

  const decrementar = (productoId: string) => {
    const current = inventario[productoId] || 0
    handleCantidadChange(productoId, current - 1)
  }

  const handleSave = async () => {
    if (!selectedUbicacion) return

    setSaving(true)
    try {
      // Solo guardar productos que cambiaron
      const changedProducts = productos.filter((prod) => {
        const currentQty = inventario[prod.id] || 0
        const originalQty = originalInventario[prod.id] || 0
        return currentQty !== originalQty
      })

      if (changedProducts.length === 0) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        setSaving(false)
        return
      }

      // Crear array de updates para batch upsert
      const updates = changedProducts.map((prod) => ({
        producto_id: prod.id,
        ubicacion_id: selectedUbicacion,
        cantidad: inventario[prod.id] || 0,
        fecha_actualizacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      // Una sola llamada a la base de datos
      const { error } = await supabase
        .from('inventario')
        .upsert(updates, { onConflict: 'producto_id,ubicacion_id' })

      if (error) throw error

      setOriginalInventario({ ...inventario })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving inventario:', error)
      alert('Error al guardar el inventario')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(inventario) !== JSON.stringify(originalInventario)

  const filteredProductos = productos.filter((prod) => {
    const matchSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !selectedCategoria || prod.categoria_id === selectedCategoria
    return matchSearch && matchCategoria
  })

  const groupedProductos = filteredProductos.reduce((acc, prod) => {
    const catName = prod.categorias?.nombre || 'Sin categoria'
    if (!acc[catName]) {
      acc[catName] = []
    }
    acc[catName].push(prod)
    return acc
  }, {} as Record<string, ProductoConCategoria[]>)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

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
            <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
            <p className="text-gray-500 mt-1">Registra las cantidades por ubicacion</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {saving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Guardando...
              </>
            ) : saved ? (
              <>
                <Check size={20} />
                Guardado
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>

        {/* Location and filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Ubicacion
                </label>
                <Select
                  options={ubicaciones.map((ub) => ({
                    value: ub.id,
                    label: ub.nombre,
                  }))}
                  value={selectedUbicacion}
                  onChange={(e) => setSelectedUbicacion(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por categoria
                </label>
                <Select
                  options={[
                    { value: '', label: 'Todas las categorias' },
                    ...categorias.map((cat) => ({
                      value: cat.id,
                      label: cat.nombre,
                    })),
                  ]}
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar producto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Grid */}
        {Object.entries(groupedProductos).map(([categoria, prods]) => (
          <Card key={categoria}>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-base">{categoria}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {prods.map((producto) => {
                  const cantidad = inventario[producto.id] || 0
                  const valorTotal = cantidad * producto.precio

                  return (
                    <div
                      key={producto.id}
                      className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg shrink-0">
                          <Package className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{producto.nombre}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {formatCurrency(producto.precio)}
                            <span className="hidden sm:inline"> - {formatCurrency(valorTotal)} total</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button
                          onClick={() => decrementar(producto.id)}
                          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>

                        <input
                          type="number"
                          value={cantidad}
                          onChange={(e) =>
                            handleCantidadChange(producto.id, parseInt(e.target.value) || 0)
                          }
                          className="w-12 sm:w-16 text-center px-1 sm:px-2 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          min="0"
                        />

                        <button
                          onClick={() => incrementar(producto.id)}
                          className="p-1.5 sm:p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        >
                          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProductos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No se encontraron productos
            </CardContent>
          </Card>
        )}

        {/* Floating save button for mobile */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 md:hidden">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="rounded-full shadow-lg"
            >
              {saving ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <Save size={24} />
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
