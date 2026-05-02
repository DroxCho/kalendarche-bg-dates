CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.cron_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  success boolean NOT NULL,
  reason text,
  ip text,
  user_agent text,
  has_secret_header boolean NOT NULL DEFAULT false,
  secret_length integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE private.cron_audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS cron_audit_log_created_at_idx
  ON private.cron_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS cron_audit_log_success_idx
  ON private.cron_audit_log (success, created_at DESC);
