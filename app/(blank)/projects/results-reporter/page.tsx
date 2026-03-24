import type { Metadata } from "next";

import { ResultsReporterProjectPage } from "./_components/results-reporter-project-page";

export const metadata: Metadata = {
  title: "results reporter",
  description: "Run independent-samples t-tests in webR and export a report-ready summary.",
};

export default function ResultsReporterPage() {
  return <ResultsReporterProjectPage />;
}
