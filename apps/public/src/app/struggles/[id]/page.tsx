'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StruggleDetail {
  id: string;
  title: string;
  slug: string;
  description?: string;
  summary?: string;
  type: string;
  status: string;
  visibility: string;
  verificationStatus: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  participants?: string;
  outcome?: string;
  lessons?: string;
  tags: { tag: string }[];
  sourceEvidence: Array<{
    id: string;
    excerpt?: string;
    pageNumber?: number;
    notes?: string;
    source?: {
      id: string;
      title: string;
      type: string;
      url?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { name: string };
  updatedByUser?: { name: string };
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

const STATUS_LABELS = {
  active: { label: 'Devam Ediyor', color: '#10b981' },
  completed: { label: 'Tamamlandı', color: '#6b7280' },
  ongoing: { label: 'Süregelen', color: '#f59e0b' },
  historical: { label: 'Tarihi', color: '#8b5cf6' },
};

const VERIFICATION_LABELS = {
  unverified: { label: 'Doğrulanmamış', color: '#ef4444' },
  verified: { label: 'Doğrulanmış', color: '#10b981' },
  needs_review: { label: 'İnceleme Gerekli', color: '#f59e0b' },
  source_required: { label: 'Kaynak Gerekli', color: '#f59e0b' },
  conflicting: { label: 'Çelişkili', color: '#ef4444' },
};

export default function StruggleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [struggle, setStruggle] = useState<StruggleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStruggle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/v1/public/struggles/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Mücadele kaydı bulunamadı');
          } else {
            setError('Mücadele yüklenirken hata oluştu');
          }
          return;
        }
        const data = await response.json();
        setStruggle(data);
      } catch (err) {
        console.error('Error fetching struggle:', err);
        setError('Mücadele yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStruggle();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ fontSize: '20px', fontWeight: '700', textDecoration: 'none', color: '#1a1a1a' }}>
              Düşmanı Tanı Ablukayı Dağıt
            </a>
          </div>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ color: '#666', fontSize: '16px' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !struggle) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px' }}>
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
              {error}
            </h2>
            <a
              href="/struggles"
              style={{
                display: 'inline-block',
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              Mücadeleler'e Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = STRUGGLE_TYPES[struggle.type as keyof typeof STRUGGLE_TYPES] || STRUGGLE_TYPES.other;
  const statusInfo = STATUS_LABELS[struggle.status as keyof typeof STATUS_LABELS] || STATUS_LABELS.active;
  const verificationInfo = VERIFICATION_LABELS[struggle.verificationStatus as keyof typeof VERIFICATION_LABELS] || VERIFICATION_LABELS.unverified;
  const startDate = struggle.startDate ? new Date(struggle.startDate).toLocaleDateString('tr-TR') : null;
  const endDate = struggle.endDate ? new Date(struggle.endDate).toLocaleDateString('tr-TR') : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px' }}>
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

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '24px' }}>
            <a href="/struggles" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px' }}>
              ← Mücadeleler'e Dön
            </a>
          </div>

          {/* Header */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: typeInfo.color + '20',
                  color: typeInfo.color,
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {typeInfo.label}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: statusInfo.color + '20',
                  color: statusInfo.color,
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {statusInfo.label}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: verificationInfo.color + '20',
                  color: verificationInfo.color,
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {verificationInfo.label}
              </div>
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 12px 0', color: '#1a1a1a', lineHeight: '1.3' }}>
              {struggle.title}
            </h1>

            {struggle.location && (
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
                📍 {struggle.location}
              </div>
            )}

            {startDate && (
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                📅 {startDate}
                {endDate && ` - ${endDate}`}
              </div>
            )}
          </div>

          {/* Description */}
          {struggle.description && (
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                Açıklama
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', margin: 0, whiteSpace: 'pre-wrap' }}>
                {struggle.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {struggle.participants && (
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Katılımcılar
                </h3>
                <p style={{ fontSize: '15px', color: '#1a1a1a', margin: 0, lineHeight: '1.6' }}>
                  {struggle.participants}
                </p>
              </div>
            )}

            {struggle.outcome && (
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sonuç
                </h3>
                <p style={{ fontSize: '15px', color: '#1a1a1a', margin: 0, lineHeight: '1.6' }}>
                  {struggle.outcome}
                </p>
              </div>
            )}
          </div>

          {struggle.lessons && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Dersleri
              </h3>
              <p style={{ fontSize: '15px', color: '#1a1a1a', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {struggle.lessons}
              </p>
            </div>
          )}

          {/* Tags */}
          {struggle.tags.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Etiketler
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {struggle.tags.map((tag) => (
                  <span
                    key={tag.tag}
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#666',
                      borderRadius: '20px',
                      fontSize: '13px',
                      border: '1px solid #e5e5e5',
                    }}
                  >
                    #{tag.tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Evidence */}
          {struggle.sourceEvidence && struggle.sourceEvidence.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                Kaynak Kanıtları ({struggle.sourceEvidence.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {struggle.sourceEvidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    style={{
                      borderLeft: '4px solid #dc2626',
                      paddingLeft: '16px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                    }}
                  >
                    {evidence.source && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                          Kaynak
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                          {evidence.source.title}
                        </div>
                        {evidence.source.type && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                            Tür: {evidence.source.type}
                          </div>
                        )}
                      </div>
                    )}

                    {evidence.excerpt && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                          Alıntı
                        </div>
                        <blockquote
                          style={{
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#333',
                            margin: '0',
                            padding: '8px 12px',
                            backgroundColor: '#f9f8f6',
                            borderRadius: '4px',
                            lineHeight: '1.6',
                          }}
                        >
                          "{evidence.excerpt}"
                        </blockquote>
                      </div>
                    )}

                    {evidence.pageNumber && (
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                        Sayfa: {evidence.pageNumber}
                      </div>
                    )}

                    {evidence.notes && (
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                        Notlar: {evidence.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div style={{ backgroundColor: 'white', padding: '16px 24px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px', color: '#999' }}>
            <div style={{ marginBottom: '8px' }}>
              Oluşturulma: {new Date(struggle.createdAt).toLocaleString('tr-TR')}
              {struggle.createdByUser && ` (${struggle.createdByUser.name})`}
            </div>
            <div>
              Son Güncelleme: {new Date(struggle.updatedAt).toLocaleString('tr-TR')}
              {struggle.updatedByUser && ` (${struggle.updatedByUser.name})`}
            </div>
          </div>
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
