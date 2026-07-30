import { NextResponse } from "next/server";
import { getOAuthClient } from "../../../../lib/google";

// Visit /api/auth/google in your browser while logged into the Gmail
// account you want to add. It'll redirect you to Google's consent screen.
export async function GET() {
  const oAuth2Client = getOAuthClient();
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token
    prompt: "consent", // forces refresh_token on every add, even repeat accounts
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  return NextResponse.redirect(url);
}
