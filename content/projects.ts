export type FundraisingFeature = {
  description: string;
  raised: number;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  fundraisingFeatures: FundraisingFeature[];
};

export const projects: Project[] = [
  {
    slug: "schedular",
    name: "schedular",
    description: "Conveniently plan a schedule and push changes to your Google Calendar.",
    fundraisingFeatures: [
      {
        description:
          "Export to Google Sheets or Excel, with cells representing the same event merged.",
        raised: 0,
      },
    ],
  },
  {
    slug: "results-reporter",
    name: "results reporter",
    description:
      "Run browser-based statistical analyses in R and turn them into report-ready writeups.",
    fundraisingFeatures: [
      {
        description: "Add visualisation for t test and improve UI.",
        raised: 0,
      },
      {
        description: "Add summary and visualisation for Pearson correlation.",
        raised: 0,
      },
      {
        description: "Add summary and visualisation for 3-groups ANOVA.",
        raised: 0,
      },
    ],
  },
];
