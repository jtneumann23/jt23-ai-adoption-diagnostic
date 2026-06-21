import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JT23 AI Adoption Diagnostic",
  description:
    "Assess AI literacy, training needs, and policy gaps with JT23 Impact Labs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
