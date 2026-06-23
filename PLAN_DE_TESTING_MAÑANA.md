# 📋 Plan de Testing: Hercix (Preparación para la Expo)

¡Tranquilo, Sebastian! En el desarrollo profesional de software, cuando un gerente te pide "probar todo el sistema" antes de una sesión con usuarios reales, lo que se hace es una **Prueba de Humo (Smoke Test)** de los flujos principales (Happy Paths).

Aquí tienes el libreto paso a paso que debes seguir tú hoy para verificar que todo esté al 100%, y que puedes usar mañana para guiar a los practicantes.

---

## 🏃 Flujo 1: El Atleta (El Cliente)
*El objetivo de este flujo es buscar gimnasios y reservar clases.*

1. **Registro/Ingreso:** 
   * Inicia sesión con una cuenta de prueba de tipo usuario/atleta.
2. **Buscador y Mapa (`/map`):**
   * Escribe una dirección en el buscador de Lima (ej: "Av. Aviación 2410" o "Av. Gran Chimú 450").
   * Verifica que el mapa se mueva correctamente al local.
   * Filtra por categorías usando los botones superiores (Fútbol, Gimnasio, etc.) y comprueba que se filtren los locales del mapa.
3. **Ficha del Gimnasio (Showroom):**
   * Haz clic en un gimnasio del mapa y presiona **"Ver clases"**.
   * Verifica que se abra la vitrina con la información limpia (sin códigos en la descripción), teléfonos y horarios.
4. **Reservar y Pagar:**
   * Ve a la pestaña **"Clases"** y haz clic en **"Reservar"** en cualquier clase.
   * Completa la simulación de pago del modal de Pay-me.
   * Comprueba que te aparezca el mensaje de éxito en verde.

---

## 🏋️ Flujo 2: El Dueño de Gimnasio
*El objetivo es gestionar el local, membresías y productos.*

1. **Ingreso:**
   * Entra con una cuenta que tenga el rol de **Dueño de Gimnasio** (GYM_OWNER).
2. **Editar/Crear Gimnasio:**
   * Ve a la lista de locales y haz clic en **"Registrar Mi Gimnasio"** o **"Editar"** sobre uno existente.
   * Modifica el nombre o la descripción.
   * Marca manualmente los **Checkboxes de Deportes** (ej: Vóley y Natación).
   * Escribe la dirección y presiona **"Ubicar"**. Verifica que el pin rojo se coloque automáticamente en el mapa.
   * Guarda los cambios.
3. **Verificar el Mapa:**
   * Ve al mapa general y busca tu local. Verifica que aparezca al filtrar por los deportes que acabas de marcar.
4. **Gestión de Tienda y Membresías:**
   * Ve a la vitrina de tu gimnasio y añade un producto de prueba en la tienda.
   * Añade una membresía de prueba. Verifica que se listen correctamente.

---

## 🎓 Flujo 3: El Entrenador (Trainer)
*El objetivo es registrarse y postular al rol.*

1. **Registro:**
   * Crea una nueva cuenta en la plataforma y selecciona el rol de **Entrenador (Coach)**.
2. **Solicitud:**
   * Llena el formulario de solicitud para activarte como entrenador en la plataforma.
   * Envía la solicitud y verifica que quede en estado de "Pendiente de Aprobación".

---

## 🛡️ Flujo 4: El Administrador (Admin)
*El objetivo es revisar estadísticas y aprobar entrenadores.*

1. **Ingreso:**
   * Entra con la cuenta de administrador global de Hercix.
2. **Panel de Aprobación (El nuevo dashboard):**
   * Ve a la sección de solicitudes de entrenadores.
   * Utiliza la barra de búsqueda rápida para filtrar por el nombre del entrenador que acabas de registrar en el Flujo 3.
   * Presiona **Aprobar** (o Desaprobar) y verifica que el rol se actualice al instante sin tener que refrescar manualmente la página.

---

## 🚪 Flujo 5: Salida Limpia (Logout)
1. Haz clic en el botón de **Cerrar Sesión**.
2. Verifica que la aplicación muestre la pantalla de carga e inicie la redirección de Auth0 de forma limpia, devolviéndote al Landing Page principal sin pantallas intermedias ni parpadeos.

---

## 💡 Consejos para la sesión de mañana con el Gerente y Practicantes:
* **Asigna Roles:** Divide a los 20 practicantes en grupos: dile a 15 de ellos que entren como **Atletas** a buscar y reservar clases, a 3 que entren como **Dueños de Gimnasio** a crear sus locales, y a 2 que entren como **Coaches** para que envíen solicitudes.
* **Sé el Guía:** Dirige la prueba paso a paso. Diles: *"Por favor, todos ingresen a la sección de mapa y busquen 'Av. Aviación'"*. De esta forma mantendrás el orden de la prueba y evitarás que hagan clic en cosas no programadas o incompletas de otros módulos que no son parte de esta demo.
