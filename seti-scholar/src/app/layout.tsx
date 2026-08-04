import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SETI Scholar",
    template: "%s · SETI Scholar",
  },
  description:
    "Prepare for every course in your physics & astronomy degree — on the path to becoming a SETI astrophysicist.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
