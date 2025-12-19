# 🤝 Contrato de Integración API — RetainAI

Este documento define la **estructura de datos (JSON)** que viaja entre los sistemas.

⚠️ **Cualquier cambio en este contrato debe ser comunicado y aprobado por el Tech Lead**.

---

## 1️⃣ Comunicación Backend (Java) → AI Engine (Python)

### 🎯 Propósito

El **Backend en Java** envía los datos del cliente al **AI Engine en Python**, el cual devuelve la predicción de fuga.

### 🌐 Endpoint

```http
POST http://localhost:8000/predict
```

---

### 📤 Request (Lo que Java envía)

```json
{
  "tenure": 12,
  "MonthlyCharges": 75.50,
  "TotalCharges": 850.00,
  "Contract": "Month-to-month",
  "PaymentMethod": "Electronic check",
  "Partner": "Yes",
  "InternetService": "Fiber optic"
}
```

#### 📌 Detalle de Campos

| Campo             | Tipo    | Descripción                                |
| ----------------- | ------- | ------------------------------------------ |
| `tenure`          | Integer | Meses de antigüedad del cliente            |
| `MonthlyCharges`  | Float   | Pago mensual                               |
| `TotalCharges`    | Float   | Pago total histórico                       |
| `Contract`        | String  | `Month-to-month` · `One year` · `Two year` |
| `PaymentMethod`   | String  | Método de pago                             |
| `Partner`         | String  | `Yes` o `No`                               |
| `InternetService` | String  | Tipo de servicio de internet               |

---

### 📥 Response (Lo que Python responde)

```json
{
  "prediction": "Va a cancelar",
  "probability": 0.85,
  "risk_level": "ALTO"
}
```

#### 📌 Detalle de Campos

| Campo         | Tipo   | Descripción                              |
| ------------- | ------ | ---------------------------------------- |
| `prediction`  | String | Texto claro para el usuario              |
| `probability` | Float  | Probabilidad de fuga (0 a 1)             |
| `risk_level`  | String | Nivel de riesgo: `BAJO`, `MEDIO`, `ALTO` |

---

## 2️⃣ Comunicación Frontend (Next.js) → Backend (Java)

### 🎯 Propósito

El usuario completa el formulario en el **Frontend** y solicita el análisis de riesgo.

### 🌐 Endpoint

```http
POST http://localhost:8080/api/analyze
```

---

### 📤 Request (Lo que envía el Frontend)

El Frontend envía **el mismo JSON** definido en la comunicación Backend → AI, capturado desde el formulario del usuario.

```json
{
  "tenure": 12,
  "MonthlyCharges": 75.50,
  "TotalCharges": 850.00,
  "Contract": "Month-to-month",
  "PaymentMethod": "Electronic check",
  "Partner": "Yes",
  "InternetService": "Fiber optic"
}
```

---

### 📥 Response (Lo que responde el Backend)

El Backend:

1. Solicita la predicción al AI Engine.
2. Guarda el resultado en **MySQL**.
3. Devuelve la respuesta al Frontend.

```json
{
  "transaction_id": 105,
  "client_name": "Juan Perez",
  "result": {
    "prediction": "Va a cancelar",
    "probability": 0.85,
    "risk_level": "ALTO"
  },
  "timestamp": "2025-12-15T10:30:00Z"
}
```

#### 📌 Detalle de Campos

| Campo            | Tipo              | Descripción                |
| ---------------- | ----------------- | -------------------------- |
| `transaction_id` | Integer           | ID único de la transacción |
| `client_name`    | String            | Nombre del cliente         |
| `result`         | Object            | Resultado de la predicción |
| `timestamp`      | String (ISO 8601) | Fecha y hora del análisis  |

---

⚠️ **Este contrato es la fuente de verdad entre equipos.**
No rompas este acuerdo sin coordinación previa.
