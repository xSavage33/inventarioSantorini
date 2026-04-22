'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react'
import type { Ubicacion } from '@/types/database'

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUbicaciones()
  }, [])

  const loadUbicaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('*')
        .order('nombre')

      if (error) throw error
      setUbicaciones(data || [])
    } catch (error) {
      console.error('Error loading ubicaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (ubicacion?: Ubicacion) => {
    if (ubicacion) {
      setEditingId(ubicacion.id)
      setFormData({
        nombre: ubicacion.nombre,
        descripcion: ubicacion.descripcion || '',
      })
    } else {
      setEditingId(null)
      setFormData({ nombre: '', descripcion: '' })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('ubicaciones')
          .update({
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ubicaciones')
          .insert({
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
          })

        if (error) throw error
      }

      setModalOpen(false)
      loadUbicaciones()
    } catch (error) {
      console.error('Error saving ubicacion:', error)
      alert('Error al guardar la ubicacion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de eliminar esta ubicacion?')) return

    try {
      const { error } = await supabase
        .from('ubicaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadUbicaciones()
    } catch (error) {
      console.error('Error deleting ubicacion:', error)
      alert('Error al eliminar la ubicacion')
    }
  }

  const toggleActiva = async (ubicacion: Ubicacion) => {
    try {
      const { error } = await supabase
        .from('ubicaciones')
        .update({ activa: !ubicacion.activa })
        .eq('id', ubicacion.id)

      if (error) throw error
      loadUbicaciones()
    } catch (error) {
      console.error('Error toggling ubicacion:', error)
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
            <h1 className="text-2xl font-bold text-gray-800">Ubicaciones</h1>
            <p className="text-gray-500 mt-1">Gestiona las ubicaciones del inventario</p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={20} />
            Nueva Ubicacion
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Descripcion</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ubicaciones.map((ubicacion) => (
                    <tr key={ubicacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-800">{ubicacion.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {ubicacion.descripcion || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleActiva(ubicacion)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ubicacion.activa
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {ubicacion.activa ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(ubicacion)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ubicacion.id)}
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

              {ubicaciones.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hay ubicaciones registradas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Ubicacion' : 'Nueva Ubicacion'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Enfriador blanco #1"
            required
          />
          <Input
            label="Descripcion (opcional)"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Descripcion de la ubicacion"
          />
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
