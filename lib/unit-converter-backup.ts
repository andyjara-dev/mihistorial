/**
 * Conversión de unidades médicas comunes
 */

// Definir unidades estándar para cada tipo de medición
export const STANDARD_UNITS: Record<string, string> = {
  'Ácido Úrico': 'mg/dL',
  'Glucosa': 'mg/dL',
  'Hemoglobina Glicosilada': '%',
  'Colesterol Total': 'mg/dL',
  'HDL Colesterol': 'mg/dL',
  'LDL Colesterol': 'mg/dL',
  'Triglicéridos': 'mg/dL',
  'Creatinina': 'mg/dL',
  'Urea': 'mg/dL',
  'Bilirrubina Total': 'mg/dL',
  'Hemoglobina': 'g/dL',
  'Hematocrito': '%',
  'Leucocitos': 'mil/uL',
  'Eritrocitos': 'mill/uL',
  'Plaquetas': 'mil/uL',
  'Calcio': 'mg/dL',
  'Sodio': 'mEq/L',
  'Potasio': 'mEq/L',
  'Cloro': 'mEq/L',
  'TSH': 'uUI/mL',
  'Vitamina D': 'ng/mL',
  'Vitamina B12': 'pg/mL',
}

// Factores de conversión: [de_unidad, a_unidad, factor_multiplicador]
// Para convertir: valor_en_unidad_destino = valor_en_unidad_origen * factor
const CONVERSION_FACTORS: Record<string, Array<[string, string, number]>> = {
  'Ácido Úrico': [
    ['umol/L', 'mg/dL', 1 / 59.48], // umol/L a mg/dL
    ['µmol/L', 'mg/dL', 1 / 59.48], // variante con μ
    ['mg/dL', 'umol/L', 59.48],     // mg/dL a umol/L
  ],
  'Glucosa': [
    ['mmol/L', 'mg/dL', 18.02],     // mmol/L a mg/dL
    ['mg/dL', 'mmol/L', 1 / 18.02], // mg/dL a mmol/L
  ],
  'Colesterol Total': [
    ['mmol/L', 'mg/dL', 38.67],     // mmol/L a mg/dL
    ['mg/dL', 'mmol/L', 1 / 38.67], // mg/dL a mmol/L
  ],
  'HDL Colesterol': [
    ['mmol/L', 'mg/dL', 38.67],
    ['mg/dL', 'mmol/L', 1 / 38.67],
  ],
  'LDL Colesterol': [
    ['mmol/L', 'mg/dL', 38.67],
    ['mg/dL', 'mmol/L', 1 / 38.67],
  ],
  'Triglicéridos': [
    ['mmol/L', 'mg/dL', 88.57],
    ['mg/dL', 'mmol/L', 1 / 88.57],
  ],
  'Creatinina': [
    ['umol/L', 'mg/dL', 1 / 88.4],
    ['µmol/L', 'mg/dL', 1 / 88.4],
    ['mg/dL', 'umol/L', 88.4],
  ],
  'Urea': [
    ['mmol/L', 'mg/dL', 6.006],
    ['mg/dL', 'mmol/L', 1 / 6.006],
  ],
  'Bilirrubina Total': [
    ['umol/L', 'mg/dL', 1 / 17.1],
    ['µmol/L', 'mg/dL', 1 / 17.1],
    ['mg/dL', 'umol/L', 17.1],
  ],
  'Calcio': [
    ['mmol/L', 'mg/dL', 4.008],
    ['mg/dL', 'mmol/L', 1 / 4.008],
  ],
}

/**
 * Normaliza una unidad (elimina espacios, convierte a minúsculas, estandariza símbolos)
 */
function normalizeUnit(unit: string | undefined): string {
  if (!unit) return ''

  return unit
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('μ', 'u') // Convertir μ a u
    .replace('µ', 'u') // Convertir µ a u (otra variante)
}

/**
 * Verifica si dos unidades son equivalentes (mismo formato, diferentes escrituras)
 */
function areUnitsEquivalent(unit1: string | undefined, unit2: string | undefined): boolean {
  const norm1 = normalizeUnit(unit1)
  const norm2 = normalizeUnit(unit2)

  if (norm1 === norm2) return true

  // Casos especiales de equivalencia
  const equivalences: Record<string, string[]> = {
    'mg/dl': ['mg/dl', 'mg/100ml'],
    'g/dl': ['g/dl', 'g/100ml'],
    'mmol/l': ['mmol/l', 'mm/l'],
    'umol/l': ['umol/l', 'µmol/l', 'μmol/l'],
    'meq/l': ['meq/l', 'mmol/l'], // Para electrolitos
  }

  for (const [standard, variants] of Object.entries(equivalences)) {
    if (variants.includes(norm1) && variants.includes(norm2)) {
      return true
    }
  }

  return false
}

/**
 * Convierte un valor de una unidad a otra para una medición específica
 */
export function convertUnit(
  measurementName: string,
  value: number,
  fromUnit: string | undefined,
  toUnit: string | undefined
): number | null {
  if (!fromUnit || !toUnit) return null

  // Si las unidades son equivalentes, no convertir
  if (areUnitsEquivalent(fromUnit, toUnit)) return value

  // Buscar factor de conversión
  const conversions = CONVERSION_FACTORS[measurementName]
  if (!conversions) return null

  const normFrom = normalizeUnit(fromUnit)
  const normTo = normalizeUnit(toUnit)

  for (const [from, to, factor] of conversions) {
    if (normalizeUnit(from) === normFrom && normalizeUnit(to) === normTo) {
      return value * factor
    }
  }

  return null
}

/**
 * Obtiene la unidad estándar para una medición
 */
export function getStandardUnit(measurementName: string): string | undefined {
  return STANDARD_UNITS[measurementName]
}

/**
 * Convierte un valor a la unidad estándar de su medición
 */
export function convertToStandardUnit(
  measurementName: string,
  value: number,
  currentUnit: string | undefined
): { value: number; unit: string } | null {
  const standardUnit = getStandardUnit(measurementName)
  if (!standardUnit) {
    // Si no hay unidad estándar definida, retornar el valor original
    return { value, unit: currentUnit || '' }
  }

  if (!currentUnit || areUnitsEquivalent(currentUnit, standardUnit)) {
    // Ya está en la unidad estándar
    return { value, unit: standardUnit }
  }

  const convertedValue = convertUnit(measurementName, value, currentUnit, standardUnit)

  if (convertedValue === null) {
    // No se pudo convertir, retornar original
    return { value, unit: currentUnit }
  }

  return { value: convertedValue, unit: standardUnit }
}

/**
 * Verifica si dos mediciones con diferentes unidades son comparables
 */
export function areUnitsComparable(
  measurementName: string,
  unit1: string | undefined,
  unit2: string | undefined
): boolean {
  if (!unit1 || !unit2) return false

  // Si son equivalentes, son comparables
  if (areUnitsEquivalent(unit1, unit2)) return true

  // Si existe conversión entre ellas, son comparables
  const conversions = CONVERSION_FACTORS[measurementName]
  if (!conversions) return false

  const norm1 = normalizeUnit(unit1)
  const norm2 = normalizeUnit(unit2)

  for (const [from, to] of conversions) {
    if (
      (normalizeUnit(from) === norm1 && normalizeUnit(to) === norm2) ||
      (normalizeUnit(from) === norm2 && normalizeUnit(to) === norm1)
    ) {
      return true
    }
  }

  return false
}

/**
 * Formatea un valor con su unidad
 */
export function formatValueWithUnit(value: number, unit: string | undefined): string {
  const decimals = value < 10 ? 2 : value < 100 ? 1 : 0
  const formattedValue = value.toFixed(decimals)
  return unit ? `${formattedValue} ${unit}` : formattedValue
}
