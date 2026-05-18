# 🛡️ GUÍA CORPORATIVA: GESTIÓN Y CONTROL DE ACCESO BASADO EN ROLES (RBAC) CON AUTH0
## Sistema de Gestión Deportiva Hercix — Entrega de Producción

---

## 1. Mapeo de Roles de Negocio
El sistema implementa 4 niveles de acceso estrictos:
1.  **Super Admin (`ADMIN`):** Control total del software SaaS y facturación nacional.
2.  **Owners (`GYM_OWNER`):** Gestión exclusiva de sus gimnasios y finanzas propios.
3.  **Coaches (`TRAINER`):** Administración de clases, horarios e inscritos.
4.  **Atletas / Usuarios (`USER`):** Reservas de sesiones, perfiles de salud y compras en Marketplace.

---

## 2. Configuración en la Consola Web de Auth0 (Paso a Paso)

Para que el Gerente o el Auditor verifique la seguridad, configure los roles en Auth0 siguiendo estos pasos:

### Paso 1: Crear los Roles en la Consola
1. Ingrese a su panel de administración de [Auth0 Dashboard](https://manage.auth0.com/).
2. Vaya a la sección **User Management** > **Roles**.
3. Haga clic en **Create Role** y cree los siguientes roles:
   *   `ADMIN`
   *   `GYM_OWNER`
   *   `TRAINER`
   *   `USER`

### Paso 2: Crear la "Acción" en Auth0 para Inyectar los Roles en el JWT
Para que el token cifrado (JWT) que viaja por internet contenga los roles seguros del usuario, cree un **Auth0 Action**:
1. En el panel lateral de Auth0, vaya a **Actions** > **Library** > **Build Custom**.
2. Nombre la acción: `InjectRolesToToken`, y elija el trigger: **Login / Post Login**.
3. Copie y pegue el siguiente código oficial en el editor de Auth0:

```javascript
/**
* Handler que inyecta roles en los Tokens JWT de Auth0 de manera segura.
*/
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://hercix.com';
  if (event.authorization && event.authorization.roles) {
    // Agrega los roles tanto al token de ID como al token de Acceso
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

4. Haga clic en **Deploy** (Desplegar).
5. Vaya a **Actions** > **Flows** > **Login**, arrastre su nueva acción `InjectRolesToToken` y colóquela en medio del flujo de inicio de sesión. Guarde los cambios.

---

## 3. Integración en el Backend (NestJS + Prisma)

Su sistema ya cuenta con el código de producción para leer esta configuración automáticamente. La clase `Auth0JwtStrategy` valida la firma criptográfica del token e interpreta los roles de Auth0:

```typescript
// Fragmento de d:\sports-saas-platform\backend\src\auth\strategies\auth0-jwt.strategy.ts

async validate(payload: any) {
  // 1. Extraemos los roles desde el namespace seguro de la cabecera del JWT
  const customRoles = payload['https://hercix.com/roles'] || payload['roles'] || [];
  let assignedRole: UserRole = 'USER';
  
  if (customRoles.includes('ADMIN') || customRoles.includes('Super Admin')) {
    assignedRole = 'ADMIN';
  } else if (customRoles.includes('GYM_OWNER') || customRoles.includes('Owners')) {
    assignedRole = 'GYM_OWNER';
  } else if (customRoles.includes('TRAINER') || customRoles.includes('Coaches')) {
    assignedRole = 'TRAINER';
  } else if (customRoles.includes('USER') || customRoles.includes('Atletas')) {
    assignedRole = 'USER';
  }

  // 2. Guardamos y sincronizamos el rol con Neon Postgres
  return this.authService.findOrCreateAuth0User({
    auth0Id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: assignedRole,
  });
}
```

---

## 4. Ventajas de Seguridad de esta Arquitectura
1.  **Firma Criptográfica Asimétrica:** Los roles del token no pueden alterarse en tránsito porque están firmados digitalmente por Auth0 con algoritmo **RS256**.
2.  **Sincronización Automática:** Si un Administrador le cambia el rol a un Coach en el panel web de Auth0, el sistema actualiza su perfil en la base de datos local en su siguiente inicio de sesión, sin requerir intervención del administrador de bases de datos.
3.  **Seguridad a Nivel de Endpoints:** Protegido mediante un `RolesGuard` NestJS de alto desempeño que bloquea peticiones no autorizadas en el servidor.
