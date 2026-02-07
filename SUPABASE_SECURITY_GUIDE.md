# Guía de Seguridad para Venus Spa (Supabase)

Para asegurar tu base de datos y evitar que usuarios malintencionados modifiquen tus datos, debes aplicar **Políticas de Seguridad (Row Level Security - RLS)** en Supabase.

## Paso 1: Abrir el Editor SQL
1. Ve a tu panel de [Supabase](https://supabase.com/dashboard).
2. Selecciona tu proyecto.
3. En el menú lateral, haz clic en **SQL Editor** (C icon).
4. Haz clic en **New Query**.

## Paso 2: Copiar y Ejecutar el Script de Seguridad
Copia todo el código SQL a continuación, pégalo en el editor y haz clic en **Run**.

```sql
-- 1. Habilitar RLS en todas las tablas
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'settings' (Configuración)
-- Cualquiera puede LEER la configuración (necesario para ver horario, teléfono, etc.)
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
-- Solo el Admin (autenticado) puede MODIFICAR
CREATE POLICY "Admin Full Access Settings" ON settings FOR ALL TO authenticated USING (true);


-- 3. Políticas para 'services' (Servicios)
-- Cualquiera puede LEER los servicios para ver qué ofrece el spa
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);
-- Solo el Admin puede CREAR/EDITAR/BORRAR servicios
CREATE POLICY "Admin Full Access Services" ON services FOR ALL TO authenticated USING (true);


-- 4. Políticas para 'appointments' (Citas)
-- Cualquiera puede CREAR una cita (Reservar)
CREATE POLICY "Public Insert Appointments" ON appointments FOR INSERT WITH CHECK (true);

-- IMPORTANTE: Lectura pública restringida. 
-- Para verificar disponibilidad (booking), permitimos leer solo fecha y hora.
-- (Supabase no permite filtrar columnas en RLS fácilmente, así que permitimos SELECT público
-- pero en el FrontEnd cuidamos qué mostramos, o usamos una Edge Function para seguridad máxima.
-- Por ahora, para que funcione el check de disponibilidad del Booking.jsx:
CREATE POLICY "Public Read Appointments Time" ON appointments FOR SELECT USING (true);

-- Solo el Admin puede hacer TODO (Ver detalles, Aprobar, Borrar)
CREATE POLICY "Admin Full Access Appointments" ON appointments FOR ALL TO authenticated USING (true);


-- 5. Políticas para 'expenses' (Gastos)
-- Solo el Admin puede ver y gestionar gastos. Nadie más.
CREATE POLICY "Admin Full Access Expenses" ON expenses FOR ALL TO authenticated USING (true);
```

## Paso 3: Verificar Autenticación por Correo
Asegúrate de que el Login funcione.
1. Ve a **Authentication** > **Providers** en Supabase.
2. Asegúrate de que **Email** esté habilitado.
3. Ve a **Authentication** > **Users** y verifica que tu usuario (admin) exista.

## Resultado
Una vez ejecutado este script:
- Nadie podrá borrar citas ni ver gastos desde la consola del navegador.
- Solo tu usuario logueado en el Dashboard tendrá permisos completos.
- El formulario de reservas seguirá funcionando para tus clientes.
