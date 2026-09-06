# Flujo de desarrollo

Usar Node 22.13+ o 24 y pnpm 11.19.0. Instalar con `pnpm install --frozen-lockfile`.

```sh
git switch main
git pull --ff-only
git switch -c feat/nombre-del-cambio
# implementar
pnpm check
pnpm export:android
git add <archivos>
git commit -m "feat: describe el cambio"
git push -u origin feat/nombre-del-cambio
gh pr create --fill
```

Ramas cortas `feat/*`, `fix/*`, `docs/*`; PR hacia `main`. Usar commits descriptivos y no subir `.env`, llaves ni archivos de firma. CI verifica tipos, lint y exportación Android. La protección de `main` debe configurarse en GitHub según el plan disponible; el archivo de CI por sí solo no bloquea fusiones.

Mantener rutas delgadas, lógica por módulo y UI compartida en `components`. Agregar pruebas de comportamiento al incorporar temporizadores, corrección, analíticas y sincronización; no agregar pruebas que solo repliquen placeholders.
