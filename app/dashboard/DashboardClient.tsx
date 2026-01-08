'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string | null
}

interface MedicalExam {
  id: string
  examType: string
  institution: string | null
  laboratory?: string | null
  examDate: Date
  processingStatus: string
  aiProcessed: boolean
}

interface Appointment {
  id: string
  doctorName: string
  specialty: string
  appointmentDate: Date
  location?: string | null
  institution?: string | null
  status: string
}

interface HealthReport {
  id: string
  periodMonths: number
  generatedAt: Date
  summary?: string
  overallStatus?: 'good' | 'attention' | 'concerning'
  keyFindings?: Array<{
    text: string
    examId?: string
  }>
  examCount?: number
}

interface Props {
  user: User
  medicalExams: MedicalExam[]
  appointments: Appointment[]
}

export default function DashboardClient({ user, medicalExams, appointments }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'exams' | 'appointments' | 'health-reports'>('exams')
  const [healthReports, setHealthReports] = useState<HealthReport[]>([])
  const [loadingReports, setLoadingReports] = useState(false)

  // Cargar reportes de salud
  useEffect(() => {
    const fetchHealthReports = async () => {
      setLoadingReports(true)
      try {
        const response = await fetch('/api/health-reports')
        if (response.ok) {
          const data = await response.json()
          setHealthReports(data.reports || [])
        }
      } catch (error) {
        console.error('Error al cargar reportes de salud:', error)
      } finally {
        setLoadingReports(false)
      }
    }

    fetchHealthReports()
  }, [])

  // Auto-refresh cuando hay exámenes en procesamiento
  useEffect(() => {
    const hasProcessingExams = medicalExams.some(
      exam => exam.processingStatus === 'processing' || !exam.aiProcessed
    )

    if (hasProcessingExams) {
      // Refrescar cada 5 segundos si hay exámenes procesándose
      const intervalId = setInterval(() => {
        router.refresh()
      }, 5000)

      // Limpiar interval al desmontar o cuando ya no hay exámenes procesándose
      return () => clearInterval(intervalId)
    }
  }, [medicalExams, router])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const handleUploadExam = () => {
    router.push('/dashboard/upload')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MiHistorial.Cloud" className="h-24 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-500 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Bienvenido, {user.name || 'Usuario'}
          </h2>
          <p className="text-teal-100">
            Gestiona tus exámenes médicos y citas de forma segura y centralizada
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Exámenes</p>
                <p className="text-3xl font-bold text-gray-900">{medicalExams.length}</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Citas Programadas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Procesados con IA</p>
                <p className="text-3xl font-bold text-gray-900">
                  {medicalExams.filter(e => e.aiProcessed).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleUploadExam}
            className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Subir Nuevo Examen
          </button>
          <button
            onClick={() => router.push('/dashboard/appointments')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Ver Todas las Citas
          </button>
          <button
            onClick={() => router.push('/dashboard/trends')}
            className="bg-gradient-to-r from-blue-900 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-800 hover:to-teal-600 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ver Tendencias y Análisis
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('exams')}
                className={`py-4 px-6 font-medium ${
                  activeTab === 'exams'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Exámenes Médicos
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-6 font-medium ${
                  activeTab === 'appointments'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Citas Médicas
              </button>
              <button
                onClick={() => setActiveTab('health-reports')}
                className={`py-4 px-6 font-medium ${
                  activeTab === 'health-reports'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Reportes de Salud
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'exams' ? (
              medicalExams.length > 0 ? (
                <div className="space-y-4">
                  {medicalExams.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => router.push(`/dashboard/exams/${exam.id}`)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-teal-400"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{exam.examType}</h3>
                          <p className="text-gray-600">{exam.institution}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(exam.examDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {exam.processingStatus === 'processing' ? (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Procesando con IA...
                            </span>
                          ) : exam.aiProcessed ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Procesado
                            </span>
                          ) : exam.processingStatus === 'failed' ? (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              Error
                            </span>
                          ) : null}
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay exámenes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza subiendo tu primer examen médico
                  </p>
                </div>
              )
            ) : activeTab === 'appointments' ? (
              appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            Dr(a). {appointment.doctorName}
                          </h3>
                          <p className="text-gray-600">{appointment.specialty}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No tienes citas médicas programadas
                  </p>
                </div>
              )
            ) : (
              /* Reportes de Salud */
              loadingReports ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando reportes...</p>
                </div>
              ) : healthReports.length > 0 ? (
                <div className="space-y-4">
                  {healthReports.map((report) => {
                    const statusEmoji = report.overallStatus === 'good' ? '✅' : report.overallStatus === 'attention' ? '⚠️' : '🚨'
                    const statusColor = report.overallStatus === 'good' ? 'green' : report.overallStatus === 'attention' ? 'yellow' : 'red'
                    const statusText = report.overallStatus === 'good' ? 'Bueno' : report.overallStatus === 'attention' ? 'Requiere Atención' : 'Preocupante'

                    return (
                      <div
                        key={report.id}
                        onClick={() => router.push(`/dashboard/health-reports/${report.id}`)}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition cursor-pointer hover:border-teal-400"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{statusEmoji}</span>
                              <h3 className="font-semibold text-lg text-gray-900">Reporte de Salud</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(report.generatedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} - Análisis de {report.periodMonths} {report.periodMonths === 1 ? 'mes' : 'meses'}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full bg-${statusColor}-100 text-${statusColor}-800 whitespace-nowrap`}>
                            {statusText}
                          </span>
                        </div>

                        {report.summary && (
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{report.summary}</p>
                        )}

                        {report.keyFindings && report.keyFindings.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Hallazgos principales:</p>
                            <ul className="space-y-1">
                              {report.keyFindings.map((finding, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start">
                                  <span className="mr-2">•</span>
                                  <span className="line-clamp-1">{finding.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span>{report.examCount} exámenes analizados</span>
                          <span className="flex items-center gap-1">
                            Ver detalles
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes de salud</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Los reportes se generan automáticamente cuando subes y procesas exámenes médicos
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
