# Supabase Keepalive Mechanism

This project uses a dedicated, idempotent keepalive mechanism to prevent the Supabase Free tier project from being paused due to inactivity.

## How it works

1. **Database Script**: There is a dedicated table `api.supabase_keepalive` and function `api.keepalive()`. When called, it simply updates the `last_heartbeat` timestamp for a single row. This avoids exposing or modifying any of the application's actual business data.
2. **Scheduler**: A GitHub Actions workflow (`.github/workflows/supabase-keepalive.yml`) runs twice a day using a cron schedule. It calls the `api.keepalive()` RPC endpoint securely via the Supabase REST API using the anon key.

## Setup

The database requires the initial migration or running the `keepalive.sql` script located in this folder.

To enable the automated keepalive via GitHub Actions, ensure you have the following secrets added to your GitHub repository at `Settings > Secrets and variables > Actions`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xxxx.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key.

*(Note: We reuse the standard `NEXT_PUBLIC_` environment variables typically used by Next.js for simplicity)*

## How to Test Manually

You can trigger the keepalive script manually in two ways:

1. **Via GitHub/Actions tab**: Go to the "Actions" tab in your repository, select "Supabase Keepalive", and click "Run workflow".
2. **Directly via CURL**:
   ```bash
   curl -X POST "https://<PROJECT_URL>/rest/v1/rpc/keepalive" \
     -H "apikey: <ANON_KEY>" \
     -H "Authorization: Bearer <ANON_KEY>" \
     -H "Accept-Profile: api" \
     -H "Content-Profile: api"
   ```

## Adjusting or Disabling

- **To adjust the schedule**: Edit `.github/workflows/supabase-keepalive.yml` and modify the cron expression (default is `0 0,12 * * *` which means every 12 hours).
- **To disable**: Simply remove the YAML file or disable the action inside the GitHub repository settings.
