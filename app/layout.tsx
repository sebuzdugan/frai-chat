import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRAI Chat — Responsible-AI copilot",
  description:
    "Chat grounded in the EU AI Act, NIST AI RMF, ISO/IEC 42001, and the FRAI methodology. Runs in your browser with your own API key.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
