import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data: accounts } = await supabase
    .from("accounts")
    .select("email, watch_expiration, created_at")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1>Email Monitor</h1>
      <p>
        <a href="/api/auth/google">+ Add a Gmail account</a>
      </p>
      <p>{accounts?.length || 0} account(s) connected</p>
      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th>Email</th>
            <th>Watch expires</th>
          </tr>
        </thead>
        <tbody>
          {(accounts || []).map((a) => (
            <tr key={a.email} style={{ borderBottom: "1px solid #eee" }}>
              <td>{a.email}</td>
              <td>{a.watch_expiration ? new Date(a.watch_expiration).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
