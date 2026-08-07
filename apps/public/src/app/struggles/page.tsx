'use client';

import { useEffect, useState } from 'react';

import { API_BASE_URL, IS_PREVIEW_MODE } from '../../lib/config';
import { DEMO_STRUGGLES } from '../../lib/demo-data';

interface Struggle {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  participants?: string;
  outcome?: string;
  tags: { tag: string }[];
}

const STRUGGLE_TYPES = {
  worker_resistance: { label: 'İşçi Direniş', color: '#dc2626' },
  union_pressure: { label: 'Sendikal Baskı', color: '#f59e0b' },
  wage_theft: { label: 'Ücret Gasp', color: '#ef4444' },
  workplace_death: { label: 'İş Cinayeti', color: '#991b1b' },
  forced_expropriation: { label: 'Zorunlu Kamulaştırma', color: '#7c3aed' },
  mining_project: { label: 'Madencilik Karşıtı', color: '#78716c' },
  energy_project: { label: 'Enerji Projesi Karşıtı', color: '#10b981' },
  ecological_battle: { label: 'Ekoloji Mücadelesi', color: '#059669' },
  land_struggle: { label: 'Arazi Mücadelesi', color: '#d97706' },
  other: { label: 'Diğer', color: '#6b7280' },
};

export default function StrugglesPage() {
  const [struggles, setStruggles] = useState<Struggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStruggles();
  }, []);

  const fetchStruggles = async () => {
    if (IS_PREVIEW_MODE) {
      setStruggles([...DEMO_STRUGGLES]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/public/struggles`);
      if (response.ok) {
        const data = await response.json();
        setStruggles(data);
      }
    } catch (err) {
      console.error('Mücadeleler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStruggles = struggles.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || s.type === selectedType;
    return matchesSearch && matchesType;
  });

  const groupedByType = Object.entries(STRUGGLE_TYPES).reduce((acc, [type, info]) => {
    const count = struggles.filter(s => s.type === type).length;
    if (count > 0) {
      acc[type] = { ...info, count };
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px', position: 'relative', zIndex: 20 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: '700', textDecoration: 'none', color: '#1a1a1a' }}>
            Düşmanı Tanı Ablukayı Dağıt
          </a>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>Anasayfa</a>
            <a href="/entities" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>Varlıklar</a>
            <a href="/relations" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>İlişkiler</a>
            <a href="/struggles" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Mücadeleler</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
            Direniş Haritası
          </h1>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            İşçi direniş, sendikal örgütlenme, ekoloji mücadelesi ve halk hareketlerinin kapsamlı arşivi
          </p>

          {/* Search */}
          <div style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Mücadele, konum, açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}>
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tags */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedType('')}
              style={{
                padding: '8px 16px',
                backgroundColor: !selectedType ? '#dc2626' : 'white',
                color: !selectedType ? 'white' : '#1a1a1a',
                border: `1px solid ${!selectedType ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Tümü ({struggles.length})
            </button>
            {Object.entries(groupedByType).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedType === type ? info.color : 'white',
                  color: selectedType === type ? 'white' : info.color,
                  border: `1px solid ${info.color}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {info.label} ({info.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Mücadeleler yükleniyor...
            </div>
          ) : filteredStruggles.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '60px 40px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              textAlign: 'center',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
                Mücadele Kaydı Bulunamadı
              </h2>
              <p style={{ color: '#666', margin: 0 }}>
                Arama kriterlerinize uygun bir mücadele kaydı bulunamadı.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {filteredStruggles.map((struggle) => {
                const typeInfo = STRUGGLE_TYPES[struggle.type as keyof typeof STRUGGLE_TYPES] || STRUGGLE_TYPES.other;
                const startDate = struggle.startDate ? new Date(struggle.startDate).toLocaleDateString('tr-TR') : '';
                const endDate = struggle.endDate ? new Date(struggle.endDate).toLocaleDateString('tr-TR') : '';

                return (
                  <a
                    key={struggle.id}
                    href={`/struggles/${struggle.slug}`}
                    style={{
                      background: 'white',
                      border: `1px solid #e5e5e5`,
                      borderRadius: '8px',
                      padding: '20px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      (e.currentTarget as HTMLElement).style.borderColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                      (e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5';
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      width: 'fit-content',
                      padding: '4px 8px',
                      backgroundColor: typeInfo.color + '20',
                      color: typeInfo.color,
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '12px',
                    }}>
                      {typeInfo.label}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px', color: '#1a1a1a' }}>
                      {struggle.title}
                    </h3>

                    {struggle.description && (
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px', lineHeight: '1.5' }}>
                        {struggle.description.substring(0, 120)}...
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                      {struggle.location && (
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                          📍 {struggle.location}
                        </div>
                      )}
                      {startDate && (
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                          📅 {startDate}
                          {endDate && ` - ${endDate}`}
                        </div>
                      )}
                      {struggle.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {struggle.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.tag}
                              style={{
                                fontSize: '11px',
                                backgroundColor: '#f3f4f6',
                                color: '#666',
                                padding: '2px 6px',
                                borderRadius: '3px',
                              }}
                            >
                              {tag.tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2a2a2a', color: 'white', padding: '40px 20px', textAlign: 'center', fontSize: '14px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 20px' }}>
            Düşmanı Tanı Ablukayı Dağıt © 2024. Halkın bilgilendirilmesi için.
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Gizlilik</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Kullanım Şartları</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>İletişim</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Katkıda Bulun</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
