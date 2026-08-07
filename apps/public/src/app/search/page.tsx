'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface SearchResult {
  id: string;
  type: 'entity' | 'relation' | 'source';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }} />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(q);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/v1/public/search?q=${encodeURIComponent(q)}`,
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: '700', textDecoration: 'none', color: '#1a1a1a' }}>
            Umut-Sen Platform
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Anasayfa
            </a>
            <a href="/entities" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>
              Varlıklar
            </a>
            <a href="/relations" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>
              İlişkiler
            </a>
          </div>
        </div>
      </nav>

      {/* Search Form */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '24px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ara..."
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

      {/* Results */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666' }}>Aranıyor...</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ color: '#666', margin: 0 }}>
              "{q}" için sonuç bulunamadı.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1a1a1a' }}>
              {results.length} sonuç bulundu
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((result) => (
                <div
                  key={result.id}
                  style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e5e5',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <Link
                    href={`/${result.type}/${result.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                          {result.title}
                        </h3>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor:
                            result.type === 'entity' ? '#dbeafe' :
                            result.type === 'relation' ? '#dcfce7' : '#fef3c7',
                          color:
                            result.type === 'entity' ? '#1e40af' :
                            result.type === 'relation' ? '#166534' : '#92400e',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}>
                          {result.type === 'entity' ? 'Varlık' :
                           result.type === 'relation' ? 'İlişki' : 'Kaynak'}
                        </span>
                      </div>
                      {result.description && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                          {result.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
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
