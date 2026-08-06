'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Entity {
  id: string;
  canonicalName: string;
  description?: string;
  entityType?: { name: string };
  createdAt: string;
}

export default function EntitiesPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/v1/public/entities?limit=100');
        if (!response.ok) throw new Error('Failed to fetch entities');
        const data = await response.json();
        setEntities(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const filteredEntities = query
    ? entities.filter(e =>
        e.canonicalName.toLowerCase().includes(query.toLowerCase())
      )
    : entities;

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
            <a href="/entities" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Varlıklar</a>
            <a href="/relations" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>İlişkiler</a>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '24px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Varlık ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Ara
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', color: '#1a1a1a' }}>
          Tüm Varlıklar ({filteredEntities.length})
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Yükleniyor...
          </div>
        ) : filteredEntities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ color: '#666', margin: 0 }}>Varlık bulunamadı</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredEntities.map((entity) => (
              <Link
                key={entity.id}
                href={`/entity/${entity.id}`}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#1a1a1a' }}>
                  {entity.canonicalName}
                </h3>
                {entity.entityType && (
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                    {entity.entityType.name}
                  </div>
                )}
                {entity.description && (
                  <p style={{ fontSize: '14px', color: '#666', margin: '0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {entity.description}
                  </p>
                )}
              </Link>
            ))}
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
