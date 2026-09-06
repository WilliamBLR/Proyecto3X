# Proyecto 3X

Proyecto 3X es una app Android/iOS para preparar la licencia de conducir en Chile con práctica guiada, progreso medible y material interactivo. La primera experiencia está enfocada en clase B y usa contenido propio de estudio enlazado a fuentes oficiales.

## Qué funciona

- Onboarding con nombre, licencia B, comuna, meta diaria y recordatorios locales.
- Modo claro/oscuro, navegación Expo Router y botón persistente para iniciar un test.
- Test del día (10 preguntas), simulacro de práctica clase B (35 preguntas, 3 dobles, 38 puntos, aprobación desde 33) y refuerzo de preguntas falladas.
- Respuestas guardadas mientras se responde, temporizador absoluto que continúa al salir, resultado ponderado y explicación de cada error.
- Dashboard con meta diaria, racha, XP, historial, aprobación de simulacros y temas por mejorar.
- Seis lecciones originales, búsqueda, enlace al libro oficial 2026 y narración local en español con controles de reproducción.
- Flashcards visuales de señales PARE, CEDA EL PASO, velocidad, no entrar, no estacionar y dirección obligada.
- Día D con checklist municipal, preparación de reactímetro/coordinación/pulso y recordatorio para consultar el momento de la foto.
- Cuenta por correo, recuperación de contraseña y respaldo Supabase protegido por RLS. Google está preparado en el código y queda bloqueado hasta registrar las credenciales OAuth del proyecto.

El banco de 42 preguntas es material original de práctica. No declara ser el banco oficial ni reproduce preguntas reservadas de CONASET.

## Stack y estructura

React Native + Expo SDK 57 + TypeScript, Expo Router, Supabase Auth/PostgreSQL y pnpm workspaces.

```text
apps/mobile/
├── src/app/                  # rutas: tabs, onboarding, auth, quiz, resultados y material
├── src/features/             # auth, onboarding, dashboard, estudio, tests y Día D
├── src/domain/               # modelos Zod, motor de tests, analytics y pruebas PGlite
├── src/content/              # preguntas, lecciones, señales y fuentes
├── src/components/           # Screen, Card, controles y enlaces de fuente
├── src/state/                # progreso local por usuario y sincronización Supabase
├── src/lib/                  # sesión segura, recordatorios y medición de actividad
└── assets/audio/             # seis narraciones locales en español
supabase/migrations/          # perfiles, RLS y RPC server-side de sincronización
docs/                         # arquitectura y hoja de ruta
```

## Ejecutar

Requisitos: Node.js 22.13+, pnpm 11.19.0, Android SDK para compilar Android.

```sh
pnpm install --frozen-lockfile
pnpm start
pnpm typecheck
pnpm lint
pnpm test
pnpm export:android
```

Para el proyecto conectado se usa `apps/mobile/.env` (ignorado por Git):

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=false
```

La URL y la publishable key son públicas. Nunca incluir `service_role`, contraseñas ni tokens en la app. La migración `supabase/migrations/202609060002_study_progress.sql` crea la tabla privada de progreso, las políticas RLS y `sync_study_state`, que vuelve a calcular los puntajes antes de guardar.

## Backend provisionado

El entorno de desarrollo de Proyecto 3X está en Supabase, región São Paulo, con ref `kmmbxfdngdkjreflmkyt`. La URL de retorno nativa `proyecto3x://auth/callback` y las URLs locales de desarrollo ya están permitidas. El proveedor Email está disponible; Google requiere añadir un Client ID y Client Secret propios en Supabase Authentication antes de activarlo.

## Calidad y entrega

`pnpm check` reúne tipos, lint y pruebas. Las pruebas actuales cubren reglas de simulacro, selección determinista, recuperación del temporizador, refuerzo, merge local/nube, aislamiento RLS, revalidación de puntajes y banco de preguntas. Android se compila con Expo prebuild y Gradle para una APK interna; para publicar se debe configurar firma de producción.

Fuentes consultadas y enlazadas en la app: [Ley de Tránsito](https://www.bcn.cl/leychile/navegar?idNorma=1007469), [libro clase B de CONASET](https://mejoresconductores.conaset.cl/assets/data/pdf/B-ESP/Libro_para_la_conduccion_en_Chile_Clase_B_27-02-2026.pdf), [formato del examen](https://www.conaset.cl/mtt-anuncia-nuevo-examen-teorico-y-libro-de-estudio-para-la-obtencion-de-la-licencia-de-conducir/) y [Dirección de Tránsito de La Granja](https://www.municipalidadlagranja.cl/servicios/transito/).

APK interna arm64: `artifacts/Proyecto3X-0.1.0-arm64-v8a.apk`. Está firmada con la clave de desarrollo local para pruebas; no es una firma de Play Store.
