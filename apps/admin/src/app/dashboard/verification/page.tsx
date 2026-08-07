'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface PendingItem {
  id: string;
  canonicalName?: string;
  summary?: string;
  createdAt: string;
  sourceCount: number;
  type: 'entity' | 'relation';
}

export default function VerificationPage() {
  const router = useRouter();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entity' | 'relation'>('entity');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchPendingItems();
  }, [router]);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const [entities, relations] = await Promise.all([
        apiClient.get('/verification/entities/pending').catch(() => []),
        apiClient.get('/verification/relations/pending').catch(() => []),
      ]);

      const pendingItems: PendingItem[] = [
        ...((Array.isArray(entities) ? entities : []) as any[]).map((e: any) => ({
          id: e.id,
          canonicalName: e.canonicalName,
          summary: e.description || 'Açıklama yok',
          createdAt: e.createdAt,
          sourceCount: e.sourceEvidence?.length || 0,
          type: 'entity' as const,
        })),
        ...((Array.isArray(relations) ? relations : []) as any[]).map((r: any) => ({
          id: r.id,
          canonicalName: `${r.sourceEntity?.canonicalName} → ${r.targetEntity?.canonicalName}`,
          summary: r.description || 'Açıklama yok',
          createdAt: r.createdAt,
          sourceCount: r.sourceEvidence?.length || 0,
          type: 'relation' as const,
        })),
      ];

      setItems(pendingItems);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğeleri yüklerken hata oluştu';
      setError(message);
      console.error('Error fetching pending items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const endpoint = item.type === 'entity'
        ? `/verification/entities/${id}/verify`
        : `/verification/relations/${id}/verify`;

      await apiClient.post(endpoint, { approve: true });
      await fetchPendingItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onay hatası';
      setError(message);
      console.error('Error approving:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const endpoint = item.type === 'entity'
        ? `/verification/entities/${id}/verify`
        : `/verification/relations/${id}/verify`;

      await apiClient.post(endpoint, { approve: false });
      await fetchPendingItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reddetme hatası';
      setError(message);
      console.error('Error rejecting:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Yükleniyor...</div>;
  }

  const filteredItems = items.filter((item) => item.type === activeTab);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Doğrulama Merkezi</h1>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Geri
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 20px', marginBottom: '20px' }}>
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e5e5e5' }}>
          <button
            onClick={() => setActiveTab('entity')}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'entity' ? '2px solid #dc2626' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'entity' ? '600' : '400',
              color: activeTab === 'entity' ? '#dc2626' : '#666',
              backgroundColor: 'transparent',
            }}
          >
            Varlıklar ({items.filter(i => i.type === 'entity').length})
          </button>
          <button
            onClick={() => setActiveTab('relation')}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'relation' ? '2px solid #dc2626' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'relation' ? '600' : '400',
              color: activeTab === 'relation' ? '#dc2626' : '#666',
              backgroundColor: 'transparent',
            }}
          >
            İlişkiler ({items.filter(i => i.type === 'relation').length})
          </button>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            Doğrulanmaya beklenen {activeTab === 'entity' ? 'varlık' : 'ilişki'} yok.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {item.canonicalName}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
                    {item.summary}
                  </p>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    📅 {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                    {' • '}📎 {item.sourceCount} kaynak
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleApprove(item.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    ✓ Onayla
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    ✕ Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
