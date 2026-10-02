import type { Metadata } from 'next';
import { ProjectRedirect } from '@/components/site/project-redirect';

const url = 'https://marcusgohtx.github.io/results-reporter/';

export const metadata: Metadata = {
  title: 'Results Reporter',
  alternates: { canonical: url },
};

export default function Page() {
  return <ProjectRedirect name="Results Reporter" url={url} />;
}
