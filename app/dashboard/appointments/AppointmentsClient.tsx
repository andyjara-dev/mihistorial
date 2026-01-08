'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ManualAppointmentModal from './ManualAppointmentModal'
import AIExtractModal from './AIExtractModal'
import AppointmentCard from './AppointmentCard'

interface Appointment {
  id: string
  doctorName: string
  specialty: string
  appointmentDate: Date
  location: string | null
  institution?: string | null
  status: string
  sourceType: string
  sendReminders: boolean
}

export default function AppointmentsClient({
  appointments,
}: {
  appointments: Appointment[]
}) {
  const router = useRouter()
  const [showManualModal, setShowManualModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(a => a.status === filterStatus)

  const now = new Date()
  const upcoming = appointments.filter(a =>
    a.status === 'scheduled' && new Date(a.appointmentDate) > now
  )
  const past = appointments.filter(a =>
    new Date(a.appointmentDate) <= now || a.status !== 'scheduled'
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Citas Médicas</h1>
            <p className="text-gray-600 mt-2">
              {upcoming.length} próximas · {past.length} pasadas
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="bg-gradient-to-r from-blue-900 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-800 hover:to-teal-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Extraer con IA
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Manualmente
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'Todas' :
               status === 'scheduled' ? 'Programadas' :
               status === 'completed' ? 'Completadas' : 'Canceladas'}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onUpdate={() => router.refresh()}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all'
                ? 'Comienza agregando tu primera cita médica'
                : `No hay citas ${filterStatus === 'scheduled' ? 'programadas' : filterStatus === 'completed' ? 'completadas' : 'canceladas'}`}
            </p>
          </div>
        )}

        {/* Modals */}
        {showManualModal && (
          <ManualAppointmentModal
            onClose={() => setShowManualModal(false)}
            onSuccess={() => {
              setShowManualModal(false)
              router.refresh()
              toast.success('Cita creada exitosamente')
            }}
          />
        )}

        {showAIModal && (
          <AIExtractModal
            onClose={() => setShowAIModal(false)}
            onSuccess={() => {
              setShowAIModal(false)
              router.refresh()
              toast.success('Cita creada exitosamente')
            }}
          />
        )}
      </div>
    </div>
  )
}
