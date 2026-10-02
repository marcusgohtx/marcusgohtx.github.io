"use client";

import { useEffect } from "react";

export function ProjectRedirect({ name, url }: { name: string; url: string }) {
  useEffect(() => {
    window.location.replace(url + window.location.search + window.location.hash);
  }, [url]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">{name} has moved</h1>
      <p className="mt-4">Opening the project at its new address.</p>
      <a href={url} className="mt-4 inline-block underline underline-offset-4">
        Continue to {name}
      </a>
    </main>
  );
}
