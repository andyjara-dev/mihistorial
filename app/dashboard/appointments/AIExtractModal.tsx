'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface ExtractedData {
  doctorName: string | null
  specialty: string | null
  appointmentDate: string | null
  location: string | null
  notes: string | null
}

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AIExtractModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'paste' | 'review'>('paste')
  const [emailText, setEmailText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('medium')
  const [editedData, setEditedData] = useState<{
    doctorName: string
    specialty: string
    appointmentDate: string
    appointmentTime: string
    location: string
    notes: string
    sendReminders: boolean
  }>({
    doctorName: '',
    specialty: '',
    appointmentDate: '',
    appointmentTime: '',
    location: '',
    notes: '',
    sendReminders: true,
  })

  const handleExtract = async () => {
    if (!emailText.trim()) {
      toast.error('Pega el texto del email de tu cita')
      return
    }

    setExtracting(true)

    try {
      const response = await fetch('/api/appointments/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText }),
      })

      const data = await response.json()

      if (response.ok) {
        setConfidence(data.confidence)

        // Inicializar datos editables
        const [dateOnly, timeOnly] = data.extracted.appointmentDate
          ? data.extracted.appointmentDate.split('T')
          : ['', '']

        setEditedData({
          doctorName: data.extracted.doctorName || '',
          specialty: data.extracted.specialty || '',
          appointmentDate: dateOnly || '',
          appointmentTime: timeOnly?.substring(0, 5) || '',
          location: data.extracted.location || '',
          notes: data.extracted.notes || '',
          sendReminders: true,
        })

        setStep('review')

        if (data.confidence === 'low') {
          toast('Revisa los datos extraídos, algunos pueden estar incompletos', { icon: '⚠️' })
        }
      } else {
        toast.error(data.error || 'Error al extraer datos')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setExtracting(false)
    }
  }

  const handleCreate = async () => {
    if (!editedData.doctorName || !editedData.specialty || !editedData.appointmentDate || !editedData.appointmentTime) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    setCreating(true)

    try {
      const appointmentDateTime = `${editedData.appointmentDate}T${editedData.appointmentTime}:00`

      const response = await fetch('/api/appointments/create-from-extraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: editedData.doctorName,
          specialty: editedData.specialty,
          appointmentDate: appointmentDateTime,
          location: editedData.location || null,
          notes: editedData.notes || null,
          originalEmail: emailText,
          sendReminders: editedData.sendReminders,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        toast.error(data.error || 'Error al crear cita')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Extraer Cita con IA</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'paste' ? 'Pega el email de tu cita médica' : 'Revisa y edita los datos extraídos'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Pega aquí el email completo de tu cita médica
                </label>
                <textarea
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 font-mono text-sm"
                  rows={12}
                  placeholder="Estimado/a paciente,

Le confirmamos su cita médica con el Dr. Juan Pérez
Especialidad: Cardiología
Fecha: 15 de enero de 2025
Hora: 14:30
Lugar: Hospital UC Christus, Santiago

Por favor llegar 15 minutos antes..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tip:</p>
                    <p>La IA extraerá automáticamente el doctor, especialidad, fecha, hora y ubicación. Podrás revisar y editar los datos antes de guardar.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExtract}
                  disabled={extracting || !emailText.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-900 to-teal-500 text-white rounded-md hover:from-blue-800 hover:to-teal-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {extracting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Extrayendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Extraer Datos con IA
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              {/* Confidence Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                confidence === 'high' ? 'bg-green-100 text-green-800' :
                confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {confidence === 'high' && '✓'}
                {confidence === 'medium' && '⚠'}
                {confidence === 'low' && '!'}
                <span>
                  Confianza: {confidence === 'high' ? 'Alta' : confidence === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>

              {/* Editable Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Doctor/a <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedData.doctorName}
                    onChange={e => setEditedData({ ...editedData, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Especialidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedData.specialty}
                    onChange={e => setEditedData({ ...editedData, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editedData.appointmentDate}
                    onChange={e => setEditedData({ ...editedData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={editedData.appointmentTime}
                    onChange={e => setEditedData({ ...editedData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={editedData.location}
                  onChange={e => setEditedData({ ...editedData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notas
                </label>
                <textarea
                  value={editedData.notes}
                  onChange={e => setEditedData({ ...editedData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedData.sendReminders}
                  onChange={e => setEditedData({ ...editedData, sendReminders: e.target.checked })}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enviar recordatorios por email (3 días y 1 día antes)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setStep('paste')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
                  disabled={creating}
                >
                  Volver
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition disabled:bg-gray-400"
                >
                  {creating ? 'Creando...' : 'Guardar Cita'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
