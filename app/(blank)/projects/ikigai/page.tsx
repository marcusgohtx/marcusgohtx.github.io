import type { Metadata } from 'next';
import { ProjectRedirect } from '@/components/site/project-redirect';

const url = 'https://ikigai-for-humanity.marcusgohtx.chatgpt.site/';

export const metadata: Metadata = {
  title: 'Ikigai for Humanity',
  alternates: { canonical: url },
};

export default function Page() {
  return <ProjectRedirect name="Ikigai for Humanity" url={url} />;
}
