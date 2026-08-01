import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ikigai: Make a Life",
  description: "A pass-the-device game for imagining career possibilities together.",
};

export default function IkigaiPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/projects"
          className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-950"
        >
          ← Back to projects
        </Link>
        <p className="text-sm font-semibold text-slate-800">Ikigai: Make a Life</p>
      </div>
      <iframe
        title="Ikigai: Make a Life"
        src="/ikigai-game/index.html"
        className="block h-[calc(100vh-65px)] min-h-[720px] w-full border-0"
        allow="clipboard-write"
      />
    </main>
  );
}
