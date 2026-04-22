-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA INVENTARIO SANTORINI
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: UBICACIONES
-- ============================================
CREATE TABLE ubicaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar ubicaciones iniciales
INSERT INTO ubicaciones (nombre, descripcion) VALUES
    ('Enfriador blanco #1 (Izquierda)', 'Enfriador principal lado izquierdo'),
    ('Enfriador blanco #2 (Derecha)', 'Enfriador principal lado derecho'),
    ('Estanteria #1 (Izquierda)', 'Estantería principal lado izquierdo'),
    ('Estanteria #2 (Derecha)', 'Estantería principal lado derecho'),
    ('Estanteria mecatos (Derecha)', 'Estantería para snacks y mecatos'),
    ('Exhibidora barra', 'Exhibidora en la barra principal'),
    ('Cava (Izquierda)', 'Cava de almacenamiento'),
    ('Enfriador blanco #3 bodega interna (Izquierda)', 'Enfriador en bodega interna izquierda'),
    ('Enfriador blanco #4 bodega interna (Derecha)', 'Enfriador en bodega interna derecha'),
    ('Estanteria bodega interna', 'Estantería dentro de la bodega'),
    ('Exhibidora bodega interna', 'Exhibidora dentro de la bodega'),
    ('Cajas, canastas o pacas de bodega interna', 'Almacenamiento en cajas y canastas'),
    ('Bodega externa', 'Bodega exterior');

-- ============================================
-- TABLA: CATEGORIAS
-- ============================================
CREATE TABLE categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías iniciales
INSERT INTO categorias (nombre, orden) VALUES
    ('Aguardientes', 1),
    ('Ron Medellin', 2),
    ('Viejo de Caldas', 3),
    ('Tequilas', 4),
    ('Whiskys', 5),
    ('Vodka', 6),
    ('Vino', 7),
    ('Cervezas', 8),
    ('Bebidas', 9),
    ('Snacks', 10),
    ('Medicamentos', 11);

-- ============================================
-- TABLA: SUBCATEGORIAS
-- ============================================
CREATE TABLE subcategorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar subcategorías para Aguardientes
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Amarillo de Manzanares', 1 FROM categorias WHERE nombre = 'Aguardientes';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Tapa Verde', 2 FROM categorias WHERE nombre = 'Aguardientes';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Tapa Azul', 3 FROM categorias WHERE nombre = 'Aguardientes';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Tapa Roja', 4 FROM categorias WHERE nombre = 'Aguardientes';

-- Insertar subcategorías para Ron Medellín
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Licor de Medellin 29°', 1 FROM categorias WHERE nombre = 'Ron Medellin';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Medellin 3 Años', 2 FROM categorias WHERE nombre = 'Ron Medellin';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Medellin 5 Años', 3 FROM categorias WHERE nombre = 'Ron Medellin';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Medellin 8 Años', 4 FROM categorias WHERE nombre = 'Ron Medellin';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Medellin 12 Años', 5 FROM categorias WHERE nombre = 'Ron Medellin';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Medellin 18 Años', 6 FROM categorias WHERE nombre = 'Ron Medellin';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Medellin 19 Años', 7 FROM categorias WHERE nombre = 'Ron Medellin';

-- Insertar subcategorías para Whiskys
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Buchanans', 1 FROM categorias WHERE nombre = 'Whiskys';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Old Parr', 2 FROM categorias WHERE nombre = 'Whiskys';
INSERT INTO subcategorias (categoria_id, nombre, orden)
SELECT id, 'Johnny Walker', 3 FROM categorias WHERE nombre = 'Whiskys';

-- ============================================
-- TABLA: PRODUCTOS
-- ============================================
CREATE TABLE productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    subcategoria_id UUID REFERENCES subcategorias(id) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL,
    precio DECIMAL(12, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INSERTAR PRODUCTOS INICIALES
-- ============================================

-- Aguardientes - Amarillo de Manzanares
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Manzanares 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Amarillo de Manzanares';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Manzanares 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Amarillo de Manzanares';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Manzanares 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Amarillo de Manzanares';

-- Aguardientes - Tapa Verde
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Verde 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Verde';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Verde 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Verde';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Verde 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Verde';

-- Aguardientes - Tapa Azul
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Azul 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Azul';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Azul 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Azul';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Azul 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Azul';

-- Aguardientes - Tapa Roja
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Roja 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Roja';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Tapa Roja 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Aguardientes' AND s.nombre = 'Tapa Roja';

-- Ron Medellín - Licor de Medellin 29°
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 29° 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Licor de Medellin 29°';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 29° 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Licor de Medellin 29°';

-- Ron Medellín - 3 Años
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 3 Años 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 3 Años';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 3 Años 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 3 Años';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 3 Años 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 3 Años';

-- Ron Medellín - 5 Años
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 5 Años 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 5 Años';

-- Ron Medellín - 8 Años
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 8 Años 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 8 Años';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 8 Años 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 8 Años';

-- Ron Medellín - 12 Años
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 12 Años 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 12 Años';

-- Ron Medellín - 18 Años
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 18 Años (Dos maderas) 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 18 Años';

-- Ron Medellín - 19 Años
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Medellin 19 Años (Gran solera) 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Ron Medellin' AND s.nombre = 'Medellin 19 Años';

-- Viejo de Caldas (sin subcategoría)
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas 5 Años (Juan de la Cruz) 750 ML', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas 8 Años (Carta de oro) 375 ML', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas 8 Años (Carta de oro) 750 ML', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas Esencial 375 ML', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas Esencial 750 ML', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas Esencial 1 LT', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas Tradicional 750 ML', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Caldas Tradicional 1 LT', 0 FROM categorias WHERE nombre = 'Viejo de Caldas';

-- Tequilas
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, '1800 Reposado 750 ML', 0 FROM categorias WHERE nombre = 'Tequilas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, '1800 Cristalino 700 ML', 0 FROM categorias WHERE nombre = 'Tequilas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, '1800 Añejo 750 ML', 0 FROM categorias WHERE nombre = 'Tequilas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Jose Cuervo Reposado 750 ML', 0 FROM categorias WHERE nombre = 'Tequilas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Don Julio Blanco 700 ML', 0 FROM categorias WHERE nombre = 'Tequilas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Don Julio Cristalino 700 ML', 0 FROM categorias WHERE nombre = 'Tequilas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Maestro Dobel Reposado 700 ML', 0 FROM categorias WHERE nombre = 'Tequilas';

-- Whiskys - Buchanans
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Deluxe 375 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Deluxe 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Deluxe 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Master 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Master 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Two Souls 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Buchanan 18 Años 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Buchanans';

-- Whiskys - Old Parr
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Old Parr 500 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Old Parr';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Old Parr 750 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Old Parr';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Old Parr 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Old Parr';

-- Whiskys - Johnny Walker
INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Black Label 700 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Johnny Walker';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Black Label 1 LT', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Johnny Walker';

INSERT INTO productos (categoria_id, subcategoria_id, nombre, precio)
SELECT c.id, s.id, 'Red Label 700 ML', 0
FROM categorias c, subcategorias s
WHERE c.nombre = 'Whiskys' AND s.nombre = 'Johnny Walker';

-- Vodka
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Vodka Tamarindo 750 ML', 0 FROM categorias WHERE nombre = 'Vodka';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Vodka Lulo 750 ML', 0 FROM categorias WHERE nombre = 'Vodka';

-- Vino
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'JP Rose 750 ML', 0 FROM categorias WHERE nombre = 'Vino';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'JP Blanco 750 ML', 0 FROM categorias WHERE nombre = 'Vino';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'JP Fizzy Lata 250 ML', 0 FROM categorias WHERE nombre = 'Vino';

-- Cervezas
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Aguila Negra 330 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Aguila Zero Lata', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'BBC Miel 330 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Budweiser Lata 279 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Club Colombia Dorada 330 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Club Colombia Trigo 330 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Cola Pola Lata', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Corona Extra Lata', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Corona Zero', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Corona Zero Lata', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Coronita 210 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Costeñita 175 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Heineken 330 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Poker 250 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Reds Verde Lata', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Reds Rose Lata', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Smirnoff Verde 275 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Smirnoff Roja 275 ML', 0 FROM categorias WHERE nombre = 'Cervezas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Stella Artois 300 ML', 0 FROM categorias WHERE nombre = 'Cervezas';

-- Bebidas
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Agua Pool 600 ML', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Bretaña 300 ML', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Canada Dry', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Coca Cola 400 ML', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Electrolit 625 ML', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Gatorade 500 ML', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Monster Lata', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Redbull Lata Pequeña', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Speed Max Pequeño Lata', 0 FROM categorias WHERE nombre = 'Bebidas';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Speed Max Grande Lata', 0 FROM categorias WHERE nombre = 'Bebidas';

-- Snacks
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Manicero', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Manikraks', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Margarita Papas Naturales', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Margarita Dorito Mix', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Margarita Chicharron BBQ', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Papas Mayonesa', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Madurito Limon', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Madurito Natural', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Papas Naturales', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Chicharron Natural', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Chicharron Limon', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Papas Limon', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Tajaditas Verdes', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Artesanal Rosquitas', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Rizadas Papas Mayonesa', 0 FROM categorias WHERE nombre = 'Snacks';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Rizadas Papas Limon', 0 FROM categorias WHERE nombre = 'Snacks';

-- Medicamentos
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Alkaseltzer', 0 FROM categorias WHERE nombre = 'Medicamentos';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Aspirina Efervescente', 0 FROM categorias WHERE nombre = 'Medicamentos';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Bonfiest', 0 FROM categorias WHERE nombre = 'Medicamentos';
INSERT INTO productos (categoria_id, nombre, precio)
SELECT id, 'Sal de frutas lua', 0 FROM categorias WHERE nombre = 'Medicamentos';

-- ============================================
-- TABLA: INVENTARIO
-- Relaciona productos con ubicaciones y cantidades
-- ============================================
CREATE TABLE inventario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    ubicacion_id UUID REFERENCES ubicaciones(id) ON DELETE CASCADE,
    cantidad INT DEFAULT 0,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producto_id, ubicacion_id)
);

-- ============================================
-- TABLA: HISTORIAL DE INVENTARIO
-- Para llevar registro de cambios
-- ============================================
CREATE TABLE historial_inventario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventario_id UUID REFERENCES inventario(id) ON DELETE CASCADE,
    producto_id UUID,
    ubicacion_id UUID,
    cantidad_anterior INT,
    cantidad_nueva INT,
    usuario_id UUID,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notas TEXT
);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_inventario ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver ubicaciones" ON ubicaciones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar ubicaciones" ON ubicaciones
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver categorias" ON categorias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar categorias" ON categorias
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver subcategorias" ON subcategorias
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar subcategorias" ON subcategorias
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver productos" ON productos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar productos" ON productos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver inventario" ON inventario
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar inventario" ON inventario
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver historial" ON historial_inventario
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar historial" ON historial_inventario
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener el total de un producto en todas las ubicaciones
CREATE OR REPLACE FUNCTION get_total_producto(p_producto_id UUID)
RETURNS INT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(cantidad) FROM inventario WHERE producto_id = p_producto_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el valor total del inventario
CREATE OR REPLACE FUNCTION get_valor_total_inventario()
RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(i.cantidad * p.precio)
         FROM inventario i
         JOIN productos p ON i.producto_id = p.id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Vista para reporte de inventario completo
CREATE OR REPLACE VIEW vista_inventario_completo AS
SELECT
    p.id as producto_id,
    p.nombre as producto_nombre,
    p.precio,
    c.nombre as categoria,
    s.nombre as subcategoria,
    u.nombre as ubicacion,
    COALESCE(i.cantidad, 0) as cantidad,
    COALESCE(i.cantidad, 0) * p.precio as valor_total
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN subcategorias s ON p.subcategoria_id = s.id
CROSS JOIN ubicaciones u
LEFT JOIN inventario i ON p.id = i.producto_id AND u.id = i.ubicacion_id
WHERE p.activo = true AND u.activa = true
ORDER BY c.orden, s.orden, p.nombre, u.nombre;

-- Vista para totales por producto
CREATE OR REPLACE VIEW vista_totales_producto AS
SELECT
    p.id as producto_id,
    p.nombre as producto_nombre,
    p.precio,
    c.nombre as categoria,
    s.nombre as subcategoria,
    COALESCE(SUM(i.cantidad), 0) as cantidad_total,
    COALESCE(SUM(i.cantidad), 0) * p.precio as valor_total
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN subcategorias s ON p.subcategoria_id = s.id
LEFT JOIN inventario i ON p.id = i.producto_id
WHERE p.activo = true
GROUP BY p.id, p.nombre, p.precio, c.nombre, c.orden, s.nombre, s.orden
ORDER BY c.orden, s.orden, p.nombre;
