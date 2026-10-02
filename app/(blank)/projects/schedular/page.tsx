import type { Metadata } from 'next';
import { ProjectRedirect } from '@/components/site/project-redirect';

const url = 'https://marcusgohtx.github.io/schedular-app/';

export const metadata: Metadata = {
  title: 'Schedular',
  alternates: { canonical: url },
};

export default function Page() {
  return <ProjectRedirect name="Schedular" url={url} />;
}
