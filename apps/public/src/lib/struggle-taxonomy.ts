export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export const STRUGGLE_TYPES: Record<string, { label: string; tone: BadgeTone }> = {
  worker_resistance: { label: 'İşçi Direniş', tone: 'danger' },
  union_pressure: { label: 'Sendikal Baskı', tone: 'warning' },
  wage_theft: { label: 'Ücret Gasp', tone: 'danger' },
  workplace_death: { label: 'İş Cinayeti', tone: 'danger' },
  forced_expropriation: { label: 'Zorunlu Kamulaştırma', tone: 'accent' },
  mining_project: { label: 'Madencilik Karşıtı', tone: 'warning' },
  energy_project: { label: 'Enerji Projesi Karşıtı', tone: 'warning' },
  ecological_battle: { label: 'Ekoloji Mücadelesi', tone: 'success' },
  land_struggle: { label: 'Arazi Mücadelesi', tone: 'warning' },
  other: { label: 'Diğer', tone: 'neutral' },
};

export const STATUS_LABELS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Devam Ediyor', tone: 'success' },
  completed: { label: 'Tamamlandı', tone: 'neutral' },
  ongoing: { label: 'Süregelen', tone: 'warning' },
  historical: { label: 'Tarihi', tone: 'info' },
};

export const VERIFICATION_LABELS: Record<string, { label: string; tone: BadgeTone }> = {
  unverified: { label: 'Doğrulanmamış', tone: 'danger' },
  verified: { label: 'Doğrulanmış', tone: 'success' },
  needs_review: { label: 'İnceleme Gerekli', tone: 'warning' },
  source_required: { label: 'Kaynak Gerekli', tone: 'warning' },
  conflicting: { label: 'Çelişkili', tone: 'danger' },
};

export function getStruggleType(type: string) {
  return STRUGGLE_TYPES[type] ?? STRUGGLE_TYPES.other;
}
