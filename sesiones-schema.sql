-- ============================================
-- ESQUEMA PARA SESIONES DE INVENTARIO
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Tabla de sesiones de inventario
CREATE TABLE sesiones_inventario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columna sesion_id a la tabla inventario
ALTER TABLE inventario ADD COLUMN sesion_id UUID REFERENCES sesiones_inventario(id) ON DELETE CASCADE;

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_inventario_sesion ON inventario(sesion_id);

-- Crear primera sesión con los datos existentes
INSERT INTO sesiones_inventario (nombre, fecha, notas)
VALUES ('Inventario Inicial', CURRENT_DATE, 'Sesion inicial con datos existentes');

-- Asociar inventario existente a la primera sesión
UPDATE inventario SET sesion_id = (SELECT id FROM sesiones_inventario LIMIT 1) WHERE sesion_id IS NULL;

-- Eliminar constraint anterior y crear nuevo con sesion_id
ALTER TABLE inventario DROP CONSTRAINT IF EXISTS inventario_producto_id_ubicacion_id_key;
ALTER TABLE inventario ADD CONSTRAINT inventario_producto_ubicacion_sesion_key
    UNIQUE (producto_id, ubicacion_id, sesion_id);

-- Políticas RLS para sesiones_inventario
ALTER TABLE sesiones_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de sesiones a usuarios autenticados"
ON sesiones_inventario FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserción de sesiones a usuarios autenticados"
ON sesiones_inventario FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir actualización de sesiones a usuarios autenticados"
ON sesiones_inventario FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Permitir eliminación de sesiones a usuarios autenticados"
ON sesiones_inventario FOR DELETE
TO authenticated
USING (true);
