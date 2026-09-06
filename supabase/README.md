# Backend Supabase

Proyecto 3X usa Auth y PostgreSQL para respaldar el progreso. El proyecto de desarrollo ya está creado en São Paulo. La app usa la URL y la publishable key desde `apps/mobile/.env`; nunca se debe empaquetar una clave `service_role`.

## Migraciones

1. `202609060001_profiles.sql` crea el perfil y su política por usuario.
2. `202609060002_study_progress.sql` crea `study_states`, la tabla privada de preguntas, RLS y `sync_study_state(jsonb)`.

La RPC exige una sesión autenticada, limita el tamaño del documento, vuelve a calcular los puntajes con la clave privada del banco y fusiona intentos/eventos sin permitir escritura directa a la tabla. Las pruebas PGlite cubren usuario propio, usuario ajeno, sesión anónima, preguntas inventadas e idempotencia.

Para otra instancia, aplicar las migraciones con la CLI oficial o copiarlas en el SQL Editor:

```sh
supabase db push
```

Configurar en Authentication → URL Configuration:

```text
Site URL: proyecto3x://auth/callback
proyecto3x://auth/callback
proyecto3x://auth/callback?recovery=1
http://localhost:8081/auth/callback
http://localhost:8081/auth/callback?recovery=1
```

Email/password ya está soportado por la app. Para Google, crear un OAuth Client en Google Cloud, registrar el callback de Supabase que muestra el panel de proveedores y copiar Client ID/Secret en Authentication → Sign In / Providers → Google. Después cambiar `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true` al compilar.
