# Validación de Identidad del Paciente

## Resumen

Se ha implementado un sistema de validación que asegura que los usuarios solo puedan subir exámenes médicos a su propio nombre. Esto previene que se suban PDFs de otros pacientes al sistema.

## Cambios Implementados

### 1. Campos de Nombre Obligatorios en el Registro

**Antes:**
- Campo único "Nombre" (opcional)

**Ahora:**
- Campo "Nombre" (obligatorio, mínimo 2 caracteres)
- Campo "Apellido" (obligatorio, mínimo 2 caracteres)

**Ubicación:** `app/auth/signup/page.tsx`

**Validación:**
```typescript
// Cliente
if (!firstName || !lastName) {
  error: 'Los campos son obligatorios'
}

// Servidor (app/api/auth/register/route.ts)
if (firstName.trim().length < 2 || lastName.trim().length < 2) {
  error: 'El nombre y apellido deben tener al menos 2 caracteres'
}
```

### 2. Actualización de Base de Datos

**Schema modificado:** `prisma/schema.prisma`

```prisma
model User {
  firstName     String    // Nuevo - obligatorio
  lastName      String    // Nuevo - obligatorio
  name          String?   // Deprecado - se mantiene por compatibilidad
}
```

**Migración:** `prisma/migrations/20260101182533_add_firstname_lastname/migration.sql`

La migración:
- Agrega campos `firstName` y `lastName`
- Migra usuarios existentes dividiendo el campo `name`
- Establece valores por defecto si no existe nombre previo

**Ejecutar migración:**
```bash
npx prisma migrate deploy
```

### 3. Validación de PDF contra Identidad del Usuario

**Ubicación:** `app/api/exams/analyze/route.ts:75-85`

Cuando un usuario sube un PDF:

1. Se extrae el texto del PDF
2. Se obtiene el `firstName` y `lastName` del usuario desde la base de datos
3. Se valida que ambos nombres aparezcan en el PDF

**Función de validación:** `validatePatientInPDF()`

**Características:**
- Normaliza texto (quita acentos, minúsculas, caracteres especiales)
- Busca múltiples variaciones:
  - "Nombre Apellido"
  - "Apellido Nombre"
  - Ambos nombres dentro de 200 caracteres de distancia
- Tolerante a diferencias de formato

**Ejemplo de validación:**
```
Usuario: Juan Pérez
PDF contiene: "PACIENTE: PEREZ, JUAN" ✓ Válido
PDF contiene: "Juan Carlos Pérez" ✓ Válido
PDF contiene: "María González" ✗ Rechazado
```

### 4. Mensaje de Error al Usuario

Si el PDF no corresponde al paciente:

```json
{
  "error": "El PDF no corresponde a tu nombre. Solo puedes subir exámenes médicos a tu propio nombre.",
  "details": "Se esperaba encontrar: Juan Pérez"
}
```

## Flujo Completo

```
1. Usuario se registra
   ├─ Ingresa nombre: "Juan"
   ├─ Ingresa apellido: "Pérez"
   └─ Se guarda en BD: firstName="Juan", lastName="Pérez"

2. Usuario sube PDF
   ├─ Sistema extrae texto del PDF
   ├─ Busca "juan" Y "perez" en el PDF (normalizado)
   │
   ├─ ✓ Si encuentra ambos → Permite upload
   └─ ✗ Si NO encuentra → Rechaza con error 403
```

## Casos de Uso Validados

### ✅ Casos que FUNCIONAN:

| Usuario Registrado | Texto en PDF | Resultado |
|-------------------|--------------|-----------|
| Juan Pérez | PACIENTE: PEREZ, JUAN | ✓ Válido |
| María González | María José González | ✓ Válido |
| Carlos López | Dr. López atiende a Carlos | ✓ Válido |
| Ana García | GARCIA PEREZ, ANA | ✓ Válido |

### ❌ Casos que se RECHAZAN:

| Usuario Registrado | Texto en PDF | Resultado |
|-------------------|--------------|-----------|
| Juan Pérez | PACIENTE: María González | ✗ Rechazado |
| Juan Pérez | Examen sin nombre | ✗ Rechazado |
| Carlos López | Solo aparece "Carlos" | ✗ Rechazado |

## Casos Especiales

### Nombres Compuestos
```
Usuario: Juan Carlos Pérez López
Registro: firstName="Juan Carlos", lastName="Pérez López"
Validación: Busca "juan carlos" Y "perez lopez"
```

### Nombres con Acentos
```
Usuario: José García
PDF: "JOSE GARCIA" (sin acentos)
Resultado: ✓ Válido (la normalización quita acentos)
```

### Apellidos Primero
```
Usuario: Pedro Martínez
PDF: "MARTINEZ, PEDRO"
Resultado: ✓ Válido (busca ambas variaciones)
```

## Seguridad

### Qué previene:
- ✓ Subir PDFs de otros pacientes
- ✓ Compartir cuenta entre personas
- ✓ Mezclar historiales médicos

### Qué NO previene:
- ⚠ Si dos personas tienen el mismo nombre (muy raro en contexto médico)
- ⚠ PDFs editados maliciosamente (pero esto requiere esfuerzo significativo)

## Migración de Usuarios Existentes

Para usuarios que ya estén en el sistema:

1. La migración SQL divide el campo `name` en `firstName` y `lastName`
2. Si no hay nombre, establece "Usuario" y "Sistema" por defecto
3. Estos usuarios deberán actualizar su perfil con sus nombres reales

**Ejemplo:**
```sql
-- Usuario con name="Juan Pérez"
firstName = "Juan"
lastName = "Pérez"

-- Usuario con name="María"
firstName = "María"
lastName = "" (se debe completar)

-- Usuario sin nombre
firstName = "Usuario"
lastName = "Sistema" (se debe completar)
```

## Próximos Pasos (Opcional)

### Mejoras futuras sugeridas:

1. **Validación con IA adicional**
   - Usar el modelo de IA para extraer el nombre del paciente
   - Comparar con mayor precisión

2. **Página de perfil**
   - Permitir a usuarios actualizar firstName/lastName
   - Validar que coincidan con documentos de identidad

3. **Alertas de seguridad**
   - Notificar cuando un PDF es rechazado
   - Log de intentos de subir PDFs de terceros

4. **Validación flexible**
   - Permitir sobrenombres o alias
   - Configurar nombres alternativos (ej: "José" vs "Pepe")

## Pruebas

Para probar el sistema:

1. **Registrar usuario nuevo:**
   ```
   Nombre: Juan
   Apellido: Pérez
   ```

2. **Subir PDF válido:**
   - PDF debe contener "Juan" y "Pérez"
   - Resultado esperado: ✓ Éxito

3. **Subir PDF inválido:**
   - PDF con otro nombre
   - Resultado esperado: Error 403

## Referencias

- **Schema:** `prisma/schema.prisma:18-19`
- **Validación:** `app/api/exams/analyze/route.ts:108-164`
- **Formulario:** `app/auth/signup/page.tsx:104-132`
- **API Registro:** `app/api/auth/register/route.ts:9-25`
