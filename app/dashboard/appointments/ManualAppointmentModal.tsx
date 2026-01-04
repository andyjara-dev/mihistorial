'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function ManualAppointmentModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    appointmentDate: '',
    appointmentTime: '',
    location: '',
    notes: '',
    sendReminders: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.doctorName || !formData.specialty || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: formData.doctorName,
          specialty: formData.specialty,
          appointmentDate: appointmentDateTime,
          location: formData.location || null,
          notes: formData.notes || null,
          sendReminders: formData.sendReminders,
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
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Cita Médica</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nombre del Doctor/a <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.doctorName}
                onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                placeholder="Dr. Juan Pérez"
                required
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Especialidad <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                required
              >
                <option value="">Selecciona...</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Dermatología">Dermatología</option>
                <option value="Oftalmología">Oftalmología</option>
                <option value="Traumatología">Traumatología</option>
                <option value="Ginecología">Ginecología</option>
                <option value="Pediatría">Pediatría</option>
                <option value="Psiquiatría">Psiquiatría</option>
                <option value="Neurología">Neurología</option>
                <option value="Endocrinología">Endocrinología</option>
                <option value="Otra">Otra</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="Hospital UC Christus, Santiago"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              rows={3}
              placeholder="Instrucciones, preparación necesaria, etc."
            />
          </div>

          {/* Send Reminders */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sendReminders}
              onChange={e => setFormData({ ...formData, sendReminders: e.target.checked })}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Enviar recordatorios por email (3 días y 1 día antes)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition disabled:bg-gray-400"
            >
              {loading ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
