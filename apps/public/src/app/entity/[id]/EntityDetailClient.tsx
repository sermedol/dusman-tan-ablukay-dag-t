'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { API_BASE_URL, IS_PREVIEW_MODE } from '../../../lib/config';
import { findDemoEntity } from '../../../lib/demo-data';

interface EntityProfile {
  id: string;
  canonicalName: string;
  slug: string;
  description?: string;
  entityType?: { name: string };
  sourceEvidence?: Array<{
    id: string;
    source?: {
      id: string;
      title: string;
      url: string;
    };
  }>;
  outgoingRelations?: Array<{
    id: string;
    targetEntity: {
      id: string;
      canonicalName: string;
    };
    relationType?: { name: string };
  }>;
  incomingRelations?: Array<{
    id: string;
    sourceEntity: {
      id: string;
      canonicalName: string;
    };
    relationType?: { name: string };
  }>;
}

export default function EntityDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (IS_PREVIEW_MODE) {
      const demo = findDemoEntity(id);
      setEntity({ ...demo, outgoingRelations: [], incomingRelations: [], sourceEvidence: [] });
      setLoading(false);
      return;
    }

    const fetchEntity = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/entities/${id}`);
        if (!response.ok) throw new Error('Entity not found');
        const data = await response.json();
        setEntity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666' }}>Yükleniyor...</p>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Bulunamadı</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error || 'Bu varlık bulunamadı.'}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Anasayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: '700', textDecoration: 'none', color: '#1a1a1a' }}>
            Umut-Sen
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>Anasayfa</a>
            <a href="/entities" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>Varlıklar</a>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dc2626',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: '700',
            }}>
              {entity.canonicalName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a' }}>
                {entity.canonicalName}
              </h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {entity.entityType && (
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: '#e5e5e5',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                    {entity.entityType.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {entity.description && (
            <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', margin: 0 }}>
              {entity.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Left Column */}
          <div>
            {/* Outgoing Relations */}
            {entity.outgoingRelations && entity.outgoingRelations.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                  Bağlantılar ({entity.outgoingRelations.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {entity.outgoingRelations.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/entity/${rel.targetEntity.id}`}
                      style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e5e5e5',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
                        {rel.targetEntity.canonicalName}
                      </div>
                      {rel.relationType && (
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {rel.relationType.name}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming Relations */}
            {entity.incomingRelations && entity.incomingRelations.length > 0 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                  Bağlanan Varlıklar ({entity.incomingRelations.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {entity.incomingRelations.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/entity/${rel.sourceEntity.id}`}
                      style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e5e5e5',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
                        {rel.sourceEntity.canonicalName}
                      </div>
                      {rel.relationType && (
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {rel.relationType.name}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Sources */}
            {entity.sourceEvidence && entity.sourceEvidence.length > 0 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
                  Kaynaklar ({entity.sourceEvidence.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {entity.sourceEvidence.map((evidence) => (
                    <a
                      key={evidence.id}
                      href={evidence.source?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e5e5e5',
                        textDecoration: 'none',
                        color: '#0066cc',
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {evidence.source?.title || 'Kaynak'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {evidence.source?.url}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2a2a2a', color: 'white', padding: '40px 20px', textAlign: 'center', fontSize: '14px', marginTop: '60px' }}>
        <p style={{ margin: 0 }}>Umut-Sen Platform © 2024</p>
      </footer>
    </div>
  );
}
