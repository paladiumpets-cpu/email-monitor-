import { NextResponse } from "next/server";
import { getOAuthClient, getGmailClient } from "../../../../lib/google";
import { getSupabase } from "../../../../lib/supabase";
import { google } from "googleapis";

export async function GET(request) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const oAuth2Client = getOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        error:
          "No refresh token returned. This account may already be authorized — remove it from https://myaccount.google.com/permissions and try again.",
      },
      { status: 400 }
    );
  }

  oAuth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
  const { data: userInfo } = await oauth2.userinfo.get();
  const email = userInfo.email;

  // Save (or update) this account
  await getSupabase().from("accounts").upsert(
    {
      email,
      refresh_token: tokens.refresh_token,
    },
    { onConflict: "email" }
  );

  // Start watching this inbox for new mail via Pub/Sub
  const gmail = getGmailClient(tokens.refresh_token);
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
      history_id: String(watchRes.data.historyId),
      watch_expiration: new Date(Number(watchRes.data.expiration)).toISOString(),
    })
    .eq("email", email);

  return NextResponse.json({
    success: true,
    message: `${email} added and being watched. Go to /api/auth/google again to add the next account.`,
  });
}
