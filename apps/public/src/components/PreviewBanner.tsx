'use client';

import { IS_PREVIEW_MODE } from '../lib/config';

export default function PreviewBanner() {
  if (!IS_PREVIEW_MODE) return null;

  return (
    <div
      role="status"
      style={{
        backgroundColor: '#1a1a1a',
        color: '#f4d35e',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '6px 12px',
        letterSpacing: '0.02em',
      }}
    >
      Önizleme — bu sayfa temsili/demo veriyle çalışıyor, canlı üretim verisi değildir
    </div>
  );
}
