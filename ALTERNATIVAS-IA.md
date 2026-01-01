# 🤖 Alternativas de IA para Procesamiento de PDFs

El sistema por defecto usa **Google Gemini (GRATIS)** en lugar de Claude API (pagado).

## 📊 Comparación de Opciones

| Proveedor | Costo | Calidad | Límites | Recomendación |
|-----------|-------|---------|---------|---------------|
| **Google Gemini** ⭐ | Gratis | Excelente | 60 req/min | **Mejor opción** |
| OpenAI GPT-4 | $0.03/1K tokens | Excelente | Pago desde inicio | Buena pero pagada |
| Groq | Gratis | Buena | 30 req/min | Muy rápido |
| Ollama | Gratis | Buena | Ilimitado (local) | Requiere recursos |
| Claude (Anthropic) | $0.015/1K tokens | Excelente | Pago desde inicio | Pagado |

---

## 🆓 Opción 1: Google Gemini (Actual - GRATIS) ⭐

**Ya está configurado en el proyecto.**

### Obtener API Key (Gratis)

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click en "Get API Key"
3. Crea un proyecto o selecciona uno existente
4. Copia la API key

### Configurar

Edita `.env`:
```bash
GEMINI_API_KEY="tu-api-key-aqui"
```

**Límites gratuitos:**
- 60 requests por minuto
- 1,500 requests por día
- Suficiente para uso personal

---

## 💰 Opción 2: OpenAI GPT (Alternativa Pagada)

### Ventajas
- Muy preciso
- $5 de crédito gratis al registrarse
- Ampliamente soportado

### Instalar

```bash
npm install openai
```

### Crear procesador

Crea `lib/pdf-processor-openai.ts`:

```typescript
import pdf from 'pdf-parse'
import OpenAI from 'openai'

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer)
  return data.text
}

export async function processExamWithAI(
  pdfText: string,
  examType: string,
  institution: string
): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return { examType, institution, processed: false }
  }

  const openai = new OpenAI({ apiKey })

  const prompt = `Analiza este examen médico y extrae información en JSON...

  ${pdfText}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Más barato que GPT-4
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}
```

### Configurar

En `.env`:
```bash
OPENAI_API_KEY="sk-..."
```

En `app/api/exams/upload/route.ts`:
```typescript
import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor-openai'
```

**Costo:** ~$0.15 por 1,000 exámenes (con GPT-4o-mini)

---

## ⚡ Opción 3: Groq (Gratis y Rápido)

**Ventaja:** Extremadamente rápido, gratis.

### Obtener API Key

1. Ve a [console.groq.com](https://console.groq.com)
2. Regístrate gratis
3. Crea una API key

### Instalar

```bash
npm install groq-sdk
```

### Crear procesador

Crea `lib/pdf-processor-groq.ts`:

```typescript
import pdf from 'pdf-parse'
import Groq from 'groq-sdk'

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer)
  return data.text
}

export async function processExamWithAI(
  pdfText: string,
  examType: string,
  institution: string
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return { examType, institution, processed: false }
  }

  const groq = new Groq({ apiKey })

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Analiza este examen médico: ${pdfText}`,
      },
    ],
    model: 'llama-3.1-70b-versatile',
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content || '{}')
}
```

### Configurar

En `.env`:
```bash
GROQ_API_KEY="gsk_..."
```

**Límites gratuitos:**
- 30 requests por minuto
- 14,400 requests por día

---

## 🖥️ Opción 4: Ollama (Local - Gratis Total)

**Ventaja:** Completamente gratis, privado, sin límites.
**Desventaja:** Requiere recursos (GPU/RAM), más lento.

### Instalar Ollama

```bash
# En tu servidor/PC
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelo (13GB)
ollama pull llama3.1
```

### Instalar SDK

```bash
npm install ollama
```

### Crear procesador

Crea `lib/pdf-processor-ollama.ts`:

```typescript
import pdf from 'pdf-parse'
import { Ollama } from 'ollama'

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer)
  return data.text
}

export async function processExamWithAI(
  pdfText: string,
  examType: string,
  institution: string
): Promise<Record<string, unknown>> {
  const ollama = new Ollama({ host: 'http://localhost:11434' })

  const response = await ollama.chat({
    model: 'llama3.1',
    messages: [
      {
        role: 'user',
        content: `Analiza este examen médico en JSON: ${pdfText}`,
      },
    ],
    format: 'json',
  })

  return JSON.parse(response.message.content)
}
```

**Requisitos:**
- 8GB RAM mínimo
- GPU recomendada (opcional)
- ~20GB espacio en disco

---

## 🔄 Cómo Cambiar de Proveedor

Edita `app/api/exams/upload/route.ts`:

```typescript
// Opción 1: Google Gemini (GRATIS - Por defecto)
import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor-gemini'

// Opción 2: Claude (Pagado)
// import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor'

// Opción 3: OpenAI (Pagado)
// import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor-openai'

// Opción 4: Groq (Gratis)
// import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor-groq'

// Opción 5: Ollama (Local - Gratis)
// import { extractTextFromPDF, processExamWithAI } from '@/lib/pdf-processor-ollama'
```

---

## 🎯 Recomendación por Caso de Uso

### Para uso personal (pocos exámenes/mes)
➡️ **Google Gemini** (gratis, excelente calidad)

### Para uso comercial ligero
➡️ **Groq** (gratis, muy rápido)

### Para máxima privacidad
➡️ **Ollama** (local, sin enviar datos)

### Para máxima calidad
➡️ **Claude** o **GPT-4** (pagados, mejores resultados)

### Para desarrollo/testing
➡️ **Google Gemini** (gratis, sin tarjeta de crédito)

---

## 📝 Configuración Actual

El proyecto usa **Google Gemini** por defecto porque:
- ✅ Completamente gratis
- ✅ No requiere tarjeta de crédito
- ✅ Excelente para extraer datos de PDFs médicos
- ✅ Límites generosos (60 req/min)

Para cambiar a otro proveedor, sigue las instrucciones arriba.

---

## 🔗 Links Útiles

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini API
- [Groq Console](https://console.groq.com) - Groq API
- [OpenAI Platform](https://platform.openai.com) - OpenAI API
- [Anthropic Console](https://console.anthropic.com) - Claude API
- [Ollama](https://ollama.com) - Modelos locales

---

¿Preguntas? Lee la documentación de cada proveedor o pregunta en el README del proyecto.
