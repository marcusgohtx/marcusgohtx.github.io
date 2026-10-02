import { projects } from "@/content/projects";

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
    <section className="projects-page">
      <header className="projects-heading">
        <h1 className="field-notes-title">Projects</h1>
        <p className="projects-intro">
          For every $1 donated, you may message me the feature in the project you want me to
          prioritise.
        </p>
      </header>

      <section className="fundraising-grid">
          {fundraisingProjects.map((project) => (
            <article key={project.slug} className="fundraising-project">
              <div className="project-summary">
                <a
                  href={project.url}
                  className="project-title-link"
                >
                  {project.name}
                </a>
                <p className="project-description">{project.description}</p>
              </div>

              <div className="feature-list">
                {project.fundraisingFeatures.map((feature) => (
                  <div key={feature.description} className="feature-row">
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-amount">
                      <p className="feature-value">${feature.raised.toLocaleString()}</p>
                      <p className="feature-label">raised</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
      </section>

      <section className="finished-projects">
        <h2>Finished projects</h2>

        <div className="finished-list">
          {projects.map((project) => (
            <a key={project.slug} href={project.url} className="finished-row">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
