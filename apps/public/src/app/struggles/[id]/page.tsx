import { DEMO_STRUGGLES } from '../../../lib/demo-data';
import StruggleDetailClient from './StruggleDetailClient';

// Required for `next build --output export` (GitHub Pages preview): dynamic
// routes must declare which params to prebuild. Demo IDs cover the static
// preview; in the normal (non-exported) app any other :id is still resolved
// dynamically at request time.
export function generateStaticParams() {
  return DEMO_STRUGGLES.map((s) => ({ id: s.id }));
}

export default function StruggleDetailPage({ params }: { params: { id: string } }) {
  return <StruggleDetailClient id={params.id} />;
}
