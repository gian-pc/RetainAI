# 🤝 Contrato de Integración API — RetainAI

Este documento define la estructura de datos que viaja entre los sistemas.
⚠️ **Cualquier cambio debe ser aprobado por el Tech Lead.**

---

## 1️⃣ Frontend → Backend (Visualización)

### 🗺️ Mapa de Calor (Heatmap)
El Frontend necesita puntos geográficos y su nivel de riesgo para pintar el mapa.

* **Endpoint:** `GET /api/dashboard/heatmap`
* **Response:**
```json
[
  {
    "lat": 40.7128, 
    "lng": -74.0060,
    "weight": 0.95  // Probabilidad de Fuga (Muy Rojo 🔴)
  },
  {
    "lat": 40.7300, 
    "lng": -73.9950,
    "weight": 0.10  // Probabilidad Baja (Verde 🟢)
  }
]
```
## 2️⃣ Backend (Java) ↔ AI Engine (Python)

### 🔮 Solicitar Predicción

Java envía los datos consolidados del cliente para que Python los evalúe.

- **Endpoint:**  
  `POST http://python-service:8000/predict`

---

### 📥 Request (DTO unificado)

```json
{
  "tenure": 12,
  "monthly_charges": 75.50,
  "total_charges": 850.00,
  "contract": "Month-to-month",
  "payment_method": "Electronic check",
  "partner": "Yes",
  "internet_service": "Fiber optic",
  "online_security": "No",
  "tech_support": "No"
}
```
## 3️⃣ Ingesta de Datos

### 📤 Subida de CSV

- **Endpoint:**  
  `POST /api/customers/upload`

- **Body:**  
  `multipart/form-data` (archivo `.csv`)

---

### 📤 Response

```json
{
  "status": "success",
  "processed_rows": 1000,
  "errors": 0,
  "message": "Datos cargados y geolocalizados en New York."
}
