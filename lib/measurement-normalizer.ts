/**
 * Normaliza nombres de mediciones médicas para agrupar valores similares
 * a través de diferentes exámenes
 */

import { convertToStandardUnit, getStandardUnit, formatValueWithUnit } from './unit-converter'

// Mapa de sinónimos y variaciones de nombres de mediciones
const MEASUREMENT_ALIASES: Record<string, string[]> = {
  // ===== PERFIL LIPÍDICO =====
  'Colesterol Total': ['colesterol total', 'cholesterol total', 'col total', 'colesterol', 'cholesterol'],
  'HDL Colesterol': ['hdl', 'hdl colesterol', 'colesterol hdl', 'hdl-c', 'c-hdl', 'lipoproteína de alta densidad', 'high density lipoprotein'],
  'LDL Colesterol': ['ldl', 'ldl colesterol', 'colesterol ldl', 'ldl-c', 'c-ldl', 'lipoproteína de baja densidad', 'low density lipoprotein'],
  'VLDL Colesterol': ['vldl', 'vldl colesterol', 'colesterol vldl', 'vldl-c'],
  'Triglicéridos': ['triglicéridos', 'trigliceridos', 'triglycerides', 'trig', 'tg'],
  'Ácido Úrico': ['ácido úrico', 'acido urico', 'uric acid', 'urato', 'urato sérico'],

  // ===== GLUCOSA =====
  'Glucosa': ['glucosa', 'glucose', 'glicemia', 'glucemia', 'glucosa en ayunas', 'glucosa basal', 'fasting glucose'],
  'Hemoglobina Glicosilada': ['hba1c', 'hemoglobina glicosilada', 'hemoglobina glicada', 'a1c', 'glicohemoglobina', 'glycated hemoglobin'],

  // ===== HEMATOLOGÍA =====
  'Hemoglobina': ['hemoglobina', 'hb', 'hgb', 'hemoglobin'],
  'Hematocrito': ['hematocrito', 'hct', 'hto', 'hematocrit', 'ht'],
  'Leucocitos': ['leucocitos', 'glóbulos blancos', 'wbc', 'white blood cells', 'gb', 'globulos blancos'],
  'Eritrocitos': ['eritrocitos', 'glóbulos rojos', 'rbc', 'red blood cells', 'gr', 'hematíes', 'globulos rojos'],
  'Plaquetas': ['plaquetas', 'platelets', 'plt', 'trombocitos'],
  'VCM': ['vcm', 'mcv', 'volumen corpuscular medio', 'mean corpuscular volume'],
  'HCM': ['hcm', 'mch', 'hemoglobina corpuscular media'],
  'CHCM': ['chcm', 'mchc', 'concentración de hemoglobina corpuscular media'],
  'RDW': ['rdw', 'ancho de distribución eritrocitaria'],

  // Recuento Absoluto de células (valores absolutos en células/μL)
  'R.A. Neutrófilos': ['r.a. neutrófilos', 'r.a. neutrofilos', 'recuento absoluto neutrófilos', 'recuento absoluto de neutrófilos', 'neutrofilos absolutos'],
  'R.A. Linfocitos': ['r.a. linfocitos', 'recuento absoluto linfocitos', 'recuento absoluto de linfocitos', 'linfocitos absolutos'],
  'R.A. Monocitos': ['r.a. monocitos', 'recuento absoluto monocitos', 'recuento absoluto de monocitos', 'monocitos absolutos'],
  'R.A. Eosinófilos': ['r.a. eosinófilos', 'r.a. eosinofilos', 'recuento absoluto eosinófilos', 'recuento absoluto de eosinófilos', 'eosinofilos absolutos'],
  'R.A. Basófilos': ['r.a. basófilos', 'r.a. basofilos', 'recuento absoluto basófilos', 'recuento absoluto de basófilos', 'basofilos absolutos'],

  // Porcentaje de células (valores relativos en %)
  'Neutrófilos %': ['neutrófilos %', 'neutrofilos %', 'neutrophils %', 'pmn %', 'neutrofilos porcentaje'],
  'Linfocitos %': ['linfocitos %', 'lymphocytes %', 'linf %', 'linfocitos porcentaje'],
  'Monocitos %': ['monocitos %', 'monocytes %', 'mono %', 'monocitos porcentaje'],
  'Eosinófilos %': ['eosinófilos %', 'eosinofilos %', 'eosinophils %', 'eos %', 'eosinofilos porcentaje'],
  'Basófilos %': ['basófilos %', 'basofilos %', 'basophils %', 'baso %', 'basofilos porcentaje'],

  'VSG': ['vsg', 'velocidad de sedimentación globular', 'esr', 'eritrosedimentación'],
  'Reticulocitos': ['reticulocitos', 'reticulocytes', 'retic'],

  // ===== FUNCIÓN RENAL =====
  'Creatinina': ['creatinina', 'creatinine', 'creat', 'crea'],
  'Urea': ['urea', 'nitrógeno ureico'],
  'BUN': ['bun', 'blood urea nitrogen', 'nitrógeno ureico en sangre'],
  'Cistatina C': ['cistatina c', 'cystatin c'],

  // ===== FUNCIÓN HEPÁTICA =====
  'ALT (TGP)': ['alt', 'tgp', 'alanina aminotransferasa', 'sgpt', 'alat', 'gpt'],
  'AST (TGO)': ['ast', 'tgo', 'aspartato aminotransferasa', 'sgot', 'asat', 'got'],
  'Bilirrubina Total': ['bilirrubina total', 'bilirrubina', 'bil total', 'total bilirubin'],
  'Bilirrubina Directa': ['bilirrubina directa', 'bil directa', 'direct bilirubin'],
  'Bilirrubina Indirecta': ['bilirrubina indirecta', 'bil indirecta', 'indirect bilirubin'],
  'Fosfatasa Alcalina': ['fosfatasa alcalina', 'alkaline phosphatase', 'alp', 'fa', 'fal'],
  'GGT': ['ggt', 'gamma glutamil transferasa', 'gamma gt', 'γ-gt'],
  'LDH': ['ldh', 'lactato deshidrogenasa', 'dhl'],
  'Proteínas Totales': ['proteínas totales', 'proteinas totales', 'total protein', 'tp'],
  'Albúmina': ['albúmina', 'albumina', 'albumin', 'alb'],
  'Globulinas': ['globulinas', 'globulins'],

  // ===== HORMONAS TIROIDEAS =====
  'TSH': ['tsh', 'hormona estimulante de tiroides', 'tirotropina', 'thyroid stimulating hormone'],
  'T3': ['t3', 'triyodotironina', 't3 total'],
  'T4': ['t4', 'tiroxina', 't4 total', 'thyroxine'],
  'T3 Libre': ['t3 libre', 'ft3', 'free t3'],
  'T4 Libre': ['t4 libre', 'ft4', 'free t4'],
  'Tiroglobulina': ['tiroglobulina', 'thyroglobulin', 'tg'],
  'Anticuerpos Anti-TPO': ['anticuerpos anti-tpo', 'anti-tpo', 'tpo ab'],
  'Anticuerpos Anti-Tiroglobulina': ['anticuerpos anti-tiroglobulina', 'anti-tg', 'tg ab'],

  // ===== HORMONAS SEXUALES =====
  'Testosterona Total': ['testosterona total', 'testosterone total', 'testosterona'],
  'Testosterona Libre': ['testosterona libre', 'free testosterone'],
  'Estradiol': ['estradiol', 'e2', 'estrogen'],
  'Progesterona': ['progesterona', 'progesterone', 'p4'],
  'Prolactina': ['prolactina', 'prolactin', 'prl'],
  'FSH': ['fsh', 'hormona folículo estimulante', 'follicle stimulating hormone'],
  'LH': ['lh', 'hormona luteinizante', 'luteinizing hormone'],
  'DHEA-S': ['dhea-s', 'dhea sulfato', 'dehidroepiandrosterona'],
  'SHBG': ['shbg', 'globulina fijadora de hormonas sexuales'],

  // ===== OTRAS HORMONAS =====
  'Cortisol': ['cortisol', 'hidrocortisona'],
  'ACTH': ['acth', 'hormona adrenocorticotropa'],
  'Insulina': ['insulina', 'insulin'],
  'Péptido C': ['péptido c', 'peptido c', 'c-peptide'],
  'Hormona de Crecimiento': ['hormona de crecimiento', 'hgh', 'gh', 'growth hormone'],
  'IGF-1': ['igf-1', 'factor de crecimiento insulínico'],
  'PTH': ['pth', 'paratohormona', 'hormona paratiroidea'],

  // ===== VITAMINAS =====
  'Vitamina D': ['vitamina d', 'vitamin d', '25-oh vitamina d', 'calcidiol', '25-hidroxivitamina d'],
  'Vitamina B12': ['vitamina b12', 'vitamin b12', 'cobalamina', 'b12'],
  'Vitamina A': ['vitamina a', 'vitamin a', 'retinol'],
  'Vitamina E': ['vitamina e', 'vitamin e', 'tocoferol'],
  'Vitamina K': ['vitamina k', 'vitamin k'],
  'Ácido Fólico': ['ácido fólico', 'acido folico', 'folic acid', 'folato', 'folate'],
  'Folato': ['folato', 'folate', 'ácido fólico'],
  'Vitamina C': ['vitamina c', 'vitamin c', 'ácido ascórbico'],

  // ===== MINERALES =====
  'Sodio': ['sodio', 'sodium', 'na', 'na+'],
  'Potasio': ['potasio', 'potassium', 'k', 'k+'],
  'Cloro': ['cloro', 'chloride', 'cl', 'cl-'],
  'Calcio': ['calcio', 'calcium', 'ca', 'ca++'],
  'Calcio Iónico': ['calcio iónico', 'calcio ionizado', 'ionized calcium'],
  'Magnesio': ['magnesio', 'magnesium', 'mg', 'mg++'],
  'Fósforo': ['fósforo', 'fosforo', 'phosphorus', 'p'],
  'Hierro': ['hierro', 'iron', 'fe', 'hierro sérico'],
  'Ferritina': ['ferritina', 'ferritin'],
  'Transferrina': ['transferrina', 'transferrin'],
  'TIBC': ['tibc', 'capacidad total de fijación de hierro'],
  'Zinc': ['zinc', 'zn'],
  'Cobre': ['cobre', 'copper', 'cu'],
  'Selenio': ['selenio', 'selenium', 'se'],

  // ===== MARCADORES CARDÍACOS =====
  'Troponina I': ['troponina i', 'troponin i', 'tni', 'tn-i'],
  'Troponina T': ['troponina t', 'troponin t', 'tnt', 'tn-t'],
  'CK': ['ck', 'cpk', 'creatina kinasa', 'creatine kinase'],
  'CK-MB': ['ck-mb', 'cpk-mb', 'creatina kinasa mb'],
  'Mioglobina': ['mioglobina', 'myoglobin'],
  'BNP': ['bnp', 'péptido natriurético cerebral'],
  'NT-proBNP': ['nt-probnp', 'nt-pro-bnp', 'pro-bnp'],
  'Homocisteína': ['homocisteína', 'homocisteina', 'homocysteine'],

  // ===== MARCADORES DE INFLAMACIÓN =====
  'PCR': ['pcr', 'proteína c reactiva', 'c-reactive protein', 'crp'],
  'PCR Ultrasensible': ['pcr ultrasensible', 'hs-crp', 'pcr-us'],
  'Procalcitonina': ['procalcitonina', 'procalcitonin', 'pct'],

  // ===== MARCADORES TUMORALES =====
  'PSA': ['psa', 'antígeno prostático específico'],
  'PSA Libre': ['psa libre', 'free psa'],
  'CA 125': ['ca 125', 'ca-125', 'antígeno ca 125'],
  'CA 19-9': ['ca 19-9', 'ca-19-9', 'antígeno ca 19-9'],
  'CA 15-3': ['ca 15-3', 'ca-15-3'],
  'CEA': ['cea', 'antígeno carcinoembrionario'],
  'AFP': ['afp', 'alfa-fetoproteína', 'alfafetoproteína'],
  'Beta-HCG': ['beta-hcg', 'bhcg', 'gonadotropina coriónica'],

  // ===== COAGULACIÓN =====
  'INR': ['inr', 'razón normalizada internacional'],
  'TP': ['tp', 'tiempo de protrombina', 'pt', 'protrombina'],
  'TTPA': ['ttpa', 'tiempo de tromboplastina parcial activada', 'aptt', 'ptt', 'ttpk'],
  'Fibrinógeno': ['fibrinógeno', 'fibrinogeno', 'fibrinogen'],
  'Dímero D': ['dímero d', 'dimero d', 'd-dimer'],

  // ===== ENZIMAS PANCREÁTICAS =====
  'Amilasa': ['amilasa', 'amylase'],
  'Lipasa': ['lipasa', 'lipase'],

  // ===== INMUNOGLOBULINAS =====
  'IgA': ['iga', 'inmunoglobulina a', 'immunoglobulin a'],
  'IgG': ['igg', 'inmunoglobulina g', 'immunoglobulin g'],
  'IgM': ['igm', 'inmunoglobulina m', 'immunoglobulin m'],
  'IgE': ['ige', 'inmunoglobulina e', 'immunoglobulin e'],

  // ===== COMPLEMENTO =====
  'C3': ['c3', 'complemento c3'],
  'C4': ['c4', 'complemento c4'],

  // ===== GASES ARTERIALES =====
  'pH': ['ph', 'potencial de hidrógeno'],
  'pO2': ['po2', 'presión parcial de oxígeno', 'pao2'],
  'pCO2': ['pco2', 'presión parcial de co2', 'paco2'],
  'HCO3': ['hco3', 'bicarbonato'],
  'Lactato': ['lactato', 'láctico', 'ácido láctico'],
}

/**
 * Normaliza el nombre de una medición a su forma estándar
 */
export function normalizeMeasurementName(rawName: string): string {
  const normalized = rawName.toLowerCase().trim()

  // Primero, buscar coincidencias exactas (más específicas)
  for (const [standardName, aliases] of Object.entries(MEASUREMENT_ALIASES)) {
    if (aliases.some(alias => normalized === alias)) {
      return standardName
    }
  }

  // Luego, buscar coincidencias parciales ordenadas por longitud (más largas primero)
  // Esto asegura que "r.a. eosinófilos" coincida antes que "eosinófilos"
  const sortedEntries = Object.entries(MEASUREMENT_ALIASES).sort((a, b) => {
    const maxLenA = Math.max(...a[1].map(alias => alias.length))
    const maxLenB = Math.max(...b[1].map(alias => alias.length))
    return maxLenB - maxLenA
  })

  for (const [standardName, aliases] of sortedEntries) {
    for (const alias of aliases) {
      // Buscar coincidencias parciales pero más estrictas
      if (normalized.includes(alias) && alias.length > 3) {
        return standardName
      }
    }
  }

  // Si no se encuentra, capitalizar el nombre original
  return capitalizeWords(rawName.trim())
}

/**
 * Capitaliza cada palabra de un texto
 */
function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Extrae el valor numérico de un string (ej: "120 mg/dL" -> 120)
 */
export function extractNumericValue(value: string): number | null {
  // Remover comas de miles (ej: 1,234 -> 1234)
  const cleaned = value.replace(/,/g, '')

  // Buscar el primer número (puede ser decimal)
  const match = cleaned.match(/-?\d+\.?\d*/)

  if (match) {
    return parseFloat(match[0])
  }

  return null
}

/**
 * Determina la categoría de una medición
 */
export function getMeasurementCategory(measurementName: string): string {
  const normalized = normalizeMeasurementName(measurementName)

  // Definir categorías
  const categories: Record<string, string[]> = {
    'Perfil Lipídico': ['Colesterol Total', 'HDL Colesterol', 'LDL Colesterol', 'VLDL Colesterol', 'Triglicéridos', 'Ácido Úrico'],
    'Glucemia': ['Glucosa', 'Hemoglobina Glicosilada', 'Insulina', 'Péptido C'],
    'Hematología': [
      'Hemoglobina', 'Hematocrito', 'Leucocitos', 'Eritrocitos', 'Plaquetas',
      'VCM', 'HCM', 'CHCM', 'RDW', 'VSG', 'Reticulocitos',
      // Recuento Absoluto
      'R.A. Neutrófilos', 'R.A. Linfocitos', 'R.A. Monocitos', 'R.A. Eosinófilos', 'R.A. Basófilos',
      // Porcentaje
      'Neutrófilos %', 'Linfocitos %', 'Monocitos %', 'Eosinófilos %', 'Basófilos %'
    ],
    'Función Renal': ['Creatinina', 'Urea', 'BUN', 'Cistatina C', 'Creatinina Orina'],
    'Función Hepática': ['ALT (TGP)', 'AST (TGO)', 'Bilirrubina Total', 'Bilirrubina Directa', 'Bilirrubina Indirecta', 'Fosfatasa Alcalina', 'GGT', 'LDH'],
    'Hormonas Tiroideas': ['TSH', 'T3', 'T4', 'T3 Libre', 'T4 Libre', 'Tiroglobulina', 'Anticuerpos Anti-TPO', 'Anticuerpos Anti-Tiroglobulina'],
    'Hormonas Sexuales': ['Testosterona Total', 'Testosterona Libre', 'Estradiol', 'Progesterona', 'Prolactina', 'FSH', 'LH', 'DHEA-S', 'SHBG'],
    'Otras Hormonas': ['Cortisol', 'ACTH', 'Hormona de Crecimiento', 'IGF-1', 'PTH'],
    'Electrolitos': ['Sodio', 'Potasio', 'Cloro', 'Calcio', 'Calcio Iónico', 'Magnesio', 'Fósforo'],
    'Vitaminas': ['Vitamina D', 'Vitamina B12', 'Vitamina A', 'Vitamina E', 'Vitamina K', 'Ácido Fólico', 'Folato', 'Vitamina C'],
    'Minerales': ['Hierro', 'Ferritina', 'Transferrina', 'TIBC', 'Zinc', 'Cobre', 'Selenio'],
    'Proteínas': ['Proteínas Totales', 'Albúmina', 'Globulinas'],
    'Marcadores Cardíacos': ['Troponina I', 'Troponina T', 'CK', 'CK-MB', 'Mioglobina', 'BNP', 'NT-proBNP', 'Homocisteína'],
    'Marcadores de Inflamación': ['PCR', 'PCR Ultrasensible', 'Procalcitonina', 'VSG'],
    'Marcadores Tumorales': ['PSA', 'PSA Libre', 'CA 125', 'CA 19-9', 'CA 15-3', 'CEA', 'AFP', 'Beta-HCG'],
    'Coagulación': ['INR', 'TP', 'TTPA', 'Fibrinógeno', 'Dímero D'],
    'Enzimas Pancreáticas': ['Amilasa', 'Lipasa'],
    'Inmunoglobulinas': ['IgA', 'IgG', 'IgM', 'IgE'],
    'Complemento': ['C3', 'C4'],
    'Gases Arteriales': ['pH', 'pO2', 'pCO2', 'HCO3', 'Lactato'],
  }

  for (const [category, measurements] of Object.entries(categories)) {
    if (measurements.includes(normalized)) {
      return category
    }
  }

  return 'Otros'
}

/**
 * Agrupa y normaliza resultados de múltiples exámenes
 */
export interface NormalizedMeasurement {
  name: string
  category: string
  standardUnit: string | undefined
  values: Array<{
    value: number
    rawValue: string
    unit: string | undefined
    originalValue: number
    originalUnit: string | undefined
    date: Date
    examId: string
    examType: string
    isAbnormal: boolean
    normalRange?: string
  }>
}

export function groupMeasurements(
  exams: Array<{
    id: string
    examType: string
    examDate: Date
    data: {
      results?: Array<{
        test: string
        value: string
        unit?: string
        normalRange?: string
        isAbnormal?: boolean
      }>
    }
  }>
): NormalizedMeasurement[] {
  const grouped = new Map<string, NormalizedMeasurement>()

  for (const exam of exams) {
    if (!exam.data.results) continue

    // Agrupar resultados del mismo examen para detectar duplicados
    const examMeasurements = new Map<string, Array<{
      test: string
      value: string
      unit?: string
      normalRange?: string
      isAbnormal?: boolean
    }>>()

    for (const result of exam.data.results) {
      const normalizedName = normalizeMeasurementName(result.test)

      if (!examMeasurements.has(normalizedName)) {
        examMeasurements.set(normalizedName, [])
      }
      examMeasurements.get(normalizedName)!.push(result)
    }

    // Procesar cada medición única por examen
    for (const [normalizedName, results] of examMeasurements.entries()) {
      // Si hay duplicados del mismo indicador en el mismo examen, consolidar
      const consolidatedResult = consolidateDuplicates(results)

      const numericValue = extractNumericValue(consolidatedResult.value)

      // Solo agrupar valores numéricos
      if (numericValue === null) continue

      // Convertir a unidad estándar
      const converted = convertToStandardUnit(normalizedName, numericValue, consolidatedResult.unit)

      if (!converted) continue

      if (!grouped.has(normalizedName)) {
        const standardUnit = getStandardUnit(normalizedName)
        grouped.set(normalizedName, {
          name: normalizedName,
          category: getMeasurementCategory(normalizedName),
          standardUnit: standardUnit,
          values: [],
        })
      }

      grouped.get(normalizedName)!.values.push({
        value: converted.value, // Valor convertido a unidad estándar
        rawValue: consolidatedResult.value,
        unit: converted.unit, // Unidad estándar
        originalValue: numericValue, // Valor original
        originalUnit: consolidatedResult.unit, // Unidad original
        date: exam.examDate,
        examId: exam.id,
        examType: exam.examType,
        isAbnormal: consolidatedResult.isAbnormal || false,
        normalRange: consolidatedResult.normalRange,
      })
    }
  }

  // Ordenar valores por fecha para cada medición
  for (const measurement of grouped.values()) {
    measurement.values.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Consolida duplicados de la misma medición en un examen
 * Si hay múltiples valores:
 * - Si son iguales o muy similares (< 5% diferencia), toma uno
 * - Si son diferentes, toma el último o el que no esté marcado como anormal si hay diferencia
 */
function consolidateDuplicates(
  results: Array<{
    test: string
    value: string
    unit?: string
    normalRange?: string
    isAbnormal?: boolean
  }>
): {
  test: string
  value: string
  unit?: string
  normalRange?: string
  isAbnormal?: boolean
} {
  if (results.length === 1) {
    return results[0]
  }

  // Extraer valores numéricos de todos los resultados
  const numericValues = results
    .map(r => extractNumericValue(r.value))
    .filter(v => v !== null) as number[]

  if (numericValues.length === 0) {
    return results[0]
  }

  // Si todos los valores son iguales o muy similares (< 5% diferencia)
  const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
  const maxDiff = Math.max(...numericValues.map(v => Math.abs((v - avg) / avg * 100)))

  if (maxDiff < 5) {
    // Valores similares, tomar el primero
    return results[0]
  }

  // Valores diferentes: priorizar el que NO esté marcado como anormal
  const normalResult = results.find(r => !r.isAbnormal)
  if (normalResult) {
    return normalResult
  }

  // Si todos están anormales o no hay marcas, tomar el último
  return results[results.length - 1]
}
