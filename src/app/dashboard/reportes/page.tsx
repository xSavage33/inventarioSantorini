'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase'
import {
  FileSpreadsheet,
  FileText,
  Download,
  Package,
  DollarSign,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { Ubicacion, Categoria } from '@/types/database'

interface TotalProducto {
  producto_id: string
  producto_nombre: string
  precio: number
  categoria: string
  subcategoria: string | null
  cantidad_total: number
  valor_total: number
  por_ubicacion: Record<string, number>
}

export default function ReportesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [totales, setTotales] = useState<TotalProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategoria, setFilterCategoria] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const [resumen, setResumen] = useState({
    valorTotal: 0,
    unidadesTotal: 0,
    productosConStock: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ubicRes, catRes, prodRes, invRes] = await Promise.all([
        supabase.from('ubicaciones').select('*').eq('activa', true).order('nombre'),
        supabase.from('categorias').select('*').eq('activa', true).order('orden'),
        supabase
          .from('productos')
          .select(`*, categorias (*), subcategorias (*)`)
          .eq('activo', true)
          .order('nombre'),
        supabase.from('inventario').select('*'),
      ])

      if (ubicRes.error) throw ubicRes.error
      if (catRes.error) throw catRes.error
      if (prodRes.error) throw prodRes.error
      if (invRes.error) throw invRes.error

      setUbicaciones(ubicRes.data || [])
      setCategorias(catRes.data || [])

      // Process totales
      const invMap: Record<string, Record<string, number>> = {}
      ;(invRes.data || []).forEach((inv) => {
        if (!invMap[inv.producto_id]) {
          invMap[inv.producto_id] = {}
        }
        invMap[inv.producto_id][inv.ubicacion_id] = inv.cantidad
      })

      let valorTotal = 0
      let unidadesTotal = 0
      let productosConStock = 0

      const totalesData: TotalProducto[] = (prodRes.data || []).map((prod) => {
        const porUbicacion = invMap[prod.id] || {}
        const cantidadTotal = Object.values(porUbicacion).reduce((sum, qty) => sum + qty, 0)
        const valorProducto = cantidadTotal * prod.precio

        valorTotal += valorProducto
        unidadesTotal += cantidadTotal
        if (cantidadTotal > 0) productosConStock++

        return {
          producto_id: prod.id,
          producto_nombre: prod.nombre,
          precio: prod.precio,
          categoria: prod.categorias?.nombre || 'Sin categoria',
          subcategoria: prod.subcategorias?.nombre || null,
          cantidad_total: cantidadTotal,
          valor_total: valorProducto,
          por_ubicacion: porUbicacion,
        }
      })

      setTotales(totalesData)
      setResumen({ valorTotal, unidadesTotal, productosConStock })

      // Expand all categories by default
      const expanded: Record<string, boolean> = {}
      ;(catRes.data || []).forEach((cat) => {
        expanded[cat.nombre] = true
      })
      setExpandedCategories(expanded)
    } catch (error) {
      console.error('Error loading data:', error)
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

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filteredTotales = totales
    .filter((prod) => {
      if (!filterCategoria) return true
      const cat = categorias.find((c) => c.id === filterCategoria)
      return cat && prod.categoria === cat.nombre
    })
    .sort((a, b) => a.cantidad_total - b.cantidad_total) // Ordenar de menor a mayor cantidad

  const groupedTotales = filteredTotales.reduce((acc, prod) => {
    if (!acc[prod.categoria]) {
      acc[prod.categoria] = []
    }
    acc[prod.categoria].push(prod)
    return acc
  }, {} as Record<string, TotalProducto[]>)

  // Ordenar productos dentro de cada categoria por cantidad (menor a mayor)
  Object.keys(groupedTotales).forEach((cat) => {
    groupedTotales[cat].sort((a, b) => a.cantidad_total - b.cantidad_total)
  })

  const exportToExcel = async () => {
    const XLSX = await import('xlsx')

    // Sheet 1: Resumen por producto
    const resumenData = filteredTotales.map((prod) => ({
      Producto: prod.producto_nombre,
      Categoria: prod.categoria,
      Subcategoria: prod.subcategoria || '-',
      'Precio Unitario': prod.precio,
      'Cantidad Total': prod.cantidad_total,
      'Valor Total': prod.valor_total,
    }))

    // Sheet 2: Detalle por ubicacion
    const detalleData: any[] = []
    filteredTotales.forEach((prod) => {
      ubicaciones.forEach((ub) => {
        const cantidad = prod.por_ubicacion[ub.id] || 0
        if (cantidad > 0) {
          detalleData.push({
            Producto: prod.producto_nombre,
            Categoria: prod.categoria,
            Ubicacion: ub.nombre,
            Cantidad: cantidad,
            'Precio Unitario': prod.precio,
            'Valor Total': cantidad * prod.precio,
          })
        }
      })
    })

    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.json_to_sheet(resumenData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')

    const ws2 = XLSX.utils.json_to_sheet(detalleData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle por Ubicacion')

    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `inventario-santorini-${date}.xlsx`)
  }

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default
    await import('jspdf-autotable')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const date = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Colores Santorini
    const primary: [number, number, number] = [32, 0, 32] // #200020
    const primaryLight: [number, number, number] = [245, 240, 245] // Light purple/gray
    const grayDark: [number, number, number] = [51, 51, 51] // #333333
    const white: [number, number, number] = [255, 255, 255]

    let logoBase64: string | null = null
    const pagesWithHeader: Set<number> = new Set()

    // Cargar logo
    try {
      const logoResponse = await fetch('/logo.png')
      const logoBlob = await logoResponse.blob()
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(logoBlob)
      })
    } catch (e) {
      logoBase64 = null
    }

    // Funcion para dibujar header (solo si no se ha dibujado en esta pagina)
    const drawHeader = (pageNum: number) => {
      if (pagesWithHeader.has(pageNum)) return
      pagesWithHeader.add(pageNum)

      // Linea superior
      doc.setFillColor(...primary)
      doc.rect(0, 0, pageWidth, 3, 'F')

      // Logo
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 8, 25, 25)
      } else {
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...primary)
        doc.text('S', 22, 22)
      }

      // Titulo al lado del logo
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primary)
      doc.text('SANTORINI', 44, 18)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('TERRAZA BAR', 44, 24)

      // Info derecha
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('Reporte de Inventario', pageWidth - 14, 15, { align: 'right' })
      doc.text(date, pageWidth - 14, 21, { align: 'right' })

      // Linea separadora
      doc.setDrawColor(...primary)
      doc.setLineWidth(0.5)
      doc.line(14, 38, pageWidth - 14, 38)
    }

    // Dibujar header en primera pagina
    drawHeader(1)

    // Titulo principal
    doc.setFontSize(16)
    doc.setTextColor(...primary)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Inventario', 14, 50)

    // Cuadro de Resumen
    const boxY = 56
    const boxHeight = 32
    doc.setFillColor(250, 250, 250)
    doc.setDrawColor(220, 220, 220)
    doc.roundedRect(14, boxY, pageWidth - 28, boxHeight, 3, 3, 'FD')

    // Contenido del resumen
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primary)
    doc.text('Resumen General', pageWidth / 2, boxY + 8, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayDark)
    const col1X = 24
    const col2X = pageWidth / 2 + 10
    const row1Y = boxY + 16
    const row2Y = boxY + 24

    doc.text('Valor Total:', col1X, row1Y)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(resumen.valorTotal), col1X + 50, row1Y)

    doc.setFont('helvetica', 'normal')
    doc.text('Total Unidades:', col2X, row1Y)
    doc.setFont('helvetica', 'bold')
    doc.text(resumen.unidadesTotal.toLocaleString(), col2X + 50, row1Y)

    doc.setFont('helvetica', 'normal')
    doc.text('Productos:', col1X, row2Y)
    doc.setFont('helvetica', 'bold')
    doc.text(`${resumen.productosConStock} con stock`, col1X + 50, row2Y)

    let currentY = boxY + boxHeight + 15
    const headerHeight = 45
    const footerHeight = 15

    // Agrupar por categoria y ordenar por subcategoria y cantidad
    const categoriasList = Object.keys(groupedTotales).sort()

    categoriasList.forEach((categoria) => {
      const productos = groupedTotales[categoria]

      // Ordenar productos: primero por subcategoria, luego por cantidad (menor a mayor)
      const productosOrdenados = [...productos].sort((a, b) => {
        const subA = a.subcategoria || ''
        const subB = b.subcategoria || ''
        if (subA !== subB) return subA.localeCompare(subB)
        return a.cantidad_total - b.cantidad_total
      })

      // Calcular totales de la categoria
      const catTotal = productos.reduce((sum, p) => sum + p.valor_total, 0)
      const catUnidades = productos.reduce((sum, p) => sum + p.cantidad_total, 0)

      // Verificar si hay espacio para el titulo + al menos unas filas
      if (currentY > pageHeight - 70) {
        doc.addPage()
        const pageNum = doc.getNumberOfPages()
        drawHeader(pageNum)
        currentY = headerHeight
      }

      // Titulo de categoria
      doc.setFillColor(...primary)
      doc.roundedRect(14, currentY, pageWidth - 28, 10, 2, 2, 'F')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...white)
      doc.text(categoria, 18, currentY + 7)

      // Info de categoria
      doc.setFontSize(9)
      doc.text(`${catUnidades} uds. | ${formatCurrency(catTotal)}`, pageWidth - 18, currentY + 7, { align: 'right' })

      currentY += 14

      // Preparar datos de tabla con agrupacion por subcategoria
      const tableData: any[] = []
      let currentSubcat = ''

      productosOrdenados.forEach((prod) => {
        const subcat = prod.subcategoria || 'Sin subcategoria'

        // Agregar fila de subcategoria si cambia
        if (subcat !== currentSubcat) {
          currentSubcat = subcat
          if (prod.subcategoria) {
            tableData.push([
              { content: `► ${subcat}`, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [235, 230, 235], textColor: primary } }
            ])
          }
        }

        tableData.push([
          prod.producto_nombre,
          prod.cantidad_total.toString(),
          formatCurrency(prod.precio),
          formatCurrency(prod.valor_total),
        ])
      })

      // Tabla de productos
      ;(doc as any).autoTable({
        startY: currentY,
        head: [['Producto', 'Cant.', 'Precio', 'Valor Total']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: grayDark,
        },
        headStyles: {
          fillColor: [80, 40, 80],
          textColor: white,
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: primaryLight,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { halign: 'center', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 35 },
          3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14, top: headerHeight, bottom: footerHeight },
        didDrawPage: (data: any) => {
          const pageNum = data.pageNumber
          drawHeader(pageNum)
        },
      })

      currentY = (doc as any).lastAutoTable.finalY + 12
    })

    // Agregar footers a todas las paginas
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      // Linea inferior
      doc.setFillColor(...primary)
      doc.rect(0, pageHeight - 3, pageWidth, 3, 'F')
      // Texto de pagina
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Santorini Terraza Bar - Pagina ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: 'center' }
      )
    }

    doc.save(`inventario-santorini-${new Date().toISOString().split('T')[0]}.pdf`)
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
            <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
            <p className="text-gray-500 mt-1">Totales y exportacion de inventario</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportToExcel}>
              <FileSpreadsheet size={20} />
              Excel
            </Button>
            <Button variant="secondary" onClick={exportToPDF}>
              <FileText size={20} />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Total</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(resumen.valorTotal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Unidades</p>
                  <p className="text-xl font-bold text-gray-800">
                    {resumen.unidadesTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Productos con Stock</p>
                  <p className="text-xl font-bold text-gray-800">
                    {resumen.productosConStock} / {totales.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
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
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products by Category */}
        {Object.entries(groupedTotales).map(([categoria, productos]) => {
          const catTotal = productos.reduce((sum, p) => sum + p.valor_total, 0)
          const catUnidades = productos.reduce((sum, p) => sum + p.cantidad_total, 0)
          const isExpanded = expandedCategories[categoria]

          return (
            <Card key={categoria}>
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(categoria)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-800">{categoria}</span>
                  <span className="text-sm text-gray-500">
                    ({productos.length} productos)
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Unidades: </span>
                    <span className="font-medium">{catUnidades.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valor: </span>
                    <span className="font-medium text-green-600">{formatCurrency(catTotal)}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <CardContent className="p-0 border-t">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Producto
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Subcategoria
                          </th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Precio
                          </th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Cantidad
                          </th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Valor Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {productos.map((prod) => (
                          <tr key={prod.producto_id} className="hover:bg-gray-50">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-800">
                                  {prod.producto_nombre}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {prod.subcategoria || '-'}
                            </td>
                            <td className="px-6 py-3 text-right text-gray-600">
                              {formatCurrency(prod.precio)}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                                  prod.cantidad_total > 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {prod.cantidad_total}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-medium text-green-600">
                              {formatCurrency(prod.valor_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {Object.keys(groupedTotales).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No hay productos para mostrar
            </CardContent>
          </Card>
        )}

        {/* Detail by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Detalle por Ubicacion
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Ubicacion
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Unidades
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ubicaciones.map((ub) => {
                    const unidades = totales.reduce(
                      (sum, p) => sum + (p.por_ubicacion[ub.id] || 0),
                      0
                    )
                    const valor = totales.reduce(
                      (sum, p) => sum + (p.por_ubicacion[ub.id] || 0) * p.precio,
                      0
                    )

                    return (
                      <tr key={ub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-800">{ub.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="font-medium">{unidades.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-green-600">
                          {formatCurrency(valor)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-6 py-3 font-semibold text-gray-800">Total</td>
                    <td className="px-6 py-3 text-center font-semibold text-gray-800">
                      {resumen.unidadesTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(resumen.valorTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
