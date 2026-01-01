'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { getMeasurementDescription } from '@/lib/measurement-descriptions'

interface MeasurementValue {
  value: number
  rawValue: string
  unit: string | undefined
  originalValue: number
  originalUnit: string | undefined
  date: string
  examId: string
  examType: string
  isAbnormal: boolean
  normalRange?: string
}

interface Measurement {
  name: string
  category: string
  count: number
  latestValue: number
  latestRawValue: string
  latestUnit: string | undefined
  latestDate: string
  latestIsAbnormal: boolean
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  min: number
  max: number
  avg: number
  hasConversions?: boolean
  values: MeasurementValue[]
}

interface TrendsData {
  measurements: Measurement[]
  byCategory: Record<string, Measurement[]>
  totalExams: number
  totalMeasurements: number
}

export default function TrendsClient() {
  const router = useRouter()
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Scroll automático en móvil cuando se selecciona una medición
  useEffect(() => {
    if (selectedMeasurement && chartRef.current && window.innerWidth < 1024) {
      setTimeout(() => {
        chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [selectedMeasurement])

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/trends')

        if (!response.ok) {
          throw new Error('Error al cargar tendencias')
        }

        const trendsData = await response.json()
        setData(trendsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tendencias...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Error al cargar tendencias'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (data.measurements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Tendencias y Análisis</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-yellow-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay datos suficientes para mostrar tendencias
            </h3>
            <p className="text-gray-600 mb-6">
              Sube algunos exámenes médicos con resultados numéricos para comenzar a ver el análisis de tendencias.
            </p>
            <button
              onClick={() => router.push('/dashboard/upload')}
              className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition"
            >
              Subir Primer Examen
            </button>
          </div>
        </main>
      </div>
    )
  }

  const categories = ['all', ...Object.keys(data.byCategory)]
  const filteredMeasurements =
    selectedCategory === 'all'
      ? data.measurements
      : data.byCategory[selectedCategory] || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Tendencias y Análisis</h1>
            </div>
            <div className="text-sm text-gray-600">
              {data.totalExams} exámenes · {data.totalMeasurements} mediciones rastreadas
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtros por categoría */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filtrar por Categoría</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Todas' : category}
                {category !== 'all' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({data.byCategory[category]?.length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Layout de dos columnas: tarjetas y gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Lista de mediciones */}
          <div className="space-y-4 lg:order-1 order-2">
            {filteredMeasurements.map(measurement => (
              <div
                key={measurement.name}
                onClick={() => setSelectedMeasurement(measurement)}
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer ${
                  selectedMeasurement?.name === measurement.name ? 'ring-2 ring-teal-500' : ''
                }`}
              >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{measurement.category}</p>
                    {measurement.hasConversions && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800" title="Incluye conversión de unidades">
                        ⇄
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{measurement.name}</h3>
                </div>
                {measurement.trend !== 'stable' && (
                  <div
                    className={`p-2 rounded-full ${
                      measurement.trend === 'up' ? 'bg-red-100' : 'bg-green-100'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        measurement.trend === 'up' ? 'text-red-600' : 'text-green-600'
                      } ${measurement.trend === 'down' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Último valor</p>
                  <p
                    className={`text-2xl font-bold ${
                      measurement.latestIsAbnormal ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {measurement.latestRawValue}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{measurement.count} registros</span>
                  <span>
                    {new Date(measurement.latestDate).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {measurement.trend !== 'stable' && (
                  <div className="text-sm">
                    <span
                      className={
                        measurement.trend === 'up' ? 'text-red-600' : 'text-green-600'
                      }
                    >
                      {measurement.trend === 'up' ? '↑' : '↓'}{' '}
                      {Math.abs(measurement.trendPercentage).toFixed(1)}%
                    </span>
                    <span className="text-gray-500"> vs anterior</span>
                  </div>
                )}
              </div>
              </div>
            ))}
            {filteredMeasurements.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No hay mediciones en esta categoría</p>
              </div>
            )}
          </div>

          {/* Columna derecha: Gráfico detallado */}
          <div
            className="lg:order-2 order-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
            ref={chartRef}
          >
            {selectedMeasurement ? (
              <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedMeasurement.name}
                </h2>
                <p className="text-sm text-gray-500">{selectedMeasurement.category}</p>
              </div>
              <button
                onClick={() => setSelectedMeasurement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Descripción del indicador */}
            {(() => {
              const description = getMeasurementDescription(selectedMeasurement.name)
              if (description) {
                return (
                  <div className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Acerca de esta medición</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p><strong>¿Qué es?</strong> {description.whatItIs}</p>
                          <p><strong>¿Qué mide?</strong> {description.whatItMeasures}</p>
                          {description.normalRange && (
                            <p><strong>Rango normal:</strong> {description.normalRange}</p>
                          )}
                          {description.clinical && (
                            <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-teal-200">
                              <strong>Nota clínica:</strong> {description.clinical}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Mensaje de conversión de unidades */}
            {selectedMeasurement.values.some(v => v.originalUnit !== v.unit) && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los valores se han convertido automáticamente a {selectedMeasurement.latestUnit} para permitir la comparación. Los valores originales se muestran en la tabla.
                  </div>
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Promedio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedMeasurement.avg.toFixed(2)} {selectedMeasurement.latestUnit || ''}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Mínimo</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedMeasurement.min.toFixed(2)} {selectedMeasurement.latestUnit || ''}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Máximo</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedMeasurement.max.toFixed(2)} {selectedMeasurement.latestUnit || ''}
                </p>
              </div>
            </div>

            {/* Gráfico de líneas */}
            <div className="mb-6" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedMeasurement.values.map(v => ({
                    date: new Date(v.date).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    }),
                    value: v.value,
                    isAbnormal: v.isAbnormal,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine
                    y={selectedMeasurement.avg}
                    stroke="#9CA3AF"
                    strokeDasharray="5 5"
                    label="Promedio"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#14B8A6"
                    strokeWidth={2}
                    dot={{ fill: '#14B8A6', r: 5 }}
                    activeDot={{ r: 8 }}
                    name={`${selectedMeasurement.name} (${selectedMeasurement.latestUnit || ''})`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla de valores */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Valores</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rango Normal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Examen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...selectedMeasurement.values].reverse().map((value, index) => (
                    <tr
                      key={index}
                      className={value.isAbnormal ? 'bg-red-50' : ''}
                      onClick={() => router.push(`/dashboard/exams/${value.examId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(value.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div>
                          <div>{value.rawValue}</div>
                          {value.originalUnit && value.unit && value.originalUnit !== value.unit && (
                            <div className="text-xs text-gray-500 mt-1">
                              ≈ {value.value.toFixed(2)} {value.unit} (convertido)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {value.normalRange || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {value.examType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {value.isAbnormal ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Fuera de rango
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-dashed border-teal-300 rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 text-teal-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Selecciona una medición
                </h3>
                <p className="text-gray-500">
                  Haz clic en cualquier tarjeta de la izquierda para ver su gráfico y análisis detallado
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
