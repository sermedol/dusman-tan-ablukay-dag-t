/**
 * DEMO / TEMSİLİ VERİ
 *
 * Fictitious, neutral placeholder data used only when NEXT_PUBLIC_PREVIEW_MODE=true
 * (e.g. the GitHub Pages static preview, which has no backend to query). None of
 * these entities, relations or struggles refer to real organizations or people.
 * This dataset exists purely to demonstrate navigation, layout and UX - not to
 * represent real research findings.
 */

export const DEMO_ENTITIES = [
  {
    id: 'demo-holding-a',
    canonicalName: 'Demo Holding A',
    slug: 'demo-holding-a',
    description: 'Temsili bir holding yapısı. Gerçek bir kuruluşu temsil etmez.',
    entityType: { name: 'Holding' },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-sirket-b',
    canonicalName: 'Demo Şirket B',
    slug: 'demo-sirket-b',
    description: 'Demo Holding A bünyesinde temsili bir iştirak şirketi.',
    entityType: { name: 'Şirket' },
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'demo-kamu-kurumu-c',
    canonicalName: 'Demo Kamu Kurumu C',
    slug: 'demo-kamu-kurumu-c',
    description: 'Temsili bir kamu kurumu. İhale ilişkisi örneği için kullanılır.',
    entityType: { name: 'Kamu Kurumu' },
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'demo-sendika-e',
    canonicalName: 'Demo Sendika E',
    slug: 'demo-sendika-e',
    description: 'Temsili bir işçi sendikası.',
    entityType: { name: 'Sendika' },
    createdAt: '2024-01-12T00:00:00Z',
  },
] as const;

export const DEMO_RELATIONS = [
  {
    id: 'demo-relation-1',
    sourceEntity: { id: 'demo-holding-a', canonicalName: 'Demo Holding A' },
    targetEntity: { id: 'demo-sirket-b', canonicalName: 'Demo Şirket B' },
    relationType: { name: 'Sahiplik' },
    description: 'DEMO / TEMSİLİ VERİ — temsili sahiplik ilişkisi.',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'demo-relation-2',
    sourceEntity: { id: 'demo-kamu-kurumu-c', canonicalName: 'Demo Kamu Kurumu C' },
    targetEntity: { id: 'demo-sirket-b', canonicalName: 'Demo Şirket B' },
    relationType: { name: 'İhale' },
    description: 'DEMO / TEMSİLİ VERİ — temsili ihale ilişkisi.',
    createdAt: '2024-02-20T00:00:00Z',
  },
  {
    id: 'demo-relation-3',
    sourceEntity: { id: 'demo-sendika-e', canonicalName: 'Demo Sendika E' },
    targetEntity: { id: 'demo-sirket-b', canonicalName: 'Demo Şirket B' },
    relationType: { name: 'İşçi Direnişi' },
    description: 'DEMO / TEMSİLİ VERİ — temsili işçi direnişi ilişkisi.',
    createdAt: '2024-03-10T00:00:00Z',
  },
] as const;

export const DEMO_LOCATIONS = [
  { id: 'demo-loc-1', name: 'Demo Tesis A (İstanbul)', latitude: 41.0082, longitude: 28.9784, entityCount: 2 },
  { id: 'demo-loc-2', name: 'Demo Maden Sahası (Ankara)', latitude: 39.9334, longitude: 32.8597, entityCount: 1 },
  { id: 'demo-loc-3', name: 'Demo Liman (İzmir)', latitude: 38.4237, longitude: 27.1428, entityCount: 1 },
] as const;

export const DEMO_STRUGGLES = [
  {
    id: 'demo-struggle-1',
    title: 'Demo Maden Sahası İşçi Direnişi',
    slug: 'demo-maden-sahasi-isci-direnisi',
    summary: 'DEMO / TEMSİLİ VERİ — örnek bir işçi direnişi mücadelesi.',
    description:
      'Bu içerik yalnızca önizleme amaçlıdır ve gerçek bir mücadeleyi temsil etmez. ' +
      'Üretim ortamında bu alan doğrulanmış, kaynaklı verilerle doldurulur.',
    type: 'worker_resistance',
    status: 'ongoing',
    startDate: '2024-03-01T00:00:00Z',
    location: 'Demo Maden Sahası (Ankara)',
    tags: [] as { tag: string }[],
  },
];

export const DEMO_SEARCH_RESULTS = [
  { id: 'demo-holding-a', type: 'entity' as const, title: 'Demo Holding A', description: 'Temsili holding kaydı.' },
  { id: 'demo-sirket-b', type: 'entity' as const, title: 'Demo Şirket B', description: 'Temsili şirket kaydı.' },
  { id: 'demo-struggle-1', type: 'source' as const, title: 'Demo Maden Sahası İşçi Direnişi', description: 'Temsili mücadele kaydı.' },
];

export function findDemoEntity(id: string) {
  return DEMO_ENTITIES.find((e) => e.id === id || e.slug === id) ?? DEMO_ENTITIES[0];
}

export function findDemoStruggle(id: string) {
  return DEMO_STRUGGLES.find((s) => s.id === id || s.slug === id) ?? DEMO_STRUGGLES[0];
}
