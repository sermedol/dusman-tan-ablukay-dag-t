'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // TODO: Fetch real pending items from API
    setItems([
      {
        id: '1',
        canonicalName: 'Demo Holding A',
        summary: 'Test holding for demo purposes',
        createdAt: new Date().toISOString(),
        sourceCount: 1,
        type: 'entity',
      },
      {
        id: '2',
        canonicalName: 'Demo Company B → Demo Holding A',
        summary: 'Ownership relation',
        createdAt: new Date().toISOString(),
        sourceCount: 1,
        type: 'relation',
      },
    ]);
    setLoading(false);
  }, [router]);

  const handleApprove = async (id: string) => {
    // TODO: Call API to approve
    console.log('Approved:', id);
  };

  const handleReject = async (id: string) => {
    // TODO: Call API to reject
    console.log('Rejected:', id);
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
            Panele Dön
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #e5e5e5' }}>
          <button
            onClick={() => setActiveTab('entity')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'entity' ? '#dc2626' : 'transparent',
              color: activeTab === 'entity' ? 'white' : '#1a1a1a',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: activeTab === 'entity' ? 'none' : '2px solid transparent',
            }}
          >
            Varlıklar ({items.filter((i) => i.type === 'entity').length})
          </button>
          <button
            onClick={() => setActiveTab('relation')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'relation' ? '#dc2626' : 'transparent',
              color: activeTab === 'relation' ? 'white' : '#1a1a1a',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: activeTab === 'relation' ? 'none' : '2px solid transparent',
            }}
          >
            İlişkiler ({items.filter((i) => i.type === 'relation').length})
          </button>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              🎉 Tamamlandı! Doğrulanmayı bekleyen hiçbir öğe yok.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '16px',
                  alignItems: 'start',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                    {item.canonicalName || 'İlişki'}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                    {item.summary || 'Açıklama yok'}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999' }}>
                    <span>📅 {new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                    <span>📄 {item.sourceCount} kaynak</span>
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
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
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
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
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
