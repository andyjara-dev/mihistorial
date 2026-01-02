# Merge Inteligente de Datos de Exámenes

## 🎯 Problema Resuelto

Cuando subes el **mismo PDF dos veces** (mismo hash SHA-256), el sistema ahora hace un **merge inteligente** de los datos:

- ✅ **Mantiene TODOS los datos viejos** que ya fueron extraídos
- ✅ **Agrega SOLO los datos nuevos** que no existían antes
- ✅ **No pierde información** cuando la IA reprocesa el PDF

## 💡 ¿Por qué es necesario?

**Escenario Real:**

1. Subes un PDF de examen de sangre
2. La IA extrae: Hemoglobina, Glucosa, Colesterol
3. Una semana después, vuelves a subir el **mismo PDF**
4. Esta vez la IA también encuentra: Triglicéridos, HDL

**Antes del merge inteligente:**
- ❌ Se perdían Hemoglobina, Glucosa, Colesterol
- ❌ Solo quedaban Triglicéridos, HDL
- ❌ Resultado: datos incompletos

**Con merge inteligente:**
- ✅ Se mantienen Hemoglobina, Glucosa, Colesterol
- ✅ Se agregan Triglicéridos, HDL
- ✅ Resultado: **todos los datos completos**

## 🔧 Cómo Funciona

### 1. Detección de Duplicado

El sistema detecta PDFs duplicados por **hash SHA-256** (ver `DETECCION-DUPLICADOS.md`).

### 2. Merge de Datos

Cuando se detecta un duplicado y el examen ya fue procesado con IA, el sistema:

#### A. Desencripta datos viejos
```typescript
const oldDataJson = decryptData(
  medicalExam.encryptedData,
  medicalExam.encryptionIv,
  user.encryptionKey
)
const oldData = JSON.parse(oldDataJson)
```

#### B. Hace merge inteligente
```typescript
const finalData = mergeExamData(oldData, extractedData)
```

#### C. Encripta y guarda resultado mergeado
```typescript
const { encrypted, iv } = encryptData(
  JSON.stringify(finalData),
  user.encryptionKey
)
```

### 3. Lógica de Merge

**Para campos normales:**
- Si el campo existe en datos viejos → **mantenerlo** (no sobrescribir)
- Si el campo NO existe en datos viejos → **agregarlo**

**Para arrays de resultados (`results`, `measurements`):**
- Identificar cada resultado por **nombre normalizado** del test
- Mantener todos los resultados viejos
- Agregar solo resultados nuevos que no existen

## 📝 Implementación

### Función Principal: `mergeExamData()`

**Ubicación:** `app/api/exams/upload/route.ts:16-32`

```typescript
/**
 * Hace merge inteligente de datos de examen:
 * - Mantiene todos los datos viejos
 * - Agrega solo los datos nuevos que no existían
 * - Para arrays de resultados, hace merge por nombre del test
 */
function mergeExamData(oldData: any, newData: any): any {
  const merged = { ...oldData }

  for (const key in newData) {
    if (key === 'results' || key === 'measurements') {
      // Para arrays de resultados, hacer merge especial
      merged[key] = mergeResults(oldData[key] || [], newData[key] || [])
    } else if (!(key in oldData)) {
      // Si el campo no existe en datos viejos, agregarlo
      merged[key] = newData[key]
    }
    // Si ya existe en oldData, NO sobrescribir (mantener el viejo)
  }

  return merged
}
```

### Función de Merge de Resultados: `mergeResults()`

**Ubicación:** `app/api/exams/upload/route.ts:38-57`

```typescript
/**
 * Hace merge de arrays de resultados médicos
 * Identifica resultados por el nombre del test
 */
function mergeResults(oldResults: any[], newResults: any[]): any[] {
  const merged = [...oldResults]
  const existingTests = new Set(
    oldResults.map(r => normalizeTestName(r.test || r.name || r.measurement || ''))
  )

  for (const newResult of newResults) {
    const testName = normalizeTestName(newResult.test || newResult.name || newResult.measurement || '')

    if (!existingTests.has(testName)) {
      merged.push(newResult)
      console.log(`  ➕ Agregando nuevo resultado: ${testName}`)
    } else {
      console.log(`  ⏭️  Manteniendo resultado existente: ${testName}`)
    }
  }

  return merged
}
```

### Normalización de Nombres: `normalizeTestName()`

**Ubicación:** `app/api/exams/upload/route.ts:62-69`

```typescript
/**
 * Normaliza nombres de tests para comparación
 */
function normalizeTestName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, '') // Solo letras y números
    .trim()
}
```

**¿Por qué normalizar?**

Para que estos nombres se consideren iguales:
- "Hemoglobina" = "hemoglobina" = "HEMOGLOBINA"
- "Glóbulos Blancos" = "globulos blancos" = "GLOBULOS-BLANCOS"

## 🔍 Logs del Servidor

Cuando se hace un merge, verás en los logs:

```bash
📄 PDF duplicado detectado (hash: abc123...). Actualizando examen existente.
♻️ Examen actualizado: cm...

🔄 Merge completado: 5 datos viejos + 7 datos nuevos → 8 datos finales
  ⏭️  Manteniendo resultado existente: hemoglobina
  ⏭️  Manteniendo resultado existente: glucosa
  ⏭️  Manteniendo resultado existente: colesterol
  ➕ Agregando nuevo resultado: trigliceridos
  ➕ Agregando nuevo resultado: hdl
```

## 💼 Casos de Uso

### Caso 1: Primera Carga
```
Usuario sube "examenes.pdf" →
Hash: abc123
No existe documento →
✨ Crea nuevo examen
📊 IA extrae: Hemoglobina, Glucosa
```

### Caso 2: Segunda Carga (Mismo PDF)
```
Usuario sube "examenes.pdf" (mismo archivo) →
Hash: abc123
Ya existe documento →
♻️ Actualiza examen
📊 IA extrae: Hemoglobina, Glucosa, Triglicéridos
🔄 MERGE:
   - Mantiene: Hemoglobina (viejo)
   - Mantiene: Glucosa (viejo)
   - Agrega: Triglicéridos (nuevo)
✅ Resultado final: 3 indicadores
```

### Caso 3: Tercera Carga (Mismo PDF)
```
Usuario sube "examenes.pdf" (mismo archivo) →
Hash: abc123
Ya existe documento →
♻️ Actualiza examen
📊 IA extrae: Glucosa, HDL, LDL
🔄 MERGE:
   - Mantiene: Hemoglobina (viejo)
   - Mantiene: Glucosa (viejo)
   - Mantiene: Triglicéridos (viejo)
   - Agrega: HDL (nuevo)
   - Agrega: LDL (nuevo)
✅ Resultado final: 5 indicadores
```

## 🎯 Beneficios

1. **No se pierde información** - Todos los datos extraídos previamente se mantienen
2. **Mejora incremental** - Cada reprocesamiento puede encontrar más datos
3. **Consistencia** - Si la IA extrae los mismos datos dos veces, no se duplican
4. **Transparencia** - Los logs muestran qué se mantiene y qué se agrega

## ⚙️ Configuración

No requiere configuración. El merge inteligente está **siempre activo** cuando:
- Se detecta un PDF duplicado (mismo hash)
- El examen ya fue procesado con IA (`aiProcessed = true`)

## 🔒 Seguridad

- Los datos viejos se desencriptan **solo en memoria** para hacer el merge
- El resultado mergeado se encripta inmediatamente con la misma clave del usuario
- No se comparten datos entre usuarios
- El merge solo afecta al examen del usuario que subió el PDF

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

## 📊 Ejemplo Completo

**Datos Viejos (Primera carga):**
```json
{
  "examType": "Sangre",
  "institution": "Lab XYZ",
  "results": [
    { "test": "Hemoglobina", "value": "15.2", "unit": "g/dL" },
    { "test": "Glucosa", "value": "95", "unit": "mg/dL" }
  ]
}
```

**Datos Nuevos (Segunda carga del mismo PDF):**
```json
{
  "examType": "Sangre",
  "institution": "Lab XYZ",
  "results": [
    { "test": "Hemoglobina", "value": "15.2", "unit": "g/dL" },
    { "test": "Triglicéridos", "value": "120", "unit": "mg/dL" },
    { "test": "HDL", "value": "55", "unit": "mg/dL" }
  ],
  "notes": "Resultado dentro de parámetros normales"
}
```

**Datos Finales (Después del merge):**
```json
{
  "examType": "Sangre",
  "institution": "Lab XYZ",
  "results": [
    { "test": "Hemoglobina", "value": "15.2", "unit": "g/dL" },  // ⏭️ Mantenido
    { "test": "Glucosa", "value": "95", "unit": "mg/dL" },       // ⏭️ Mantenido
    { "test": "Triglicéridos", "value": "120", "unit": "mg/dL" }, // ➕ Agregado
    { "test": "HDL", "value": "55", "unit": "mg/dL" }            // ➕ Agregado
  ],
  "notes": "Resultado dentro de parámetros normales"              // ➕ Agregado
}
```

## 📁 Archivos Modificados

1. `app/api/exams/upload/route.ts` - Lógica completa de merge
