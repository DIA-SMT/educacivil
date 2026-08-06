# Supabase Keepalive Mechanism (v2)

This project uses a keepalive mechanism to prevent the Supabase Free tier project from being paused due to inactivity.

> **Historia (julio 2026):** la v1 hacía un simple `UPDATE` a una fila fija cada 3 días. Supabase la detectó como *"insufficient activity"* y pausó el proyecto igual (tumbando el sitio con un 504). La v2 genera actividad más parecida a tráfico real. **Esto sigue siendo un parche**: la solución definitiva es el plan Pro, que no pausa proyectos nunca.

## How it works

1. **Database Script** (`keepalive.sql`): crea la tabla `api.keepalive_log` y la función `api.keepalive()`. Cada llamada **inserta** una fila nueva con datos variables (timestamp, nonce aleatorio), **borra** las filas de más de 30 días y **consulta** un agregado — escrituras, borrados y lecturas que cambian en cada llamada, en vez de una operación idéntica repetida. La función tiene un freno interno (máximo 1 insert cada 5 minutos) para que nadie pueda inflar la tabla llamándola en loop con el anon key. No toca ningún dato de la aplicación.
2. **Scheduler** (`.github/workflows/supabase-keepalive.yml`): corre cada 6 horas con un jitter aleatorio de hasta 20 minutos (para no pegar siempre a la misma hora exacta). Además del RPC, toca el servicio de Auth. Doble propósito:
   - **Keepalive**: actividad regular para no cruzar los 7 días.
   - **Monitor**: si Supabase se cae por cualquier motivo, el workflow falla y GitHub avisa por mail al que hizo el último commit del workflow — nos enteramos en horas, no por un usuario con un 504.

## Setup

1. Ejecutar `keepalive.sql` en Supabase Dashboard → SQL Editor (es idempotente: borra la versión anterior y crea la nueva).
2. Verificar que existan estos secrets en GitHub (`Settings > Secrets and variables > Actions`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## How to Test Manually

1. **Via GitHub/Actions tab**: pestaña "Actions" → "Supabase Keepalive" → "Run workflow" (las corridas manuales saltean el jitter).
2. **Directly via CURL**:
   ```bash
   curl -X POST "https://<PROJECT_URL>/rest/v1/rpc/keepalive" \
     -H "apikey: <ANON_KEY>" \
     -H "Authorization: Bearer <ANON_KEY>" \
     -H "Content-Type: application/json" \
     -H "Accept-Profile: api" \
     -H "Content-Profile: api" \
     -d '{}'
   ```
   Respuesta esperada: `{"ok": true, "timestamp": "...", "pings_30d": N}`.

## Si el proyecto se pausa igual

- Restaurarlo desde el [dashboard](https://supabase.com/dashboard) (botón **Restore project**). Hay **90 días** desde la pausa para hacerlo; después solo se pueden descargar los datos.
- El sitio vuelve solo al restaurar, sin redeploy (el middleware tiene timeout de 3s hacia Supabase, así que mientras esté caído las páginas públicas siguen andando).
- Revisar el mail de la cuenta: Supabase siempre avisa antes de pausar y ahí dice el motivo.
- Considerar en serio el upgrade a Pro: es la única garantía.

## Adjusting or Disabling

- **Schedule**: editar la expresión cron en el workflow (default: `23 */6 * * *`, cada 6 horas).
- **Disable**: borrar el YAML o deshabilitar la action en la configuración del repo.
