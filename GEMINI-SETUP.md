# 🔑 Cómo Obtener API Key de Google Gemini (Gratis)

## ⚡ Guía Rápida (2 minutos)

### 1. Ir a Google AI Studio

Abre: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 2. Iniciar sesión

Usa tu cuenta de Google (Gmail)

### 3. Crear API Key

1. Click en **"Create API Key"** o **"Get API Key"**
2. Selecciona un proyecto existente o crea uno nuevo
3. Click en **"Create API key in new project"** (o usa uno existente)

### 4. Copiar la API Key

Se verá algo como:
```
AIzaSyD...
```

### 5. Agregar al proyecto

Edita el archivo `.env`:

```bash
GEMINI_API_KEY="AIzaSyD..."
```

### 6. ¡Listo!

Reinicia el servidor:
```bash
# Detener servidor (Ctrl+C)
npm run dev
```

---

## 📊 Límites Gratuitos

✅ **60 requests por minuto**
✅ **1,500 requests por día**
✅ **Sin tarjeta de crédito**
✅ **Sin cargos ocultos**

**Suficiente para:**
- 1,500 exámenes por día
- ~45,000 exámenes por mes
- Uso personal ilimitado

---

## 🔒 Seguridad

⚠️ **Importante:**
- NO compartas tu API key
- NO la subas a GitHub
- Mantén el archivo `.env` privado (ya está en `.gitignore`)

---

## 🧪 Probar que funciona

1. Inicia el servidor: `npm run dev`
2. Registra un usuario en http://localhost:3000
3. Sube un examen médico (cualquier PDF)
4. El sistema procesará automáticamente el PDF con Gemini

En los logs verás:
```
✓ PDF procesado con Google Gemini
```

---

## ❓ Problemas Comunes

### Error: "GEMINI_API_KEY no configurada"

**Solución:** Verifica que agregaste la key en `.env` y reiniciaste el servidor.

### Error: "API key not valid"

**Solución:**
1. Verifica que copiaste toda la key completa
2. Asegúrate de que no hay espacios antes/después
3. Genera una nueva key si es necesario

### Error: "Quota exceeded"

**Solución:** Llegaste al límite (1,500/día). Espera 24 horas o:
- Crea otro proyecto de Google
- Usa otra cuenta de Google
- Considera OpenAI o Groq (ver ALTERNATIVAS-IA.md)

---

## 🚀 Alternativas

Si no quieres usar Gemini, tienes otras opciones:

📖 **[Ver todas las alternativas →](ALTERNATIVAS-IA.md)**

Opciones populares:
- **Groq** - Gratis, muy rápido
- **Ollama** - Local, 100% privado
- **OpenAI GPT** - Pagado, muy preciso
- **Claude** - Pagado, excelente calidad

---

## 💡 Tips

### Para uso intensivo
Si procesas muchos exámenes (>1,500/día):
1. Crea múltiples proyectos en Google
2. Rota entre diferentes API keys
3. O usa Groq (30 req/min pero más días)

### Para máxima privacidad
Si trabajas con datos muy sensibles:
- Usa **Ollama** (local, sin enviar datos a internet)
- Requiere servidor con GPU y 8GB+ RAM

### Para producción comercial
Si es para negocio:
- **OpenAI GPT-4o-mini**: ~$0.15 por 1,000 exámenes
- **Claude**: ~$0.015/1K tokens
- O contacta a Google para límites enterprise

---

¡Eso es todo! Con Gemini puedes procesar PDFs médicos completamente gratis.
