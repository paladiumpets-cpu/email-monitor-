import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Run this SQL once in the Supabase SQL editor to create the table:
//
// create table accounts (
//   id uuid primary key default gen_random_uuid(),
//   email text unique not null,
//   refresh_token text not null,
//   history_id text,
//   watch_expiration timestamptz,
//   created_at timestamptz default now()
// );
