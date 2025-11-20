-- Add email tracking fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS email_last_type text,
ADD COLUMN IF NOT EXISTS email_last_status text,
ADD COLUMN IF NOT EXISTS email_last_error text,
ADD COLUMN IF NOT EXISTS email_last_sent_at timestamptz;