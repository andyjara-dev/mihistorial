# Eliminación de Exámenes

## 🗑️ Funcionalidad Implementada

Los usuarios ahora pueden eliminar exámenes médicos desde la página de detalle del examen. La eliminación incluye confirmación y limpieza inteligente de archivos.

## 🎯 Características

### 1. Botón de Eliminar

- **Ubicación:** Header de la página de detalle del examen (esquina superior derecha)
- **Estilo:** Botón rojo con icono de papelera
- **Acción:** Muestra modal de confirmación antes de eliminar

### 2. Modal de Confirmación

- **Título:** "¿Eliminar examen?"
- **Mensaje:** Advierte que la acción no se puede deshacer
- **Opciones:**
  - **Cancelar:** Cierra el modal sin hacer nada
  - **Sí, eliminar:** Procede con la eliminación

### 3. Proceso de Eliminación

1. **Verifica autenticación:** Solo usuarios autenticados
2. **Verifica propiedad:** Solo el dueño puede eliminar
3. **Elimina el examen** de la base de datos
4. **Limpieza inteligente de archivos:**
   - Si el documento asociado **solo tiene este examen** → elimina el archivo PDF del servidor
   - Si el documento tiene **otros exámenes** → mantiene el archivo (otros exámenes lo usan)
5. **Redirecciona** al dashboard

## 🔧 Implementación Técnica

### Backend: DELETE Endpoint

**Ubicación:** `app/api/exams/[id]/route.ts`

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Verificar autenticación
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 2. Obtener examen con documento y sus relaciones
  const exam = await prisma.medicalExam.findUnique({
    where: { id: examId },
    include: {
      document: {
        include: {
          medicalExams: true,  // Para saber cuántos exámenes usan el documento
        },
      },
    },
  })

  // 3. Verificar que el examen pertenece al usuario
  if (exam.userId !== session.user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // 4. Eliminar el examen
  await prisma.medicalExam.delete({
    where: { id: examId },
  })

  // 5. Si el documento solo tenía este examen, eliminarlo también
  if (exam.document && exam.document.medicalExams.length === 1) {
    // Eliminar archivo físico
    await fs.unlink(exam.document.filePath)

    // Eliminar documento de BD
    await prisma.document.delete({
      where: { id: exam.document.id },
    })
  }

  return NextResponse.json({
    message: 'Examen eliminado exitosamente',
    deletedExamId: examId,
  })
}
```

### Frontend: Botón y Modal

**Ubicación:** `app/dashboard/exams/[id]/ExamDetailClient.tsx`

**Estados:**
```typescript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const [deleting, setDeleting] = useState(false)
```

**Función de eliminación:**
```typescript
const handleDelete = async () => {
  setDeleting(true)
  try {
    const response = await fetch(`/api/exams/${examId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Error al eliminar el examen')
    }

    // Redirigir al dashboard
    router.push('/dashboard')
    router.refresh()
  } catch (err) {
    alert('Error al eliminar el examen. Por favor intenta de nuevo.')
    setDeleting(false)
    setShowDeleteConfirm(false)
  }
}
```

## 📋 Casos de Uso

### Caso 1: Examen Único con PDF

**Escenario:**
```
Usuario tiene 1 examen → asociado a 1 PDF
Usuario elimina el examen
```

**Resultado:**
- ✅ Examen eliminado de la BD
- ✅ PDF eliminado del servidor
- ✅ Documento eliminado de la BD
- ✅ Usuario redirigido al dashboard

**Logs del servidor:**
```bash
🗑️ Examen eliminado: cm...
🗑️ Archivo eliminado: uploads/user123/file456.pdf.enc
🗑️ Documento eliminado: cm...
```

### Caso 2: Múltiples Exámenes del Mismo PDF

**Escenario:**
```
Usuario sube mismo PDF 2 veces (actualización)
Tiene 2 exámenes → ambos asociados al mismo documento/PDF
Usuario elimina el primer examen
```

**Resultado:**
- ✅ Primer examen eliminado de la BD
- ✅ PDF **NO** se elimina (el segundo examen lo usa)
- ✅ Documento **NO** se elimina (el segundo examen lo usa)
- ✅ Usuario redirigido al dashboard

**Logs del servidor:**
```bash
🗑️ Examen eliminado: cm...
```

### Caso 3: Último Examen de un PDF con Múltiples Exámenes

**Escenario:**
```
Usuario tenía 2 exámenes del mismo PDF
Ya eliminó el primero
Ahora elimina el segundo (último)
```

**Resultado:**
- ✅ Segundo examen eliminado de la BD
- ✅ PDF eliminado del servidor (ya no hay exámenes que lo usen)
- ✅ Documento eliminado de la BD
- ✅ Usuario redirigido al dashboard

**Logs del servidor:**
```bash
🗑️ Examen eliminado: cm...
🗑️ Archivo eliminado: uploads/user123/file456.pdf.enc
🗑️ Documento eliminado: cm...
```

## 🔒 Seguridad

### Autenticación y Autorización

- ✅ Solo usuarios autenticados pueden eliminar
- ✅ Solo el dueño del examen puede eliminarlo
- ✅ Se verifica `exam.userId === session.user.id`

### Protección de Datos

- ✅ Los archivos solo se eliminan si no hay otros exámenes usándolos
- ✅ Si falla la eliminación del archivo, se continúa (no bloquea la eliminación del examen)
- ✅ La eliminación es transaccional (si falla algo, se puede reintentar)

## 🎨 Interfaz de Usuario

### Botón de Eliminar

**Ubicación:** Header derecho, al lado del título

**Estilos:**
```tsx
<button
  onClick={() => setShowDeleteConfirm(true)}
  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
>
  <svg>...</svg>
  Eliminar
</button>
```

### Modal de Confirmación

**Características:**
- Fondo oscuro semi-transparente (overlay)
- Modal centrado con icono de advertencia
- Mensaje claro y conciso
- Dos botones: Cancelar (gris) y Sí, eliminar (rojo)
- Estado de carga durante eliminación ("Eliminando...")
- Spinner animado mientras procesa

**Diseño:**
```
┌─────────────────────────────────────────┐
│  ⚠️  ¿Eliminar examen?                  │
│                                         │
│  Esta acción no se puede deshacer.      │
│  Se eliminará el examen y, si no hay    │
│  otros exámenes asociados al mismo      │
│  PDF, también se eliminará el archivo.  │
│                                         │
│              [Cancelar] [🗑️ Sí, eliminar]│
└─────────────────────────────────────────┘
```

## 🚀 Despliegue

Para desplegar esta funcionalidad:

```bash
# 1. Rebuild de la imagen Docker
./docker-build.sh

# 2. Restart del contenedor
docker-compose down
docker-compose up -d

# 3. Verificar logs
docker-compose logs -f health-tracker
```

## ✅ Pruebas

### Test 1: Eliminar Examen Único

1. Sube un PDF nuevo
2. Ve al detalle del examen
3. Haz clic en "Eliminar"
4. Confirma en el modal
5. Verifica que:
   - ✅ Te redirige al dashboard
   - ✅ El examen ya no aparece en la lista
   - ✅ Los logs muestran examen, archivo y documento eliminados

### Test 2: Eliminar con PDF Compartido

1. Sube un PDF dos veces (mismo archivo)
2. Elimina el primer examen
3. Verifica que:
   - ✅ El primer examen se eliminó
   - ✅ El segundo examen sigue existiendo
   - ✅ El PDF sigue disponible para el segundo examen
   - ✅ Los logs muestran solo "examen eliminado"

### Test 3: Cancelar Eliminación

1. Ve al detalle de un examen
2. Haz clic en "Eliminar"
3. Haz clic en "Cancelar"
4. Verifica que:
   - ✅ El modal se cierra
   - ✅ El examen NO se eliminó
   - ✅ Sigues en la página de detalle

### Test 4: Seguridad - Usuario No Autorizado

1. Intenta hacer DELETE request a `/api/exams/{id}` sin autenticación
2. Verifica respuesta: `401 No autenticado`
3. Intenta eliminar examen de otro usuario (vía API directa)
4. Verifica respuesta: `403 No autorizado`

## 📊 Logs del Servidor

**Eliminación exitosa (examen único):**
```bash
🗑️ Examen eliminado: cm5abc123xyz
🗑️ Archivo eliminado: uploads/user_abc/document_xyz.pdf.enc
🗑️ Documento eliminado: cm5doc123xyz
```

**Eliminación exitosa (PDF compartido):**
```bash
🗑️ Examen eliminado: cm5abc123xyz
```

**Error al eliminar archivo (no crítico):**
```bash
🗑️ Examen eliminado: cm5abc123xyz
Error al eliminar archivo: ENOENT: no such file or directory
🗑️ Documento eliminado: cm5doc123xyz
```

## 📝 Archivos Modificados

1. **`app/api/exams/[id]/route.ts`**
   - Agregado método `DELETE`
   - Lógica de limpieza inteligente de archivos
   - Validación de autenticación y autorización

2. **`app/dashboard/exams/[id]/ExamDetailClient.tsx`**
   - Agregado botón "Eliminar" en header
   - Modal de confirmación
   - Estados `showDeleteConfirm` y `deleting`
   - Función `handleDelete()`
   - Redirección al dashboard después de eliminar

## 🎯 Mejoras Futuras (Opcional)

- [ ] Papelera de reciclaje (soft delete)
- [ ] Historial de exámenes eliminados
- [ ] Recuperar exámenes eliminados (dentro de X días)
- [ ] Confirmación adicional para exámenes con datos importantes
- [ ] Batch delete (eliminar múltiples exámenes a la vez)
