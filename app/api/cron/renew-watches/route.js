import { NextResponse } from "next/server";
import { getGmailClient } from "../../../../lib/google";
import { getSupabase } from "../../../../lib/supabase";

// Vercel Cron calls this on a schedule (see vercel.json).
// Gmail's watch() subscriptions expire after 7 days, so every account
// needs to be re-subscribed before then, or notifications silently stop.
export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts } = await getSupabase().from("accounts").select("*");
  const results = [];

  for (const account of accounts || []) {
    try {
      const gmail = getGmailClient(account.refresh_token);
      const watchRes = await gmail.users.watch({
        userId: "me",
        requestBody: {
          topicName: process.env.PUBSUB_TOPIC_FULL,
          labelIds: ["INBOX"],
        },
      });
      await getSupabase()
        .from("accounts")
        .update({
          watch_expiration: new Date(Number(watchRes.data.expiration)).toISOString(),
        })
        .eq("email", account.email);
      results.push({ email: account.email, status: "renewed" });
    } catch (err) {
      results.push({ email: account.email, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
