'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalEntities: number;
  totalRelations: number;
  totalSources: number;
  pendingReview: number;
  publishedToday: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEntities: 0,
    totalRelations: 0,
    totalSources: 0,
    pendingReview: 0,
    publishedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // TODO: Fetch real stats from API
    // For now, set mock data
    setStats({
      totalEntities: 42,
      totalRelations: 156,
      totalSources: 89,
      pendingReview: 5,
      publishedToday: 3,
    });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Umut-Sen Admin</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Dashboard</h2>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <StatCard title="Toplam Varlık" value={stats.totalEntities} />
          <StatCard title="Toplam İlişki" value={stats.totalRelations} />
          <StatCard title="Toplam Kaynak" value={stats.totalSources} />
          <StatCard title="İncelemeyi Bekleyen" value={stats.pendingReview} highlight />
          <StatCard title="Bugün Yayınlanan" value={stats.publishedToday} />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Hızlı İşlemler</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <ActionButton href="/dashboard/entities" label="Varlıkları Yönet" />
            <ActionButton href="/dashboard/relations" label="İlişkileri Yönet" />
            <ActionButton href="/dashboard/sources" label="Kaynakları Yönet" />
            <ActionButton href="/dashboard/verification" label="Doğrulama Merkezi" />
            <ActionButton href="/dashboard/import" label="İçe Aktarma" />
            <ActionButton href="/dashboard/users" label="Kullanıcıları Yönet" />
          </div>
        </div>

        {/* Info Box */}
        <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e' }}>
            <strong>💡 Not:</strong> Admin paneli geliştirilmektedir. Veritabanı işlemleri şu anda API üzerinden yapılmaktadır.
          </p>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  highlight?: boolean;
}

function StatCard({ title, value, highlight }: StatCardProps) {
  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: `1px solid ${highlight ? '#fecaca' : '#e5e5e5'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', fontWeight: '500' }}>{title}</p>
      <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: highlight ? '#dc2626' : '#1a1a1a' }}>{value}</p>
    </div>
  );
}

interface ActionButtonProps {
  href: string;
  label: string;
}

function ActionButton({ href, label }: ActionButtonProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '16px',
        backgroundColor: 'white',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#1a1a1a',
        fontWeight: '500',
        fontSize: '14px',
        textAlign: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
        (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
        (e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5';
      }}
    >
      {label}
    </Link>
  );
}
