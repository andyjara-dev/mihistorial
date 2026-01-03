import { prisma } from './prisma'
import { decryptData, encryptData } from './encryption'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendHealthReportEmail } from './email-templates/health-report'

interface ExamResult {
  test: string
  value: string
  unit?: string
  normalRange?: string
  isAbnormal?: boolean
}

interface ExamData {
  id: string
  examType: string
  institution: string
  examDate: Date
  results?: ExamResult[]
  patient?: {
    name?: string
    age?: string
    gender?: string
  }
  requestingDoctor?: string
  summary?: string
  diagnoses?: string[]
}

interface TrendData {
  measurement: string
  values: Array<{
    date: Date
    value: string
    isAbnormal?: boolean
  }>
  trend: 'increasing' | 'decreasing' | 'stable' | 'unknown'
  isAbnormal: boolean
}

interface HealthAdvice {
  summary: string
  overallStatus: 'good' | 'attention' | 'concerning'
  keyFindings: string[]
  recommendations: {
    diet: string[]
    exercise: string[]
    medicalFollowUp: string[]
  }
  positiveAspects: string[]
  areasForImprovement: string[]
}

/**
 * Obtiene exámenes del período especificado
 */
async function getExamsForPeriod(userId: string, months: number): Promise<ExamData[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const exams = await prisma.medicalExam.findMany({
    where: {
      userId,
      examDate: {
        gte: startDate,
        lte: endDate,
      },
      aiProcessed: true, // Solo exámenes procesados con IA
    },
    orderBy: {
      examDate: 'desc',
    },
  })

  return exams as unknown as ExamData[]
}

/**
 * Desencripta los datos de un examen
 */
function decryptExamData(exam: any, userEncryptionKey: string): ExamData {
  try {
    const decrypted = decryptData(
      exam.encryptedData,
      exam.encryptionIv,
      userEncryptionKey
    )
    const data = JSON.parse(decrypted)

    return {
      id: exam.id,
      examType: exam.examType,
      institution: exam.institution,
      examDate: exam.examDate,
      ...data,
    }
  } catch (error) {
    console.error(`Error al desencriptar examen ${exam.id}:`, error)
    return {
      id: exam.id,
      examType: exam.examType,
      institution: exam.institution,
      examDate: exam.examDate,
    }
  }
}

/**
 * Analiza tendencias de salud en los exámenes
 */
function analyzeHealthTrends(exams: ExamData[]): {
  trends: TrendData[]
  abnormalValues: ExamResult[]
  allMeasurements: Map<string, ExamResult[]>
} {
  const measurementsByName = new Map<string, ExamResult[]>()
  const abnormalValues: ExamResult[] = []

  // Agrupar resultados por nombre de medición
  for (const exam of exams) {
    if (!exam.results) continue

    for (const result of exam.results) {
      const measurementName = result.test.toLowerCase().trim()

      if (!measurementsByName.has(measurementName)) {
        measurementsByName.set(measurementName, [])
      }

      measurementsByName.get(measurementName)!.push({
        ...result,
        // @ts-ignore - Agregamos la fecha para análisis de tendencias
        _examDate: exam.examDate,
      })

      if (result.isAbnormal) {
        abnormalValues.push(result)
      }
    }
  }

  // Calcular tendencias
  const trends: TrendData[] = []

  for (const [measurement, results] of measurementsByName.entries()) {
    if (results.length < 2) continue // Necesitamos al menos 2 valores para tendencia

    // Ordenar por fecha
    const sortedResults = results.sort((a: any, b: any) =>
      new Date(a._examDate).getTime() - new Date(b._examDate).getTime()
    )

    // Intentar detectar tendencia numérica
    const numericValues = sortedResults
      .map((r: any) => ({ ...r, numValue: parseFloat(r.value) }))
      .filter((r: any) => !isNaN(r.numValue))

    let trend: 'increasing' | 'decreasing' | 'stable' | 'unknown' = 'unknown'

    if (numericValues.length >= 2) {
      const first = numericValues[0].numValue
      const last = numericValues[numericValues.length - 1].numValue
      const diff = last - first
      const percentChange = (diff / first) * 100

      if (Math.abs(percentChange) < 5) {
        trend = 'stable'
      } else if (diff > 0) {
        trend = 'increasing'
      } else {
        trend = 'decreasing'
      }
    }

    trends.push({
      measurement,
      values: sortedResults.map((r: any) => ({
        date: r._examDate,
        value: r.value,
        isAbnormal: r.isAbnormal,
      })),
      trend,
      isAbnormal: results.some(r => r.isAbnormal),
    })
  }

  return { trends, abnormalValues, allMeasurements: measurementsByName }
}

/**
 * Genera consejos de salud usando IA (Gemini)
 */
async function generateAIHealthAdvice(
  exams: ExamData[],
  trends: TrendData[],
  abnormalValues: ExamResult[]
): Promise<HealthAdvice> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('GEMINI_API_KEY no configurada, retornando consejos básicos')
    return {
      summary: 'No se pudo generar análisis con IA. Configure GEMINI_API_KEY.',
      overallStatus: 'attention',
      keyFindings: ['Configuración de IA pendiente'],
      recommendations: {
        diet: ['Mantén una dieta equilibrada'],
        exercise: ['Realiza actividad física regular'],
        medicalFollowUp: ['Consulta con tu médico para análisis personalizado'],
      },
      positiveAspects: [],
      areasForImprovement: ['Configurar análisis con IA'],
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Preparar datos estructurados para el prompt
    const examsData = exams.map(exam => ({
      date: exam.examDate.toISOString().split('T')[0],
      type: exam.examType,
      institution: exam.institution,
      results: exam.results || [],
    }))

    const trendsData = trends.map(t => ({
      measurement: t.measurement,
      trend: t.trend,
      isAbnormal: t.isAbnormal,
      latestValue: t.values[t.values.length - 1]?.value,
      firstValue: t.values[0]?.value,
    }))

    const prompt = `Eres un asistente médico especializado en análisis de salud preventiva.

Analiza los siguientes datos de exámenes médicos del paciente de los últimos meses:

**EXÁMENES REALIZADOS:**
${JSON.stringify(examsData, null, 2)}

**TENDENCIAS DETECTADAS:**
${JSON.stringify(trendsData, null, 2)}

**VALORES FUERA DE RANGO:**
${JSON.stringify(abnormalValues, null, 2)}

**INSTRUCCIONES:**
Genera un reporte de salud personalizado con:

1. **Resumen general** (2-3 oraciones sobre el estado de salud)
2. **Estado general** (clasifica como: "good", "attention", o "concerning")
3. **Hallazgos clave** (3-5 puntos más importantes que requieren atención)
4. **Recomendaciones personalizadas:**
   - **Alimentación:** Consejos dietéticos específicos basados en los resultados (qué comer, qué evitar)
   - **Ejercicio:** Tipo de actividad física recomendada, frecuencia e intensidad
   - **Seguimiento médico:** Qué controlar, cuándo consultar, exámenes a repetir
5. **Aspectos positivos:** Qué está bien en la salud del paciente
6. **Áreas de mejora:** Qué necesita mejorar

**IMPORTANTE:**
- Sé específico: menciona los valores exactos que están fuera de rango
- Prioriza por importancia médica
- Usa lenguaje claro y comprensible para el paciente
- Si un valor está alto (ej: colesterol LDL), recomienda alimentos específicos
- Incluye disclaimer: estos son consejos informativos, no reemplazan consulta médica

Responde SOLO con un objeto JSON válido con esta estructura exacta:
{
  "summary": "string",
  "overallStatus": "good" | "attention" | "concerning",
  "keyFindings": ["string", "string"],
  "recommendations": {
    "diet": ["string", "string"],
    "exercise": ["string", "string"],
    "medicalFollowUp": ["string", "string"]
  },
  "positiveAspects": ["string", "string"],
  "areasForImprovement": ["string", "string"]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extraer JSON del texto
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de IA')
    }

    const advice: HealthAdvice = JSON.parse(jsonMatch[0])

    return advice
  } catch (error) {
    console.error('Error al generar consejos con IA:', error)

    // Fallback con análisis básico
    return {
      summary: `Se analizaron ${exams.length} exámenes. ${abnormalValues.length > 0 ? `Se encontraron ${abnormalValues.length} valores fuera de rango que requieren atención.` : 'La mayoría de los valores están dentro de los rangos normales.'}`,
      overallStatus: abnormalValues.length > 3 ? 'concerning' : abnormalValues.length > 0 ? 'attention' : 'good',
      keyFindings: abnormalValues.slice(0, 5).map(v => `${v.test}: ${v.value} ${v.unit || ''} (rango normal: ${v.normalRange || 'no especificado'})`),
      recommendations: {
        diet: ['Mantén una dieta balanceada rica en frutas y verduras'],
        exercise: ['Realiza al menos 30 minutos de actividad física moderada, 5 días a la semana'],
        medicalFollowUp: abnormalValues.length > 0
          ? ['Consulta con tu médico sobre los valores fuera de rango']
          : ['Continúa con chequeos médicos regulares'],
      },
      positiveAspects: exams.length > abnormalValues.length
        ? ['La mayoría de tus resultados están dentro de rangos normales']
        : [],
      areasForImprovement: abnormalValues.length > 0
        ? [`Atender los ${abnormalValues.length} valores fuera de rango`]
        : [],
    }
  }
}

/**
 * Genera un reporte de salud completo
 */
export async function generateHealthReport(
  userId: string,
  userEncryptionKey: string,
  triggeredByExamId?: string
): Promise<string> {
  try {
    console.log(`🏥 Generando reporte de salud para usuario ${userId}...`)

    // Obtener configuración del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        healthReportPeriodMonths: true,
      },
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    const periodMonths = user.healthReportPeriodMonths
    const periodEnd = new Date()
    const periodStart = new Date()
    periodStart.setMonth(periodStart.getMonth() - periodMonths)

    console.log(`📅 Período de análisis: ${periodMonths} meses (${periodStart.toISOString().split('T')[0]} a ${periodEnd.toISOString().split('T')[0]})`)

    // Obtener exámenes del período
    const examsRaw = await getExamsForPeriod(userId, periodMonths)

    if (examsRaw.length === 0) {
      console.log('⚠️ No hay exámenes para analizar en este período')
      return ''
    }

    console.log(`📊 Analizando ${examsRaw.length} exámenes...`)

    // Desencriptar datos de exámenes
    const exams = examsRaw.map(exam => decryptExamData(exam, userEncryptionKey))

    // Analizar tendencias
    const { trends, abnormalValues, allMeasurements } = analyzeHealthTrends(exams)

    console.log(`📈 Detectadas ${trends.length} tendencias y ${abnormalValues.length} valores anormales`)

    // Generar consejos con IA
    const healthAdvice = await generateAIHealthAdvice(exams, trends, abnormalValues)

    console.log(`🤖 Consejos generados por IA - Estado: ${healthAdvice.overallStatus}`)

    // Preparar datos completos del reporte
    const reportData = {
      ...healthAdvice,
      examCount: exams.length,
      periodMonths,
      trends: trends.slice(0, 10), // Limitar a 10 tendencias más relevantes
      examsAnalyzed: exams.map(e => ({
        id: e.id,
        type: e.examType,
        date: e.examDate,
        institution: e.institution,
      })),
      generatedAt: new Date(),
    }

    // Encriptar datos del reporte
    const { encrypted, iv } = encryptData(
      JSON.stringify(reportData),
      userEncryptionKey
    )

    // Guardar reporte en BD
    const healthReport = await prisma.healthReport.create({
      data: {
        userId,
        periodMonths,
        periodStart,
        periodEnd,
        encryptedData: encrypted,
        encryptionIv: iv,
        triggeredBy: triggeredByExamId,
        generatedAt: new Date(),
      },
    })

    console.log(`✅ Reporte guardado: ${healthReport.id}`)

    // Enviar email en background
    try {
      await sendHealthReportEmail({
        to: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        reportId: healthReport.id,
        reportData: healthAdvice,
        periodMonths,
        examCount: exams.length,
      })

      // Marcar email como enviado
      await prisma.healthReport.update({
        where: { id: healthReport.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      })

      console.log(`📧 Email enviado exitosamente`)
    } catch (emailError) {
      console.error('Error al enviar email:', emailError)
      // No fallar si el email falla, el reporte ya está guardado
    }

    return healthReport.id
  } catch (error) {
    console.error('Error al generar reporte de salud:', error)
    throw error
  }
}
