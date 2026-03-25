import Link from "next/link";

import { projects } from "@/content/projects";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectsContent() {
  const fundraisingProjects = projects
    .map((project, projectIndex) => ({
      ...project,
      projectIndex,
      topRaisedAmount: Math.max(...project.fundraisingFeatures.map((feature) => feature.raised), 0),
      fundraisingFeatures: project.fundraisingFeatures
        .map((feature, featureIndex) => ({ ...feature, featureIndex }))
        .sort((left, right) => {
          if (right.raised !== left.raised) {
            return right.raised - left.raised;
          }

          return left.featureIndex - right.featureIndex;
        }),
    }))
    .sort((left, right) => {
      if (right.topRaisedAmount !== left.topRaisedAmount) {
        return right.topRaisedAmount - left.topRaisedAmount;
      }

      return left.projectIndex - right.projectIndex;
    });

  return (
    <section className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>

      <section className="space-y-5">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          For every $1 donated, you may message me the feature in the project you want me to
          prioritise.
        </p>

        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-5 px-1">
          {fundraisingProjects.map((project) => (
            <div key={project.slug} className="w-[18rem] shrink-0 space-y-3">
              <div className="space-y-1">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-block text-lg font-semibold tracking-tight transition-colors hover:text-foreground/75"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>

              <div className="grid gap-3">
                {project.fundraisingFeatures.map((feature) => (
                  <Card
                    key={feature.description}
                    className="min-h-[10.5rem] border-dashed bg-secondary/20"
                  >
                    <CardHeader className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                      <CardDescription className="pr-2 text-sm leading-6 text-foreground">
                        {feature.description}
                      </CardDescription>
                      <div className="flex h-full min-w-[6.5rem] flex-col items-end justify-between pb-1 text-right">
                        <div />
                        <div className="flex flex-col items-end">
                          <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            ${feature.raised.toLocaleString()}
                          </p>
                          <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
                            raised
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">Finished projects</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="block">
              <Card className="h-full transition-colors hover:bg-secondary/50">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
