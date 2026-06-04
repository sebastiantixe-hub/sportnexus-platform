# Guía de Configuración y Despliegue para el Sr. Mario (Hercix Production)

Hola Mario, aquí tienes el paso a paso exacto para terminar de poner en marcha Hercix en producción. Por favor, realiza estos 3 pasos simples en tus cuentas de **Neon**, **Render** y **Auth0**.

---

## 💾 PASO 1 — Crear las Tablas en la Base de Datos (Neon DB)

Dado que es una base de datos nueva y limpia, debemos crear la estructura (tablas, relaciones y tipos) en tu consola de Neon.

### Instrucciones:
1. Inicia sesión en [https://console.neon.tech/](https://console.neon.tech/).
2. Ve a tu proyecto de base de datos de Hercix.
3. En el menú de la izquierda, haz clic en **SQL Editor**.
4. Haz clic en **New Query** (Nueva consulta).
5. Abre el archivo `neon_migration.sql` que te compartirá Sebastián, copia todo su contenido y pégalo en el editor de Neon.
6. Haz clic en el botón **Run** (Ejecutar) en la esquina superior derecha.
7. Verifica que al terminar diga que la consulta se ejecutó correctamente.

---

## 🌐 PASO 2 — Corregir Variables de Entorno en Render

Necesitamos que el Backend de Render valide los tokens con el identificador correcto del API de Auth0.

### Instrucciones:
1. Inicia sesión en [https://dashboard.render.com/](https://dashboard.render.com/).
2. Selecciona tu servicio Backend de Hercix.
3. Ve a la pestaña **Environment** (Variables de Entorno).
4. Busca la variable `AUTH0_AUDIENCE` y cambia su valor actual a:
   ```text
   https://hercix-api
   ```
5. Haz clic en **Save Changes** (Guardar cambios). 
*(Render reiniciará automáticamente el servidor para aplicar el cambio)*.

---

## 🔒 PASO 3 — Configuración en Auth0

Debemos habilitar los registros públicos, crear el identificador del API y autorizar los orígenes web para los popups.

### 3A. Crear el API (Audience)
1. Inicia sesión en tu panel de [https://manage.auth0.com/](https://manage.auth0.com/).
2. En el menú izquierdo, ve a **Applications** -> **APIs**.
3. Haz clic en el botón **+ Create API** (Crear API).
4. Configura los siguientes campos:
   - **Name:** `Hercix API`
   - **Identifier:** `https://hercix-api`
5. Haz clic en **Create**.

### 3B. Habilitar Registro de Usuarios (Sign Up)
1. En el menú izquierdo, ve a **Authentication** -> **Database**.
2. Selecciona la conexión llamada **Username-Password-Authentication**.
3. Ve a la pestaña **Settings** (Configuración).
4. Asegúrate de que la opción **Disable Sign Ups** (Deshabilitar registros) esté en **OFF** (Apagada), para permitir que los usuarios se registren en la plataforma.
5. Guarda los cambios.

### 3C. Configurar Orígenes Web Permitidos (Popups)
1. En el menú izquierdo, ve a **Applications** -> **Applications**.
2. Selecciona tu aplicación principal de Hercix.
3. Ve a la pestaña **Settings** (Configuración) y desplázate hacia abajo hasta:
   - **Allowed Callback URLs:** Asegúrate de incluir:
     ```text
     https://www.hercix.com, https://hercix.com
     ```
   - **Allowed Web Origins:** Agrega lo siguiente para permitir el popup de login:
     ```text
     https://www.hercix.com, https://hercix.com
     ```
4. Desplázate hasta el final y haz clic en **Save Changes** (Guardar cambios).

---

## 🧪 PASO 4 — Probar el Flujo Completo

Una vez completados los pasos anteriores:
1. Abre una ventana de incógnito en tu navegador e ingresa a `https://www.hercix.com`.
2. Haz clic en **Ingresar** o **Registrarse**.
3. Selecciona **Atleta / Usuario** en el portal de acceso.
4. Se abrirá una ventana emergente (popup) de Auth0 sin sacarte de Hercix.
5. Regístrate o inicia sesión. La ventana se cerrará sola y entrarás exitosamente al Dashboard de Hercix.
