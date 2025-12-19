# 📘 Guía de Contribución — RetainAI

¡Bienvenido al equipo! 🚀
Este documento define los **estándares técnicos**, el **flujo de trabajo** y las **herramientas** que usamos para asegurar el éxito en el Hackathon.

📌 **Lectura obligatoria para todos los miembros.**

---

## 1️⃣ Stack Tecnológico Oficial 🛠️

| Capa                | Tecnología                     | Versión mínima | Puerto local |
| ------------------- | ------------------------------ | -------------- | ------------ |
| **Frontend**        | Next.js (React) + Tailwind CSS | Node.js 18+    | 3000         |
| **Backend**         | Java Spring Boot 3             | Java JDK 17    | 8080         |
| **AI Engine**       | Python FastAPI + Scikit-learn  | Python 3.10+   | 8000         |
| **Base de Datos**   | MySQL                          | v8.0           | 3306         |
| **Infraestructura** | Docker & Docker Compose        | v24+           | N/A          |

---

## 2️⃣ Organización de Equipos (Squads) 👥

Cada miembro pertenece a un **Squad**, pero todos colaboramos de forma transversal.

### 🐍 Squad Data Science

* **Responsabilidad**: Limpieza de datos (ETL), entrenamiento del modelo (`.pkl`) y exposición de la API de predicción.
* **Directorio de trabajo**: `/ai-ml`

### ☕ Squad Backend

* **Responsabilidad**: Lógica de negocio, gestión de usuarios, base de datos y orquestación entre Frontend y AI.
* **Directorio de trabajo**: `/backend`

### 🎨 Squad Frontend

* **Responsabilidad**: Interfaz de usuario, dashboard y experiencia de cliente.
* **Directorio de trabajo**: `/frontend`

---

## 3️⃣ Flujo de Trabajo con Git (Gitflow) 🐙

Para evitar conflictos y código roto, seguimos estas **reglas estrictas**.

### 🌳 Ramas Principales

* **`main`**: 🔴 Producción
  Código estable y probado. **Solo el Tech Lead** hace merge aquí.

* **`develop`**: 🟡 Integración
  Aquí se une el trabajo de todos los equipos. Es la base para iniciar nuevas tareas.

---

### 🚧 Cómo Empezar una Tarea (Paso a Paso)

#### 1️⃣ Sincronízate

Antes de empezar, descarga lo último de `develop`:

```bash
git checkout develop
git pull origin develop
```

---

#### 2️⃣ Crea tu Rama

Nombra tu rama según el tipo de trabajo y tu equipo.

**Estructura:**

```
<tipo>/<equipo>-<descripcion-corta>
```

**Ejemplos:**

* `feat/back-entidad-cliente`
* `fix/front-error-login`

```bash
git checkout -b feat/back-nueva-funcionalidad
```

---

#### 3️⃣ Programa y Guarda

Haz **commits pequeños y descriptivos**:

```bash
git add .
git commit -m "feat: agregada validación de usuario en login"
```

---

#### 4️⃣ Sube tus Cambios

Sube **tu rama** a GitHub.
❌ **Nunca** hagas push directo a `develop`.

```bash
git push origin feat/back-nueva-funcionalidad
```

---

#### 5️⃣ Solicita Fusión (Pull Request)

1. Ve a GitHub y crea un **Pull Request (PR)** hacia `develop`.
2. Avisa en el grupo:

   > "Chicos, subí PR del Login, ¿alguien revisa?"
3. Una vez aprobado, el PR será fusionado.

---

## 4️⃣ Estándares de Código 📝

### 🌐 Idioma

* **Código**: Inglés (variables, funciones, clases).
* **Comentarios y commits**: Español o Inglés (mantener consistencia).

### 🎨 Formato

* **Java**: Google Java Style.
* **Python**: PEP 8.
* **JS/TS**: Prettier estándar.

### 🧾 Commits (Conventional Commits)

Usar siempre este formato:

* `feat:` Nueva funcionalidad
* `fix:` Corrección de error
* `docs:` Cambios en documentación
* `style:` Cambios de formato (espacios, comas)
* `refactor:` Mejora de código sin cambiar lógica

---

## 5️⃣ Contacto y Ayuda 🆘

* **Tech Lead**: *[Tu Nombre]* (`@usuario_discord`)
* **Canal de dudas**: `#general-dev` en Discord / WhatsApp

### 🧠 Regla de Oro

> **Si el código no corre en local, no se sube.**
> ¡Prueba siempre antes de hacer push!

---

🔥 *Estas reglas nos permiten avanzar rápido, con orden y calidad. Sigámoslas.*
