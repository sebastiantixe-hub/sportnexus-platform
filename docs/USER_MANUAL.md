# 👤 Manual de Usuario — SportNexus Platform

> Guía completa de uso del sistema para cada rol de usuario.

---

## Roles del Sistema

| Rol | Quién es |
|---|---|
| `ADMIN` | Administrador de la plataforma SportNexus |
| `GYM_OWNER` | Dueño o gerente de un gimnasio / academia deportiva |
| `TRAINER` | Entrenador físico o instructor |
| `USER` | Atleta / cliente final del gimnasio |

---

## 🔑 Cómo Registrarse e Iniciar Sesión

### Registro
1. Ve a la URL de la plataforma
2. Click en **"Crear Cuenta"** o **"Registrarse"**
3. Completa: nombre, email, contraseña
4. Click en **"Registrarse"**
5. Tu cuenta se crea con rol `USER` por defecto

### Inicio de Sesión
1. Click en **"Iniciar Sesión"**
2. Ingresa tu email y contraseña
3. Click en **"Entrar"**
4. Serás redirigido a tu Dashboard

---

## 🏋️ Rol: GYM_OWNER (Dueño de Negocio)

### 1. Registrar mi Gimnasio
1. En el Dashboard, click en **"Mis Negocios"** o **"+"**
2. Click en **"Crear Nuevo Gimnasio"**
3. Completa la información:
   - **Nombre** del gimnasio
   - **Descripción**
   - **Ciudad** y **País**
   - **Dirección** (opcional, para búsqueda por mapa)
   - **Categoría**: Gimnasio, Academia de Fútbol, CrossFit, Yoga, etc.
4. Click en **"Guardar"**

### 2. Gestionar Clases
1. En el sidebar izquierdo, click en **"Clases"**
2. Click en **"+ Nueva Clase"**
3. Completa:
   - **Nombre** de la clase (ej. "CrossFit Mañana")
   - **Instructor** (selecciona de tu lista de trainers)
   - **Capacidad máxima** (número de cupos)
   - **Fecha y hora**
   - **Precio** (0 si es incluida en membresía)
4. Click en **"Crear Clase"**

### 3. Gestionar Membresías
1. En el Dashboard → **"Membresías"**
2. Click en **"+ Nuevo Plan"**
3. Define:
   - **Nombre** del plan (ej. "Plan Premium Mensual")
   - **Precio** mensual
   - **Duración** en días (30, 90, 365)
   - **Descripción** de beneficios
4. Los usuarios podrán suscribirse desde la app

### 4. Tienda (Marketplace)
1. En el sidebar → **"Tienda"**
2. Click en **"+ Agregar Producto"**
3. Completa:
   - **Nombre** del producto
   - **Descripción**
   - **Precio**
   - **Stock disponible**
   - **Categoría**: Ropa, Equipamiento, Suplementos, etc.
4. Los productos aparecerán en la tienda pública

### 5. Analytics / KPIs del Negocio
1. En el sidebar → **"Analytics"**
2. Selecciona tu gimnasio
3. Verás:
   - **MRR** (Ingresos recurrentes mensuales)
   - **Tasa de retención** de miembros
   - **Asistencia** a clases (últimos 30 días)
   - **Nuevos miembros** vs. cancelaciones

### 6. Campañas de Marketing (Email)
1. En el sidebar → **"Marketing"**
2. Click en **"+ Nueva Campaña"**
3. Define:
   - **Asunto** del email
   - **Contenido** del mensaje
   - **Segmento**: todos los miembros, VIP, inactivos
4. Click en **"Enviar Campaña"**
5. Los emails se envían vía **Resend** con tu marca

### 7. CRM de Miembros
1. En el sidebar → **"CRM"**
2. Verás la lista de todos tus miembros con:
   - Estado: Activo, Vencido, En riesgo
   - Última asistencia
   - Plan activo
3. Haz click en un miembro para ver su perfil
4. Puedes agregar **notas internas** sobre el cliente

---

## 🏃 Rol: TRAINER (Entrenador)

### 1. Ver mis Clases Asignadas
1. En el Dashboard → **"Clases"**
2. Verás las clases donde estás asignado como instructor
3. Puedes ver lista de inscritos en cada clase

### 2. Marcar Asistencia
1. En la clase activa → click en **"Ver Inscritos"**
2. Marca a cada asistente con el checkmark ✅
3. Los datos se registran para el analytics del gimnasio

### 3. Crear una Clase (si el GYM_OWNER lo permite)
1. En **"Clases"** → click en **"+ Nueva Clase"**
2. Solo puedes crear clases en el gimnasio donde estás asignado

---

## 🏅 Rol: USER (Atleta / Cliente)

### 1. Buscar Gimnasios
1. En el menú → **"Descubrir"**
2. Puedes buscar por:
   - **Ciudad** o **país**
   - **Tipo**: Gimnasio, Fútbol, CrossFit, Yoga, etc.
   - **Mapa interactivo** (búsqueda por distancia)
3. Click en un gimnasio para ver su perfil completo

### 2. Reservar una Clase
1. En el perfil del gimnasio → **"Clases"**
2. Click en la clase que deseas
3. Click en **"Reservar"**
4. Recibirás confirmación con **código QR** de tu ticket
5. Muestra el QR en el gimnasio para check-in

### 3. Suscribirse a una Membresía
1. En el perfil del gimnasio → **"Membresías"**
2. Selecciona el plan que deseas
3. Click en **"Suscribirme"**
4. Completa el pago con Pay-Me
5. Tu membresía se activa inmediatamente

### 4. Comprar en la Tienda
1. En el menú → **"Tienda"**
2. Navega por productos disponibles
3. Click en **"Agregar al carrito"**
4. Procede al **"Pago"** con Pay-Me
5. Recibirás confirmación de tu orden

### 5. Conectar Fitbit (Wearables)
1. En el sidebar → **"Salud"** o **"Wearables"**
2. Click en **"Conectar con Fitbit"**
3. Se abrirá la página oficial de Fitbit — autoriza a SportNexus
4. Serás redirigido de regreso automáticamente
5. Tus datos se sincronizan:
   - **Pasos** del día
   - **Calorías** quemadas
   - **Ritmo cardíaco** promedio
   - **Minutos activos**
6. Click en **"Sincronizar Ahora"** para actualizar en tiempo real

### 6. Recomendaciones con IA
1. En el Dashboard → **"Recomendaciones"** o ícono del robot
2. El sistema analiza tu historial y preferencias
3. Recibes:
   - Gimnasios recomendados cerca de ti
   - Clases sugeridas según tu actividad
4. Puedes **chatear con el asistente IA** para hacer preguntas deportivas

### 7. Ver mis Reservas
1. En el Dashboard → **"Mis Reservas"**
2. Ves todas tus clases: próximas, pasadas, canceladas
3. Puedes **cancelar** reservas futuras con un click

### 8. Mis Facturas
1. En el menú → **"Facturas"**
2. Historial completo de todos tus pagos y membresías

---

## 🔐 Rol: ADMIN (Administrador de Plataforma)

### Acceso al Panel Admin
El administrador tiene acceso a todo el sistema y puede:

1. **Ver todos los gimnasios** registrados
2. **Ver todos los usuarios** del sistema
3. **Gestionar eventos** globales de la plataforma
4. **Ver analytics** de toda la plataforma
5. **Moderar contenido** del Marketplace

---

## ❓ Preguntas Frecuentes

**¿Cómo cambio mi contraseña?**
Dashboard → tu avatar (esquina inferior izquierda) → Configuración → Cambiar contraseña

**¿Puedo cancelar mi membresía?**
Actualmente las membresías se cancelan contactando al gimnasio directamente.

**¿Mis datos de Fitbit son privados?**
Sí. Tus tokens de Fitbit se almacenan de forma segura y solo tú puedes ver tus métricas.

**¿Qué hago si un pago falla?**
Verifica que tu tarjeta esté habilitada para compras en línea y reintenta. Si el problema persiste, contacta al soporte.
