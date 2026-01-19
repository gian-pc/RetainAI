# 📝 Guía de Commit - ML Pipeline Setup

## ✅ Archivos que DEBES subir:

### 1. Dataset Principal
```bash
git add ai-ml/data/data.csv
```

### 2. Notebooks del Equipo
```bash
git add ai-ml/notebooks/gian/01_data_collection.ipynb
```

### 3. Estructura de Carpetas (outputs)
```bash
git add ai-ml/outputs/gian/figures/eda/01_target_distribution.png
```

### 4. README actualizado
```bash
git add ai-ml/README.md
```

### 5. Archivos de Backend (ya modificados)
```bash
git add backend/src/main/java/com/retainai/model/Customer.java
git add backend/src/main/java/com/retainai/model/Subscription.java
git add backend/src/main/java/com/retainai/dto/CustomerDetailDto.java
git add backend/src/main/java/com/retainai/service/CustomerService.java
git add backend/src/main/java/com/retainai/service/PythonIntegrationService.java
```

## ❌ Archivos que NO debes subir:

### Carpeta de Antigravity (EXCLUIR)
```bash
# NO subir nada de:
# ai-ml/_temp_old_files/  ← Archivos viejos
# .gemini/                ← Archivos de Antigravity
```

### Archivos viejos/deprecated
```bash
# NO subir:
# ai-ml/notebooks/deprecated/
# ai-ml/test_api.py
# ai-ml/test_api_real_data.py
```

## 🚀 Comandos para hacer el commit:

### Paso 1: Agregar archivos nuevos importantes
```bash
cd /Users/admin/Desktop/projects/hackathon-oracle/RetainAI

# Dataset principal
git add ai-ml/data/data.csv

# Notebook de Gian
git add ai-ml/notebooks/gian/

# Outputs de Gian
git add ai-ml/outputs/gian/

# README
git add ai-ml/README.md
```

### Paso 2: Agregar cambios en backend
```bash
# Modelos actualizados
git add backend/src/main/java/com/retainai/model/

# DTOs actualizados
git add backend/src/main/java/com/retainai/dto/

# Servicios actualizados
git add backend/src/main/java/com/retainai/service/
```

### Paso 3: Hacer commit
```bash
git commit -m "feat: Setup ML pipeline structure and realistic NYC dataset

- Created team structure for 4 data scientists (gian, gabriel, vanessa, ivan)
- Added realistic NYC telecom dataset (data.csv) with 9,701 records
- Adjusted churn rates to match real USA telecom statistics (15.69%)
- Created first notebook: 01_data_collection.ipynb
- Set up outputs folder structure for figures, reports, and models
- Updated backend models for dynamic feature calculation
- Cleaned up old files and organized project structure"
```

### Paso 4: Verificar antes de push
```bash
git status
```

## 📋 Resumen de cambios:

**Agregados:**
- ✅ Dataset realista NYC (data.csv)
- ✅ Estructura de equipo (notebooks/gian, gabriel, vanessa, ivan)
- ✅ Primer notebook con outputs
- ✅ Carpetas de outputs organizadas
- ✅ README actualizado

**Excluidos:**
- ❌ Archivos de Antigravity (.gemini)
- ❌ Archivos temporales (_temp_old_files)
- ❌ Scripts de test antiguos
- ❌ Notebooks deprecated

## ⚠️ IMPORTANTE:

Asegúrate de tener un `.gitignore` que excluya:
```
.gemini/
_temp_old_files/
*.pyc
__pycache__/
.DS_Store
```
