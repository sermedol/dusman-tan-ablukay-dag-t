'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiClient } from '../../../lib/api-client';

interface HoldingRegistryRow {
  id: string;
  holdingId: string;
  holdingName: string;
  shortName: string | null;
  spreadsheetUrl: string | null;
  spreadsheetId: string | null;
  status: string | null;
  researchStatus: string | null;
  syncEnabled: boolean;
  syncMode: string;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  entity: { id: string; slug: string; canonicalName: string } | null;
}

interface SyncCounts {
  rowCount: number;
  createCount: number;
  updateCount: number;
  unchangedCount: number;
  missingFromSourceCount: number;
  rejectedCount: number;
  warningCount: number;
  unresolvedReferenceCount: number;
}

interface SyncRowOutcome {
  sheetName: string;
  rowNumber: number;
  externalId?: string;
  operation: string;
  errors?: string[];
  warnings?: string[];
}

interface SyncResult {
  importBatchId: string;
  dryRun: boolean;
  status: string;
  counts: SyncCounts;
  rows: SyncRowOutcome[];
  tabsFound: string[];
  tabsMissing: string[];
}

export default function DataSourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<HoldingRegistryRow[]>([]);
  const [busyHoldingId, setBusyHoldingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, SyncResult>>({});
  const [refreshingRegistry, setRefreshingRegistry] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    void loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [status, holdingsList] = await Promise.all([
        apiClient.get<{ googleIntegrationEnabled: boolean; disabledReason: string | null }>('/data-sources'),
        apiClient.get<HoldingRegistryRow[]>('/data-sources/holdings'),
      ]);
      setGoogleEnabled(status.googleIntegrationEnabled);
      setDisabledReason(status.disabledReason);
      setHoldings(holdingsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri kaynakları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRegistry = async () => {
    try {
      setRefreshingRegistry(true);
      setError(null);
      await apiClient.post('/data-sources/refresh-registry');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Master Registry yenilenemedi');
    } finally {
      setRefreshingRegistry(false);
    }
  };

  const handleAction = async (holdingId: string, dryRun: boolean) => {
    try {
      setBusyHoldingId(holdingId);
      setError(null);
      const endpoint = dryRun ? `/data-sources/preview/${holdingId}` : `/data-sources/sync/${holdingId}`;
      const result = await apiClient.post<SyncResult>(endpoint, dryRun ? undefined : { dryRun: false });
      setResults((prev) => ({ ...prev, [holdingId]: result }));
      if (!dryRun) await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Senkronizasyon başarısız oldu');
    } finally {
      setBusyHoldingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/dashboard" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '4px 0 0 0' }}>Veri Kaynakları / Google Drive Senkronizasyonu</h1>
          </div>
          <button
            onClick={handleRefreshRegistry}
            disabled={refreshingRegistry || !googleEnabled}
            style={{
              padding: '10px 18px',
              backgroundColor: googleEnabled ? '#1a1a1a' : '#e5e5e5',
              color: googleEnabled ? 'white' : '#999',
              border: 'none',
              borderRadius: '6px',
              cursor: googleEnabled ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {refreshingRegistry ? 'Yenileniyor...' : 'Master Registry\'yi Yenile'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {!googleEnabled && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #d97706', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              <strong>Google entegrasyonu devre dışı.</strong> {disabledReason ?? 'GOOGLE_DRIVE_ENABLED ve GOOGLE_SERVICE_ACCOUNT_JSON ortam değişkenlerini tanımlayın.'}
              {' '}Ayrıntılar için <code>docs/GOOGLE_DRIVE_DATA_PIPELINE.md</code> dosyasına bakın.
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fee2e2', borderRadius: '8px', borderLeft: '4px solid #dc2626', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>{error}</p>
          </div>
        )}

        {holdings.length === 0 ? (
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#666' }}>
              Henüz kayıtlı holding yok. Master Registry sayfasına bir holding satırı ekleyip &quot;Master Registry&apos;yi Yenile&quot; butonuna basın.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {holdings.map((holding) => (
              <HoldingCard
                key={holding.id}
                holding={holding}
                busy={busyHoldingId === holding.holdingId}
                disabled={!googleEnabled || busyHoldingId !== null}
                result={results[holding.holdingId]}
                onPreview={() => handleAction(holding.holdingId, true)}
                onSync={() => handleAction(holding.holdingId, false)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function HoldingCard({
  holding,
  busy,
  disabled,
  result,
  onPreview,
  onSync,
}: {
  holding: HoldingRegistryRow;
  busy: boolean;
  disabled: boolean;
  result?: SyncResult;
  onPreview: () => void;
  onSync: () => void;
}) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{holding.holdingName}</h3>
            <Badge tone={holding.syncEnabled ? 'green' : 'gray'}>{holding.syncEnabled ? 'Sync Açık' : 'Sync Kapalı'}</Badge>
            {holding.entity && <Badge tone="blue">Yayında bir profil var</Badge>}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{holding.holdingId}</p>
          {holding.spreadsheetUrl && (
            <a href={holding.spreadsheetUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#0284c7' }}>
              Google Sheet&apos;i aç ↗
            </a>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onPreview}
            disabled={disabled || !holding.syncEnabled || !holding.spreadsheetId}
            style={buttonStyle(false)}
          >
            {busy ? '...' : 'Önizle (Dry Run)'}
          </button>
          <button
            onClick={onSync}
            disabled={disabled || !holding.syncEnabled || !holding.spreadsheetId}
            style={buttonStyle(true)}
          >
            {busy ? '...' : 'Şimdi Senkronize Et'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '13px', color: '#666' }}>
        <span>Araştırma durumu: <strong>{holding.researchStatus ?? '—'}</strong></span>
        <span>Son senkron: <strong>{holding.lastSyncAt ? new Date(holding.lastSyncAt).toLocaleString('tr-TR') : 'Hiç'}</strong></span>
        <span>Son sonuç: <strong>{holding.lastSyncStatus ?? '—'}</strong></span>
      </div>

      {result && <SyncResultPanel result={result} />}
    </div>
  );
}

function SyncResultPanel({ result }: { result: SyncResult }) {
  const c = result.counts;
  return (
    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9f8f6', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>
        {result.dryRun ? 'Önizleme Sonucu' : 'Senkronizasyon Sonucu'} ({result.status})
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <Stat label="Toplam Satır" value={c.rowCount} />
        <Stat label="Yeni" value={c.createCount} tone="green" />
        <Stat label="Güncellenen" value={c.updateCount} tone="blue" />
        <Stat label="Değişmeyen" value={c.unchangedCount} />
        <Stat label="Kaynakta Yok" value={c.missingFromSourceCount} tone="amber" />
        <Stat label="Reddedilen" value={c.rejectedCount} tone="red" />
        <Stat label="Çözülemeyen Ref." value={c.unresolvedReferenceCount} tone="red" />
        <Stat label="Uyarı" value={c.warningCount} tone="amber" />
      </div>

      {result.tabsMissing.length > 0 && (
        <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>
          Bulunamayan sekmeler: {result.tabsMissing.join(', ')}
        </p>
      )}

      {result.rows.some((r) => r.errors?.length || r.warnings?.length) && (
        <details>
          <summary style={{ fontSize: '12px', color: '#666', cursor: 'pointer' }}>Satır bazlı hata/uyarılar</summary>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#666' }}>
            {result.rows
              .filter((r) => r.errors?.length || r.warnings?.length)
              .slice(0, 50)
              .map((r, i) => (
                <li key={i}>
                  <strong>{r.sheetName}</strong> satır {r.rowNumber} ({r.externalId ?? 'external_id yok'}): {[...(r.errors ?? []), ...(r.warnings ?? [])].join('; ')}
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'green' | 'blue' | 'amber' | 'red' }) {
  const colors: Record<string, string> = { green: '#059669', blue: '#0284c7', amber: '#d97706', red: '#dc2626' };
  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: tone ? colors[tone] : '#1a1a1a' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#999' }}>{label}</div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'gray' | 'blue' }) {
  const styles: Record<string, { bg: string; color: string }> = {
    green: { bg: '#dcfce7', color: '#166534' },
    gray: { bg: '#f3f4f6', color: '#666' },
    blue: { bg: '#dbeafe', color: '#1e40af' },
  };
  const s = styles[tone];
  return (
    <span style={{ padding: '3px 8px', backgroundColor: s.bg, color: s.color, borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
      {children}
    </span>
  );
}

function buttonStyle(primary: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    backgroundColor: primary ? '#dc2626' : 'white',
    color: primary ? 'white' : '#1a1a1a',
    border: primary ? 'none' : '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  };
}
