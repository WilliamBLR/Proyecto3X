# Arquitectura de Proyecto 3X

## Decisión inicial

React Native + Expo + TypeScript para compartir producto Android/iOS; Expo Router para rutas. Supabase aporta Auth, PostgreSQL, Storage y Realtime. Se mantiene una sola app en un workspace pnpm, con documentación e infraestructura fuera de la UI. No se agrega un servidor propio hasta necesitar lógica privilegiada.

El workspace usa dependencias hoisted para Expo. Se fijan `react-native-worklets` 0.10.1 y `@react-native/metro-config` 0.86.3 según las versiones compatibles con SDK 57/React Native 0.86.3; revisar esos overrides al actualizar Expo. ESLint permanece en 9 por compatibilidad del plugin React. El único postinstall habilitado explícitamente es el resolver nativo de ESLint (`unrs-resolver`).

## Dependencias y límites

`src/app` compone rutas → `src/features` contiene pantallas y casos de uso → `src/components`, `src/theme` y `src/lib` aportan herramientas compartidas. Las funciones de dominio no dependen de React. El cliente Supabase vive exclusivamente en `src/lib/supabase.ts`; las futuras consultas se agrupan en servicios de cada módulo. No se consulta la base directamente desde componentes visuales.

Los módulos iniciales son auth, onboarding, dashboard, study, tests y exam-day. Hoy hay navegación y pantallas de base; los módulos aún no tienen flujos de producción.

## Datos previstos

| Entidad | Propósito | Estado |
| --- | --- | --- |
| profiles | Licencia, comuna, meta y preferencia de recordatorios | Migración inicial con RLS |
| questions / question_options | Banco versionado, categorías, fuente y explicación | Diseño pendiente |
| exam_rules | Reglas por licencia y versión de fuente | Diseño pendiente |
| attempts / answers | Sesiones y respuestas por usuario | Diseño pendiente |
| chapters / signs | Libro, audio, señalética y procedencia | Diseño pendiente |
| study_events | Actividad, rachas y objetivos | Diseño pendiente |

Las reglas del examen (tiempo, cantidad, ponderación y aprobación) deben estar versionadas por clase y fuente, no incrustadas en la UI. El servidor corregirá los simulacros publicados; la app no será autoridad sobre puntajes, rachas o recompensas.

Las debilidades se calcularán por categoría usando respuestas incorrectas / respuestas totales, acompañadas del tamaño de muestra. Se mostrarán estados vacíos para categorías sin datos. El refuerzo recuperará preguntas falladas; los criterios de dominio y repetición espaciada se definirán durante ese módulo.

## Autenticación y sincronización previstas

Email y Google mediante Supabase Auth. Google necesita proveedor OAuth, redirect URI y deep links `proyecto3x://` configurados. La base incluye un cliente opcional con persistencia de sesión nativa; aún no implementa formularios, OAuth ni sincronización. La app puede arrancar sin variables de entorno.

RLS obliga a que cada usuario solo lea y modifique su perfil. Nunca incluir `service_role`, claves secretas ni credenciales de firma en la app. `EXPO_PUBLIC_*` se incorpora al bundle y es público. La autorización real reside en políticas de base y funciones del servidor.

Storage, Realtime, cola offline, permisos push y reproducción de audio en segundo plano se incorporarán con cada módulo. El consentimiento de notificaciones será contextual y revocable; una preferencia guardada no equivale al permiso del sistema.

## UX

Cuatro destinos: Inicio, Estudiar, Tests y Día D. Un CTA persistente lleva a Tests fuera de ese destino. Tema automático claro/oscuro; contraste alto, controles de al menos 48 dp, etiquetas accesibles y contenido desplazable. Las transiciones base usan navegación nativa; las animaciones futuras respetarán reducción de movimiento.

No mostrar porcentajes de aprobación, rachas ni actividad inventada. La entrega inicial usa estados vacíos. Los requisitos municipales y consejos prácticos se publicarán con fuente, fecha y comuna. El recordatorio de foto solicitado se conservará como copy propuesto hasta validar su aplicación municipal.

## Distribución

Expo genera proyectos nativos cuando se requieren. Los identificadores `cl.proyecto3x.app` son provisionales y deben confirmarse antes de publicar. EAS tiene perfiles de desarrollo, APK interno y producción; falta vincular un proyecto Expo y configurar firma. iOS comparte código, pero su compilación local requiere macOS/Xcode o EAS Build.
