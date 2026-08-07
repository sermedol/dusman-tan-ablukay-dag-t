export type CategoryTone = 'accent' | 'info' | 'success' | 'violet' | 'warning';

export interface EntityCategory {
  code: string;
  /** Plural, editorial label used in headings and card titles. */
  label: string;
  /** Exact EntityType.name value from packages/database/src/seed.ts - used for filtering/matching. */
  typeName: string;
  description: string;
  tone: CategoryTone;
}

// Mirrors the real EntityType rows seeded in packages/database/src/seed.ts
// (code/name/colorToken) - not invented categories.
export const ENTITY_CATEGORIES: EntityCategory[] = [
  { code: 'holding', label: 'Holdingler', typeName: 'Holding', description: 'Çok sektörlü sermaye grupları ve ana şirketler.', tone: 'accent' },
  { code: 'company', label: 'Şirketler', typeName: 'Şirket', description: 'Holding ve grupların iştirakleri, taşeronları.', tone: 'info' },
  { code: 'public_institution', label: 'Kamu Kurumları', typeName: 'Kamu Kurumu', description: 'İhale, teşvik ve kamu ilişkisi kurduğu kurumlar.', tone: 'success' },
  { code: 'bank', label: 'Bankalar', typeName: 'Banka', description: 'Finansman ve kredi ilişkisi kuran bankalar.', tone: 'violet' },
  { code: 'union', label: 'Sendikalar', typeName: 'Sendika', description: 'İşçi örgütlenmesi ve toplu sözleşme süreçleri.', tone: 'warning' },
];

// Tailwind's content scanner needs literal class strings, not `bg-${tone}-soft`
// template interpolation, so every combination used in JSX is spelled out here.
export const CATEGORY_CARD_CLASSES: Record<CategoryTone, string> = {
  accent: 'bg-accent-soft',
  info: 'bg-info-soft',
  success: 'bg-success-soft',
  violet: 'bg-violet-soft',
  warning: 'bg-warning-soft',
};

export const CATEGORY_BADGE_CLASSES: Record<CategoryTone, string> = {
  accent: 'bg-accent-soft text-accent-strong',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  violet: 'bg-violet-soft text-violet',
  warning: 'bg-warning-soft text-warning',
};
