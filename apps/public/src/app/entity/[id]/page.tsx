import { DEMO_ENTITIES } from '../../../lib/demo-data';
import EntityDetailClient from './EntityDetailClient';

// Required for `next build --output export` (GitHub Pages preview): dynamic
// routes must declare which params to prebuild. Demo IDs cover the static
// preview; in the normal (non-exported) app these are just a starting set -
// any other :id is still resolved dynamically at request time.
export function generateStaticParams() {
  return DEMO_ENTITIES.map((e) => ({ id: e.id }));
}

export default function EntityPage({ params }: { params: { id: string } }) {
  return <EntityDetailClient id={params.id} />;
}
