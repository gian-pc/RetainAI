# 🔄 Git Workflow - Actualizar Repo Local

## 📋 Pasos a seguir:

### 1️⃣ Cambiar a rama `main`
```bash
git checkout main
```

### 2️⃣ Traer cambios del merge de GitHub
```bash
git pull origin main
```

### 3️⃣ Borrar rama feature antigua (local)
```bash
git branch -d feat/DS-510-heatmaps
```

### 4️⃣ Borrar rama feature antigua (remota) - OPCIONAL
```bash
git push origin --delete feat/DS-510-heatmaps
```

---

## 🆕 Crear nuevo issue y rama

### Opción A: Crear issue en GitHub primero

1. Ve a GitHub → Issues → New Issue
2. **Título sugerido:** "DS-511: Create Data Quality Assessment Notebook"
3. **Descripción:**
   ```
   ## Objetivo
   Crear notebook 02_data_quality.ipynb para análisis profundo de calidad de datos
   
   ## Tareas
   - [ ] Análisis detallado de valores nulos
   - [ ] Detección de outliers
   - [ ] Análisis de distribuciones
   - [ ] Identificación de problemas de datos
   - [ ] Generación de reporte HTML de calidad
   
   ## Criterios de aceptación
   - Notebook ejecutable con outputs visibles
   - Gráficos guardados en outputs/gian/figures/
   - Reporte HTML generado
   ```

### Opción B: Crear rama directamente

```bash
# Crear y cambiar a nueva rama
git checkout -b feat/DS-511-data-quality-notebook
```

---

## 🎯 Comandos completos en orden:

```bash
# 1. Volver a main
git checkout main

# 2. Actualizar con cambios del merge
git pull origin main

# 3. Borrar rama antigua local
git branch -d feat/DS-510-heatmaps

# 4. (Opcional) Borrar rama remota
git push origin --delete feat/DS-510-heatmaps

# 5. Crear nueva rama para siguiente issue
git checkout -b feat/DS-511-data-quality-notebook

# 6. Verificar que estás en la nueva rama
git branch
```

---

## ✅ Verificación

Después de ejecutar, deberías ver:
```
* feat/DS-511-data-quality-notebook
  main
```

---

## 📝 Próximo commit será:

```bash
git commit -m "feat(DS-511): Add data quality assessment notebook

- Created 02_data_quality.ipynb with comprehensive analysis
- Added null values analysis
- Implemented outlier detection
- Generated data quality HTML report
- Saved visualizations to outputs/gian/figures/"
```
