CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS private.app_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON private.app_secrets FROM PUBLIC, anon, authenticated;

INSERT INTO private.app_secrets(key, value)
VALUES ('cron_secret', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (key) DO UPDATE SET value = encode(gen_random_bytes(32), 'hex');

SELECT cron.unschedule('send-birthday-reminders-daily');
SELECT cron.schedule(
  'send-birthday-reminders-daily',
  '0 8 * * *',
  format(
    $job$
    SELECT net.http_post(
      url := 'https://rakskddcjvvewctwoprn.supabase.co/functions/v1/send-birthday-reminders',
      headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', %L),
      body := '{}'::jsonb
    );
    $job$,
    (SELECT value FROM private.app_secrets WHERE key='cron_secret')
  )
);