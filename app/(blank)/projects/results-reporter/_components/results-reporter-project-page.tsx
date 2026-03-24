"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  buildDatasetAnalysis,
  buildSummaryAnalysis,
  buildValueMap,
  computeSummaryAnalysisStats,
  createDefaultDatasetForm,
  createDefaultSummaryStatsForm,
  formatApaNumber,
  formatApaP,
  getUniqueColumnValues,
  parseAnalysisOutput,
  parseCsvText,
  type AnalysisStats,
  type DatasetForm,
  type InputMode,
  type SummaryStatsForm,
} from "../_lib/independent-samples";
import { runCapturedR } from "../_lib/webr";

type AnalysisResult = {
  code: string;
  output: string;
  plotDataUrl: string | null;
  stats: AnalysisStats;
  dependentVariableLabel: string;
  group1Label: string;
  group2Label: string;
  methodLabel: string;
};

type AnalysisNotice = {
  title: string;
  description: string;
};

const fieldClassName =
  "w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

function LoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function StatValue({
  token,
  value,
  activeToken,
  onHoverChange,
}: {
  token: string;
  value: string;
  activeToken: string | null;
  onHoverChange: (token: string | null) => void;
}) {
  return (
    <span
      className={cn(
        "rounded px-1 transition-colors",
        activeToken === token && "bg-secondary text-foreground",
      )}
      onMouseEnter={() => onHoverChange(token)}
      onMouseLeave={() => onHoverChange(null)}
    >
      {value}
    </span>
  );
}

function renderHighlightedOutput(
  output: string,
  activeToken: string | null,
  valueMap: Record<string, string>,
) {
  if (!activeToken) {
    return output;
  }

  const activeValue = valueMap[activeToken];

  if (!activeValue) {
    return output;
  }

  const escapedValue = activeValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escapedValue})`, "g");
  const parts = output.split(pattern);

  return parts.map((part, index) => {
    if (part === activeValue) {
      return (
        <mark key={`${activeToken}-${index}`} className="rounded bg-secondary px-1 text-foreground">
          {part}
        </mark>
      );
    }

    return <span key={`${activeToken}-${index}`}>{part}</span>;
  });
}

function bitmapToDataUrl(bitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("The browser could not create a canvas for the ggplot image.");
  }

  context.drawImage(bitmap, 0, 0);
  return canvas.toDataURL("image/png");
}

function parseDatasetFile(file: File) {
  return file.text().then((text) => {
    const parsed = parseCsvText(text);
    return {
      fileName: file.name,
      csvText: text,
      headers: parsed.headers,
      previewRows: parsed.previewRows,
      dataRows: parsed.dataRows,
    };
  });
}

function ReportPanel({
  result,
  activeToken,
  onHoverChange,
}: {
  result: AnalysisResult | null;
  activeToken: string | null;
  onHoverChange: (token: string | null) => void;
}) {
  if (!result) {
    return <LoadingState label="Your report will appear here after you run the analysis." />;
  }

  const valueMap = buildValueMap(result.stats);
  const relationshipText =
    result.stats.meanDifference === 0
      ? `${result.dependentVariableLabel} is similar in ${result.group1Label}`
      : result.stats.meanDifference > 0
        ? `${result.dependentVariableLabel} is higher in ${result.group1Label}`
        : `${result.dependentVariableLabel} is lower in ${result.group1Label}`;

  return (
    <div className="space-y-4">
      <div className="text-sm leading-7 text-foreground">
        <p>
          An independent-samples t test revealed that {relationshipText} (
          <StatValue token="mean1" value={`M = ${valueMap.mean1}`} activeToken={activeToken} onHoverChange={onHoverChange} />
          , <StatValue token="sd1" value={`SD = ${valueMap.sd1}`} activeToken={activeToken} onHoverChange={onHoverChange} />
          , <StatValue token="n1" value={`n = ${valueMap.n1}`} activeToken={activeToken} onHoverChange={onHoverChange} />
          ) {result.stats.meanDifference === 0 ? "to" : "than in"} {result.group2Label} (
          <StatValue token="mean2" value={`M = ${valueMap.mean2}`} activeToken={activeToken} onHoverChange={onHoverChange} />
          , <StatValue token="sd2" value={`SD = ${valueMap.sd2}`} activeToken={activeToken} onHoverChange={onHoverChange} />
          , <StatValue token="n2" value={`n = ${valueMap.n2}`} activeToken={activeToken} onHoverChange={onHoverChange} />
          ), t(
          <StatValue token="df" value={valueMap.df} activeToken={activeToken} onHoverChange={onHoverChange} />
          ) = <StatValue token="t" value={valueMap.t} activeToken={activeToken} onHoverChange={onHoverChange} />,
          p = <StatValue token="p" value={valueMap.p} activeToken={activeToken} onHoverChange={onHoverChange} />.
        </p>
      </div>
    </div>
  );
}

export function ResultsReporterProjectPage() {
  const [inputMode, setInputMode] = useState<InputMode>("dataset");
  const [datasetForm, setDatasetForm] = useState<DatasetForm>(createDefaultDatasetForm);
  const [datasetRows, setDatasetRows] = useState<string[][]>([]);
  const [summaryForm, setSummaryForm] = useState<SummaryStatsForm>(createDefaultSummaryStatsForm);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [notice, setNotice] = useState<AnalysisNotice | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isBootingR, setIsBootingR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupValues = useMemo(() => {
    if (!datasetForm.groupColumn) {
      return [];
    }

    return getUniqueColumnValues(datasetRows, datasetForm.headers, datasetForm.groupColumn);
  }, [datasetForm.groupColumn, datasetForm.headers, datasetRows]);

  async function handleDatasetUpload(file: File) {
    setError(null);

    const parsed = await parseDatasetFile(file);
    const defaultGroupColumn = parsed.headers[0] ?? "";
    const defaultOutcomeColumn = parsed.headers[1] ?? parsed.headers[0] ?? "";
    const values = getUniqueColumnValues(parsed.dataRows, parsed.headers, defaultGroupColumn);

    startTransition(() => {
      setDatasetRows(parsed.dataRows);
      setDatasetForm({
        fileName: parsed.fileName,
        csvText: parsed.csvText,
        headers: parsed.headers,
        previewRows: parsed.previewRows,
        groupColumn: defaultGroupColumn,
        outcomeColumn: defaultOutcomeColumn,
        group1Value: values[0] ?? "",
        group2Value: values[1] ?? "",
        assumeEqualVariance: false,
      });
    });
  }

  async function handleRunAnalysis() {
    setError(null);
    setNotice(null);
    setIsRunning(true);
    setIsBootingR(true);
    setActiveToken(null);

    try {
      const analysis =
        inputMode === "dataset" ? buildDatasetAnalysis(datasetForm) : buildSummaryAnalysis(summaryForm);

      const capture = await runCapturedR({
        code: analysis.code,
        files: analysis.files,
      });

      let stats: AnalysisStats;
      let output = capture.output;

      try {
        const parsed = parseAnalysisOutput(capture.output);
        stats = parsed.stats;
        output = parsed.cleanedOutput;
      } catch (parseError) {
        if (inputMode !== "summary") {
          throw parseError;
        }

        stats = computeSummaryAnalysisStats(summaryForm);
        output = capture.output.trim();

        const message =
          parseError instanceof Error ? parseError.message : "Some statistics could not be parsed from the R output.";

        setNotice({
          title: "Using computed report statistics",
          description: `${message} The report is still being rendered from your entered values and the same t-test formulas.`,
        });
      }

      const plotDataUrl =
        capture.images.length > 0 ? bitmapToDataUrl(capture.images[capture.images.length - 1]) : null;

      setResult({
        code: analysis.code,
        output,
        plotDataUrl,
        stats,
        dependentVariableLabel: analysis.dependentVariableLabel,
        group1Label: analysis.group1Label,
        group2Label: analysis.group2Label,
        methodLabel: analysis.methodLabel,
      });
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "The analysis could not be completed.";
      setError(message);
    } finally {
      setIsRunning(false);
      setIsBootingR(false);
    }
  }

  const valueMap = result ? buildValueMap(result.stats) : {};

  return (
    <div className="min-h-screen">
      <nav className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Back to projects
            </Link>
            <p className="mt-1 text-xl font-bold text-foreground">results reporter</p>
          </div>

          <Button type="button" onClick={handleRunAnalysis} disabled={isRunning}>
            {isRunning ? "Running analysis..." : "Run analysis"}
          </Button>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)_minmax(320px,420px)]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyses</CardTitle>
              <CardDescription>Start with one implemented test and expand later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                type="button"
                className="w-full rounded-md border bg-secondary px-3 py-2 text-left text-sm font-medium"
              >
                Independent samples t-test
              </button>
              <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                ANOVA coming later
              </div>
              <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                Correlation coming later
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>
                Choose whether you want to upload a dataset or enter summary statistics directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={inputMode === "dataset" ? "default" : "outline"}
                  onClick={() => setInputMode("dataset")}
                >
                  Dataset mode
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "summary" ? "default" : "outline"}
                  onClick={() => setInputMode("summary")}
                >
                  Summary-stats mode
                </Button>
              </div>

              {inputMode === "dataset" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="dataset-upload" className="text-sm font-medium">
                      CSV dataset
                    </label>
                    <input
                      id="dataset-upload"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                          return;
                        }

                        void handleDatasetUpload(file);
                      }}
                      className={`${fieldClassName} block file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:text-foreground`}
                    />
                    {datasetForm.fileName ? (
                      <p className="text-xs text-muted-foreground">Loaded file: {datasetForm.fileName}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="group-column" className="text-sm font-medium">
                        Group column
                      </label>
                      <select
                        id="group-column"
                        value={datasetForm.groupColumn}
                        onChange={(event) => {
                          const nextGroupColumn = event.target.value;
                          const values = getUniqueColumnValues(datasetRows, datasetForm.headers, nextGroupColumn);

                          setDatasetForm((current) => ({
                            ...current,
                            groupColumn: nextGroupColumn,
                            group1Value: values[0] ?? "",
                            group2Value: values[1] ?? "",
                          }));
                        }}
                        className={fieldClassName}
                      >
                        <option value="">Select a column</option>
                        {datasetForm.headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="outcome-column" className="text-sm font-medium">
                        Outcome column
                      </label>
                      <select
                        id="outcome-column"
                        value={datasetForm.outcomeColumn}
                        onChange={(event) => {
                          const nextOutcomeColumn = event.target.value;
                          setDatasetForm((current) => ({
                            ...current,
                            outcomeColumn: nextOutcomeColumn,
                          }));
                        }}
                        className={fieldClassName}
                      >
                        <option value="">Select a column</option>
                        {datasetForm.headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="group-one" className="text-sm font-medium">
                        Group 1 value
                      </label>
                      <select
                        id="group-one"
                        value={datasetForm.group1Value}
                        onChange={(event) => {
                          setDatasetForm((current) => ({
                            ...current,
                            group1Value: event.target.value,
                          }));
                        }}
                        className={fieldClassName}
                      >
                        <option value="">Select a group</option>
                        {groupValues.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="group-two" className="text-sm font-medium">
                        Group 2 value
                      </label>
                      <select
                        id="group-two"
                        value={datasetForm.group2Value}
                        onChange={(event) => {
                          setDatasetForm((current) => ({
                            ...current,
                            group2Value: event.target.value,
                          }));
                        }}
                        className={fieldClassName}
                      >
                        <option value="">Select a group</option>
                        {groupValues.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={datasetForm.assumeEqualVariance}
                      onChange={(event) => {
                        setDatasetForm((current) => ({
                          ...current,
                          assumeEqualVariance: event.target.checked,
                        }));
                      }}
                    />
                    Assume equal variances
                  </label>

                  {datasetForm.previewRows.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Preview</p>
                      <div className="overflow-x-auto rounded-md border">
                        <table className="min-w-full text-left text-xs">
                          <thead className="border-b bg-secondary/60">
                            <tr>
                              {datasetForm.headers.map((header) => (
                                <th key={header} className="px-3 py-2 font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {datasetForm.previewRows.map((row, index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                {datasetForm.headers.map((header) => (
                                  <td key={header} className="px-3 py-2 text-muted-foreground">
                                    {row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="dependent-variable" className="text-sm font-medium">
                      Dependent variable
                    </label>
                      <input
                        id="dependent-variable"
                        value={summaryForm.dependentVariableLabel}
                        placeholder="Dependent variable"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            dependentVariableLabel: event.target.value,
                          }))
                        }
                      className={fieldClassName}
                      />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="summary-group-1" className="text-sm font-medium">
                        Group 1 label
                      </label>
                      <input
                        id="summary-group-1"
                        value={summaryForm.group1Label}
                        placeholder="Group A"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            group1Label: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="summary-group-2" className="text-sm font-medium">
                        Group 2 label
                      </label>
                      <input
                        id="summary-group-2"
                        value={summaryForm.group2Label}
                        placeholder="Group B"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            group2Label: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="spread-type" className="text-sm font-medium">
                        Spread input
                      </label>
                      <select
                        id="spread-type"
                        value={summaryForm.spreadType}
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            spreadType: event.target.value as SummaryStatsForm["spreadType"],
                          }))
                        }
                        className={fieldClassName}
                      >
                        <option value="sd">Standard deviation</option>
                        <option value="variance">Variance</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 pt-8 text-sm">
                      <input
                        type="checkbox"
                        checked={summaryForm.assumeEqualVariance}
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            assumeEqualVariance: event.target.checked,
                          }))
                        }
                      />
                      Assume equal variances
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="mean-1" className="text-sm font-medium">
                        Group 1 mean
                      </label>
                      <input
                        id="mean-1"
                        inputMode="decimal"
                        value={summaryForm.mean1}
                        placeholder="e.g. 12.4"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            mean1: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mean-2" className="text-sm font-medium">
                        Group 2 mean
                      </label>
                      <input
                        id="mean-2"
                        inputMode="decimal"
                        value={summaryForm.mean2}
                        placeholder="e.g. 10.8"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            mean2: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="spread-1" className="text-sm font-medium">
                        Group 1 {summaryForm.spreadType === "variance" ? "variance" : "SD"}
                      </label>
                      <input
                        id="spread-1"
                        inputMode="decimal"
                        value={summaryForm.spread1}
                        placeholder={summaryForm.spreadType === "variance" ? "e.g. 4.00" : "e.g. 2.00"}
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            spread1: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="spread-2" className="text-sm font-medium">
                        Group 2 {summaryForm.spreadType === "variance" ? "variance" : "SD"}
                      </label>
                      <input
                        id="spread-2"
                        inputMode="decimal"
                        value={summaryForm.spread2}
                        placeholder={summaryForm.spreadType === "variance" ? "e.g. 4.00" : "e.g. 2.00"}
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            spread2: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="n-1" className="text-sm font-medium">
                        Group 1 sample size
                      </label>
                      <input
                        id="n-1"
                        inputMode="numeric"
                        value={summaryForm.n1}
                        placeholder="e.g. 24"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            n1: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="n-2" className="text-sm font-medium">
                        Group 2 sample size
                      </label>
                      <input
                        id="n-2"
                        inputMode="numeric"
                        value={summaryForm.n2}
                        placeholder="e.g. 24"
                        onChange={(event) =>
                          setSummaryForm((current) => ({
                            ...current,
                            n2: event.target.value,
                          }))
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {error ? (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle>Problem</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {notice ? (
            <Card>
              <CardHeader>
                <CardTitle>{notice.title}</CardTitle>
                <CardDescription>{notice.description}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>R code</CardTitle>
                <CardDescription>The exact script used for the current run.</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <pre className="overflow-x-auto rounded-md border bg-secondary/30 p-4 text-xs leading-6">
                    <code>{result.code}</code>
                  </pre>
                ) : (
                  <LoadingState label="Run the analysis to see the generated R code." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>R output</CardTitle>
                <CardDescription>
                  Hover any highlighted value in the report to light up the same value here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border bg-secondary/30 p-4 text-xs leading-6">
                    <code>{renderHighlightedOutput(result.output, activeToken, valueMap)}</code>
                  </pre>
                ) : isBootingR ? (
                  <LoadingState label="Starting webR for the first analysis run..." />
                ) : (
                  <LoadingState label="Run the analysis to see the printed R output." />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Visualisation</CardTitle>
              <CardDescription>Rendered with ggplot in the browser through webR.</CardDescription>
            </CardHeader>
            <CardContent>
              {result?.plotDataUrl ? (
                <Image
                  src={result.plotDataUrl}
                  alt="ggplot output for the independent-samples t-test"
                  width={720}
                  height={440}
                  unoptimized
                  className="w-full rounded-md border"
                />
              ) : (
                <LoadingState label="A ggplot visual will appear here after the analysis runs." />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Full report</CardTitle>
              <CardDescription>
                Report-first output with traceable values tied back to the R output.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportPanel result={result} activeToken={activeToken} onHoverChange={setActiveToken} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current analysis</CardTitle>
              <CardDescription>Independent samples t-test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Mode: {inputMode === "dataset" ? "Whole dataset" : "Summary statistics only"}</p>
              <p>
                Variance assumption:{" "}
                {inputMode === "dataset"
                  ? datasetForm.assumeEqualVariance
                    ? "Equal variances assumed"
                    : "Welch correction"
                  : summaryForm.assumeEqualVariance
                    ? "Equal variances assumed"
                    : "Welch correction"}
              </p>
              {result ? (
                <p>
                  Current summary: {result.methodLabel}, t({formatApaNumber(result.stats.df)}) ={" "}
                  {formatApaNumber(result.stats.t)}, p = {formatApaP(result.stats.p)}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
