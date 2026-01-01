/**
 * Descripciones médicas de cada indicador
 * Información educativa para ayudar a los usuarios a entender sus resultados
 */

export interface MeasurementDescription {
  name: string
  whatItIs: string // Qué es
  whatItMeasures: string // Qué mide
  normalRange?: string // Rango normal general
  clinical?: string // Significado clínico
}

export const MEASUREMENT_DESCRIPTIONS: Record<string, MeasurementDescription> = {
  // ===== PERFIL LIPÍDICO =====
  'Colesterol Total': {
    name: 'Colesterol Total',
    whatItIs: 'Sustancia cerosa presente en todas las células del cuerpo.',
    whatItMeasures: 'La cantidad total de colesterol en sangre, incluyendo HDL (bueno) y LDL (malo).',
    normalRange: 'Deseable: < 200 mg/dL',
    clinical: 'Niveles elevados aumentan el riesgo de enfermedades cardiovasculares.',
  },
  'HDL Colesterol': {
    name: 'HDL Colesterol',
    whatItIs: 'Lipoproteína de alta densidad, conocida como colesterol "bueno".',
    whatItMeasures: 'El colesterol que ayuda a remover el exceso de colesterol de las arterias.',
    normalRange: 'Óptimo: > 60 mg/dL',
    clinical: 'Niveles altos de HDL protegen contra enfermedades cardíacas.',
  },
  'LDL Colesterol': {
    name: 'LDL Colesterol',
    whatItIs: 'Lipoproteína de baja densidad, conocida como colesterol "malo".',
    whatItMeasures: 'El colesterol que se acumula en las paredes de las arterias.',
    normalRange: 'Óptimo: < 100 mg/dL',
    clinical: 'Niveles elevados aumentan el riesgo de aterosclerosis e infarto.',
  },
  'VLDL Colesterol': {
    name: 'VLDL Colesterol',
    whatItIs: 'Lipoproteína de muy baja densidad, transporta principalmente triglicéridos.',
    whatItMeasures: 'El colesterol asociado a partículas que transportan triglicéridos.',
    normalRange: '2-30 mg/dL',
    clinical: 'Niveles elevados contribuyen a la formación de placas en las arterias.',
  },
  'Triglicéridos': {
    name: 'Triglicéridos',
    whatItIs: 'Tipo más común de grasa en el cuerpo, proveniente de alimentos y producción hepática.',
    whatItMeasures: 'Los niveles de grasa almacenada en la sangre.',
    normalRange: 'Normal: < 150 mg/dL',
    clinical: 'Niveles altos aumentan el riesgo de pancreatitis y enfermedad cardíaca.',
  },
  'Índice Aterogénico': {
    name: 'Índice Aterogénico',
    whatItIs: 'Relación matemática entre colesterol total y HDL.',
    whatItMeasures: 'El riesgo cardiovascular basado en el balance de colesterol.',
    normalRange: '< 5.0 (bajo riesgo)',
    clinical: 'Valores altos indican mayor riesgo de enfermedad coronaria.',
  },
  'Ácido Úrico': {
    name: 'Ácido Úrico',
    whatItIs: 'Producto de desecho del metabolismo de las purinas (compuestos en alimentos).',
    whatItMeasures: 'La cantidad de ácido úrico en sangre.',
    normalRange: 'Hombres: 3.4-7.0 mg/dL, Mujeres: 2.4-6.0 mg/dL',
    clinical: 'Niveles elevados pueden causar gota y cálculos renales.',
  },

  // ===== GLUCOSA Y METABOLISMO =====
  'Glucosa': {
    name: 'Glucosa',
    whatItIs: 'Azúcar principal en sangre, fuente primaria de energía del cuerpo.',
    whatItMeasures: 'El nivel de azúcar en sangre en un momento específico.',
    normalRange: 'En ayunas: 70-100 mg/dL',
    clinical: 'Niveles elevados pueden indicar diabetes o prediabetes.',
  },
  'Hemoglobina Glicosilada': {
    name: 'Hemoglobina Glicosilada (HbA1c)',
    whatItIs: 'Hemoglobina unida a glucosa, refleja el promedio de glucosa de 2-3 meses.',
    whatItMeasures: 'El control promedio de glucosa en los últimos 2-3 meses.',
    normalRange: 'Normal: < 5.7%',
    clinical: 'Es el estándar de oro para diagnosticar y monitorear diabetes.',
  },
  'Insulina': {
    name: 'Insulina',
    whatItIs: 'Hormona producida por el páncreas que regula el azúcar en sangre.',
    whatItMeasures: 'Los niveles de insulina circulante en sangre.',
    normalRange: 'En ayunas: 2-25 uUI/mL',
    clinical: 'Niveles elevados pueden indicar resistencia a la insulina o síndrome metabólico.',
  },
  'Péptido C': {
    name: 'Péptido C',
    whatItIs: 'Subproducto de la producción de insulina por el páncreas.',
    whatItMeasures: 'La capacidad del páncreas para producir insulina propia.',
    normalRange: 'En ayunas: 0.5-3.0 ng/mL',
    clinical: 'Ayuda a diferenciar diabetes tipo 1 de tipo 2 y evaluar función pancreática.',
  },

  // ===== HEMATOLOGÍA =====
  'Hemoglobina': {
    name: 'Hemoglobina',
    whatItIs: 'Proteína en los glóbulos rojos que transporta oxígeno.',
    whatItMeasures: 'La capacidad de la sangre para transportar oxígeno.',
    normalRange: 'Hombres: 13.5-17.5 g/dL, Mujeres: 12.0-15.5 g/dL',
    clinical: 'Niveles bajos indican anemia; niveles altos pueden sugerir policitemia.',
  },
  'Hematocrito': {
    name: 'Hematocrito',
    whatItIs: 'Porcentaje del volumen de sangre ocupado por glóbulos rojos.',
    whatItMeasures: 'La proporción de células rojas en relación al volumen total de sangre.',
    normalRange: 'Hombres: 38-50%, Mujeres: 34-44%',
    clinical: 'Ayuda a diagnosticar anemia, deshidratación y policitemia.',
  },
  'Leucocitos': {
    name: 'Leucocitos',
    whatItIs: 'Glóbulos blancos, células del sistema inmunológico.',
    whatItMeasures: 'El número total de células de defensa en la sangre.',
    normalRange: '4,000-11,000 células/μL',
    clinical: 'Niveles elevados pueden indicar infección o inflamación; bajos sugieren inmunosupresión.',
  },
  'Eritrocitos': {
    name: 'Eritrocitos',
    whatItIs: 'Glóbulos rojos, transportan oxígeno de los pulmones a los tejidos.',
    whatItMeasures: 'El número de células rojas en la sangre.',
    normalRange: 'Hombres: 4.5-5.9 M/μL, Mujeres: 4.0-5.2 M/μL',
    clinical: 'Valores bajos indican anemia; valores altos pueden sugerir policitemia.',
  },
  'Plaquetas': {
    name: 'Plaquetas',
    whatItIs: 'Fragmentos celulares esenciales para la coagulación sanguínea.',
    whatItMeasures: 'El número de plaquetas disponibles para detener hemorragias.',
    normalRange: '150,000-400,000/μL',
    clinical: 'Niveles bajos aumentan riesgo de sangrado; niveles altos pueden causar trombosis.',
  },
  'VCM': {
    name: 'VCM (Volumen Corpuscular Medio)',
    whatItIs: 'Tamaño promedio de los glóbulos rojos.',
    whatItMeasures: 'El volumen medio de cada eritrocito.',
    normalRange: '80-100 fL',
    clinical: 'Ayuda a clasificar el tipo de anemia: microcítica, normocítica o macrocítica.',
  },
  'HCM': {
    name: 'HCM (Hemoglobina Corpuscular Media)',
    whatItIs: 'Cantidad promedio de hemoglobina en cada glóbulo rojo.',
    whatItMeasures: 'La masa de hemoglobina por eritrocito.',
    normalRange: '27-33 pg',
    clinical: 'Complementa el VCM para caracterizar anemias.',
  },
  'CHCM': {
    name: 'CHCM (Concentración de Hemoglobina Corpuscular Media)',
    whatItIs: 'Concentración de hemoglobina dentro de cada glóbulo rojo.',
    whatItMeasures: 'La densidad de hemoglobina en los eritrocitos.',
    normalRange: '32-36 g/dL',
    clinical: 'Útil para diagnosticar anemias hipocrómicas como deficiencia de hierro.',
  },
  'RDW': {
    name: 'RDW (Amplitud de Distribución Eritrocitaria)',
    whatItIs: 'Medida de la variación en el tamaño de los glóbulos rojos.',
    whatItMeasures: 'La heterogeneidad del tamaño de los eritrocitos.',
    normalRange: '11.5-14.5%',
    clinical: 'Valores elevados sugieren anemia por deficiencia de hierro o vitamina B12.',
  },

  // Células diferenciadas - Porcentaje
  'Neutrófilos %': {
    name: 'Neutrófilos (Porcentaje)',
    whatItIs: 'Tipo más común de glóbulo blanco, primera línea de defensa contra infecciones.',
    whatItMeasures: 'El porcentaje de neutrófilos respecto al total de leucocitos.',
    normalRange: '40-70%',
    clinical: 'Aumentan en infecciones bacterianas; disminuyen en infecciones virales o problemas de médula ósea.',
  },
  'Linfocitos %': {
    name: 'Linfocitos (Porcentaje)',
    whatItIs: 'Glóbulos blancos clave en la respuesta inmune adaptativa (células T y B).',
    whatItMeasures: 'El porcentaje de linfocitos respecto al total de leucocitos.',
    normalRange: '20-40%',
    clinical: 'Aumentan en infecciones virales y algunos cánceres; disminuyen en inmunodeficiencias.',
  },
  'Monocitos %': {
    name: 'Monocitos (Porcentaje)',
    whatItIs: 'Glóbulos blancos que se convierten en macrófagos, eliminan patógenos y células muertas.',
    whatItMeasures: 'El porcentaje de monocitos respecto al total de leucocitos.',
    normalRange: '2-8%',
    clinical: 'Aumentan en infecciones crónicas y enfermedades inflamatorias.',
  },
  'Eosinófilos %': {
    name: 'Eosinófilos (Porcentaje)',
    whatItIs: 'Glóbulos blancos especializados en combatir parásitos y reacciones alérgicas.',
    whatItMeasures: 'El porcentaje de eosinófilos respecto al total de leucocitos.',
    normalRange: '1-4%',
    clinical: 'Aumentan en alergias, asma, infecciones parasitarias y algunas enfermedades autoinmunes.',
  },
  'Basófilos %': {
    name: 'Basófilos (Porcentaje)',
    whatItIs: 'Glóbulos blancos menos comunes, liberan histamina en reacciones alérgicas.',
    whatItMeasures: 'El porcentaje de basófilos respecto al total de leucocitos.',
    normalRange: '0-1%',
    clinical: 'Raramente elevados; pueden aumentar en trastornos mieloproliferativos.',
  },

  // Recuento Absoluto
  'R.A. Neutrófilos': {
    name: 'Recuento Absoluto de Neutrófilos',
    whatItIs: 'Cantidad absoluta de neutrófilos en sangre.',
    whatItMeasures: 'El número real de neutrófilos por microlitro de sangre.',
    normalRange: '1,500-7,000 células/μL',
    clinical: 'Más preciso que el porcentaje para evaluar el riesgo de infección.',
  },
  'R.A. Linfocitos': {
    name: 'Recuento Absoluto de Linfocitos',
    whatItIs: 'Cantidad absoluta de linfocitos en sangre.',
    whatItMeasures: 'El número real de linfocitos por microlitro de sangre.',
    normalRange: '1,000-4,000 células/μL',
    clinical: 'Útil para evaluar el estado del sistema inmune.',
  },
  'R.A. Monocitos': {
    name: 'Recuento Absoluto de Monocitos',
    whatItIs: 'Cantidad absoluta de monocitos en sangre.',
    whatItMeasures: 'El número real de monocitos por microlitro de sangre.',
    normalRange: '200-800 células/μL',
    clinical: 'Aumenta en infecciones crónicas y procesos inflamatorios.',
  },
  'R.A. Eosinófilos': {
    name: 'Recuento Absoluto de Eosinófilos',
    whatItIs: 'Cantidad absoluta de eosinófilos en sangre.',
    whatItMeasures: 'El número real de eosinófilos por microlitro de sangre.',
    normalRange: '100-500 células/μL',
    clinical: 'Valores elevados requieren investigación de alergias o parásitos.',
  },
  'R.A. Basófilos': {
    name: 'Recuento Absoluto de Basófilos',
    whatItIs: 'Cantidad absoluta de basófilos en sangre.',
    whatItMeasures: 'El número real de basófilos por microlitro de sangre.',
    normalRange: '0-100 células/μL',
    clinical: 'Raramente alterados en condiciones comunes.',
  },

  // ===== FUNCIÓN RENAL =====
  'Creatinina': {
    name: 'Creatinina',
    whatItIs: 'Producto de desecho del metabolismo muscular, eliminado por los riñones.',
    whatItMeasures: 'La función de filtración de los riñones.',
    normalRange: 'Hombres: 0.7-1.3 mg/dL, Mujeres: 0.6-1.1 mg/dL',
    clinical: 'Niveles elevados indican deterioro de la función renal.',
  },
  'Urea': {
    name: 'Urea',
    whatItIs: 'Producto de desecho del metabolismo de proteínas, eliminado por los riñones.',
    whatItMeasures: 'La capacidad del riñón para eliminar desechos nitrogenados.',
    normalRange: '15-40 mg/dL',
    clinical: 'Se eleva en insuficiencia renal, deshidratación o dieta alta en proteínas.',
  },
  'Nitrógeno Ureico': {
    name: 'Nitrógeno Ureico (BUN)',
    whatItIs: 'Medida del nitrógeno contenido en la urea.',
    whatItMeasures: 'La función renal y el balance de nitrógeno.',
    normalRange: '7-20 mg/dL',
    clinical: 'Se eleva en insuficiencia renal, deshidratación, sangrado gastrointestinal o dieta alta en proteínas.',
  },
  'TFG': {
    name: 'TFG (Tasa de Filtración Glomerular)',
    whatItIs: 'Estimación de cuánta sangre filtran los riñones por minuto.',
    whatItMeasures: 'La eficiencia global de la función renal.',
    normalRange: '> 90 mL/min/1.73m²',
    clinical: 'Valor más preciso para estadificar enfermedad renal crónica.',
  },
  'Clearance de Creatinina': {
    name: 'Clearance de Creatinina',
    whatItIs: 'Medida de la capacidad de los riñones para eliminar creatinina.',
    whatItMeasures: 'La tasa de filtración renal en base a creatinina en orina de 24 horas.',
    normalRange: 'Hombres: 97-137 mL/min, Mujeres: 88-128 mL/min',
    clinical: 'Permite ajustar dosis de medicamentos que se eliminan por riñón.',
  },
  'Microalbuminuria': {
    name: 'Microalbuminuria',
    whatItIs: 'Pequeñas cantidades de albúmina en orina.',
    whatItMeasures: 'Daño renal temprano, especialmente en diabetes e hipertensión.',
    normalRange: '< 30 mg/24h',
    clinical: 'Marcador temprano de enfermedad renal diabética y riesgo cardiovascular.',
  },

  // ===== FUNCIÓN HEPÁTICA =====
  'ALT (TGP)': {
    name: 'ALT (TGP)',
    whatItIs: 'Enzima presente principalmente en el hígado.',
    whatItMeasures: 'El daño o inflamación de las células hepáticas.',
    normalRange: '7-56 U/L',
    clinical: 'Se eleva en hepatitis, hígado graso, cirrosis y daño por medicamentos.',
  },
  'AST (TGO)': {
    name: 'AST (TGO)',
    whatItIs: 'Enzima presente en hígado, corazón y músculos.',
    whatItMeasures: 'Daño tisular, especialmente en hígado y corazón.',
    normalRange: '10-40 U/L',
    clinical: 'Se eleva en daño hepático, infarto cardíaco o lesión muscular.',
  },
  'GGT': {
    name: 'GGT (Gamma-Glutamil Transferasa)',
    whatItIs: 'Enzima presente en hígado y vías biliares.',
    whatItMeasures: 'Daño hepático y obstrucción biliar.',
    normalRange: 'Hombres: 10-71 U/L, Mujeres: 6-42 U/L',
    clinical: 'Muy sensible al consumo de alcohol y problemas de vías biliares.',
  },
  'Fosfatasa Alcalina': {
    name: 'Fosfatasa Alcalina',
    whatItIs: 'Enzima presente en hígado, huesos y otros tejidos.',
    whatItMeasures: 'Actividad hepática, biliar y ósea.',
    normalRange: '44-147 U/L',
    clinical: 'Se eleva en obstrucción biliar, enfermedad hepática y trastornos óseos.',
  },
  'Bilirrubina Total': {
    name: 'Bilirrubina Total',
    whatItIs: 'Pigmento amarillo producido por la degradación de glóbulos rojos.',
    whatItMeasures: 'La función hepática y la salud de los glóbulos rojos.',
    normalRange: '0.1-1.2 mg/dL',
    clinical: 'Niveles elevados causan ictericia y pueden indicar problemas hepáticos o hemólisis.',
  },
  'Bilirrubina Directa': {
    name: 'Bilirrubina Directa (Conjugada)',
    whatItIs: 'Bilirrubina procesada por el hígado.',
    whatItMeasures: 'La función hepática y la permeabilidad de vías biliares.',
    normalRange: '0.0-0.3 mg/dL',
    clinical: 'Elevada en obstrucción biliar, hepatitis y cirrosis.',
  },
  'Bilirrubina Indirecta': {
    name: 'Bilirrubina Indirecta (No conjugada)',
    whatItIs: 'Bilirrubina antes de ser procesada por el hígado.',
    whatItMeasures: 'La destrucción de glóbulos rojos y captación hepática.',
    normalRange: '0.1-0.9 mg/dL',
    clinical: 'Elevada en hemólisis, síndrome de Gilbert y enfermedad de Crigler-Najjar.',
  },
  'Albúmina': {
    name: 'Albúmina',
    whatItIs: 'Principal proteína producida por el hígado.',
    whatItMeasures: 'La función de síntesis proteica del hígado y el estado nutricional.',
    normalRange: '3.5-5.5 g/dL',
    clinical: 'Niveles bajos indican enfermedad hepática crónica, desnutrición o pérdida renal.',
  },
  'Proteínas Totales': {
    name: 'Proteínas Totales',
    whatItIs: 'Suma de todas las proteínas en sangre (albúmina y globulinas).',
    whatItMeasures: 'El estado general de proteínas en el organismo.',
    normalRange: '6.0-8.3 g/dL',
    clinical: 'Alteraciones sugieren problemas hepáticos, renales, nutricionales o inmunológicos.',
  },

  // ===== HORMONAS TIROIDEAS =====
  'TSH': {
    name: 'TSH (Hormona Estimulante de Tiroides)',
    whatItIs: 'Hormona producida por la hipófisis que regula la tiroides.',
    whatItMeasures: 'El funcionamiento de la glándula tiroides.',
    normalRange: '0.4-4.0 uUI/mL',
    clinical: 'TSH alta indica hipotiroidismo; TSH baja sugiere hipertiroidismo.',
  },
  'T4 Libre': {
    name: 'T4 Libre (Tiroxina Libre)',
    whatItIs: 'Hormona tiroidea principal en su forma activa disponible.',
    whatItMeasures: 'La cantidad de hormona tiroidea disponible para los tejidos.',
    normalRange: '0.8-1.8 ng/dL',
    clinical: 'Complementa TSH para diagnosticar trastornos tiroideos.',
  },
  'T4 Total': {
    name: 'T4 Total (Tiroxina Total)',
    whatItIs: 'Hormona tiroidea principal, incluyendo la unida a proteínas.',
    whatItMeasures: 'La cantidad total de tiroxina en sangre.',
    normalRange: '4.5-12.0 ug/dL',
    clinical: 'Menos específica que T4 libre, puede alterarse por cambios en proteínas transportadoras.',
  },
  'T3 Libre': {
    name: 'T3 Libre (Triyodotironina Libre)',
    whatItIs: 'Hormona tiroidea más activa en su forma libre.',
    whatItMeasures: 'La hormona tiroidea metabólicamente activa disponible.',
    normalRange: '2.3-4.2 pg/mL',
    clinical: 'Útil para diagnosticar hipertiroidismo y casos especiales de hipotiroidismo.',
  },
  'T3 Total': {
    name: 'T3 Total (Triyodotironina Total)',
    whatItIs: 'Hormona tiroidea más potente, incluyendo la unida a proteínas.',
    whatItMeasures: 'La cantidad total de T3 en sangre.',
    normalRange: '80-200 ng/dL',
    clinical: 'Complementa otros estudios tiroideos, especialmente en hipertiroidismo.',
  },
  'Anti-TPO': {
    name: 'Anticuerpos Anti-Peroxidasa Tiroidea',
    whatItIs: 'Anticuerpos contra la enzima tiroidea peroxidasa.',
    whatItMeasures: 'La presencia de autoinmunidad tiroidea.',
    normalRange: '< 35 UI/mL',
    clinical: 'Elevados en tiroiditis de Hashimoto y enfermedad de Graves.',
  },
  'Anti-Tiroglobulina': {
    name: 'Anticuerpos Anti-Tiroglobulina',
    whatItIs: 'Anticuerpos contra la proteína tiroglobulina.',
    whatItMeasures: 'Autoinmunidad tiroidea.',
    normalRange: '< 115 UI/mL',
    clinical: 'Presentes en enfermedades autoinmunes tiroideas.',
  },

  // ===== OTRAS HORMONAS =====
  'Cortisol': {
    name: 'Cortisol',
    whatItIs: 'Hormona del estrés producida por las glándulas suprarrenales.',
    whatItMeasures: 'La función adrenal y respuesta al estrés.',
    normalRange: 'Mañana: 5-25 ug/dL, Tarde: 3-16 ug/dL',
    clinical: 'Niveles altos indican síndrome de Cushing; bajos sugieren insuficiencia adrenal.',
  },
  'Testosterona Total': {
    name: 'Testosterona Total',
    whatItIs: 'Principal hormona sexual masculina.',
    whatItMeasures: 'Los niveles totales de testosterona en sangre.',
    normalRange: 'Hombres: 300-1000 ng/dL, Mujeres: 15-70 ng/dL',
    clinical: 'Niveles bajos en hombres causan hipogonadismo; elevados en mujeres pueden indicar SOP.',
  },
  'Testosterona Libre': {
    name: 'Testosterona Libre',
    whatItIs: 'Testosterona no unida a proteínas, biológicamente activa.',
    whatItMeasures: 'La fracción activa de testosterona.',
    normalRange: 'Hombres: 50-210 pg/mL',
    clinical: 'Más precisa que total para evaluar función androgénica.',
  },
  'Estradiol': {
    name: 'Estradiol',
    whatItIs: 'Principal estrógeno en mujeres premenopáusicas.',
    whatItMeasures: 'Los niveles de estrógeno circulante.',
    normalRange: 'Varía según fase del ciclo: 30-400 pg/mL',
    clinical: 'Evalúa función ovárica, fertilidad y terapia de reemplazo hormonal.',
  },
  'Progesterona': {
    name: 'Progesterona',
    whatItIs: 'Hormona esencial para el embarazo y ciclo menstrual.',
    whatItMeasures: 'La función del cuerpo lúteo y soporte del embarazo.',
    normalRange: 'Fase lútea: 5-20 ng/mL',
    clinical: 'Niveles bajos pueden indicar deficiencia de fase lútea o riesgo de aborto.',
  },
  'Prolactina': {
    name: 'Prolactina',
    whatItIs: 'Hormona que estimula la producción de leche materna.',
    whatItMeasures: 'Los niveles de prolactina hipofisaria.',
    normalRange: 'Hombres: 4-15 ng/mL, Mujeres: 4-23 ng/mL',
    clinical: 'Niveles elevados causan galactorrea, infertilidad y pueden indicar prolactinoma.',
  },
  'FSH': {
    name: 'FSH (Hormona Folículo Estimulante)',
    whatItIs: 'Hormona hipofisaria que regula función reproductiva.',
    whatItMeasures: 'La función ovárica o testicular.',
    normalRange: 'Varía según sexo y edad',
    clinical: 'Evalúa fertilidad, menopausia y función gonadal.',
  },
  'LH': {
    name: 'LH (Hormona Luteinizante)',
    whatItIs: 'Hormona que desencadena ovulación y producción de hormonas sexuales.',
    whatItMeasures: 'La función reproductiva y ciclo menstrual.',
    normalRange: 'Varía según sexo y fase del ciclo',
    clinical: 'Útil para evaluar infertilidad, SOP y trastornos hipofisarios.',
  },

  // ===== VITAMINAS =====
  'Vitamina D': {
    name: 'Vitamina D (25-OH)',
    whatItIs: 'Vitamina esencial para la absorción de calcio y salud ósea.',
    whatItMeasures: 'Los niveles de vitamina D almacenados en el cuerpo.',
    normalRange: 'Óptimo: > 30 ng/mL',
    clinical: 'Deficiencia aumenta riesgo de osteoporosis, debilidad muscular y fracturas.',
  },
  'Vitamina B12': {
    name: 'Vitamina B12 (Cobalamina)',
    whatItIs: 'Vitamina esencial para la formación de glóbulos rojos y función neurológica.',
    whatItMeasures: 'Los niveles de vitamina B12 en sangre.',
    normalRange: '200-900 pg/mL',
    clinical: 'Deficiencia causa anemia megaloblástica y neuropatía.',
  },
  'Ácido Fólico': {
    name: 'Ácido Fólico (Vitamina B9)',
    whatItIs: 'Vitamina esencial para síntesis de ADN y división celular.',
    whatItMeasures: 'Los niveles de folato en sangre.',
    normalRange: '> 3.0 ng/mL',
    clinical: 'Deficiencia causa anemia megaloblástica y defectos del tubo neural en embarazo.',
  },
  'Vitamina A': {
    name: 'Vitamina A (Retinol)',
    whatItIs: 'Vitamina liposoluble esencial para visión y sistema inmune.',
    whatItMeasures: 'Los niveles de retinol en sangre.',
    normalRange: '30-80 ug/dL',
    clinical: 'Deficiencia causa ceguera nocturna; exceso puede ser tóxico.',
  },
  'Vitamina E': {
    name: 'Vitamina E (Tocoferol)',
    whatItIs: 'Antioxidante liposoluble que protege membranas celulares.',
    whatItMeasures: 'Los niveles de vitamina E en sangre.',
    normalRange: '5-20 mg/L',
    clinical: 'Deficiencia puede causar neuropatía y hemólisis.',
  },

  // ===== ELECTROLITOS =====
  'Sodio': {
    name: 'Sodio',
    whatItIs: 'Electrolito principal en el líquido extracelular.',
    whatItMeasures: 'El balance de agua y electrolitos en el cuerpo.',
    normalRange: '135-145 mEq/L',
    clinical: 'Alteraciones pueden causar confusión, debilidad, convulsiones.',
  },
  'Potasio': {
    name: 'Potasio',
    whatItIs: 'Electrolito esencial para la función muscular y cardíaca.',
    whatItMeasures: 'Los niveles de potasio en sangre.',
    normalRange: '3.5-5.0 mEq/L',
    clinical: 'Alteraciones pueden causar arritmias cardíacas potencialmente fatales.',
  },
  'Calcio': {
    name: 'Calcio',
    whatItIs: 'Mineral esencial para huesos, músculos y sistema nervioso.',
    whatItMeasures: 'Los niveles de calcio total en sangre.',
    normalRange: '8.5-10.5 mg/dL',
    clinical: 'Alteraciones afectan huesos, músculos, nervios y corazón.',
  },
  'Cloro': {
    name: 'Cloro',
    whatItIs: 'Electrolito importante para balance ácido-base y osmótico.',
    whatItMeasures: 'Los niveles de cloro en sangre.',
    normalRange: '96-106 mEq/L',
    clinical: 'Alteraciones acompañan desequilibrios de sodio y estados ácido-base.',
  },
  'Magnesio': {
    name: 'Magnesio',
    whatItIs: 'Mineral esencial para más de 300 reacciones enzimáticas.',
    whatItMeasures: 'Los niveles de magnesio en sangre.',
    normalRange: '1.7-2.2 mg/dL',
    clinical: 'Deficiencia causa calambres, arritmias y debilidad; común en diabetes y alcoholismo.',
  },
  'Fósforo': {
    name: 'Fósforo',
    whatItIs: 'Mineral esencial para huesos, energía celular (ATP) y ADN.',
    whatItMeasures: 'Los niveles de fosfato en sangre.',
    normalRange: '2.5-4.5 mg/dL',
    clinical: 'Se altera en enfermedad renal, hiperparatiroidismo y trastornos del metabolismo óseo.',
  },

  // ===== HIERRO =====
  'Hierro': {
    name: 'Hierro Sérico',
    whatItIs: 'Mineral esencial para la producción de hemoglobina.',
    whatItMeasures: 'La cantidad de hierro circulante en sangre.',
    normalRange: 'Hombres: 65-175 ug/dL, Mujeres: 50-170 ug/dL',
    clinical: 'Niveles bajos causan anemia; niveles altos pueden indicar hemocromatosis.',
  },
  'Ferritina': {
    name: 'Ferritina',
    whatItIs: 'Proteína que almacena hierro en el cuerpo.',
    whatItMeasures: 'Las reservas totales de hierro en el organismo.',
    normalRange: 'Hombres: 24-336 ng/mL, Mujeres: 11-307 ng/mL',
    clinical: 'Mejor indicador de las reservas de hierro que el hierro sérico.',
  },
  'Transferrina': {
    name: 'Transferrina',
    whatItIs: 'Proteína transportadora de hierro en la sangre.',
    whatItMeasures: 'La capacidad de transporte de hierro.',
    normalRange: '200-360 mg/dL',
    clinical: 'Aumenta en deficiencia de hierro; disminuye en inflamación crónica.',
  },
  'Saturación de Transferrina': {
    name: 'Saturación de Transferrina',
    whatItIs: 'Porcentaje de transferrina ocupado por hierro.',
    whatItMeasures: 'Cuánto hierro está siendo transportado.',
    normalRange: '20-50%',
    clinical: 'Baja en deficiencia de hierro; alta en hemocromatosis.',
  },

  // ===== INFLAMACIÓN =====
  'PCR': {
    name: 'Proteína C Reactiva',
    whatItIs: 'Proteína producida por el hígado en respuesta a inflamación.',
    whatItMeasures: 'El nivel de inflamación en el cuerpo.',
    normalRange: '< 10 mg/L',
    clinical: 'Se eleva en infecciones, enfermedades autoinmunes y daño tisular.',
  },
  'PCR Ultrasensible': {
    name: 'PCR Ultrasensible (hs-CRP)',
    whatItIs: 'Medición muy sensible de PCR para evaluar riesgo cardiovascular.',
    whatItMeasures: 'Inflamación de bajo grado y riesgo cardíaco.',
    normalRange: '< 1.0 mg/L (bajo riesgo)',
    clinical: 'Marcador de riesgo de infarto y enfermedad cardiovascular.',
  },
  'VSG': {
    name: 'VSG (Velocidad de Sedimentación Globular)',
    whatItIs: 'Velocidad a la que los glóbulos rojos sedimentan en una hora.',
    whatItMeasures: 'Inflamación sistémica de forma inespecífica.',
    normalRange: 'Hombres: < 15 mm/h, Mujeres: < 20 mm/h',
    clinical: 'Elevada en infecciones, autoinmunidad, cáncer y anemia.',
  },
  'Procalcitonina': {
    name: 'Procalcitonina',
    whatItIs: 'Precursor de calcitonina, marcador de infección bacteriana.',
    whatItMeasures: 'La presencia y severidad de infección bacteriana.',
    normalRange: '< 0.5 ng/mL',
    clinical: 'Ayuda a diferenciar infección bacteriana de viral y guiar uso de antibióticos.',
  },

  // ===== COAGULACIÓN =====
  'INR': {
    name: 'INR (Razón Normalizada Internacional)',
    whatItIs: 'Medida estandarizada del tiempo de coagulación.',
    whatItMeasures: 'La capacidad de la sangre para coagular.',
    normalRange: '0.8-1.2 (sin anticoagulantes)',
    clinical: 'Usado para monitorear terapia con warfarina.',
  },
  'TP': {
    name: 'TP (Tiempo de Protrombina)',
    whatItIs: 'Tiempo que tarda la sangre en coagular por la vía extrínseca.',
    whatItMeasures: 'La función de factores de coagulación dependientes de vitamina K.',
    normalRange: '11-13.5 segundos',
    clinical: 'Evalúa función hepática, deficiencia de vitamina K y efecto de anticoagulantes.',
  },
  'TPT': {
    name: 'TPT/TTPA (Tiempo de Tromboplastina Parcial)',
    whatItIs: 'Tiempo de coagulación por la vía intrínseca.',
    whatItMeasures: 'La función de factores de coagulación intrínsecos.',
    normalRange: '25-35 segundos',
    clinical: 'Detecta deficiencias de factores de coagulación y monitorea heparina.',
  },
  'Fibrinógeno': {
    name: 'Fibrinógeno',
    whatItIs: 'Proteína esencial para la formación del coágulo.',
    whatItMeasures: 'La capacidad de formar coágulos estables.',
    normalRange: '200-400 mg/dL',
    clinical: 'Niveles bajos causan sangrado; niveles altos aumentan riesgo de trombosis.',
  },
  'Dímero D': {
    name: 'Dímero D',
    whatItIs: 'Producto de degradación de fibrina.',
    whatItMeasures: 'La presencia de coágulos activos siendo disueltos.',
    normalRange: '< 500 ng/mL',
    clinical: 'Elevado en trombosis venosa profunda, embolia pulmonar y coagulación intravascular diseminada.',
  },

  // ===== MARCADORES CARDÍACOS =====
  'Troponina': {
    name: 'Troponina (I o T)',
    whatItIs: 'Proteína del músculo cardíaco liberada cuando hay daño.',
    whatItMeasures: 'Daño al músculo cardíaco.',
    normalRange: '< 0.04 ng/mL',
    clinical: 'Marcador más específico de infarto al miocardio.',
  },
  'CPK': {
    name: 'CPK (Creatina Fosfoquinasa)',
    whatItIs: 'Enzima presente en corazón, cerebro y músculo esquelético.',
    whatItMeasures: 'Daño en tejidos musculares.',
    normalRange: 'Hombres: 38-174 U/L, Mujeres: 26-140 U/L',
    clinical: 'Se eleva en infarto, rabdomiólisis, traumatismos y ejercicio intenso.',
  },
  'CPK-MB': {
    name: 'CPK-MB',
    whatItIs: 'Isoenzima de CPK específica del corazón.',
    whatItMeasures: 'Daño específico al músculo cardíaco.',
    normalRange: '< 25 U/L',
    clinical: 'Marcador de infarto al miocardio, complementa troponina.',
  },
  'BNP': {
    name: 'BNP (Péptido Natriurético Cerebral)',
    whatItIs: 'Hormona liberada por el corazón cuando está sobrecargado.',
    whatItMeasures: 'La presión y volumen en el corazón.',
    normalRange: '< 100 pg/mL',
    clinical: 'Diagnóstico y seguimiento de insuficiencia cardíaca.',
  },
  'NT-proBNP': {
    name: 'NT-proBNP',
    whatItIs: 'Fragmento del precursor de BNP, más estable.',
    whatItMeasures: 'Insuficiencia cardíaca.',
    normalRange: '< 125 pg/mL (< 75 años)',
    clinical: 'Más sensible que BNP para detectar insuficiencia cardíaca.',
  },
  'Homocisteína': {
    name: 'Homocisteína',
    whatItIs: 'Aminoácido producido del metabolismo de metionina.',
    whatItMeasures: 'Riesgo cardiovascular y deficiencias vitamínicas.',
    normalRange: '5-15 umol/L',
    clinical: 'Niveles elevados aumentan riesgo de enfermedad cardiovascular y trombosis.',
  },

  // ===== MARCADORES TUMORALES =====
  'PSA': {
    name: 'PSA (Antígeno Prostático Específico)',
    whatItIs: 'Proteína producida por la próstata.',
    whatItMeasures: 'Salud prostática y posible cáncer de próstata.',
    normalRange: '< 4.0 ng/mL',
    clinical: 'Screening de cáncer de próstata, seguimiento post-tratamiento.',
  },
  'CEA': {
    name: 'CEA (Antígeno Carcinoembrionario)',
    whatItIs: 'Proteína que puede elevarse en algunos cánceres.',
    whatItMeasures: 'Presencia y progresión de ciertos tipos de cáncer.',
    normalRange: '< 3.0 ng/mL (no fumadores)',
    clinical: 'Útil para monitorear cáncer colorrectal, pulmón y otros.',
  },
  'CA 125': {
    name: 'CA 125',
    whatItIs: 'Marcador tumoral asociado con cáncer de ovario.',
    whatItMeasures: 'Actividad de cáncer ovárico y otras condiciones.',
    normalRange: '< 35 U/mL',
    clinical: 'Monitoreo de cáncer de ovario, no ideal para screening inicial.',
  },
  'CA 19-9': {
    name: 'CA 19-9',
    whatItIs: 'Marcador tumoral asociado con cáncer pancreático.',
    whatItMeasures: 'Presencia y progresión de cáncer pancreático y biliar.',
    normalRange: '< 37 U/mL',
    clinical: 'Seguimiento de cáncer de páncreas y vías biliares.',
  },
  'AFP': {
    name: 'AFP (Alfafetoproteína)',
    whatItIs: 'Proteína producida por hígado fetal y ciertos tumores.',
    whatItMeasures: 'Cáncer hepático y tumores de células germinales.',
    normalRange: '< 10 ng/mL',
    clinical: 'Screening de hepatocarcinoma en pacientes con cirrosis.',
  },

  // ===== INMUNOGLOBULINAS =====
  'IgA': {
    name: 'Inmunoglobulina A',
    whatItIs: 'Anticuerpo presente en mucosas (respiratoria, digestiva).',
    whatItMeasures: 'La inmunidad de mucosas.',
    normalRange: '70-400 mg/dL',
    clinical: 'Deficiencia aumenta infecciones respiratorias y digestivas.',
  },
  'IgG': {
    name: 'Inmunoglobulina G',
    whatItIs: 'Anticuerpo más abundante, proporciona inmunidad duradera.',
    whatItMeasures: 'La memoria inmunológica y protección contra infecciones.',
    normalRange: '700-1600 mg/dL',
    clinical: 'Evalúa inmunodeficiencias y respuesta a vacunas.',
  },
  'IgM': {
    name: 'Inmunoglobulina M',
    whatItIs: 'Primer anticuerpo producido en infecciones agudas.',
    whatItMeasures: 'Respuesta inmune temprana.',
    normalRange: '40-230 mg/dL',
    clinical: 'Elevada en infecciones agudas; útil para detectar infección reciente.',
  },
  'IgE': {
    name: 'Inmunoglobulina E',
    whatItIs: 'Anticuerpo asociado con alergias y parásitos.',
    whatItMeasures: 'Reacciones alérgicas e infecciones parasitarias.',
    normalRange: '< 100 UI/mL',
    clinical: 'Elevada en alergias, asma y parasitosis.',
  },
}

/**
 * Obtiene la descripción de una medición
 */
export function getMeasurementDescription(measurementName: string): MeasurementDescription | null {
  return MEASUREMENT_DESCRIPTIONS[measurementName] || null
}

/**
 * Verifica si existe descripción para una medición
 */
export function hasDescription(measurementName: string): boolean {
  return measurementName in MEASUREMENT_DESCRIPTIONS
}