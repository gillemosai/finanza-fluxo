-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule weekly keep-alive ping (every Sunday at 3:00 AM UTC)
SELECT cron.schedule(
  'weekly-keep-alive-ping',
  '0 3 * * 0', -- Every Sunday at 3:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://laqvhiaxerzafvsmxewn.supabase.co/functions/v1/keep-alive',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcXZoaWF4ZXJ6YWZ2c214ZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDE4NzcsImV4cCI6MjA3MzkxNzg3N30.t9kLMC79QX3wIy8rQ3Pxean-z1_-HSNQpw8hH7-3cMw"}'::jsonb,
      body := concat('{"ping": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);