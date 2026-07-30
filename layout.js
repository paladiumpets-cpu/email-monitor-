export const metadata = {
  title: "Email Monitor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        {children}
      </body>
    </html>
  );
}
