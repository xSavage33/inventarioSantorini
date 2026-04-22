# Inventario Santorini - Instrucciones de Instalacion

## Paso 1: Instalar dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

## Paso 2: Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita o inicia sesion
3. Clic en "New Project"
4. Completa:
   - **Name**: inventario-santorini
   - **Database Password**: (anota esta contrasena)
   - **Region**: South America (Sao Paulo) - o la mas cercana
5. Clic en "Create new project"

## Paso 3: Configurar la base de datos

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de base de datos en el menu lateral)
2. Clic en "New Query"
3. Copia TODO el contenido del archivo `supabase-schema.sql` de tu proyecto
4. Pega el contenido en el editor SQL
5. Clic en "Run" (o Ctrl+Enter)
6. Espera a que termine (veras "Success")

## Paso 4: Obtener las credenciales de Supabase

1. En Supabase, ve a **Settings** (engranaje) > **API**
2. Copia estos valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (una cadena larga que empieza con `eyJ...`)

## Paso 5: Configurar variables de entorno

1. En la carpeta del proyecto, crea un archivo llamado `.env.local`
2. Agrega este contenido (reemplazando con tus valores):

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 6: Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Paso 7: Crear tu cuenta

1. En la pagina de login, clic en "No tienes cuenta? Registrate"
2. Ingresa tu correo y contrasena
3. Revisa tu correo para confirmar la cuenta (Supabase envia un email)
4. Una vez confirmado, inicia sesion

---

## Despliegue en Vercel (Opcional)

Para tener tu app en linea y acceder desde cualquier lugar:

1. Sube tu proyecto a GitHub
2. Ve a [https://vercel.com](https://vercel.com)
3. Conecta tu cuenta de GitHub
4. Importa el repositorio
5. En las variables de entorno, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clic en Deploy

---

## Estructura del Proyecto

```
inventario-santorini/
├── src/
│   ├── app/                    # Paginas de la aplicacion
│   │   ├── dashboard/          # Dashboard principal
│   │   │   ├── inventario/     # Registro de inventario
│   │   │   ├── productos/      # Gestion de productos
│   │   │   ├── categorias/     # Gestion de categorias
│   │   │   ├── ubicaciones/    # Gestion de ubicaciones
│   │   │   └── reportes/       # Reportes y exportacion
│   │   └── login/              # Pagina de autenticacion
│   ├── components/             # Componentes reutilizables
│   ├── lib/                    # Configuracion de Supabase
│   └── types/                  # Tipos de TypeScript
├── supabase-schema.sql         # Esquema de base de datos
└── package.json
```

## Funcionalidades

- **Inventario**: Registra cantidades por ubicacion
- **Productos**: Agrega, edita y elimina productos con precios
- **Categorias**: Organiza productos por categorias y subcategorias
- **Ubicaciones**: Gestiona las ubicaciones de almacenamiento
- **Reportes**: Ve totales y exporta a PDF/Excel
- **Login**: Protege tu inventario con autenticacion

## Soporte

Si tienes problemas, verifica:
1. Que las variables de entorno esten correctas
2. Que el esquema SQL se haya ejecutado sin errores
3. Que hayas confirmado tu cuenta por email
