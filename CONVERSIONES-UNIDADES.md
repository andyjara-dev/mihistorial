# Conversiones de Unidades Automáticas

El sistema convierte automáticamente las unidades de medida para permitir comparaciones precisas entre exámenes.

## Mediciones con Conversión Automática

### Ácido Úrico
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - umol/L ↔ mg/dL
  - µmol/L ↔ mg/dL
- **Factor de conversión**: 59.48

**Ejemplo:**
- 226 umol/L = 3.8 mg/dL
- 3.8 mg/dL = 226 umol/L

---

### Glucosa
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - mmol/L ↔ mg/dL
- **Factor de conversión**: 18.02

**Ejemplo:**
- 5.5 mmol/L = 99.1 mg/dL
- 100 mg/dL = 5.55 mmol/L

---

### Colesterol (Total, HDL, LDL)
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - mmol/L ↔ mg/dL
- **Factor de conversión**: 38.67

**Ejemplo:**
- 5.2 mmol/L = 201 mg/dL
- 200 mg/dL = 5.17 mmol/L

---

### Triglicéridos
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - mmol/L ↔ mg/dL
- **Factor de conversión**: 88.57

**Ejemplo:**
- 1.7 mmol/L = 150.6 mg/dL
- 150 mg/dL = 1.69 mmol/L

---

### Creatinina
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - umol/L ↔ mg/dL
  - µmol/L ↔ mg/dL
- **Factor de conversión**: 88.4

**Ejemplo:**
- 88 umol/L = 1.0 mg/dL
- 1.0 mg/dL = 88.4 umol/L

---

### Urea
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - mmol/L ↔ mg/dL
- **Factor de conversión**: 6.006

**Ejemplo:**
- 5.0 mmol/L = 30 mg/dL
- 30 mg/dL = 5.0 mmol/L

---

### Bilirrubina Total
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - umol/L ↔ mg/dL
  - µmol/L ↔ mg/dL
- **Factor de conversión**: 17.1

**Ejemplo:**
- 17.1 umol/L = 1.0 mg/dL
- 1.0 mg/dL = 17.1 umol/L

---

### Calcio
- **Unidad estándar**: mg/dL
- **Conversiones soportadas**:
  - mmol/L ↔ mg/dL
- **Factor de conversión**: 4.008

**Ejemplo:**
- 2.5 mmol/L = 10.0 mg/dL
- 10.0 mg/dL = 2.5 mmol/L

---

## Recuento de Células Sanguíneas

### IMPORTANTE: Diferencia entre Porcentaje y Recuento Absoluto

Las células sanguíneas (neutrófilos, linfocitos, monocitos, eosinófilos, basófilos) se miden de dos formas diferentes que **NO son intercambiables**:

#### 1. Porcentaje (%)
- **Unidad**: % (porcentaje)
- **Qué mide**: Proporción de cada tipo de célula respecto al total de leucocitos
- **Ejemplo**: "Eosinófilos 7.4%" significa que el 7.4% de los leucocitos son eosinófilos

#### 2. Recuento Absoluto (R.A.)
- **Unidad estándar**: mil/uL (miles por microlitro)
- **Variantes reconocidas**: x 10^3/μL, K/μL, mil/μL
- **Qué mide**: Cantidad absoluta de células en sangre
- **Ejemplo**: "R.A. Eosinófilos 0.38 x 10^3/μL" significa 380 células eosinófilas por microlitro

**Estas son mediciones diferentes** y se muestran por separado en las tendencias:
- `Eosinófilos %` → para valores en porcentaje
- `R.A. Eosinófilos` → para valores de recuento absoluto

---

## Mediciones Sin Conversión

Las siguientes mediciones no requieren conversión (se usa la unidad directamente):

- **Hemoglobina Glicosilada (HbA1c)**: % (porcentaje)
- **Hemoglobina**: g/dL
- **Hematocrito**: %
- **Leucocitos**: mil/uL (miles por microlitro)
- **Eritrocitos**: mill/uL (millones por microlitro)
- **Plaquetas**: mil/uL
- **Células Diferenciadas** (Neutrófilos %, Linfocitos %, etc.): % (porcentaje)
- **Recuento Absoluto de Células** (R.A. Neutrófilos, R.A. Eosinófilos, etc.): mil/uL
- **Electrolitos** (Sodio, Potasio, Cloro): mEq/L
- **TSH**: uUI/mL
- **Vitamina D**: ng/mL
- **Vitamina B12**: pg/mL

---

## Cómo Funciona

1. **Detección automática**: El sistema identifica el nombre de la medición y su unidad
2. **Conversión**: Si existe una conversión definida, convierte el valor a la unidad estándar
3. **Agrupación**: Agrupa todos los valores convertidos para permitir comparación
4. **Visualización**:
   - En gráficos: muestra valores en unidad estándar
   - En tablas: muestra valor original + valor convertido (si aplica)

## Indicadores Visuales

- **Símbolo ⇄**: Indica que la medición incluye valores con diferentes unidades que fueron convertidas
- **Nota azul**: Aparece en el detalle del gráfico explicando que hubo conversiones
- **Valor convertido**: Se muestra debajo del valor original en la tabla con el símbolo ≈

## Precisión

Todas las conversiones utilizan factores de conversión estándar reconocidos internacionalmente. Los valores convertidos se muestran con 2 decimales para mantener la precisión.

---

## ¿Falta alguna conversión?

Si encuentras una medición que debería tener conversión automática pero no la tiene, por favor reporta un issue en el repositorio del proyecto.
