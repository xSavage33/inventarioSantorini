'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { Package, MapPin, Tags, DollarSign, TrendingUp, ClipboardList } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalProductos: number
  totalUbicaciones: number
  totalCategorias: number
  valorInventario: number
  totalUnidades: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProductos: 0,
    totalUbicaciones: 0,
    totalCategorias: 0,
    valorInventario: 0,
    totalUnidades: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [productosRes, ubicacionesRes, categoriasRes, inventarioRes] = await Promise.all([
        supabase.from('productos').select('id', { count: 'exact' }).eq('activo', true),
        supabase.from('ubicaciones').select('id', { count: 'exact' }).eq('activa', true),
        supabase.from('categorias').select('id', { count: 'exact' }).eq('activa', true),
        supabase.from('inventario').select(`
          cantidad,
          productos (precio)
        `),
      ])

      let valorTotal = 0
      let unidadesTotal = 0

      if (inventarioRes.data) {
        inventarioRes.data.forEach((item: any) => {
          const cantidad = item.cantidad || 0
          const precio = item.productos?.precio || 0
          valorTotal += cantidad * precio
          unidadesTotal += cantidad
        })
      }

      setStats({
        totalProductos: productosRes.count || 0,
        totalUbicaciones: ubicacionesRes.count || 0,
        totalCategorias: categoriasRes.count || 0,
        valorInventario: valorTotal,
        totalUnidades: unidadesTotal,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const statCards = [
    {
      title: 'Valor del Inventario',
      value: formatCurrency(stats.valorInventario),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Total Unidades',
      value: stats.totalUnidades.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Productos',
      value: stats.totalProductos.toString(),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Ubicaciones',
      value: stats.totalUbicaciones.toString(),
      icon: MapPin,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Categorias',
      value: stats.totalCategorias.toString(),
      icon: Tags,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
  ]

  const quickActions = [
    { href: '/dashboard/inventario', label: 'Hacer Inventario', icon: ClipboardList },
    { href: '/dashboard/productos', label: 'Ver Productos', icon: Package },
    { href: '/dashboard/reportes', label: 'Ver Reportes', icon: TrendingUp },
  ]

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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
          <p className="text-gray-500 mt-1">Resumen de tu inventario</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p>Sistema de Inventario Santorini</p>
              <p className="text-sm mt-1">Gestiona tu inventario de manera facil y rapida</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
