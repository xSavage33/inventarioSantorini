'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Tags, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react'
import type { Categoria, Subcategoria } from '@/types/database'

interface CategoriaConSub extends Categoria {
  subcategorias: Subcategoria[]
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaConSub[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Modal de Categoria
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' })

  // Modal de Subcategoria
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<string | null>(null)
  const [subForm, setSubForm] = useState({ nombre: '', categoria_id: '' })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    try {
      const { data: cats, error: catsError } = await supabase
        .from('categorias')
        .select('*')
        .order('orden')

      if (catsError) throw catsError

      const { data: subs, error: subsError } = await supabase
        .from('subcategorias')
        .select('*')
        .order('orden')

      if (subsError) throw subsError

      const categoriasConSub: CategoriaConSub[] = (cats || []).map((cat) => ({
        ...(cat as Categoria),
        subcategorias: (subs || []).filter((sub) => sub.categoria_id === cat.id),
      }))

      setCategorias(categoriasConSub)
    } catch (error) {
      console.error('Error loading categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Categoria handlers
  const openCatModal = (cat?: Categoria) => {
    if (cat) {
      setEditingCat(cat.id)
      setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' })
    } else {
      setEditingCat(null)
      setCatForm({ nombre: '', descripcion: '' })
    }
    setCatModalOpen(true)
  }

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingCat) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nombre: catForm.nombre,
            descripcion: catForm.descripcion || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCat)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({
            nombre: catForm.nombre,
            descripcion: catForm.descripcion || null,
            orden: categorias.length + 1,
          })

        if (error) throw error
      }

      setCatModalOpen(false)
      loadCategorias()
    } catch (error) {
      console.error('Error saving categoria:', error)
      alert('Error al guardar la categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Esto eliminara la categoria y sus subcategorias. Continuar?')) return

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadCategorias()
    } catch (error) {
      console.error('Error deleting categoria:', error)
      alert('Error al eliminar la categoria')
    }
  }

  // Subcategoria handlers
  const openSubModal = (categoriaId: string, sub?: Subcategoria) => {
    if (sub) {
      setEditingSub(sub.id)
      setSubForm({ nombre: sub.nombre, categoria_id: sub.categoria_id })
    } else {
      setEditingSub(null)
      setSubForm({ nombre: '', categoria_id: categoriaId })
    }
    setSubModalOpen(true)
  }

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingSub) {
        const { error } = await supabase
          .from('subcategorias')
          .update({
            nombre: subForm.nombre,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSub)

        if (error) throw error
      } else {
        const cat = categorias.find((c) => c.id === subForm.categoria_id)
        const { error } = await supabase
          .from('subcategorias')
          .insert({
            nombre: subForm.nombre,
            categoria_id: subForm.categoria_id,
            orden: (cat?.subcategorias.length || 0) + 1,
          })

        if (error) throw error
      }

      setSubModalOpen(false)
      loadCategorias()
    } catch (error) {
      console.error('Error saving subcategoria:', error)
      alert('Error al guardar la subcategoria')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Eliminar esta subcategoria?')) return

    try {
      const { error } = await supabase
        .from('subcategorias')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadCategorias()
    } catch (error) {
      console.error('Error deleting subcategoria:', error)
      alert('Error al eliminar la subcategoria')
    }
  }

  // Reordenar categoria
  const moveCat = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categorias.length) return

    const updatedCats = [...categorias]
    const [movedCat] = updatedCats.splice(index, 1)
    updatedCats.splice(newIndex, 0, movedCat)

    // Actualizar solo los 2 elementos que cambiaron
    try {
      await Promise.all([
        supabase.from('categorias').update({ orden: newIndex + 1 }).eq('id', movedCat.id),
        supabase.from('categorias').update({ orden: index + 1 }).eq('id', categorias[newIndex].id)
      ])
      loadCategorias()
    } catch (error) {
      console.error('Error reordering categorias:', error)
    }
  }

  // Reordenar subcategoria
  const moveSub = async (catIndex: number, subIndex: number, direction: 'up' | 'down') => {
    const cat = categorias[catIndex]
    const newSubIndex = direction === 'up' ? subIndex - 1 : subIndex + 1
    if (newSubIndex < 0 || newSubIndex >= cat.subcategorias.length) return

    const movedSub = cat.subcategorias[subIndex]
    const swappedSub = cat.subcategorias[newSubIndex]

    // Actualizar solo los 2 elementos que cambiaron
    try {
      await Promise.all([
        supabase.from('subcategorias').update({ orden: newSubIndex + 1 }).eq('id', movedSub.id),
        supabase.from('subcategorias').update({ orden: subIndex + 1 }).eq('id', swappedSub.id)
      ])
      loadCategorias()
    } catch (error) {
      console.error('Error reordering subcategorias:', error)
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
            <p className="text-gray-500 mt-1">Gestiona categorias y subcategorias</p>
          </div>
          <Button onClick={() => openCatModal()}>
            <Plus size={20} />
            Nueva Categoria
          </Button>
        </div>

        <div className="space-y-4">
          {categorias.map((cat, catIndex) => (
            <Card key={cat.id}>
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(cat.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveCat(catIndex, 'up')}
                      disabled={catIndex === 0}
                      className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => moveCat(catIndex, 'down')}
                      disabled={catIndex === categorias.length - 1}
                      className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={14} className="text-gray-500" />
                    </button>
                  </div>
                  {cat.subcategorias.length > 0 ? (
                    expanded[cat.id] ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )
                  ) : (
                    <div className="w-5" />
                  )}
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Tags className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{cat.nombre}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({cat.subcategorias.length} subcategorias)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => openSubModal(cat.id)}>
                    <Plus size={16} />
                    Subcategoria
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openCatModal(cat)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCat(cat.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {expanded[cat.id] && cat.subcategorias.length > 0 && (
                <div className="border-t">
                  {cat.subcategorias.map((sub, subIndex) => (
                    <div
                      key={sub.id}
                      className="px-6 py-3 pl-12 flex items-center justify-between hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveSub(catIndex, subIndex, 'up')}
                            disabled={subIndex === 0}
                            className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp size={12} className="text-gray-400" />
                          </button>
                          <button
                            onClick={() => moveSub(catIndex, subIndex, 'down')}
                            disabled={subIndex === cat.subcategorias.length - 1}
                            className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown size={12} className="text-gray-400" />
                          </button>
                        </div>
                        <span className="text-gray-700">{sub.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSubModal(cat.id, sub)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSub(sub.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {categorias.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No hay categorias registradas
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Categoria */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Editar Categoria' : 'Nueva Categoria'}
      >
        <form onSubmit={handleSaveCat} className="space-y-4">
          <Input
            label="Nombre"
            value={catForm.nombre}
            onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })}
            placeholder="Ej: Aguardientes"
            required
          />
          <Input
            label="Descripcion (opcional)"
            value={catForm.descripcion}
            onChange={(e) => setCatForm({ ...catForm, descripcion: e.target.value })}
            placeholder="Descripcion de la categoria"
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setCatModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Subcategoria */}
      <Modal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={editingSub ? 'Editar Subcategoria' : 'Nueva Subcategoria'}
      >
        <form onSubmit={handleSaveSub} className="space-y-4">
          <Input
            label="Nombre"
            value={subForm.nombre}
            onChange={(e) => setSubForm({ ...subForm, nombre: e.target.value })}
            placeholder="Ej: Tapa Verde"
            required
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setSubModalOpen(false)}>
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
