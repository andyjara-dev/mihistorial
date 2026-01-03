'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FileUploadStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  examId?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<FileUploadStatus[]>([])
  const [examType, setExamType] = useState('')
  const [institution, setInstitution] = useState('')
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{uploaded: number, total: number}>({uploaded: 0, total: 0})

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles: FileUploadStatus[] = []
      let hasErrors = false

      for (const file of selectedFiles) {
        // Validar que sea un PDF
        if (file.type !== 'application/pdf') {
          setError(`${file.name}: Solo se permiten archivos PDF`)
          hasErrors = true
          continue
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name}: El archivo debe ser menor a 10MB`)
          hasErrors = true
          continue
        }

        validFiles.push({
          file,
          status: 'pending'
        })
      }

      if (validFiles.length > 0) {
        setFiles(validFiles)
        setError('')

        // Analizar el primer archivo para prellenar el formulario
        if (validFiles.length > 0) {
          await analyzeFile(validFiles[0].file)
        }
      }

      if (!hasErrors && validFiles.length === 0) {
        setError('No se seleccionaron archivos válidos')
      }
    }
  }

  const analyzeFile = async (fileToAnalyze: File) => {
    setAnalyzing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', fileToAnalyze)

      const response = await fetch('/api/exams/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al analizar el PDF')
        return
      }

      // Rellenar los campos con los datos extraídos
      if (data.data.examDate) {
        // Intentar formatear la fecha al formato YYYY-MM-DD
        try {
          const date = new Date(data.data.examDate)
          if (!isNaN(date.getTime())) {
            const formatted = date.toISOString().split('T')[0]
            setExamDate(formatted)
          }
        } catch {
          // Si falla, dejar vacío
        }
      }

      if (data.data.examType) {
        setExamType(data.data.examType)
      }

      if (data.data.institution) {
        setInstitution(data.data.institution)
      }

      setAnalyzed(true)
    } catch (err) {
      setError('Error al analizar el PDF')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (files.length === 0) {
      setError('Por favor selecciona al menos un archivo PDF')
      return
    }

    if (!examType || !institution || !examDate) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setUploadProgress({uploaded: 0, total: files.length})

    let successCount = 0
    let errorCount = 0

    // Procesar cada archivo secuencialmente
    for (let i = 0; i < files.length; i++) {
      const fileStatus = files[i]

      // Actualizar estado a uploading
      setFiles(prev => prev.map((f, idx) =>
        idx === i ? {...f, status: 'uploading' as const} : f
      ))

      try {
        const formData = new FormData()
        formData.append('file', fileStatus.file)
        formData.append('examType', examType)
        formData.append('institution', institution)
        formData.append('examDate', examDate)

        const response = await fetch('/api/exams/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          // Marcar como error
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? {...f, status: 'error' as const, error: data.error || 'Error al subir'} : f
          ))
          errorCount++
        } else {
          // Marcar como exitoso
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? {...f, status: 'success' as const, examId: data.exam?.id} : f
          ))
          successCount++
        }
      } catch (err) {
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {...f, status: 'error' as const, error: 'Error de conexión'} : f
        ))
        errorCount++
      }

      setUploadProgress({uploaded: i + 1, total: files.length})
    }

    setLoading(false)

    // Mostrar resumen
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} ${successCount === 1 ? 'examen subido' : 'exámenes subidos'} exitosamente`, {
        duration: 3000,
      })

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } else if (successCount > 0 && errorCount > 0) {
      toast.error(`${successCount} exitosos, ${errorCount} fallidos. Revisa los detalles abajo.`, {
        duration: 5000,
      })
    } else {
      setError('No se pudo subir ningún archivo. Revisa los errores.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-2xl font-bold text-gray-900">Subir Examen Médico</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {analyzing && (
            <div className="bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded mb-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
              <span>Analizando PDF y extrayendo datos automáticamente...</span>
            </div>
          )}

          {analyzed && !analyzing && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              PDF analizado exitosamente. Puedes revisar y editar los datos antes de guardar.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Subida de archivo */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Archivos PDF de Exámenes <span className="text-sm text-gray-500">(puedes seleccionar varios)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-gray-600">Haz clic para seleccionar archivos PDF</p>
                    <p className="text-sm text-gray-500">Puedes seleccionar múltiples archivos (máximo 10MB cada uno)</p>
                  </div>
                </label>
              </div>

              {/* Lista de archivos seleccionados */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {files.length} {files.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
                  </p>
                  {files.map((fileStatus, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        fileStatus.status === 'success' ? 'bg-green-50 border-green-200' :
                        fileStatus.status === 'error' ? 'bg-red-50 border-red-200' :
                        fileStatus.status === 'uploading' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {fileStatus.status === 'success' && (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {fileStatus.status === 'error' && (
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {fileStatus.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                        )}
                        {fileStatus.status === 'pending' && (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{fileStatus.file.name}</p>
                          {fileStatus.error && (
                            <p className="text-xs text-red-600 mt-1">{fileStatus.error}</p>
                          )}
                          {fileStatus.status === 'uploading' && (
                            <p className="text-xs text-yellow-600 mt-1">Subiendo...</p>
                          )}
                          {fileStatus.status === 'success' && (
                            <p className="text-xs text-green-600 mt-1">Subido exitosamente</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progreso general */}
              {loading && uploadProgress.total > 0 && (
                <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-teal-900">
                      Subiendo archivos...
                    </span>
                    <span className="text-sm text-teal-700">
                      {uploadProgress.uploaded} / {uploadProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-teal-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                required
              />
            </div>

            <div className="bg-teal-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>Cómo funciona:</strong>
              </p>
              <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
                <li>Al seleccionar un PDF, el sistema extrae automáticamente la fecha, tipo de examen e institución</li>
                <li>Puedes revisar y editar estos datos antes de guardar</li>
                <li>Después de guardar, el PDF se procesará con IA para extraer los resultados médicos detallados</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || analyzing}
                className="flex-1 bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 disabled:bg-teal-300 transition font-medium"
              >
                {loading ? 'Subiendo...' : analyzing ? 'Analizando...' : 'Subir Examen'}
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
