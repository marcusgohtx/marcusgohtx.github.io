import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectsContent() {
  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/projects/results-reporter" className="block">
          <Card className="h-full transition-colors hover:bg-secondary/50">
            <CardHeader>
              <CardTitle>results reporter</CardTitle>
              <CardDescription>
                Run browser-based statistical analyses in R and turn them into report-ready writeups.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/projects/schedular" className="block">
          <Card className="h-full transition-colors hover:bg-secondary/50">
            <CardHeader>
              <CardTitle>schedular</CardTitle>
              <CardDescription>
                Conveniently plan a schedule and push changes to your Google Calendar.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </section>
  );
}
