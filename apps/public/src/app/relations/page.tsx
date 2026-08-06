'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Relation {
  id: string;
  sourceEntity?: { id: string; canonicalName: string };
  targetEntity?: { id: string; canonicalName: string };
  relationType?: { name: string };
  description?: string;
  createdAt: string;
}

export default function RelationsPage() {
  const router = useRouter();
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/v1/public/relations?limit=100');
        if (!response.ok) throw new Error('Failed to fetch relations');
        const data = await response.json();
        setRelations(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, []);

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
            <a href="/relations" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>İlişkiler</a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', color: '#1a1a1a' }}>
          Varlık İlişkileri ({relations.length})
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Yükleniyor...
          </div>
        ) : relations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ color: '#666', margin: 0 }}>İlişki bulunamadı</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f8f6', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Kaynak Varlık</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>İlişki Tipi</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>Hedef Varlık</th>
                </tr>
              </thead>
              <tbody>
                {relations.map((relation) => (
                  <tr key={relation.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      <Link
                        href={`/entity/${relation.sourceEntity?.id}`}
                        style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '500' }}
                      >
                        {relation.sourceEntity?.canonicalName || '-'}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#e5e5e5', borderRadius: '4px', fontSize: '12px' }}>
                        {relation.relationType?.name || 'İlişki'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px' }}>
                      <Link
                        href={`/entity/${relation.targetEntity?.id}`}
                        style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '500' }}
                      >
                        {relation.targetEntity?.canonicalName || '-'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2a2a2a', color: 'white', padding: '40px 20px', textAlign: 'center', fontSize: '14px', marginTop: '60px' }}>
        <p style={{ margin: 0 }}>Umut-Sen Platform © 2024</p>
      </footer>
    </div>
  );
}
