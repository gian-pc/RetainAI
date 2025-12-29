# 📘 Guía de Contribución y Reglas del Juego — RetainAI

¡Bienvenido al equipo! 🚀
Nuestro objetivo es ganar el **Hackathon Oracle ONE 2025**. Para lograrlo, necesitamos orden, disciplina y calidad.

---

## 1️⃣ Reglas de Oro 🏆

1.  **Main es Sagrada:** La rama `main` es lo que se mostrará en la Demo. **Nadie** hace commit directo ahí. Solo el Tech Lead hace merge.
2.  **Si no compila, no existe:** Prohibido subir código que rompa el build local.
3.  **Comunicación:** Si te bloqueas por más de 1 hora, avisa en Discord/WhatsApp inmediatamente.

---

## 2️⃣ Stack Tecnológico 🛠️

| Capa | Tecnología | Puerto Local |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 + Tailwind CSS | `3000` |
| **Backend** | Java Spring Boot 3 + Maven | `8080` |
| **AI / ML** | Python FastAPI + Scikit-learn | `8000` |
| **Database** | MySQL 8.0 (Docker) | `3306` |

---

## 3️⃣ Flujo de Trabajo (Gitflow) 🐙

Trabajamos con ramas por funcionalidad ("Feature Branches").

### A. Ramas Principales
* 🟡 **`develop`**: Aquí integramos todo. Es nuestra base de trabajo diaria.
* 🔴 **`main`**: Solo código listo para producción.

### B. Cómo trabajar una tarea
1.  **Sincronízate:** `git checkout develop && git pull`
2.  **Crea tu rama:** Usa el formato estándar.
    * `feat/back-entidad-cliente`
    * `fix/front-css-login`
    * `docs/diagrama-arquitectura`
3.  **Codea y guarda:** `git commit -m "feat: agrega logica de csv"`
4.  **Sube:** `git push origin feat/tu-rama`
5.  **Pull Request:** Crea el PR en GitHub hacia `develop` y pide revisión.

---

## 4️⃣ Definition of Done (DoD) ✅

Una tarea se considera terminada **SOLO** si:
* [ ] El código corre en local sin errores.
* [ ] Se han eliminado logs basura (`console.log`, `System.out.println`).
* [ ] El Pull Request ha sido aprobado por un compañero.
* [ ] Las nuevas dependencias están en `pom.xml` o `package.json`.

---

## 5️⃣ Setup Rápido

1.  **Clonar:** `git clone <repo>`
2.  **Base de Datos:** `docker-compose up -d mysql`
3.  **Backend:** `cd backend && mvn spring-boot:run`
4.  **Frontend:** `cd frontend && npm run dev`

¡A programar! 🔥