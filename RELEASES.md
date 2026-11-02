# Releases y rollback

Dos comandos. Uno publica una versión, el otro la deshace.

## Lanzar un release

```bash
node scripts/release.js patch     # 1.0.0 -> 1.0.1   (arreglos)
node scripts/release.js minor     # 1.0.0 -> 1.1.0   (funcionalidad nueva)
node scripts/release.js major     # 1.0.0 -> 2.0.0   (cambios que rompen)
node scripts/release.js 2.3.1     # una versión concreta
```

Añade `--dry-run` para ver qué haría sin tocar nada.

Qué hace, en orden:

1. Comprueba que estás en `main`, sin cambios sin commitear y al día con `origin`.
2. Sube la versión en `backend/package.json`.
3. Escribe la sección del `CHANGELOG.md` con los commits desde el release anterior.
4. Commitea (`chore(release): vX.Y.Z`) y crea el tag anotado `vX.Y.Z`.
5. Empuja `main` y el tag.

Al llegar el tag, el workflow `.github/workflows/release.yml` arranca el
servidor para comprobar `/api/health`, verifica que el tag coincide con la
versión de `package.json`, y publica el **GitHub Release** con las notas del
CHANGELOG. El push a `main` es lo que hace que Railway redespliegue.

## Volver atrás

```bash
node scripts/rollback.js              # lista los releases disponibles
node scripts/rollback.js v1.2.0       # deja main igual que v1.2.0
```

Opciones: `--dry-run` (sólo enseña), `--no-push` (deja el commit en local).

El rollback **no reescribe la historia**: crea un commit nuevo encima de `main`
cuyo contenido es exactamente el del tag elegido. Por eso:

- No hace falta `--force` y nadie pierde commits.
- Los commits malos siguen en el log, para poder mirarlos y arreglarlos.
- Railway redespliega solo al recibir ese push, así que producción vuelve a la
  versión buena sin tocar su panel.
- `backend/package.json` vuelve a la versión del tag. Cuando arregles el
  problema, lanza un release nuevo encima.

Ejemplo real:

```
v1.1.0  ──►  commit que rompe  ──►  v1.1.1  ──►  rollback a v1.1.0
                                                 (main vuelve a ser v1.1.0,
                                                  la historia se conserva)
```

## Qué NO cubre

- **La base de datos.** El rollback devuelve el código, no los datos. Si un
  release cambia el esquema de Postgres, hay que deshacer ese cambio aparte.
- **El panel de Railway.** No se toca; todo va por git.
