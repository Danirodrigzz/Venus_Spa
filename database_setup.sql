


-- ============================================
-- VENUS SPA - CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- ============================================
-- Este archivo contiene todas las tablas, políticas RLS y triggers
-- necesarios para que la aplicación Venus Spa funcione correctamente
-- ============================================

-- Limpiar tablas existentes (opcional - comentar si no quieres borrar datos)
-- DROP TABLE IF EXISTS appointments CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS expenses CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- ============================================
-- TABLA: services
-- Descripción: Servicios ofrecidos por el spa
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    icon_name TEXT DEFAULT 'Sparkle',
    show_price BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: appointments
-- Descripción: Citas y reservas de clientes
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pendiendo', 'aprobada', 'completada', 'rechazada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: expenses
-- Descripción: Gastos del spa
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    concept TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Suministros',
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: settings
-- Descripción: Configuración general del spa
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    spa_name TEXT DEFAULT 'Venus Elegant Spa',
    phone TEXT DEFAULT '04241145565',
    address TEXT DEFAULT 'Plaza Rubi Av. España #69 3er nivel, local 303 Santo Domingo, Éste.',
    opening_hour TIME DEFAULT '09:00',
    closing_hour TIME DEFAULT '19:00',
    appointments_interval TEXT DEFAULT '60 min',
    currency TEXT DEFAULT 'USD',
    notifications_enabled BOOLEAN DEFAULT true,
    auto_approve BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_name ON appointments(client_name);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - SERVICES
-- ============================================
-- Permitir lectura pública de servicios (para la página web)
DROP POLICY IF EXISTS "Permitir lectura pública de servicios" ON services;
CREATE POLICY "Permitir lectura pública de servicios"
    ON services FOR SELECT
    USING (true);

-- Solo usuarios autenticados pueden insertar servicios
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden insertar servicios" ON services;
CREATE POLICY "Solo usuarios autenticados pueden insertar servicios"
    ON services FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar servicios
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar servicios" ON services;
CREATE POLICY "Solo usuarios autenticados pueden actualizar servicios"
    ON services FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar servicios
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar servicios" ON services;
CREATE POLICY "Solo usuarios autenticados pueden eliminar servicios"
    ON services FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- POLÍTICAS RLS - APPOINTMENTS
-- ============================================
-- Permitir que cualquiera pueda crear citas (para el formulario público)
DROP POLICY IF EXISTS "Permitir creación pública de citas" ON appointments;
CREATE POLICY "Permitir creación pública de citas"
    ON appointments FOR INSERT
    WITH CHECK (true);

-- Solo usuarios autenticados pueden ver todas las citas
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden ver citas" ON appointments;
CREATE POLICY "Solo usuarios autenticados pueden ver citas"
    ON appointments FOR SELECT
    TO authenticated
    USING (true);

-- Solo usuarios autenticados pueden actualizar citas
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar citas" ON appointments;
CREATE POLICY "Solo usuarios autenticados pueden actualizar citas"
    ON appointments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar citas
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar citas" ON appointments;
CREATE POLICY "Solo usuarios autenticados pueden eliminar citas"
    ON appointments FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- POLÍTICAS RLS - EXPENSES
-- ============================================
-- Solo usuarios autenticados pueden ver gastos
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden ver gastos" ON expenses;
CREATE POLICY "Solo usuarios autenticados pueden ver gastos"
    ON expenses FOR SELECT
    TO authenticated
    USING (true);

-- Solo usuarios autenticados pueden insertar gastos
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden insertar gastos" ON expenses;
CREATE POLICY "Solo usuarios autenticados pueden insertar gastos"
    ON expenses FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar gastos
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar gastos" ON expenses;
CREATE POLICY "Solo usuarios autenticados pueden actualizar gastos"
    ON expenses FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar gastos
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar gastos" ON expenses;
CREATE POLICY "Solo usuarios autenticados pueden eliminar gastos"
    ON expenses FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- POLÍTICAS RLS - SETTINGS
-- ============================================
-- Permitir lectura pública de configuración (para teléfono y dirección en la web)
DROP POLICY IF EXISTS "Permitir lectura pública de configuración" ON settings;
CREATE POLICY "Permitir lectura pública de configuración"
    ON settings FOR SELECT
    USING (true);

-- Solo usuarios autenticados pueden actualizar configuración
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden actualizar configuración" ON settings;
CREATE POLICY "Solo usuarios autenticados pueden actualizar configuración"
    ON settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Solo usuarios autenticados pueden insertar configuración
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden insertar configuración" ON settings;
CREATE POLICY "Solo usuarios autenticados pueden insertar configuración"
    ON settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar configuración inicial
INSERT INTO settings (id, spa_name, phone, address, opening_hour, closing_hour, appointments_interval, currency, notifications_enabled, auto_approve)
VALUES (1, 'Venus Elegant Spa', '04241145565', 'Plaza Rubi Av. España #69 3er nivel, local 303 Santo Domingo, Éste.', '09:00', '19:00', '60 min', 'USD', true, false)
ON CONFLICT (id) DO NOTHING;

-- Insertar servicios iniciales
INSERT INTO services (title, description, price, icon_name, show_price) VALUES
('Masaje Relajante', 'Una experiencia sublime para liberar el estrés.', 50.00, 'Flower2', true),
('Masaje Tántrico', 'Una terapia sensorial profunda.', 80.00, 'Flame', true),
('Masaje Reconstructor', 'Ideal para dolores musculares profundos.', 65.00, 'Zap', true),
('Masaje Deportivo', 'Mejora del rendimiento físico.', 60.00, 'Activity', true),
('Choco-Love', 'Terapia sensorial con chocolate.', 90.00, 'Waves', true),
('Limpieza Facial', 'Elimina impurezas y devuelve el brillo.', 45.00, 'Sparkle', true),
('Exfoliación', 'Remoción de células muertas.', 40.00, 'Heart', true),
('Masaje 4 Manos', 'Doble técnica y relajación simultánea.', 120.00, 'Wind', true),
('Manicure y Pedicure', 'Cuidado integral para manos y pies.', 35.00, 'Sparkle', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Ejecuta estas queries para verificar que todo esté correctamente configurado

-- Ver todas las tablas creadas
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver políticas RLS activas
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Ver servicios insertados
-- SELECT * FROM services;

-- Ver configuración
-- SELECT * FROM settings;

-- ============================================
-- ¡CONFIGURACIÓN COMPLETADA!
-- ============================================
-- Para ejecutar este script en Supabase:
-- 1. Ve a tu proyecto en app.supabase.com
-- 2. Haz clic en "SQL Editor" en el menú lateral
-- 3. Crea una nueva query
-- 4. Copia y pega este archivo completo
-- 5. Haz clic en "Run" para ejecutar
-- ============================================
