'use client';

import Link from 'next/link';

export default function StrugglePage() {
  const struggles = [
    {
      id: '1',
      title: 'Soma Maden Katliamı',
      date: '2014-05-13',
      description: 'Soma kömür madeninde meydana gelen ve 301 işçinin hayatını kaybetmesine neden olan büyük endüstri trajedisi.',
      relatedEntities: 3,
    },
    {
      id: '2',
      title: 'Gezi Park Protestoları',
      date: '2013-05-28',
      description: 'İstanbul Gezi Parkı projesine karşı başlayan ve geniş kitlelere yayılan direniş hareketi.',
      relatedEntities: 12,
    },
    {
      id: '3',
      title: 'Dersim Işçileri Direnişi',
      date: '2021-03-15',
      description: 'Dersim Bakır İşletmeleri\'nde çalışan işçilerin iyileştirilmiş iş koşulları için başlattığı direniş.',
      relatedEntities: 5,
    },
  ];

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
            <a href="/struggles" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Mücadeleler</a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
          İşçi Mücadeleleği
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
          Türkiye\'deki işçi direnişleri, grevler ve sosyal hareketlerin belgelenmesi ve analizi.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {struggles.map((struggle) => (
            <div
              key={struggle.id}
              style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  {new Date(struggle.date).toLocaleDateString('tr-TR')}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#1a1a1a' }}>
                  {struggle.title}
                </h3>
              </div>

              <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
                {struggle.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {struggle.relatedEntities} ilişkili varlık
                </span>
                <button
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  Detay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{ marginTop: '60px', padding: '24px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
            Mücadeleler Bölümü Genişletiliyor
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.6' }}>
            Türkiye\'deki işçi direniş ve sosyal hareketlerin kapsamlı veritabanı inşa edilmektedir.
            Her mücadele hakkında detaylı bilgi, kaynaklar ve bağlantılı varlıklar yakında eklenecektir.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2a2a2a', color: 'white', padding: '40px 20px', textAlign: 'center', fontSize: '14px', marginTop: '60px' }}>
        <p style={{ margin: 0 }}>Umut-Sen Platform © 2024</p>
      </footer>
    </div>
  );
}
