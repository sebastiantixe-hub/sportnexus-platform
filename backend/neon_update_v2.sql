-- ============================================================
-- HERCIX – Actualización de BD en Neon (Post-Deploy)
-- Ejecutar en el SQL Editor de Neon Console
-- ============================================================

-- 1. Agregar columna last_login_at a la tabla users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);

-- 2. Crear tabla de solicitudes de rol (role_requests)
CREATE TABLE IF NOT EXISTS "role_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "requested_role" "UserRole" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_requests_pkey" PRIMARY KEY ("id")
);

-- 3. Crear índices para la tabla role_requests
CREATE INDEX IF NOT EXISTS "role_requests_user_id_idx" ON "role_requests"("user_id");
CREATE INDEX IF NOT EXISTS "role_requests_status_idx" ON "role_requests"("status");

-- 4. Agregar foreign key de role_requests hacia users
ALTER TABLE "role_requests" DROP CONSTRAINT IF EXISTS "role_requests_user_id_fkey";
ALTER TABLE "role_requests" ADD CONSTRAINT "role_requests_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ✅ VERIFICAR QUE TODO QUEDÓ BIEN
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_login_at';

SELECT table_name FROM information_schema.tables
WHERE table_name = 'role_requests';
