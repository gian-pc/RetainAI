# 📜 Reglas del Juego — RetainAI

## 🎯 Objetivo

**Ganar el Hackathon Oracle ONE 2025**.

## ⏳ Duración

**6 semanas** — hasta el **25 de enero**.

---

## 1️⃣ Organización del Código (Gitflow)

### 🌳 Ramas Principales

* **`main`**: 🔴 **INTOCABLE**
  Solo el **Tech Lead** puede hacer merge.
  Esta rama es la que se presenta en la **Demo final**.

* **`develop`**: 🟡 **BASE DE TRABAJO**
  Todos los **Pull Requests (PR)** deben apuntar a esta rama.

### 🌱 Ramas de Tarea

* Cada tarea debe crearse desde `develop`.
* **Una tarea = una rama**.

#### 📌 Nomenclatura obligatoria

```
<tipo>/<equipo>-<descripcion>
```

**Ejemplos:**

* `feat/back-entidad-cliente`
* `fix/front-error-css`
* `docs/actualizar-readme`

### ⛔ Prohibido

* ❌ Hacer **push directo** a `main` o `develop`.
* ❌ Subir archivos con **contraseñas o credenciales** (`.env`, `keys`, etc.).
* ❌ Subir carpetas basura:

  * `node_modules`
  * `venv`
  * `target`
  * `*.class`

---

## 2️⃣ Definición de Hecho (Definition of Done)

Una tarea **solo se considera terminada** si cumple **TODOS** los puntos:

* ✅ El código funciona en local (compila y corre).
* ✅ Se creó un **Pull Request** hacia `develop`.
* ✅ Otro miembro del equipo **revisó y aprobó** el PR.
* ✅ No existen errores en la consola ni en los logs.

---

## 3️⃣ Comunicación

### 💬 Canales

* **Dudas técnicas**: Canal de Discord / WhatsApp **“Desarrollo”**.
* **Bloqueos**: Avisar **inmediatamente**. No esperar a la reunión semanal.

### 🤝 Cultura de Equipo

* Todos estamos aprendiendo.
* Si alguien se traba, **el equipo ayuda**.
* El objetivo es avanzar **juntos y con calidad**.

---

🔥 *Respeta estas reglas. El orden y la disciplina son clave para ganar el hackathon.*
