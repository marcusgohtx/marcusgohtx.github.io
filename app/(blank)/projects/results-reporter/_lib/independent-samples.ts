export type InputMode = "dataset" | "summary";
export type SpreadType = "sd" | "variance";

export type SummaryStatsForm = {
  dependentVariableLabel: string;
  group1Label: string;
  group2Label: string;
  mean1: string;
  mean2: string;
  spread1: string;
  spread2: string;
  n1: string;
  n2: string;
  spreadType: SpreadType;
  assumeEqualVariance: boolean;
};

export type DatasetForm = {
  fileName: string;
  csvText: string;
  headers: string[];
  previewRows: Record<string, string>[];
  groupColumn: string;
  outcomeColumn: string;
  group1Value: string;
  group2Value: string;
  assumeEqualVariance: boolean;
};

export type AnalysisStats = {
  n1: number;
  n2: number;
  mean1: number;
  mean2: number;
  sd1: number;
  sd2: number;
  t: number;
  df: number;
  p: number;
  meanDifference: number;
  ciLow: number;
  ciHigh: number;
};

export const REQUIRED_STAT_KEYS: Array<keyof AnalysisStats> = [
  "n1",
  "n2",
  "mean1",
  "mean2",
  "sd1",
  "sd2",
  "t",
  "df",
  "p",
  "meanDifference",
  "ciLow",
  "ciHigh",
];

export type AnalysisArtifact = {
  code: string;
  files?: Array<{ path: string; content: string }>;
  dependentVariableLabel: string;
  group1Label: string;
  group2Label: string;
  methodLabel: string;
};

const META_PREFIX = "@@META|";

export function createDefaultDatasetForm(): DatasetForm {
  return {
    fileName: "",
    csvText: "",
    headers: [],
    previewRows: [],
    groupColumn: "",
    outcomeColumn: "",
    group1Value: "",
    group2Value: "",
    assumeEqualVariance: false,
  };
}

export function createDefaultSummaryStatsForm(): SummaryStatsForm {
  return {
    dependentVariableLabel: "",
    group1Label: "",
    group2Label: "",
    mean1: "",
    mean2: "",
    spread1: "",
    spread2: "",
    n1: "",
    n2: "",
    spreadType: "sd",
    assumeEqualVariance: false,
  };
}

export function parseCsvText(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);
      currentValue = "";

      if (currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentValue += character;
  }

  currentRow.push(currentValue);

  if (currentRow.some((cell) => cell.trim().length > 0)) {
    rows.push(currentRow);
  }

  if (rows.length < 2) {
    throw new Error("The CSV file needs a header row and at least one data row.");
  }

  const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
  const dataRows = rows.slice(1).map((row) =>
    headers.map((_, index) => {
      return row[index] ?? "";
    }),
  );

  return {
    headers,
    previewRows: dataRows.slice(0, 5).map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
    ),
    dataRows,
  };
}

export function getUniqueColumnValues(dataRows: string[][], headers: string[], columnName: string) {
  const columnIndex = headers.indexOf(columnName);

  if (columnIndex === -1) {
    return [];
  }

  return Array.from(
    new Set(
      dataRows
        .map((row) => (row[columnIndex] ?? "").trim())
        .filter((value) => value.length > 0),
    ),
  );
}

export function escapeRString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseNumber(fieldName: string, rawValue: string) {
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return parsed;
}

function normalizeSummaryInputs(summary: SummaryStatsForm) {
  const dependentVariableLabel = summary.dependentVariableLabel.trim() || "dependent variable";
  const group1Label = summary.group1Label.trim() || "Group 1";
  const group2Label = summary.group2Label.trim() || "Group 2";
  const mean1 = parseNumber("Group 1 mean", summary.mean1);
  const mean2 = parseNumber("Group 2 mean", summary.mean2);
  const spread1Raw = parseNumber(
    summary.spreadType === "variance" ? "Group 1 variance" : "Group 1 SD",
    summary.spread1,
  );
  const spread2Raw = parseNumber(
    summary.spreadType === "variance" ? "Group 2 variance" : "Group 2 SD",
    summary.spread2,
  );
  const n1 = parseNumber("Group 1 sample size", summary.n1);
  const n2 = parseNumber("Group 2 sample size", summary.n2);

  if (n1 < 2 || n2 < 2 || !Number.isInteger(n1) || !Number.isInteger(n2)) {
    throw new Error("Both sample sizes must be whole numbers of at least 2.");
  }

  if (spread1Raw < 0 || spread2Raw < 0) {
    throw new Error("Standard deviations and variances must be non-negative.");
  }

  return {
    dependentVariableLabel,
    group1Label,
    group2Label,
    mean1,
    mean2,
    sd1: summary.spreadType === "variance" ? Math.sqrt(spread1Raw) : spread1Raw,
    sd2: summary.spreadType === "variance" ? Math.sqrt(spread2Raw) : spread2Raw,
    n1,
    n2,
  };
}

function buildSharedRHelpers(group1Label: string, group2Label: string) {
  return `
group1_label <- "${escapeRString(group1Label)}"
group2_label <- "${escapeRString(group2Label)}"

apa_num <- function(value, digits = 2) {
  formatC(value, digits = digits, format = "f")
}

apa_p <- function(value) {
  if (value < 0.001) {
    return("< .001")
  }

  formatted <- formatC(value, digits = 3, format = "f")
  sub("^0", "", formatted)
}

emit_meta <- function(key, value) {
  cat(sprintf("${META_PREFIX}%s|%s\\n", key, format(value, digits = 16, scientific = FALSE)))
}

emit_output <- function(n1, mean1, sd1, n2, mean2, sd2, t_value, df_value, p_value, mean_difference, ci_low, ci_high, test_object) {
  cat("Extracted values from R\\n")
  cat(sprintf("%s: n = %d, M = %s, SD = %s\\n", group1_label, n1, apa_num(mean1), apa_num(sd1)))
  cat(sprintf("%s: n = %d, M = %s, SD = %s\\n", group2_label, n2, apa_num(mean2), apa_num(sd2)))
  cat(
    sprintf(
      "Test statistics: t(%s) = %s, p = %s, mean difference = %s, 95%% CI [%s, %s]\\n\\n",
      apa_num(df_value),
      apa_num(t_value),
      apa_p(p_value),
      apa_num(mean_difference),
      apa_num(ci_low),
      apa_num(ci_high)
    )
  )
  print(test_object)
  emit_meta("n1", n1)
  emit_meta("n2", n2)
  emit_meta("mean1", mean1)
  emit_meta("mean2", mean2)
  emit_meta("sd1", sd1)
  emit_meta("sd2", sd2)
  emit_meta("t", t_value)
  emit_meta("df", df_value)
  emit_meta("p", p_value)
  emit_meta("meanDifference", mean_difference)
  emit_meta("ciLow", ci_low)
  emit_meta("ciHigh", ci_high)
}

library(ggplot2)
`;
}

export function buildDatasetAnalysis(dataset: DatasetForm): AnalysisArtifact {
  if (!dataset.csvText.trim()) {
    throw new Error("Upload a CSV dataset before running the analysis.");
  }

  if (!dataset.groupColumn || !dataset.outcomeColumn) {
    throw new Error("Choose both a group column and an outcome column.");
  }

  if (!dataset.group1Value || !dataset.group2Value) {
    throw new Error("Choose the two groups to compare.");
  }

  if (dataset.group1Value === dataset.group2Value) {
    throw new Error("The two selected groups must be different.");
  }

  const dataPath = "/tmp/independent-samples-input.csv";
  const methodLabel = dataset.assumeEqualVariance
    ? "Student's independent-samples t-test"
    : "Welch's independent-samples t-test";

  const code = `
${buildSharedRHelpers(dataset.group1Value, dataset.group2Value)}

analysis_data <- read.csv("${dataPath}", stringsAsFactors = FALSE, check.names = FALSE)
analysis_data <- analysis_data[, c("${escapeRString(dataset.groupColumn)}", "${escapeRString(dataset.outcomeColumn)}")]
colnames(analysis_data) <- c("group", "outcome")
analysis_data <- analysis_data[analysis_data$group %in% c(group1_label, group2_label), , drop = FALSE]
analysis_data$outcome <- suppressWarnings(as.numeric(analysis_data$outcome))
analysis_data <- analysis_data[complete.cases(analysis_data), , drop = FALSE]
analysis_data$group <- factor(analysis_data$group, levels = c(group1_label, group2_label))

if (nrow(analysis_data) == 0) {
  stop("No complete rows remained after filtering the selected columns and groups.")
}

if (length(unique(analysis_data$group)) != 2) {
  stop("The dataset mode requires exactly two distinct groups after filtering.")
}

group1_values <- analysis_data$outcome[analysis_data$group == group1_label]
group2_values <- analysis_data$outcome[analysis_data$group == group2_label]

if (length(group1_values) < 2 || length(group2_values) < 2) {
  stop("Each selected group needs at least two numeric values.")
}

test_result <- t.test(outcome ~ group, data = analysis_data, var.equal = ${dataset.assumeEqualVariance ? "TRUE" : "FALSE"})

n1 <- length(group1_values)
n2 <- length(group2_values)
mean1 <- mean(group1_values)
mean2 <- mean(group2_values)
sd1 <- sd(group1_values)
sd2 <- sd(group2_values)
t_value <- unname(test_result$statistic)
df_value <- unname(test_result$parameter)
p_value <- test_result$p.value
mean_difference <- mean1 - mean2
ci_low <- unname(test_result$conf.int[1])
ci_high <- unname(test_result$conf.int[2])

emit_output(n1, mean1, sd1, n2, mean2, sd2, t_value, df_value, p_value, mean_difference, ci_low, ci_high, test_result)

plot_object <- ggplot(analysis_data, aes(x = group, y = outcome, fill = group)) +
  geom_boxplot(alpha = 0.55, width = 0.55, outlier.shape = NA, show.legend = FALSE) +
  geom_jitter(width = 0.10, alpha = 0.75, size = 2, show.legend = FALSE) +
  labs(
    title = "Independent-samples t-test",
    subtitle = paste(group1_label, "vs", group2_label),
    x = "Group",
    y = "Outcome"
  ) +
  theme_minimal(base_size = 12)

print(plot_object)
`.trim();

  return {
    code,
    dependentVariableLabel: dataset.outcomeColumn,
    files: [{ path: dataPath, content: dataset.csvText }],
    group1Label: dataset.group1Value,
    group2Label: dataset.group2Value,
    methodLabel,
  };
}

export function buildSummaryAnalysis(summary: SummaryStatsForm): AnalysisArtifact {
  const { dependentVariableLabel, group1Label, group2Label, mean1, mean2, sd1: spread1, sd2: spread2, n1, n2 } =
    normalizeSummaryInputs(summary);
  const methodLabel = summary.assumeEqualVariance
    ? "Student's independent-samples t-test"
    : "Welch's independent-samples t-test";

  const code = `
${buildSharedRHelpers(group1Label, group2Label)}

mean1 <- ${mean1}
mean2 <- ${mean2}
sd1 <- ${spread1}
sd2 <- ${spread2}
n1 <- ${n1}
n2 <- ${n2}

if (sd1 < 0 || sd2 < 0) {
  stop("Standard deviations must be non-negative.")
}

mean_difference <- mean1 - mean2

if (${summary.assumeEqualVariance ? "TRUE" : "FALSE"}) {
  pooled_variance <- (((n1 - 1) * sd1^2) + ((n2 - 1) * sd2^2)) / (n1 + n2 - 2)
  standard_error <- sqrt(pooled_variance * ((1 / n1) + (1 / n2)))
  df_value <- n1 + n2 - 2
  method_name <- "Two Sample t-test"
} else {
  standard_error <- sqrt((sd1^2 / n1) + (sd2^2 / n2))
  numerator <- (sd1^2 / n1 + sd2^2 / n2)^2
  denominator <- ((sd1^2 / n1)^2 / (n1 - 1)) + ((sd2^2 / n2)^2 / (n2 - 1))
  df_value <- numerator / denominator
  method_name <- "Welch Two Sample t-test"
}

if (standard_error == 0) {
  stop("The computed standard error was zero. Check the supplied values.")
}

t_value <- mean_difference / standard_error
p_value <- 2 * pt(-abs(t_value), df_value)
critical_value <- qt(0.975, df_value)
ci_low <- mean_difference - critical_value * standard_error
ci_high <- mean_difference + critical_value * standard_error

test_result <- list(
  statistic = c(t = t_value),
  parameter = c(df = df_value),
  p.value = p_value,
  conf.int = c(ci_low, ci_high),
  estimate = c(mean1, mean2),
  null.value = c("difference in means" = 0),
  alternative = "two.sided",
  method = method_name,
  data.name = paste(group1_label, "and", group2_label)
)
class(test_result) <- "htest"

emit_output(n1, mean1, sd1, n2, mean2, sd2, t_value, df_value, p_value, mean_difference, ci_low, ci_high, test_result)

plot_data <- data.frame(
  group = factor(c(group1_label, group2_label), levels = c(group1_label, group2_label)),
  mean = c(mean1, mean2),
  sd = c(sd1, sd2)
)

plot_object <- ggplot(plot_data, aes(x = group, y = mean, fill = group)) +
  geom_col(alpha = 0.85, width = 0.6, show.legend = FALSE) +
  geom_errorbar(aes(ymin = mean - sd, ymax = mean + sd), width = 0.14) +
  labs(
    title = "Independent-samples t-test",
    subtitle = "Summary statistics mode",
    x = "Group",
    y = "Mean"
  ) +
  theme_minimal(base_size = 12)

print(plot_object)
`.trim();

  return {
    code,
    dependentVariableLabel,
    group1Label,
    group2Label,
    methodLabel,
  };
}

export function parseAnalysisOutput(output: string) {
  const stats: Partial<AnalysisStats> = {};
  const cleanedLines: string[] = [];

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith(META_PREFIX)) {
      const [, key, rawValue = ""] = line.split("|");
      stats[key as keyof AnalysisStats] = Number(rawValue);
      continue;
    }

    cleanedLines.push(line);
  }

  const missingKeys = getMissingStatKeys(stats);

  if (missingKeys.length > 0) {
    throw new Error(`The R output was missing these statistics needed for the report: ${missingKeys.join(", ")}.`);
  }

  return {
    stats: stats as AnalysisStats,
    cleanedOutput: cleanedLines.join("\n").trim(),
  };
}

export function getMissingStatKeys(stats: Partial<AnalysisStats>) {
  const missingKeys: Array<keyof AnalysisStats> = [];

  for (const key of REQUIRED_STAT_KEYS) {
    if (typeof stats[key] !== "number" || Number.isNaN(stats[key])) {
      missingKeys.push(key);
    }
  }

  return missingKeys;
}

export function computeSummaryAnalysisStats(summary: SummaryStatsForm): AnalysisStats {
  const { mean1, mean2, sd1, sd2, n1, n2 } = normalizeSummaryInputs(summary);
  const meanDifference = mean1 - mean2;

  let df = 0;
  let standardError = 0;

  if (summary.assumeEqualVariance) {
    const pooledVariance = (((n1 - 1) * sd1 ** 2) + ((n2 - 1) * sd2 ** 2)) / (n1 + n2 - 2);
    standardError = Math.sqrt(pooledVariance * ((1 / n1) + (1 / n2)));
    df = n1 + n2 - 2;
  } else {
    standardError = Math.sqrt((sd1 ** 2 / n1) + (sd2 ** 2 / n2));
    const numerator = ((sd1 ** 2 / n1) + (sd2 ** 2 / n2)) ** 2;
    const denominator = (((sd1 ** 2 / n1) ** 2) / (n1 - 1)) + (((sd2 ** 2 / n2) ** 2) / (n2 - 1));
    df = numerator / denominator;
  }

  if (!Number.isFinite(standardError) || standardError === 0) {
    throw new Error("The computed standard error was zero. Check the supplied values.");
  }

  const t = meanDifference / standardError;
  const p = twoSidedPValueFromT(t, df);
  const criticalValue = approximateTQuantile(0.975, df);
  const ciLow = meanDifference - criticalValue * standardError;
  const ciHigh = meanDifference + criticalValue * standardError;

  return {
    n1,
    n2,
    mean1,
    mean2,
    sd1,
    sd2,
    t,
    df,
    p,
    meanDifference,
    ciLow,
    ciHigh,
  };
}

function twoSidedPValueFromT(tValue: number, degreesOfFreedom: number): number {
  const x = degreesOfFreedom / (degreesOfFreedom + tValue ** 2);
  return regularizedIncompleteBeta(x, degreesOfFreedom / 2, 0.5);
}

function approximateTQuantile(probability: number, degreesOfFreedom: number): number {
  const z = inverseStandardNormal(probability);
  const z2 = z ** 2;
  const z3 = z ** 3;
  const z5 = z ** 5;
  const z7 = z ** 7;
  const g1 = (z3 + z) / (4 * degreesOfFreedom);
  const g2 = (5 * z5 + 16 * z3 + 3 * z) / (96 * degreesOfFreedom ** 2);
  const g3 = (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * degreesOfFreedom ** 3);
  return z + g1 + g2 + g3;
}

function inverseStandardNormal(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    throw new Error("Probability must be between 0 and 1.");
  }

  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (probability < pLow) {
    const q = Math.sqrt(-2 * Math.log(probability));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  if (probability <= pHigh) {
    const q = probability - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  const q = Math.sqrt(-2 * Math.log(1 - probability));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) {
    return 0;
  }

  if (x >= 1) {
    return 1;
  }

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaContinuedFraction(x, a, b)) / a;
  }

  return 1 - (bt * betaContinuedFraction(1 - x, b, a)) / b;
}

function betaContinuedFraction(x: number, a: number, b: number): number {
  const maxIterations = 200;
  const epsilon = 3e-7;
  const fpMin = 1e-30;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;

  if (Math.abs(d) < fpMin) {
    d = fpMin;
  }

  d = 1 / d;
  let h = d;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const evenIteration = 2 * iteration;
    let aa = (iteration * (b - iteration) * x) / ((qam + evenIteration) * (a + evenIteration));
    d = 1 + aa * d;

    if (Math.abs(d) < fpMin) {
      d = fpMin;
    }

    c = 1 + aa / c;

    if (Math.abs(c) < fpMin) {
      c = fpMin;
    }

    d = 1 / d;
    h *= d * c;

    aa = (-(a + iteration) * (qab + iteration) * x) / ((a + evenIteration) * (qap + evenIteration));
    d = 1 + aa * d;

    if (Math.abs(d) < fpMin) {
      d = fpMin;
    }

    c = 1 + aa / c;

    if (Math.abs(c) < fpMin) {
      c = fpMin;
    }

    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < epsilon) {
      break;
    }
  }

  return h;
}

function logGamma(value: number): number {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  let x = 0.9999999999998099;
  const shiftedValue = value - 1;

  for (let index = 0; index < coefficients.length; index += 1) {
    x += coefficients[index] / (shiftedValue + index + 1);
  }

  const t = shiftedValue + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shiftedValue + 0.5) * Math.log(t) - t + Math.log(x);
}

export function formatApaNumber(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function formatApaP(value: number) {
  if (value < 0.001) {
    return "< .001";
  }

  const fixed = value.toFixed(3);
  return fixed.startsWith("0") ? fixed.slice(1) : fixed;
}

export function buildValueMap(stats: AnalysisStats) {
  return {
    n1: String(Math.round(stats.n1)),
    n2: String(Math.round(stats.n2)),
    mean1: formatApaNumber(stats.mean1),
    mean2: formatApaNumber(stats.mean2),
    sd1: formatApaNumber(stats.sd1),
    sd2: formatApaNumber(stats.sd2),
    t: formatApaNumber(stats.t),
    df: formatApaNumber(stats.df),
    p: formatApaP(stats.p),
    meanDifference: formatApaNumber(stats.meanDifference),
    ciLow: formatApaNumber(stats.ciLow),
    ciHigh: formatApaNumber(stats.ciHigh),
  };
}
