import { SiteShell } from "@/components/site/site-shell";
import { Recursive } from "next/font/google";

const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
  display: "swap",
});

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={recursive.variable}>
      <SiteShell>{children}</SiteShell>
    </div>
  );
}
