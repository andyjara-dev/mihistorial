# ⚙️ Configurar IA para Procesamiento de PDFs

El sistema soporta **2 proveedores de IA** que puedes cambiar fácilmente:

## 📋 Proveedores Disponibles

| Proveedor | Costo | Calidad | Configuración |
|-----------|-------|---------|---------------|
| **Google Gemini** ⭐ | Gratis | Excelente | 2 minutos |
| **Claude (Anthropic)** | Pagado | Excelente | 5 minutos |

---

## 🔧 Cambiar de Proveedor

Edita `.env` y cambia `AI_PROVIDER`:

```bash
# Para usar Gemini (GRATIS)
AI_PROVIDER="gemini"

# O para usar Claude (PAGADO)
AI_PROVIDER="claude"
```

¡Eso es todo! El sistema selecciona automáticamente el proveedor configurado.

---

## 🆓 Opción 1: Google Gemini (Gratis) ⭐

### ¿Por qué Gemini?
- ✅ Completamente gratis
- ✅ No requiere tarjeta de crédito
- ✅ 1,500 exámenes por día
- ✅ Excelente calidad de extracción

### Paso 1: Obtener API Key

1. **Ir a Google AI Studio**
   - Abre: https://makersuite.google.com/app/apikey

2. **Iniciar sesión**
   - Usa tu cuenta de Google (Gmail)

3. **Crear API Key**
   - Click en **"Get API Key"** o **"Create API Key"**
   - Selecciona un proyecto o crea uno nuevo
   - Click en **"Create API key in new project"**

4. **Copiar la API Key**
   - Se verá algo como: `AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxx`
   - Click en el icono de copiar

### Paso 2: Configurar en el Proyecto

Edita el archivo `.env`:

```bash
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyD_tu_api_key_aqui"
```

### Paso 3: Reiniciar el Servidor

```bash
# Detener el servidor (Ctrl+C en la terminal)
# Luego reiniciar:
npm run dev
```

### Paso 4: ¡Verificar que Funciona!

```bash
# En otra terminal, verificar configuración:
curl http://localhost:3000/api/ai-info
```

Deberías ver:
```json
{
  "provider": "gemini",
  "name": "Google Gemini",
  "cost": "Gratis",
  "configured": true
}
```

### Probar con un Examen

1. Abre http://localhost:3000
2. Inicia sesión
3. Sube un examen médico (cualquier PDF)
4. El sistema lo procesará con Gemini automáticamente

En los logs del servidor verás:
```
🤖 Procesando con: Google Gemini (Gratis)
```

### Límites Gratuitos de Gemini

- **60 requests por minuto**
- **1,500 requests por día**
- **Sin cargos ocultos**

Suficiente para:
- Uso personal ilimitado
- ~45,000 exámenes por mes

---

## 💳 Opción 2: Claude (Anthropic) - Pagado

### ¿Por qué Claude?
- ✅ Excelente calidad de análisis
- ✅ Muy bueno con documentos médicos
- ✅ Soporte técnico oficial

### Costo
- **$0.015 por 1,000 tokens de entrada**
- **$0.075 por 1,000 tokens de salida**
- Aprox. **$0.05 por examen** promedio

### Paso 1: Crear Cuenta

1. **Ir a Anthropic Console**
   - Abre: https://console.anthropic.com/

2. **Crear cuenta**
   - Regístrate con email
   - Verifica tu email

3. **Agregar método de pago**
   - Menu → Billing
   - Agrega tarjeta de crédito
   - Te dan $5 de crédito inicial (100 exámenes gratis)

### Paso 2: Obtener API Key

1. **En el Console de Anthropic**
   - Ve a: API Keys
   - Click en **"Create Key"**

2. **Copiar la API Key**
   - Se verá como: `sk-ant-api03-xxxxxxxxxxxxx`
   - ⚠️ Solo se muestra una vez, guárdala bien

### Paso 3: Configurar en el Proyecto

Edita el archivo `.env`:

```bash
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-api03-tu_api_key_aqui"
```

### Paso 4: Reiniciar y Verificar

```bash
npm run dev
```

Verificar:
```bash
curl http://localhost:3000/api/ai-info
```

Deberías ver:
```json
{
  "provider": "claude",
  "name": "Anthropic Claude",
  "cost": "Pagado",
  "configured": true
}
```

---

## 🔄 Cambiar Entre Proveedores

Puedes cambiar entre Gemini y Claude en cualquier momento:

```bash
# En .env
AI_PROVIDER="gemini"  # Para usar Gemini
# O
AI_PROVIDER="claude"  # Para usar Claude
```

Reinicia el servidor y listo. Los exámenes ya procesados no se ven afectados.

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar ambos proveedores?

Sí, configura ambas API keys en `.env` y cambia `AI_PROVIDER` cuando quieras.

### ¿Qué pasa si no configuro ninguna API key?

El sistema guardará el examen pero no lo procesará con IA. Verás los datos básicos (tipo, institución, fecha) pero no la extracción automática de resultados.

### ¿Cuál es mejor, Gemini o Claude?

Para la mayoría de casos, **Gemini es suficiente y gratis**. Claude puede ser ligeramente mejor en documentos muy complejos, pero no vale la pena pagar para uso personal.

### ¿Los datos se envían a Google/Anthropic?

Sí, el texto del PDF se envía para procesamiento. Si necesitas **máxima privacidad**, considera usar **Ollama** (local, gratis, privado). Ver `ALTERNATIVAS-IA.md`.

### ¿Cómo sé cuál estoy usando actualmente?

```bash
curl http://localhost:3000/api/ai-info
```

O mira los logs del servidor cuando subes un examen:
```
🤖 Procesando con: Google Gemini (Gratis)
```

### ¿Puedo agregar otros proveedores?

Sí! Ver `ALTERNATIVAS-IA.md` para:
- OpenAI GPT
- Groq (gratis, muy rápido)
- Ollama (local, 100% privado)

---

## 🐛 Solución de Problemas

### Error: "GEMINI_API_KEY no está configurada"

**Solución:**
1. Verifica que agregaste la key en `.env`
2. Asegúrate de que no hay espacios antes/después
3. Reinicia el servidor

### Error: "API key not valid"

**Solución:**
1. Copia toda la key completa (sin espacios)
2. Verifica que esté entre comillas en `.env`
3. Genera una nueva key si es necesario

### Error: "Quota exceeded" (Gemini)

**Solución:**
- Llegaste al límite de 1,500/día
- Espera 24 horas
- O crea otro proyecto de Google con otra cuenta
- O cambia a Claude temporalmente

### El examen se sube pero no se procesa

**Solución:**
1. Verifica que `AI_PROVIDER` esté configurado correctamente
2. Verifica que la API key correspondiente esté configurada
3. Mira los logs del servidor para ver el error exacto
4. Prueba: `curl http://localhost:3000/api/ai-info`

---

## 📝 Resumen Rápido

### Para Gemini (GRATIS):
```bash
# En .env:
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSy..."

# Reiniciar:
npm run dev
```

### Para Claude (PAGADO):
```bash
# En .env:
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Reiniciar:
npm run dev
```

---

¿Necesitas más opciones? Ver **[ALTERNATIVAS-IA.md](ALTERNATIVAS-IA.md)**
