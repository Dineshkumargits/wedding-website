import { headers } from 'next/headers';
import { getWeddingConfig } from '@/data/wedding';
import WeddingClient from '@/components/WeddingClient';

interface PageProps {
  searchParams?: Promise<{ invite?: string; wedding?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  let host = '';
  try {
    const headersList = await headers();
    host = headersList.get('host') || '';
  } catch {
    // fallback during static rendering or testing
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const querySlug = resolvedParams.invite || resolvedParams.wedding;

  // Resolve config from query parameter or domain host
  // Examples:
  // - https://sanjay-fathima.vercel.app/ -> sanjayFathimaConfig
  // - https://prakash-bella.vercel.app/ -> prakashBellaConfig
  // - http://localhost:3000/?invite=sanjay-fathima -> sanjayFathimaConfig
  const initialConfig = getWeddingConfig(querySlug || host);

  return <WeddingClient initialConfig={initialConfig} />;
}
