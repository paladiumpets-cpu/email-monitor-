import { NextResponse } from "next/server";
import { getGmailClient, sendTelegramMessage } from "../../../../lib/google";
import { supabase } from "../../../../lib/supabase";

// Google Pub/Sub POSTs here the moment a watched inbox changes.
export async function POST(request) {
  const body = await request.json();

  // Pub/Sub sends a base64-encoded JSON payload: { emailAddress, historyId }
  const messageData = JSON.parse(
    Buffer.from(body.message.data, "base64").toString("utf-8")
  );
  const { emailAddress, historyId } = messageData;

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("email", emailAddress)
    .single();

  if (!account) {
    return NextResponse.json({ ok: true }); // unknown account, ignore
  }

  const gmail = getGmailClient(account.refresh_token);

  // Ask Gmail what changed since the last historyId we saw
  const historyRes = await gmail.users.history.list({
    userId: "me",
    startHistoryId: account.history_id,
    historyTypes: ["messageAdded"],
  });

  const added = historyRes.data.history?.flatMap((h) => h.messagesAdded || []) || [];

  for (const item of added) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: item.message.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });
    const headers = msg.data.payload.headers;
    const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const from = headers.find((h) => h.name === "From")?.value || "(unknown sender)";

    await sendTelegramMessage(
      `📬 New mail on ${emailAddress}\nFrom: ${from}\nSubject: ${subject}`
    );
  }

  // Save the new historyId so we don't re-report the same messages next time
  await supabase
    .from("accounts")
    .update({ history_id: String(historyId) })
    .eq("email", emailAddress);

  return NextResponse.json({ ok: true });
}
