# Results Reporter Project Plan

## Purpose

Build a browser-based results reporter / data analyser inside the Next.js site.

The tool should:
- accept either a full dataset or summary statistics
- run analyses in R using `webR`
- generate a polished report-ready writeup
- show the exact R code used
- show the raw R output
- link values in the report to the corresponding values in the R output

## Current Scope

Implemented first:
- Independent samples t-test

Planned later:
- Paired samples t-test and/or correlation
- ANOVA
- Other analyses only after the shared architecture is working well

## Current Route

- Page route: `/projects/results-reporter`
- Entry page: `app/(blank)/projects/results-reporter/page.tsx`
- Main UI: `app/(blank)/projects/results-reporter/_components/results-reporter-project-page.tsx`

## Current UX Layout

- Left: analysis navigation
- Middle: inputs, generated R code, raw R output, visualization
- Right: full report

This matches the intended product direction:
- report-first workflow
- supporting evidence in the middle
- analysis selection on the left

## Current Features Implemented

### Input modes

1. Dataset mode
- user uploads a CSV
- user selects group column
- user selects outcome column
- user selects the two groups to compare
- user can toggle equal variance assumption

2. Summary-stats mode
- user enters dependent variable label
- user enters group labels
- user enters means
- user enters SDs or variances
- user enters sample sizes
- user can toggle equal variance assumption

### Output areas

- Full report
- Generated R code
- R output
- ggplot visualization

### Interaction behavior

- Hovering values in the report highlights matching values in the R output pane

## Report Template For Independent Samples t-Test

Use this exact wording:

`An independent-samples t test revealed that [dependent variable] is [higher / lower / similar to] in [group A name] (M = ___, SD = ___, n = ___) than in [group B name] (M = ___, SD = ___, n = ___), t(___) = ___, p = ___.`

Implementation notes:
- If group A mean > group B mean, use `higher in ... than in ...`
- If group A mean < group B mean, use `lower in ... than in ...`
- If means are equal, use `similar in ... to ...`

## Important Product Rule

For each new analysis added in the future:
- ask the user for the exact report template, or
- ask the user for a sample write-up to convert into the final template

Do not finalize a new analysis renderer with generic wording if the user has not yet provided their preferred template.

## Architecture Notes

### Analysis logic

Current analysis logic is in:
- `app/(blank)/projects/results-reporter/_lib/independent-samples.ts`

This file currently handles:
- form types
- CSV parsing
- R code generation
- R output parsing
- APA-style formatting helpers
- fallback stats computation for summary-stats mode

### webR runner

Current webR wrapper is in:
- `app/(blank)/projects/results-reporter/_lib/webr.ts`

Current responsibilities:
- load `webR`
- install/use `ggplot2`
- execute R code
- capture console output
- capture graphics

### UI page

The page component currently handles:
- input mode switching
- file upload flow
- summary-stats input flow
- running analyses
- rendering report / code / output / visualization
- hover-link synchronization between report values and R output

## Known Behavior

### Summary-stats fallback

If summary-stats mode cannot parse all expected statistics back out of the raw R output, the app should still render the report by computing the needed statistics directly from the entered values.

This is intentional and avoids blocking the user on fragile output parsing.

### Dataset mode expectations

Dataset mode still depends on parsing the computed values from R output for the final report.

## Validation Expectations

Summary-stats mode expects user-provided inputs for:
- dependent variable label
- group 1 label
- group 2 label
- mean 1
- mean 2
- spread 1
- spread 2
- sample size 1
- sample size 2

The report then requires these computed statistics:
- `n1`
- `n2`
- `mean1`
- `mean2`
- `sd1`
- `sd2`
- `t`
- `df`
- `p`
- `meanDifference`
- `ciLow`
- `ciHigh`

Users do not enter `t`, `df`, `p`, confidence interval, or mean difference manually.

## Styling Direction

- Keep default site styling for now
- Do not add custom visual design unless explicitly requested
- Respect the site’s dark mode so inputs remain legible

## Local Testing Notes

Verified in this repo:
- `npm run lint`
- `npm run build`

For local static testing, the exported site can be served from `out/`.

## Next Recommended Steps

1. Test summary-stats mode thoroughly in-browser with several known examples.
2. Test dataset mode with a few CSVs, especially edge cases:
- non-numeric outcome values
- more than two groups in the grouping column
- missing data
- identical means
3. Improve the report/output linkage if specific values are not highlighting as expected.
4. Add the next analysis only after collecting the user’s preferred template first.
