'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FileUploadData {
  file: File
  examType: string
  institution: string
  examDate: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  examId?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<FileUploadData[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{uploaded: number, total: number}>({uploaded: 0, total: 0})
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles: FileUploadData[] = []
      const errors: string[] = []

      // Obtener fecha de hoy en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0]

      for (const file of selectedFiles) {
        // Validar que sea un PDF
        if (file.type !== 'application/pdf') {
          errors.push(`${file.name}: Solo se permiten archivos PDF`)
          continue
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${file.name}: El archivo debe ser menor a 10MB`)
          continue
        }

        validFiles.push({
          file,
          examType: 'Sangre', // Valor por defecto
          institution: '',
          examDate: today, // Fecha de hoy por defecto
          status: 'pending'
        })
      }

      if (errors.length > 0) {
        toast.error(errors[0])
      }

      if (validFiles.length > 0) {
        setFiles(validFiles)
      }
    }
  }

  const updateFileData = (index: number, field: keyof FileUploadData, value: string) => {
    setFiles(prev => prev.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    ))
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const openPreview = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreviewFile(file)
    setPreviewUrl(url)
  }

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Selecciona al menos un archivo')
      return
    }

    // Validar que todos los archivos tengan datos completos
    const incompleteFiles = files.filter(f => !f.examType || !f.institution || !f.examDate)
    if (incompleteFiles.length > 0) {
      toast.error('Completa todos los campos requeridos para cada archivo')
      return
    }

    setLoading(true)
    setUploadProgress({uploaded: 0, total: files.length})

    let successCount = 0
    let errorCount = 0

    // Subir cada archivo con sus propios datos
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i]

      setFiles(prev => prev.map((f, idx) =>
        idx === i ? {...f, status: 'uploading' as const} : f
      ))

      try {
        const formData = new FormData()
        formData.append('file', fileData.file)
        formData.append('examType', fileData.examType)
        formData.append('institution', fileData.institution)
        formData.append('examDate', fileData.examDate)

        const response = await fetch('/api/exams/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? {...f, status: 'success' as const, examId: data.exam.id} : f
          ))
          successCount++
        } else {
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? {...f, status: 'error' as const, error: data.error || 'Error al subir'} : f
          ))
          errorCount++
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
      toast.error('No se pudo subir ningún archivo. Revisa los errores.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subir Exámenes Médicos</h1>
            <p className="text-gray-600 mt-2">Selecciona uno o más PDFs de exámenes médicos</p>
          </div>
          <Link
            href="/dashboard"
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de archivos */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Selecciona uno o más archivos PDF
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Máximo 10MB por archivo
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={loading}
                />
                <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  Seleccionar archivos
                </span>
              </label>
            </div>
          </div>

          {/* Lista de archivos con formularios individuales */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Archivos seleccionados ({files.length})
                </h2>
                {loading && (
                  <div className="text-sm text-gray-600">
                    Subiendo {uploadProgress.uploaded} de {uploadProgress.total}...
                  </div>
                )}
              </div>

              {files.map((fileData, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-colors ${
                    fileData.status === 'success' ? 'border-green-300 bg-green-50' :
                    fileData.status === 'error' ? 'border-red-300 bg-red-50' :
                    fileData.status === 'uploading' ? 'border-teal-300 bg-teal-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icono de estado */}
                    <div className="flex-shrink-0 mt-1">
                      {fileData.status === 'success' && (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {fileData.status === 'error' && (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {fileData.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                      )}
                      {fileData.status === 'pending' && (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      {/* Nombre del archivo */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileData.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {fileData.status === 'pending' && !loading && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              type="button"
                              onClick={() => openPreview(fileData.file)}
                              className="px-3 py-1 text-sm text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded flex items-center gap-1"
                              title="Ver PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-800"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Formulario individual para este archivo */}
                      {fileData.status === 'pending' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Tipo de examen */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de examen <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={fileData.examType}
                              onChange={(e) => updateFileData(index, 'examType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              disabled={loading}
                            >
                              <option value="Sangre">Sangre</option>
                              <option value="Orina">Orina</option>
                              <option value="Heces">Heces</option>
                              <option value="Radiografía">Radiografía</option>
                              <option value="Ecografía">Ecografía</option>
                              <option value="Resonancia">Resonancia</option>
                              <option value="TAC">TAC</option>
                              <option value="Electrocardiograma">Electrocardiograma</option>
                              <option value="Endoscopia">Endoscopia</option>
                              <option value="Biopsia">Biopsia</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>

                          {/* Institución */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Centro médico <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={fileData.institution}
                              onChange={(e) => updateFileData(index, 'institution', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Ej: UC Christus"
                              required
                              disabled={loading}
                            />
                          </div>

                          {/* Fecha */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha del examen <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={fileData.examDate}
                              onChange={(e) => updateFileData(index, 'examDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              disabled={loading}
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                      )}

                      {/* Mensaje de éxito */}
                      {fileData.status === 'success' && (
                        <div className="text-sm text-green-700">
                          ✓ Subido exitosamente
                        </div>
                      )}

                      {/* Mensaje de error */}
                      {fileData.status === 'error' && (
                        <div className="text-sm text-red-700">
                          ✗ {fileData.error || 'Error al subir'}
                        </div>
                      )}

                      {/* Mensaje de subiendo */}
                      {fileData.status === 'uploading' && (
                        <div className="text-sm text-teal-700">
                          Subiendo...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Barra de progreso */}
              {loading && (
                <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso total</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Botón de subir */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || files.length === 0}
                  className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                    loading || files.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Subiendo...
                    </span>
                  ) : (
                    `Subir ${files.length} ${files.length === 1 ? 'examen' : 'exámenes'}`
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Modal de vista previa del PDF */}
        {previewUrl && previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vista previa del PDF</h3>
                  <p className="text-sm text-gray-600">{previewFile.name}</p>
                </div>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Visor del PDF */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Vista previa del PDF"
                />
              </div>

              {/* Footer con botón de cerrar */}
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
