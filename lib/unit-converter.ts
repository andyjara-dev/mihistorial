/**
 * Conversión COMPLETA de unidades médicas
 * Incluye todas las mediciones comunes de laboratorio clínico
 */

// Definir unidades estándar para cada tipo de medición
export const STANDARD_UNITS: Record<string, string> = {
  // ===== PERFIL LIPÍDICO =====
  'Ácido Úrico': 'mg/dL',
  'Glucosa': 'mg/dL',
  'Hemoglobina Glicosilada': '%',
  'Colesterol Total': 'mg/dL',
  'HDL Colesterol': 'mg/dL',
  'LDL Colesterol': 'mg/dL',
  'VLDL Colesterol': 'mg/dL',
  'Triglicéridos': 'mg/dL',

  // ===== FUNCIÓN RENAL =====
  'Creatinina': 'mg/dL',
  'Urea': 'mg/dL',
  'BUN': 'mg/dL',
  'Cistatina C': 'mg/L',
  'Microalbuminuria': 'mg/24h',
  'Proteinuria': 'mg/24h',

  // ===== FUNCIÓN HEPÁTICA =====
  'ALT (TGP)': 'U/L',
  'AST (TGO)': 'U/L',
  'Bilirrubina Total': 'mg/dL',
  'Bilirrubina Directa': 'mg/dL',
  'Bilirrubina Indirecta': 'mg/dL',
  'Fosfatasa Alcalina': 'U/L',
  'GGT': 'U/L',
  'LDH': 'U/L',
  'Proteínas Totales': 'g/dL',
  'Albúmina': 'g/dL',
  'Globulinas': 'g/dL',

  // ===== HEMATOLOGÍA =====
  'Hemoglobina': 'g/dL',
  'Hematocrito': '%',
  'Leucocitos': 'mil/uL',
  'Eritrocitos': 'mill/uL',
  'Plaquetas': 'mil/uL',
  'VCM': 'fL',
  'HCM': 'pg',
  'CHCM': 'g/dL',
  'RDW': '%',

  // Recuento Absoluto (valores absolutos en células/μL)
  'R.A. Neutrófilos': 'mil/uL',
  'R.A. Linfocitos': 'mil/uL',
  'R.A. Monocitos': 'mil/uL',
  'R.A. Eosinófilos': 'mil/uL',
  'R.A. Basófilos': 'mil/uL',

  // Porcentaje (valores relativos)
  'Neutrófilos %': '%',
  'Linfocitos %': '%',
  'Monocitos %': '%',
  'Eosinófilos %': '%',
  'Basófilos %': '%',

  'VSG': 'mm/h',
  'Reticulocitos': '%',

  // ===== ELECTROLITOS =====
  'Sodio': 'mEq/L',
  'Potasio': 'mEq/L',
  'Cloro': 'mEq/L',
  'Calcio': 'mg/dL',
  'Calcio Iónico': 'mg/dL',
  'Magnesio': 'mg/dL',
  'Fósforo': 'mg/dL',

  // ===== HORMONAS TIROIDEAS =====
  'TSH': 'uUI/mL',
  'T3': 'ng/dL',
  'T4': 'ug/dL',
  'T3 Libre': 'pg/mL',
  'T4 Libre': 'ng/dL',
  'Tiroglobulina': 'ng/mL',
  'Anticuerpos Anti-TPO': 'UI/mL',
  'Anticuerpos Anti-Tiroglobulina': 'UI/mL',

  // ===== HORMONAS SEXUALES =====
  'Testosterona Total': 'ng/dL',
  'Testosterona Libre': 'pg/mL',
  'Estradiol': 'pg/mL',
  'Progesterona': 'ng/mL',
  'Prolactina': 'ng/mL',
  'FSH': 'mUI/mL',
  'LH': 'mUI/mL',
  'DHEA-S': 'ug/dL',
  'SHBG': 'nmol/L',

  // ===== OTRAS HORMONAS =====
  'Cortisol': 'ug/dL',
  'ACTH': 'pg/mL',
  'Insulina': 'uUI/mL',
  'Péptido C': 'ng/mL',
  'Hormona de Crecimiento': 'ng/mL',
  'IGF-1': 'ng/mL',
  'PTH': 'pg/mL',
  'Vitamina D': 'ng/mL',
  'Vitamina B12': 'pg/mL',

  // ===== VITAMINAS Y MINERALES =====
  'Vitamina A': 'ug/dL',
  'Vitamina E': 'mg/L',
  'Vitamina K': 'ng/mL',
  'Ácido Fólico': 'ng/mL',
  'Folato': 'ng/mL',
  'Vitamina C': 'mg/dL',
  'Hierro': 'ug/dL',
  'Ferritina': 'ng/mL',
  'Transferrina': 'mg/dL',
  'TIBC': 'ug/dL',
  'Saturación de Transferrina': '%',
  'Zinc': 'ug/dL',
  'Cobre': 'ug/dL',
  'Selenio': 'ug/L',

  // ===== MARCADORES CARDÍACOS =====
  'Troponina I': 'ng/mL',
  'Troponina T': 'ng/mL',
  'CK': 'U/L',
  'CK-MB': 'ng/mL',
  'Mioglobina': 'ng/mL',
  'BNP': 'pg/mL',
  'NT-proBNP': 'pg/mL',
  'Homocisteína': 'umol/L',

  // ===== MARCADORES DE INFLAMACIÓN =====
  'PCR': 'mg/L',
  'PCR Ultrasensible': 'mg/L',
  'Procalcitonina': 'ng/mL',

  // ===== MARCADORES TUMORALES =====
  'PSA': 'ng/mL',
  'PSA Libre': 'ng/mL',
  'CA 125': 'U/mL',
  'CA 19-9': 'U/mL',
  'CA 15-3': 'U/mL',
  'CEA': 'ng/mL',
  'AFP': 'ng/mL',
  'Beta-HCG': 'mUI/mL',

  // ===== COAGULACIÓN =====
  'INR': '',
  'TP': 'seg',
  'TTPA': 'seg',
  'Fibrinógeno': 'mg/dL',
  'Dímero D': 'ng/mL',

  // ===== ENZIMAS PANCREÁTICAS =====
  'Amilasa': 'U/L',
  'Lipasa': 'U/L',

  // ===== INMUNOGLOBULINAS =====
  'IgA': 'mg/dL',
  'IgG': 'mg/dL',
  'IgM': 'mg/dL',
  'IgE': 'UI/mL',

  // ===== COMPLEMENTO =====
  'C3': 'mg/dL',
  'C4': 'mg/dL',

  // ===== GASES ARTERIALES =====
  'pH': '',
  'pO2': 'mmHg',
  'pCO2': 'mmHg',
  'HCO3': 'mEq/L',
  'Lactato': 'mmol/L',

  // ===== ORINA =====
  'Creatinina Orina': 'mg/dL',
  'Urea Orina': 'g/24h',
  'Proteínas Orina': 'mg/24h',
  'Microalbúmina Orina': 'mg/L',
  'Sodio Orina': 'mEq/L',
  'Potasio Orina': 'mEq/L',
}

// Factores de conversión exhaustivos
const CONVERSION_FACTORS: Record<string, Array<[string, string, number]>> = {
  // ===== ÁCIDO ÚRICO =====
  'Ácido Úrico': [
    ['umol/L', 'mg/dL', 1 / 59.48],
    ['µmol/L', 'mg/dL', 1 / 59.48],
    ['mg/dL', 'umol/L', 59.48],
  ],

  // ===== GLUCOSA =====
  'Glucosa': [
    ['mmol/L', 'mg/dL', 18.02],
    ['mg/dL', 'mmol/L', 1 / 18.02],
  ],

  // ===== COLESTEROL Y LÍPIDOS =====
  'Colesterol Total': [
    ['mmol/L', 'mg/dL', 38.67],
    ['mg/dL', 'mmol/L', 1 / 38.67],
  ],
  'HDL Colesterol': [
    ['mmol/L', 'mg/dL', 38.67],
    ['mg/dL', 'mmol/L', 1 / 38.67],
  ],
  'LDL Colesterol': [
    ['mmol/L', 'mg/dL', 38.67],
    ['mg/dL', 'mmol/L', 1 / 38.67],
  ],
  'VLDL Colesterol': [
    ['mmol/L', 'mg/dL', 38.67],
    ['mg/dL', 'mmol/L', 1 / 38.67],
  ],
  'Triglicéridos': [
    ['mmol/L', 'mg/dL', 88.57],
    ['mg/dL', 'mmol/L', 1 / 88.57],
  ],

  // ===== CREATININA =====
  'Creatinina': [
    ['umol/L', 'mg/dL', 1 / 88.4],
    ['µmol/L', 'mg/dL', 1 / 88.4],
    ['mg/dL', 'umol/L', 88.4],
  ],
  'Creatinina Orina': [
    ['mmol/L', 'mg/dL', 11.31],
    ['mg/dL', 'mmol/L', 1 / 11.31],
  ],

  // ===== UREA / BUN =====
  'Urea': [
    ['mmol/L', 'mg/dL', 6.006],
    ['mg/dL', 'mmol/L', 1 / 6.006],
  ],
  'BUN': [
    ['mmol/L', 'mg/dL', 2.8],
    ['mg/dL', 'mmol/L', 1 / 2.8],
  ],

  // ===== BILIRRUBINA =====
  'Bilirrubina Total': [
    ['umol/L', 'mg/dL', 1 / 17.1],
    ['µmol/L', 'mg/dL', 1 / 17.1],
    ['mg/dL', 'umol/L', 17.1],
  ],
  'Bilirrubina Directa': [
    ['umol/L', 'mg/dL', 1 / 17.1],
    ['µmol/L', 'mg/dL', 1 / 17.1],
    ['mg/dL', 'umol/L', 17.1],
  ],
  'Bilirrubina Indirecta': [
    ['umol/L', 'mg/dL', 1 / 17.1],
    ['µmol/L', 'mg/dL', 1 / 17.1],
    ['mg/dL', 'umol/L', 17.1],
  ],

  // ===== CALCIO =====
  'Calcio': [
    ['mmol/L', 'mg/dL', 4.008],
    ['mg/dL', 'mmol/L', 1 / 4.008],
  ],
  'Calcio Iónico': [
    ['mmol/L', 'mg/dL', 4.008],
    ['mg/dL', 'mmol/L', 1 / 4.008],
  ],

  // ===== MAGNESIO =====
  'Magnesio': [
    ['mmol/L', 'mg/dL', 2.431],
    ['mg/dL', 'mmol/L', 1 / 2.431],
    ['mEq/L', 'mg/dL', 1.215],
    ['mg/dL', 'mEq/L', 1 / 1.215],
  ],

  // ===== FÓSFORO =====
  'Fósforo': [
    ['mmol/L', 'mg/dL', 3.097],
    ['mg/dL', 'mmol/L', 1 / 3.097],
  ],

  // ===== HEMOGLOBINA =====
  'Hemoglobina': [
    ['mmol/L', 'g/dL', 1.611],
    ['g/dL', 'mmol/L', 1 / 1.611],
    ['g/L', 'g/dL', 0.1],
    ['g/dL', 'g/L', 10],
  ],

  // ===== PROTEÍNAS =====
  'Proteínas Totales': [
    ['g/L', 'g/dL', 0.1],
    ['g/dL', 'g/L', 10],
  ],
  'Albúmina': [
    ['g/L', 'g/dL', 0.1],
    ['g/dL', 'g/L', 10],
  ],
  'Globulinas': [
    ['g/L', 'g/dL', 0.1],
    ['g/dL', 'g/L', 10],
  ],

  // ===== HORMONAS TIROIDEAS =====
  'TSH': [
    ['mUI/L', 'uUI/mL', 1],
    ['uUI/mL', 'mUI/L', 1],
  ],
  'T3': [
    ['nmol/L', 'ng/dL', 65.1],
    ['ng/dL', 'nmol/L', 1 / 65.1],
    ['ng/mL', 'ng/dL', 100],
    ['ng/dL', 'ng/mL', 0.01],
  ],
  'T4': [
    ['nmol/L', 'ug/dL', 7.775],
    ['ug/dL', 'nmol/L', 1 / 7.775],
    ['pmol/L', 'ng/dL', 0.0777],
    ['ng/dL', 'pmol/L', 1 / 0.0777],
  ],
  'T3 Libre': [
    ['pmol/L', 'pg/mL', 0.651],
    ['pg/mL', 'pmol/L', 1 / 0.651],
  ],
  'T4 Libre': [
    ['pmol/L', 'ng/dL', 0.07775],
    ['ng/dL', 'pmol/L', 1 / 0.07775],
  ],

  // ===== TESTOSTERONA =====
  'Testosterona Total': [
    ['nmol/L', 'ng/dL', 28.84],
    ['ng/dL', 'nmol/L', 1 / 28.84],
    ['ng/mL', 'ng/dL', 100],
    ['ng/dL', 'ng/mL', 0.01],
  ],
  'Testosterona Libre': [
    ['pmol/L', 'pg/mL', 0.2884],
    ['pg/mL', 'pmol/L', 1 / 0.2884],
  ],

  // ===== ESTRADIOL =====
  'Estradiol': [
    ['pmol/L', 'pg/mL', 0.2724],
    ['pg/mL', 'pmol/L', 1 / 0.2724],
  ],

  // ===== PROGESTERONA =====
  'Progesterona': [
    ['nmol/L', 'ng/mL', 0.3145],
    ['ng/mL', 'nmol/L', 1 / 0.3145],
  ],

  // ===== CORTISOL =====
  'Cortisol': [
    ['nmol/L', 'ug/dL', 3.625],
    ['ug/dL', 'nmol/L', 1 / 3.625],
  ],

  // ===== PROLACTINA =====
  'Prolactina': [
    ['mUI/L', 'ng/mL', 0.0476],
    ['ng/mL', 'mUI/L', 1 / 0.0476],
  ],

  // ===== INSULINA =====
  'Insulina': [
    ['pmol/L', 'uUI/mL', 0.1429],
    ['uUI/mL', 'pmol/L', 1 / 0.1429],
  ],

  // ===== PÉPTIDO C =====
  'Péptido C': [
    ['nmol/L', 'ng/mL', 0.331],
    ['ng/mL', 'nmol/L', 1 / 0.331],
  ],

  // ===== VITAMINA D =====
  'Vitamina D': [
    ['nmol/L', 'ng/mL', 0.4],
    ['ng/mL', 'nmol/L', 2.5],
  ],

  // ===== VITAMINA B12 =====
  'Vitamina B12': [
    ['pmol/L', 'pg/mL', 1.355],
    ['pg/mL', 'pmol/L', 1 / 1.355],
  ],

  // ===== ÁCIDO FÓLICO =====
  'Ácido Fólico': [
    ['nmol/L', 'ng/mL', 0.441],
    ['ng/mL', 'nmol/L', 1 / 0.441],
  ],
  'Folato': [
    ['nmol/L', 'ng/mL', 0.441],
    ['ng/mL', 'nmol/L', 1 / 0.441],
  ],

  // ===== HIERRO =====
  'Hierro': [
    ['umol/L', 'ug/dL', 5.587],
    ['µmol/L', 'ug/dL', 5.587],
    ['ug/dL', 'umol/L', 1 / 5.587],
  ],

  // ===== FERRITINA =====
  'Ferritina': [
    ['pmol/L', 'ng/mL', 0.4494],
    ['ng/mL', 'pmol/L', 1 / 0.4494],
    ['ug/L', 'ng/mL', 1],
    ['ng/mL', 'ug/L', 1],
  ],

  // ===== TRANSFERRINA =====
  'Transferrina': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
  ],

  // ===== TIBC =====
  'TIBC': [
    ['umol/L', 'ug/dL', 5.587],
    ['µmol/L', 'ug/dL', 5.587],
    ['ug/dL', 'umol/L', 1 / 5.587],
  ],

  // ===== HOMOCISTEÍNA =====
  'Homocisteína': [
    ['umol/L', 'mg/L', 0.135],
    ['µmol/L', 'mg/L', 0.135],
    ['mg/L', 'umol/L', 1 / 0.135],
  ],

  // ===== TROPONINAS =====
  'Troponina I': [
    ['ug/L', 'ng/mL', 1],
    ['ng/mL', 'ug/L', 1],
  ],
  'Troponina T': [
    ['ug/L', 'ng/mL', 1],
    ['ng/mL', 'ug/L', 1],
  ],

  // ===== CK-MB =====
  'CK-MB': [
    ['ug/L', 'ng/mL', 1],
    ['ng/mL', 'ug/L', 1],
  ],

  // ===== BNP / NT-proBNP =====
  'BNP': [
    ['pmol/L', 'pg/mL', 0.289],
    ['pg/mL', 'pmol/L', 1 / 0.289],
  ],
  'NT-proBNP': [
    ['pmol/L', 'pg/mL', 0.118],
    ['pg/mL', 'pmol/L', 1 / 0.118],
  ],

  // ===== PCR =====
  'PCR': [
    ['nmol/L', 'mg/L', 0.105],
    ['mg/L', 'nmol/L', 1 / 0.105],
    ['mg/dL', 'mg/L', 10],
    ['mg/L', 'mg/dL', 0.1],
  ],
  'PCR Ultrasensible': [
    ['nmol/L', 'mg/L', 0.105],
    ['mg/L', 'nmol/L', 1 / 0.105],
  ],

  // ===== FIBRINÓGENO =====
  'Fibrinógeno': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
    ['umol/L', 'mg/dL', 29.4],
    ['µmol/L', 'mg/dL', 29.4],
    ['mg/dL', 'umol/L', 1 / 29.4],
  ],

  // ===== DÍMERO D =====
  'Dímero D': [
    ['ug/mL', 'ng/mL', 1000],
    ['ng/mL', 'ug/mL', 0.001],
    ['mg/L', 'ng/mL', 1000],
    ['ng/mL', 'mg/L', 0.001],
  ],

  // ===== LACTATO =====
  'Lactato': [
    ['mmol/L', 'mg/dL', 9.008],
    ['mg/dL', 'mmol/L', 1 / 9.008],
  ],

  // ===== INMUNOGLOBULINAS =====
  'IgA': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
  ],
  'IgG': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
  ],
  'IgM': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
  ],

  // ===== COMPLEMENTO =====
  'C3': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
  ],
  'C4': [
    ['g/L', 'mg/dL', 100],
    ['mg/dL', 'g/L', 0.01],
  ],

  // ===== GASES ARTERIALES =====
  'pO2': [
    ['kPa', 'mmHg', 7.5],
    ['mmHg', 'kPa', 1 / 7.5],
  ],
  'pCO2': [
    ['kPa', 'mmHg', 7.5],
    ['mmHg', 'kPa', 1 / 7.5],
  ],
}

/**
 * Normaliza una unidad (elimina espacios, convierte a minúsculas, estandariza símbolos)
 */
function normalizeUnit(unit: string | undefined): string {
  if (!unit || typeof unit !== 'string') return ''

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
    'mg/dl': ['mg/dl', 'mg/100ml', 'mg%'],
    'g/dl': ['g/dl', 'g/100ml', 'g%'],
    'mmol/l': ['mmol/l', 'mm/l'],
    'umol/l': ['umol/l', 'µmol/l', 'μmol/l'],
    'meq/l': ['meq/l', 'mmol/l'],
    'u/l': ['u/l', 'ui/l'],
    'uui/ml': ['uui/ml', 'mui/ml', 'mu/ml'],
    'ng/ml': ['ng/ml', 'ug/l'],
    'pg/ml': ['pg/ml', 'ng/l'],
    'ug/dl': ['ug/dl', 'mcg/dl'],
    'ug/l': ['ug/l', 'mcg/l'],
    // Recuento de células (miles por microlitro)
    'mil/ul': ['mil/ul', 'x10^3/ul', 'x10^3/μl', 'k/ul', 'k/μl', 'mil/μl', '10^3/ul', '10^3/μl'],
    // Recuento de células (millones por microlitro)
    'mill/ul': ['mill/ul', 'x10^6/ul', 'x10^6/μl', 'm/ul', 'm/μl', 'mill/μl', '10^6/ul', '10^6/μl'],
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
