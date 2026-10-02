import type { Metadata } from 'next';
import { ProjectRedirect } from '@/components/site/project-redirect';

const url = 'https://marcusgohtx.github.io/ikigai/';

export const metadata: Metadata = {
  title: 'Ikigai: Make a Life',
  alternates: { canonical: url },
};

export default function Page() {
  return <ProjectRedirect name="Ikigai: Make a Life" url={url} />;
}
