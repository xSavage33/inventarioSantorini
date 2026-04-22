export interface Database {
  public: {
    Tables: {
      ubicaciones: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          orden: number
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          orden?: number
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          orden?: number
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subcategorias: {
        Row: {
          id: string
          categoria_id: string
          nombre: string
          orden: number
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          categoria_id: string
          nombre: string
          orden?: number
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          categoria_id?: string
          nombre?: string
          orden?: number
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      productos: {
        Row: {
          id: string
          categoria_id: string | null
          subcategoria_id: string | null
          nombre: string
          precio: number
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          categoria_id?: string | null
          subcategoria_id?: string | null
          nombre: string
          precio?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          categoria_id?: string | null
          subcategoria_id?: string | null
          nombre?: string
          precio?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventario: {
        Row: {
          id: string
          producto_id: string
          ubicacion_id: string
          cantidad: number
          fecha_actualizacion: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          producto_id: string
          ubicacion_id: string
          cantidad?: number
          fecha_actualizacion?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          producto_id?: string
          ubicacion_id?: string
          cantidad?: number
          fecha_actualizacion?: string
          created_at?: string
          updated_at?: string
        }
      }
      historial_inventario: {
        Row: {
          id: string
          inventario_id: string
          producto_id: string
          ubicacion_id: string
          cantidad_anterior: number
          cantidad_nueva: number
          usuario_id: string
          fecha: string
          notas: string | null
        }
        Insert: {
          id?: string
          inventario_id: string
          producto_id: string
          ubicacion_id: string
          cantidad_anterior: number
          cantidad_nueva: number
          usuario_id: string
          fecha?: string
          notas?: string | null
        }
        Update: {
          id?: string
          inventario_id?: string
          producto_id?: string
          ubicacion_id?: string
          cantidad_anterior?: number
          cantidad_nueva?: number
          usuario_id?: string
          fecha?: string
          notas?: string | null
        }
      }
    }
    Views: {
      vista_inventario_completo: {
        Row: {
          producto_id: string
          producto_nombre: string
          precio: number
          categoria: string
          subcategoria: string | null
          ubicacion: string
          cantidad: number
          valor_total: number
        }
      }
      vista_totales_producto: {
        Row: {
          producto_id: string
          producto_nombre: string
          precio: number
          categoria: string
          subcategoria: string | null
          cantidad_total: number
          valor_total: number
        }
      }
    }
  }
}

export type Ubicacion = Database['public']['Tables']['ubicaciones']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Subcategoria = Database['public']['Tables']['subcategorias']['Row']
export type Producto = Database['public']['Tables']['productos']['Row']
export type Inventario = Database['public']['Tables']['inventario']['Row']
export type HistorialInventario = Database['public']['Tables']['historial_inventario']['Row']

export type ProductoConCategoria = Producto & {
  categorias: Categoria | null
  subcategorias: Subcategoria | null
}

export type InventarioCompleto = {
  producto_id: string
  producto_nombre: string
  precio: number
  categoria: string
  subcategoria: string | null
  ubicacion: string
  cantidad: number
  valor_total: number
}

export type TotalProducto = {
  producto_id: string
  producto_nombre: string
  precio: number
  categoria: string
  subcategoria: string | null
  cantidad_total: number
  valor_total: number
}
