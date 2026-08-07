'use client';

import { IS_PREVIEW_MODE } from '../lib/config';

export default function PreviewBanner() {
  if (!IS_PREVIEW_MODE) return null;

  return (
    <div
      role="status"
      className="bg-ink px-3 py-1.5 text-center text-tiny font-semibold uppercase tracking-wide text-[#e0b559]"
    >
      Önizleme — bu sayfa temsili/demo veriyle çalışıyor, canlı üretim verisi değildir
    </div>
  );
}
