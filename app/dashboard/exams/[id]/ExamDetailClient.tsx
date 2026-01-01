'use client'

import { useEffect, useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { getMeasurementDescription } from '@/lib/measurement-descriptions'

interface ExamData {
  id: string
  examType: string
  institution: string
  examDate: string
  processingStatus: string
  aiProcessed: boolean
  createdAt: string
  updatedAt: string
  document: {
    id: string
    fileName: string
    fileType: string
    fileSize: number
    uploadedAt: string
  } | null
  data: {
    patient?: {
      name?: string | null
      age?: string | null
      gender?: string | null
    }
    examDate?: string | null
    requestingDoctor?: string | null
    results?: Array<{
      test: string
      value: string
      unit?: string
      normalRange?: string
      isAbnormal?: boolean
    }>
    diagnoses?: string[]
    summary?: string
    processed?: boolean
    processedAt?: string
    error?: string
    rawText?: string
  }
}

export default function ExamDetailClient({ examId }: { examId: string }) {
  const router = useRouter()
  const [exam, setExam] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`)

        if (!response.ok) {
          throw new Error('Error al cargar el examen')
        }

        const data = await response.json()
        setExam(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchExam()
  }, [examId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando examen...</p>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Examen no encontrado'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Función para resaltar texto según el término de búsqueda
  const highlightText = (text: string) => {
    if (!searchTerm.trim()) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    )
  }

  // Filtrar resultados según el término de búsqueda
  const filteredResults = exam?.data.results?.filter(result => {
    if (!searchTerm.trim()) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      result.test.toLowerCase().includes(searchLower) ||
      result.value.toLowerCase().includes(searchLower) ||
      result.unit?.toLowerCase().includes(searchLower) ||
      result.normalRange?.toLowerCase().includes(searchLower)
    )
  })

  // Función para alternar la expansión de una fila
  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index)
    } else {
      newExpandedRows.add(index)
    }
    setExpandedRows(newExpandedRows)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Detalle del Examen</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Buscador */}
        {exam?.data && exam.data.processed && (
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en los resultados del examen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && filteredResults && (
              <p className="mt-2 text-sm text-gray-600">
                {filteredResults.length} resultado(s) encontrado(s)
              </p>
            )}
          </div>
        )}

        {/* Información General */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Información General</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Tipo de Examen</p>
                <p className="text-lg font-medium text-gray-900">{exam.examType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Institución</p>
                <p className="text-lg font-medium text-gray-900">{exam.institution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha del Examen</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(exam.examDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado del Procesamiento</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    exam.processingStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : exam.processingStatus === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.processingStatus}
                  </span>
                  {exam.aiProcessed && (
                    <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      IA Procesado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {exam.document && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Archivo</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{exam.document.fileName}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(exam.document.fileSize)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/documents/${exam.document.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver PDF
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Datos Procesados por IA */}
        {exam.data && exam.data.processed && (
          <>
            {/* Información del Paciente */}
            {exam.data.patient && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Información del Paciente</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {exam.data.patient.name && (
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="text-lg font-medium text-gray-900">{exam.data.patient.name}</p>
                      </div>
                    )}
                    {exam.data.patient.age && (
                      <div>
                        <p className="text-sm text-gray-500">Edad</p>
                        <p className="text-lg font-medium text-gray-900">{exam.data.patient.age}</p>
                      </div>
                    )}
                    {exam.data.patient.gender && (
                      <div>
                        <p className="text-sm text-gray-500">Género</p>
                        <p className="text-lg font-medium text-gray-900">{exam.data.patient.gender}</p>
                      </div>
                    )}
                  </div>
                  {exam.data.requestingDoctor && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Médico Solicitante</p>
                      <p className="text-lg font-medium text-gray-900">{exam.data.requestingDoctor}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resumen */}
            {exam.data.summary && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Resumen</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{highlightText(exam.data.summary)}</p>
                </div>
              </div>
            )}

            {/* Resultados */}
            {filteredResults && filteredResults.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Resultados</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rango Normal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Info
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResults.map((result, index) => {
                          const description = getMeasurementDescription(result.test)
                          const isExpanded = expandedRows.has(index)
                          return (
                            <Fragment key={index}>
                              <tr className={result.isAbnormal ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {highlightText(result.test)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {highlightText(result.value)} {result.unit ? highlightText(result.unit) : ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {result.normalRange ? highlightText(result.normalRange) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {result.isAbnormal ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Fuera de rango
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Normal
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {description && (
                                    <button
                                      onClick={() => toggleRow(index)}
                                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                      title="Ver descripción"
                                    >
                                      <svg
                                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {isExpanded && description && (
                                <tr key={`${index}-details`} className={result.isAbnormal ? 'bg-red-50' : ''}>
                                  <td colSpan={5} className="px-6 py-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                      <div>
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">¿Qué es?</h4>
                                        <p className="text-sm text-gray-700">{description.whatItIs}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">¿Qué mide?</h4>
                                        <p className="text-sm text-gray-700">{description.whatItMeasures}</p>
                                      </div>
                                      {description.normalRange && (
                                        <div>
                                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Rango normal</h4>
                                          <p className="text-sm text-gray-700">{description.normalRange}</p>
                                        </div>
                                      )}
                                      {description.clinical && (
                                        <div>
                                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Significado clínico</h4>
                                          <p className="text-sm text-gray-700">{description.clinical}</p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnósticos */}
            {exam.data.diagnoses && exam.data.diagnoses.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Diagnósticos y Comentarios</h2>
                </div>
                <div className="p-6">
                  <ul className="list-disc list-inside space-y-2">
                    {exam.data.diagnoses.map((diagnosis, index) => (
                      <li key={index} className="text-gray-700">{highlightText(diagnosis)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        {/* Si no está procesado o falló */}
        {(!exam.data.processed || exam.data.error) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {exam.data.error ? 'Error en el procesamiento' : 'Procesamiento pendiente'}
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  {exam.data.error || 'Este examen aún no ha sido procesado completamente por la IA.'}
                </p>
                {exam.data.rawText && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-yellow-800">Texto extraído:</p>
                    <p className="mt-2 text-sm text-yellow-700 whitespace-pre-wrap">
                      {exam.data.rawText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
