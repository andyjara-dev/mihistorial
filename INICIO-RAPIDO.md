# Guía de Inicio Rápido - Health Tracker

## Pasos para ejecutar el proyecto

### 1. Iniciar la base de datos

El proyecto usa Prisma Postgres para desarrollo. Ejecuta:

```bash
npx prisma dev
```

Este comando:
- Iniciará un servidor PostgreSQL local automáticamente
- Creará las tablas necesarias
- Estará disponible en `localhost:51213`

**Mantén esta terminal abierta** mientras trabajas con el proyecto.

### 2. En una nueva terminal, ejecutar las migraciones

```bash
npx prisma migrate dev --name init
```

Esto creará todas las tablas en la base de datos.

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 4. Abrir la aplicación

Ve a [http://localhost:3000](http://localhost:3000) en tu navegador.

## Primeros pasos

1. **Registrarte**: Haz clic en "Comenzar Ahora" y crea una cuenta
2. **Iniciar sesión**: Usa tu email y contraseña
3. **Subir un examen**:
   - Haz clic en "Subir Nuevo Examen"
   - Selecciona un archivo PDF
   - Completa los datos
   - ¡Listo!

## Configuración Opcional: API de Claude

Para habilitar el procesamiento inteligente de PDFs con IA:

1. Ve a [https://console.anthropic.com/](https://console.anthropic.com/)
2. Crea una cuenta y genera una API key
3. Edita el archivo `.env` y reemplaza:
   ```
   ANTHROPIC_API_KEY="tu-api-key-aqui"
   ```
4. Reinicia el servidor

**Nota**: Sin la API key, el sistema funcionará igual pero no procesará automáticamente el contenido de los PDFs.

## Comandos Útiles

```bash
# Ver la base de datos con interfaz visual
npx prisma studio

# Detener todo y empezar de cero
npx prisma migrate reset

# Ver logs del servidor
# (Ya se muestran en la terminal donde ejecutaste npm run dev)
```

## Solución de Problemas

### Error: "Can't reach database server"

**Solución**: Asegúrate de que `npx prisma dev` esté ejecutándose en otra terminal.

### Error al subir archivos

**Solución**: Verifica que el directorio `uploads/` tenga permisos de escritura.

### Página en blanco o errores de compilación

**Solución**:
1. Detén el servidor (Ctrl+C)
2. Ejecuta `rm -rf .next`
3. Ejecuta `npm run dev` nuevamente

## Estructura de Archivos Importante

```
health-tracker/
├── .env                # Variables de entorno (YA CONFIGURADO)
├── prisma/
│   └── schema.prisma   # Modelos de base de datos
├── app/
│   ├── page.tsx        # Página de inicio
│   ├── auth/           # Páginas de login/registro
│   ├── dashboard/      # Dashboard principal
│   └── api/            # Endpoints de API
└── lib/
    ├── auth.ts         # Configuración de autenticación
    └── encryption.ts   # Funciones de encriptación
```

## Siguientes Pasos

Una vez que tengas el sistema funcionando:

1. Prueba subir un examen médico en PDF
2. Explora el dashboard
3. Revisa el código en `app/` y `lib/` para entender cómo funciona
4. Personaliza según tus necesidades

## Seguridad

Las claves de encriptación ya están configuradas en `.env`. **IMPORTANTE**:

- No compartas el archivo `.env` con nadie
- No lo subas a repositorios públicos (ya está en `.gitignore`)
- Si vas a producción, regenera las claves con: `openssl rand -base64 32`

¡Disfruta tu Health Tracker! 🏥
