# Proyecto 3X

Aplicación móvil para preparar los exámenes teóricos y prácticos de conducir en Chile. Estudio a tu ritmo, práctica orientada a tus debilidades y una experiencia simple, accesible y gamificada.

**Estado: base técnica v0.1.0.** Esta entrega inicializa el proyecto; los módulos completos se desarrollarán por etapas. Android es la primera plataforma; la arquitectura comparte código con iOS.

Repositorio privado: [WilliamBLR/Proyecto3X](https://github.com/WilliamBLR/Proyecto3X).

## Stack

| Capa | Elección | Motivo |
| --- | --- | --- |
| App | React Native + Expo SDK 57 + TypeScript | Una base Android/iOS, herramientas nativas y tipado estricto |
| Navegación | Expo Router | Rutas por archivos y separación entre navegación y módulos |
| Backend | Supabase | Auth, PostgreSQL con RLS, Storage y Realtime |
| Desarrollo | Workspace pnpm + ESLint + GitHub Actions | Dependencias reproducibles y controles en cada PR |
| Distribución | Perfiles EAS Build | APK de prueba y compilaciones de producción |

## Qué incluye esta entrega

- App navegable: Inicio, Estudiar, Tests y Día D.
- Tema claro/oscuro según el sistema; componentes reutilizables y áreas seguras.
- Botón persistente **Empezar Test** que abre el hub de modalidades. Todavía no inicia un examen.
- Dashboard con estados vacíos, sin historial ni porcentajes simulados.
- Cliente Supabase opcional, ejemplo de variables y migración inicial de perfiles con políticas por usuario.
- Configuración Android/iOS, perfiles EAS, lint, tipos y CI de exportación Android.
- Arquitectura, hoja de ruta y flujo Git documentados.

**Pendiente:** login Email/Google, onboarding interactivo, persistencia de progreso, notificaciones, banco de preguntas, tests, analíticas, rachas, libro, audio, flashcards y ejercicios psicotécnicos. La migración no está aplicada y la app no está publicada ni firmada para tiendas.

## Ejecutar localmente

Requisitos: Git, Node.js 22.13+ (rama 22) o 24, y pnpm 11.19.0. Para abrir Android necesitas un emulador con Android SDK o un dispositivo. Los scripts usan un development build; Expo Go compatible puede seleccionarse con `s` en la terminal de Expo para revisar la base.

```sh
git clone https://github.com/WilliamBLR/Proyecto3X.git
cd Proyecto3X
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
pnpm start
```

Sin backend configurado puedes revisar las pantallas. Para previsualizar en navegador: `pnpm web`. `pnpm android` abre el destino Android; `pnpm ios` abre iOS (simulador local requiere macOS y Xcode).

Para un development build Android, instalar Android Studio/JDK según Expo y ejecutar desde `apps/mobile`:

```sh
pnpm exec expo run:android
```

### Configuración Supabase (cuando se implemente auth)

En PowerShell:

```powershell
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

Completar `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los valores del proyecto Supabase. Las variables `EXPO_PUBLIC_*` son públicas en la app; nunca usar claves secretas o `service_role`. El cliente nativo usa AsyncStorage para persistir la sesión; ese almacenamiento no está cifrado. Evaluar almacenamiento protegido antes de producción.

Ver [backend y migraciones](supabase/README.md). Aún se deben provisionar Supabase, aplicar la migración, configurar OAuth y montar el proveedor de autenticación. No se necesitan credenciales para arrancar esta base visual.

## Estructura de carpetas

```text
Proyecto3X/
├── .github/
│   ├── workflows/ci.yml            # Tipos, lint y exportación Android
│   └── pull_request_template.md
├── apps/
│   └── mobile/
│       ├── assets/                # Iconos provisionales de la plantilla Expo
│       ├── src/
│       │   ├── app/               # Rutas y layouts (Expo Router)
│       │   │   ├── _layout.tsx
│       │   │   └── (tabs)/         # Inicio, Estudiar, Tests, Día D
│       │   ├── features/
│       │   │   ├── auth/          # Contrato de implementación futura
│       │   │   ├── onboarding/    # Tipos de preferencias y metas
│       │   │   ├── dashboard/     # Pantalla inicial y futuro progreso
│       │   │   ├── study/         # Hub de material
│       │   │   ├── tests/         # Hub de modalidades
│       │   │   └── exam-day/      # Preparación Día D
│       │   ├── components/        # Screen, Card y texto compartido
│       │   ├── theme/             # Colores semánticos claro/oscuro
│       │   └── lib/               # Cliente Supabase
│       ├── .env.example
│       ├── app.json               # Configuración multiplataforma
│       ├── eas.json               # Development, preview y production
│       ├── eslint.config.js
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── migrations/                # SQL versionado con RLS
│   └── README.md
├── docs/
│   ├── architecture.md            # Límites, modelo de datos y UX
│   └── roadmap.md                 # Módulos y criterios de publicación
├── CONTRIBUTING.md
├── package.json                   # Comandos del workspace
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── README.md
```

Las pantallas se agrupan por funcionalidad. Las rutas solo componen pantallas; los futuros servicios y reglas de negocio se incorporan en su módulo. Ver [arquitectura](docs/architecture.md).

## Alcance del producto

| Módulo | Comportamiento previsto |
| --- | --- |
| Onboarding | Google/Email, clase B/C/profesionales, comuna, meta diaria y opt-in push |
| Dashboard | Aprobación histórica, tests realizados, categorías por reforzar y rachas |
| Estudio | Libro por capítulos, búsqueda, audiolibro y flashcards de señales |
| Tests | Test diario, simulacro con reglas vigentes y refuerzo de errores anteriores |
| Día D | Checklist municipal, ejercicios explicativos de reactímetro, punteo y tijeras/pulso |

Copy motivacional solicitado, pendiente de validar para cada comuna: “¡Si apruebas el teórico y práctico, te sacan la foto de la licencia de inmediato, así que ve preparado/a para la cámara!”. La base muestra una invitación a confirmar el momento de la foto con la municipalidad.

Las reglas y materiales deben tener fuente, fecha, licencia aplicable y revisión editorial. Este proyecto es independiente y no declara afiliación con CONASET ni acceso a su banco real de examen. El contenido propio se identificará como práctica. La hoja de ruta está en [docs/roadmap.md](docs/roadmap.md).

## Calidad y flujo Git

```sh
pnpm check           # TypeScript + ESLint
pnpm export:android  # Bundle de producción y assets; no genera un APK
```

GitHub Actions ejecuta esos controles en cada push a `main` y en pull requests. Trabajar en ramas cortas `feat/*`, `fix/*` o `docs/*`, subir a `origin` y abrir PR hacia `main`. Ver [CONTRIBUTING.md](CONTRIBUTING.md). La protección de rama requiere configuración adicional en GitHub.

Para generar un APK interno con EAS, primero vincular la app a un proyecto Expo, confirmar identificadores de paquete y configurar firma. Desde `apps/mobile`: `pnpm dlx eas-cli build --platform android --profile preview`. Los perfiles están preparados; no se ha solicitado una compilación en la nube.

## Referencias técnicas

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Instalación de Expo Router](https://docs.expo.dev/router/installation/)
- [Supabase Auth para React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native)

El archivo `apps/mobile/LICENSE` corresponde a la plantilla Expo. Aún no se ha seleccionado una licencia de distribución para el código propio del proyecto.
