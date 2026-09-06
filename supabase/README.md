# Backend Supabase

La migración crea preferencias con acceso limitado por usuario. Todavía no se ha aplicado a una instancia Supabase. El alta de perfil será un `upsert` explícito después de iniciar sesión.

Para desarrollo, instalar la CLI oficial y Docker, ejecutar `supabase init` en la raíz y luego `supabase start`. Aplicar la migración con `supabase migration up` sobre la instancia local. Copiar URL y publishable key a `apps/mobile/.env`; no copiar claves secretas ni `service_role`.

Antes de usar una instancia remota, revisar la migración y enlazar el proyecto elegido. Configurar Email/Google, URLs de redirección y políticas de Storage al implementar los módulos. Generar tipos de base con Supabase CLI después de aplicar el esquema.

Verificación pendiente de RLS: con dos usuarios A/B, A solo debe poder consultar y modificar A; insertar/actualizar B debe fallar; una sesión anónima no debe acceder a perfiles. Validar además cascada al borrar la cuenta y límites de meta diaria. No se ha ejecutado este control en esta entrega porque no hay backend provisionado.
