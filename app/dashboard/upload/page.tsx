'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [examType, setExamType] = useState('')
  const [institution, setInstitution] = useState('')
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validar que sea un PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF')
        setFile(null)
        return
      }

      // Validar tamaño (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo debe ser menor a 10MB')
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!file) {
      setError('Por favor selecciona un archivo PDF')
      return
    }

    if (!examType || !institution || !examDate) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('examType', examType)
      formData.append('institution', institution)
      formData.append('examDate', examDate)

      const response = await fetch('/api/exams/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al subir el examen')
        return
      }

      setSuccess(true)

      // Resetear formulario
      setFile(null)
      setExamType('')
      setInstitution('')
      setExamDate('')

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (error) {
      setError('Error al subir el examen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Subir Examen Médico</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Examen subido exitosamente. Redirigiendo...
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Subida de archivo */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Archivo PDF del Examen
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-gray-600">Haz clic para seleccionar un archivo PDF</p>
                      <p className="text-sm text-gray-500">Máximo 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Tipo de examen */}
            <div className="mb-6">
              <label htmlFor="examType" className="block text-gray-700 font-medium mb-2">
                Tipo de Examen
              </label>
              <select
                id="examType"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un tipo</option>
                <option value="Sangre">Examen de Sangre</option>
                <option value="Orina">Examen de Orina</option>
                <option value="Imagenología">Imagenología (Rayos X, TAC, etc.)</option>
                <option value="Cardiología">Cardiología (ECG, Ecocardiograma, etc.)</option>
                <option value="Endocrinología">Endocrinología</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Institución */}
            <div className="mb-6">
              <label htmlFor="institution" className="block text-gray-700 font-medium mb-2">
                Centro Médico / Laboratorio
              </label>
              <input
                type="text"
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Laboratorio Clínico XYZ"
                required
              />
            </div>

            {/* Fecha del examen */}
            <div className="mb-6">
              <label htmlFor="examDate" className="block text-gray-700 font-medium mb-2">
                Fecha del Examen
              </label>
              <input
                type="date"
                id="examDate"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong> El sistema procesará automáticamente el PDF con inteligencia artificial
                para extraer los datos relevantes. Esto puede tomar unos minutos.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition font-medium"
              >
                {loading ? 'Subiendo...' : 'Subir Examen'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
