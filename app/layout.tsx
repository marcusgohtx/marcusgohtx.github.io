import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Website",
  description: "A personal website built with Next.js and shadcn/ui.",
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