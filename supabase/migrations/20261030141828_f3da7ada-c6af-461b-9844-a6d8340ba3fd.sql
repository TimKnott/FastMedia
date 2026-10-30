ALTER TABLE public.outreach_settings
  ADD COLUMN IF NOT EXISTS send_daily_cap integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS send_hourly_cap integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS send_min_gap_minutes integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS send_max_gap_minutes integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS send_window_start_minute integer NOT NULL DEFAULT 540,
  ADD COLUMN IF NOT EXISTS send_window_end_minute integer NOT NULL DEFAULT 990,
  ADD COLUMN IF NOT EXISTS send_weekdays_only boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS next_send_at timestamptz;

ALTER TABLE public.outreach_messages
  ADD COLUMN IF NOT EXISTS body_html text;