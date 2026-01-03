'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HealthReportData {
  id: string
  periodMonths: number
  periodStart: string
  periodEnd: string
  generatedAt: string
  emailSent: boolean
  data: {
    summary: string
    overallStatus: 'good' | 'attention' | 'concerning'
    keyFindings: Array<{
      text: string
      examId?: string
    }>
    recommendations: {
      diet: string[]
      exercise: string[]
      medicalFollowUp: string[]
    }
    positiveAspects: string[]
    areasForImprovement: string[]
    examCount: number
    trends?: any[]
    examsAnalyzed?: Array<{
      id: string
      type: string
      date: string
      institution: string
    }>
  }
}

export default function HealthReportClient({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [report, setReport] = useState<HealthReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/health-reports/${reportId}`)

        if (!response.ok) {
          throw new Error('Error al cargar el reporte')
        }

        const data = await response.json()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Reporte no encontrado'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'good': return '✅'
      case 'attention': return '⚠️'
      case 'concerning': return '🚨'
      default: return '📊'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Bueno'
      case 'attention': return 'Requiere Atención'
      case 'concerning': return 'Preocupante'
      default: return 'Indeterminado'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-300'
      case 'attention': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'concerning': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-teal-600 hover:text-teal-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Reporte de Salud</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header del Reporte */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-500 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{getStatusEmoji(report.data.overallStatus)}</span>
                <h2 className="text-2xl font-bold">Estado General: {getStatusText(report.data.overallStatus)}</h2>
              </div>
              <p className="text-teal-100 text-sm">
                Generado el {new Date(report.generatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-teal-100 text-sm">
                Análisis de {report.periodMonths} {report.periodMonths === 1 ? 'mes' : 'meses'}
                ({new Date(report.periodStart).toLocaleDateString('es-ES')} - {new Date(report.periodEnd).toLocaleDateString('es-ES')})
              </p>
              <p className="text-teal-100 text-sm mt-1">
                {report.data.examCount} exámenes analizados
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Resumen Ejecutivo</h3>
          <p className="text-gray-700 leading-relaxed">{report.data.summary}</p>
        </div>

        {/* Hallazgos Importantes */}
        {report.data.keyFindings && report.data.keyFindings.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🔍 Hallazgos Importantes</h3>
            <p className="text-sm text-gray-600 mb-3">Haz clic en un hallazgo para ver el examen completo</p>
            <ul className="space-y-3">
              {report.data.keyFindings.map((finding, index) => {
                const findingContent = (
                  <>
                    <span className="text-amber-600 mt-0.5">⚠️</span>
                    <span className="text-gray-700 flex-1">{finding.text}</span>
                    {finding.examId && (
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </>
                )

                if (finding.examId) {
                  return (
                    <li key={index}>
                      <Link
                        href={`/dashboard/exams/${finding.examId}`}
                        className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer group"
                      >
                        {findingContent}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    {findingContent}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Consejos Personalizados */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">💡 Consejos Personalizados</h3>

          {/* Alimentación */}
          {report.data.recommendations.diet.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🥗</span>
                <h4 className="text-lg font-semibold text-gray-900">Alimentación</h4>
              </div>
              <ul className="space-y-2">
                {report.data.recommendations.diet.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ejercicio */}
          {report.data.recommendations.exercise.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏃</span>
                <h4 className="text-lg font-semibold text-gray-900">Ejercicio</h4>
              </div>
              <ul className="space-y-2">
                {report.data.recommendations.exercise.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seguimiento Médico */}
          {report.data.recommendations.medicalFollowUp.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🩺</span>
                <h4 className="text-lg font-semibold text-gray-900">Seguimiento Médico</h4>
              </div>
              <ul className="space-y-2">
                {report.data.recommendations.medicalFollowUp.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Aspectos Positivos */}
        {report.data.positiveAspects && report.data.positiveAspects.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-semibold text-green-900">Aspectos Positivos</h3>
            </div>
            <ul className="space-y-2">
              {report.data.positiveAspects.map((aspect, index) => (
                <li key={index} className="flex items-start gap-2 text-green-800">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Áreas de Mejora */}
        {report.data.areasForImprovement && report.data.areasForImprovement.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📈</span>
              <h3 className="text-xl font-semibold text-blue-900">Áreas de Mejora</h3>
            </div>
            <ul className="space-y-2">
              {report.data.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-800">
                  <span className="text-blue-600 mt-1">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exámenes Analizados */}
        {report.data.examsAnalyzed && report.data.examsAnalyzed.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Exámenes Analizados</h3>
            <p className="text-sm text-gray-600 mb-3">Haz clic en cualquier examen para ver su detalle completo</p>
            <div className="space-y-2">
              {report.data.examsAnalyzed.map((exam, index) => (
                <Link
                  key={index}
                  href={`/dashboard/exams/${exam.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-teal-50 hover:border-teal-300 border border-gray-200 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-teal-700">{exam.type}</p>
                    <p className="text-sm text-gray-600">{exam.institution}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {new Date(exam.date).toLocaleDateString('es-ES')}
                    </p>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-medium mb-1">Importante</p>
              <p className="text-sm text-yellow-800">
                Este reporte es informativo y generado con asistencia de inteligencia artificial.
                No reemplaza el consejo médico profesional. Consulta siempre con tu médico antes
                de hacer cambios significativos en tu dieta, ejercicio o tratamiento médico.
              </p>
            </div>
          </div>
        </div>

        {/* Botón volver */}
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
          >
            Volver al Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
