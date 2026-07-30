import { createClient } from "@supabase/supabase-js";

let _supabase;

// Lazily create the client only when it's actually used (at request time),
// never at module load / build time — this avoids build failures if env
// vars aren't present during the build step.
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}

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
