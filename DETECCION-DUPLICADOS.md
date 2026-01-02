# Detección de Duplicados de PDFs

## 📋 Problema Resuelto

Cuando subes el mismo PDF dos veces (por ejemplo, la primera vez faltaban datos y la segunda está completo), el sistema ahora **actualiza el examen existente** en lugar de crear un duplicado.

## 🔍 Cómo Funciona

### 1. Detección por Hash SHA-256

Cada PDF se identifica mediante un **hash SHA-256** del contenido del archivo:
- Dos archivos idénticos → mismo hash
- Archivos diferentes → hash diferente
- El hash se calcula del contenido, no del nombre del archivo

**Ubicación:** `app/api/exams/upload/route.ts:59-60`

```typescript
const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
```

### 2. Búsqueda de Duplicados

Antes de crear un nuevo examen, el sistema busca si ya existe un documento con el mismo hash para ese usuario.

**Ubicación:** `app/api/exams/upload/route.ts:63-71`

```typescript
const existingDocument = await prisma.document.findFirst({
  where: {
    userId: user.id,
    fileHash,
  },
  include: {
    medicalExams: true,
  },
})
```

### 3. Actualizar vs Crear

**Si el PDF ya existe (isUpdate = true):**
- ✅ Reutiliza el documento existente (no copia el archivo otra vez)
- ✅ Actualiza el examen médico con los nuevos datos
- ✅ Reprocesa con IA para obtener resultados actualizados
- ✅ Muestra mensaje: "Examen actualizado exitosamente. El PDF ya existía, se reprocesará con IA."

**Si el PDF es nuevo:**
- ✅ Guarda el archivo encriptado
- ✅ Crea nuevo documento en BD
- ✅ Crea nuevo examen médico
- ✅ Procesa con IA
- ✅ Muestra mensaje: "Examen subido exitosamente"

## 📊 Casos de Uso

### Caso 1: Primera Carga del PDF
```
Usuario sube "examenes_sangre_2024.pdf" →
Hash: abc123...
No existe documento con ese hash →
✨ Crea nuevo examen
```

### Caso 2: Segunda Carga del Mismo PDF
```
Usuario sube "examenes_sangre_2024.pdf" (mismo archivo) →
Hash: abc123...
Ya existe documento con ese hash →
♻️ Actualiza examen existente
📄 Muestra alerta: "PDF duplicado detectado"
```

### Caso 3: PDF Similar Pero Diferente
```
Usuario sube "examenes_sangre_2024_v2.pdf" (contenido diferente) →
Hash: xyz789...
No existe documento con ese hash →
✨ Crea nuevo examen
```

## 🎯 Beneficios

1. **Ahorro de Espacio:** No se almacenan PDFs duplicados
2. **Datos Actualizados:** Si el PDF se reprocesa, obtiene los datos más recientes
3. **Sin Duplicados en Dashboard:** Solo aparece una vez cada examen único
4. **Mejor UX:** El usuario sabe cuando está actualizando vs creando

## 🔧 Logs del Servidor

Cuando se detecta un duplicado, verás en los logs:

```bash
📄 PDF duplicado detectado (hash: abc123...). Actualizando examen existente.
♻️ Examen actualizado: cm...
```

Cuando es nuevo:

```bash
✨ Nuevo examen creado: cm...
```

## 💡 Ejemplo Real

**Escenario:** Subes un PDF de examen de sangre, pero la primera vez la IA no pudo extraer la hemoglobina. Una semana después, vuelves a subir el mismo PDF.

**Antes (sin detección de duplicados):**
- Resultado: 2 exámenes en el dashboard (duplicado)
- Archivos: 2 copias del mismo PDF

**Ahora (con detección de duplicados):**
- Resultado: 1 examen en el dashboard (actualizado)
- Archivos: 1 copia del PDF
- El examen se reprocesa con IA
- Si ahora la IA encuentra la hemoglobina, se actualiza

## ⚙️ Configuración

No requiere configuración. La detección está **siempre activa** y es automática.

## 🔒 Seguridad

- El hash se calcula sobre el contenido del archivo **original** (antes de encriptar)
- Cada usuario solo puede actualizar sus propios exámenes
- La búsqueda de duplicados es por usuario (`userId` + `fileHash`)
- No se comparten documentos entre usuarios

## 📝 Archivos Modificados

1. `app/api/exams/upload/route.ts` - Lógica principal
2. `app/dashboard/upload/page.tsx` - Mensaje de alerta al usuario
3. `lib/encryption.ts` - Cálculo de hash SHA-256 (ya existía)
