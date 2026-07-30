# Email Monitor — 50 Gmail accounts, real-time Telegram alerts, $0 cost

## What this does
Watches up to 50 Gmail accounts and sends you an instant Telegram message
the moment any of them gets new mail — including which account it came
from, the sender, and subject.

## 1. Google Cloud setup
1. Go to console.cloud.google.com → create a project.
2. Enable **Gmail API** and **Cloud Pub/Sub API** (APIs & Services → Library).
3. **OAuth consent screen** → External → fill in app name/email → add your
   50 business Gmail addresses under **Test users**.
4. **Credentials** → Create OAuth Client ID → type "Web application" →
   add `https://YOUR-VERCEL-URL.vercel.app/api/auth/callback` as an
   authorized redirect URI. Copy the Client ID + Secret.
5. **Pub/Sub → Topics** → create a topic, e.g. `gmail-notifications`.
   Copy its full name: `projects/YOUR_PROJECT_ID/topics/gmail-notifications`.
6. On that topic → **Permissions** → Add principal →
   `gmail-api-push@system.gserviceaccount.com` → role **Pub/Sub Publisher**.
   (This lets Gmail actually publish to your topic — required step.)
7. **Pub/Sub → Subscriptions** → create a subscription on that topic:
   - Delivery type: **Push**
   - Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook/pubsub`

## 2. Supabase setup
1. Create a free project at supabase.com.
2. SQL editor → run:
   ```sql
   create table accounts (
     id uuid primary key default gen_random_uuid(),
     email text unique not null,
     refresh_token text not null,
     history_id text,
     watch_expiration timestamptz,
     created_at timestamptz default now()
   );
   ```
3. Settings → API → copy the Project URL and `service_role` key.

## 3. Telegram bot
1. Message @BotFather → `/newbot` → copy the token.
2. Message your new bot anything once, then visit
   `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your chat ID.

## 4. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Import it in Vercel.
3. Add all the environment variables from `.env.example` in Vercel's
   project settings (fill in the real values you collected above).
4. Deploy.
5. Go back and update `GOOGLE_REDIRECT_URI` and `PUBSUB_TOPIC_FULL`
   with your real Vercel URL / project ID if you filled placeholders in
   earlier, then redeploy.

## 5. Add your 50 accounts
Visit `https://YOUR-VERCEL-URL.vercel.app/api/auth/google`, sign in with
one business Gmail account, approve access. Repeat 50 times (once per
account) — each one gets added to Supabase and starts being watched
immediately. Visit `/` to see your connected accounts list.

## Notes
- Gmail's watch subscriptions expire every 7 days — the cron job in
  `vercel.json` renews all of them daily automatically, so you don't
  need to think about this.
- Everything here (Gmail API, Pub/Sub, Supabase, Vercel Hobby, Telegram)
  is free at this scale.
- Vercel's Hobby plan terms are scoped to personal/non-commercial use —
  worth knowing since this supports a business, even though nothing
  here generates revenue directly.
