'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
            Düşmanı Tanı Ablukayı Dağıt
          </h1>
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
            <a href="/struggles" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '14px' }}>
              Mücadeleler
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 16px 0', color: '#1a1a1a', maxWidth: '700px' }}>
          Düşmanı Tanı, Ablukayı Dağıt
        </h2>
        <p style={{ fontSize: '18px', color: '#666', margin: '0 0 40px 0', maxWidth: '600px', lineHeight: '1.6' }}>
          Türkiye'de sermayenin gerçek yapısını, gücü nasıl örgütlendiğini ve direniş alanlarının nereye kadar uzandığını gösterir.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Bir varlık, kişi veya ilişki ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Ara
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          <button
            onClick={() => router.push('/entities')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            En Yeni Varlıklar
          </button>
          <button
            onClick={() => router.push('/relations')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            En Çok Bağlantı
          </button>
          <button
            onClick={() => router.push('/struggles')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Güncel Mücadeleler
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ backgroundColor: 'white', borderTop: '1px solid #e5e5e5', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '40px', textAlign: 'center' }}>
            Platform İstatistikleri
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
                1,247
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Varlık Profili</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
                3,891
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Doğrulanmış İlişki</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
                523
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Mücadele Kayıtları</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
                12K+
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Kaynak Kanıtı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2a2a2a', color: 'white', padding: '40px 20px', textAlign: 'center', fontSize: '14px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 20px 0' }}>
            Düşmanı Tanı Ablukayı Dağıt © 2024. Halkın bilgilendirilmesi için.
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Gizlilik</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Kullanım Şartları</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>İletişim</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Kaynak Göster</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
