'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Entity {
  id: string;
  canonicalName: string;
  slug: string;
  entityTypeId: string;
  entityType?: { name: string };
  description?: string;
  visibility: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function EntitiesPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'internal' | 'public'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    canonicalName: '',
    description: '',
    entityTypeId: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchEntities();
  }, [router]);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/entities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch entities');
      const data = await response.json();
      setEntities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = editingId
        ? `http://localhost:3001/api/v1/entities/${editingId}`
        : 'http://localhost:3001/api/v1/entities';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save entity');

      setShowForm(false);
      setEditingId(null);
      setFormData({ canonicalName: '', description: '', entityTypeId: '' });
      await fetchEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleEdit = (entity: Entity) => {
    setFormData({
      canonicalName: entity.canonicalName,
      description: entity.description || '',
      entityTypeId: entity.entityTypeId,
    });
    setEditingId(entity.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bunu silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/v1/entities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete entity');
      await fetchEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Yükleniyor...</div>;
  }

  const filteredEntities = filter === 'all'
    ? entities
    : entities.filter(e => e.visibility === filter);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Varlıklar</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) setEditingId(null);
              }}
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
              + Yeni Varlık
            </button>
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
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '32px', border: '1px solid #e5e5e5' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>{editingId ? 'Varlığı Düzenle' : 'Yeni Varlık Oluştur'}</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.canonicalName}
                  onChange={(e) => setFormData({ ...formData, canonicalName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ canonicalName: '', description: '', entityTypeId: '' });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {(['all', 'draft', 'internal', 'public'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === f ? '#dc2626' : '#f3f4f6',
                color: filter === f ? 'white' : '#1a1a1a',
                border: filter === f ? 'none' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {f === 'all' ? 'Tümü' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {filteredEntities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Varlık bulunamadı
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f8f6', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Adı</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Tür</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Durum</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Görünürlük</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((entity) => (
                  <tr key={entity.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{entity.canonicalName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{entity.entityType?.name || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px' }}>
                        {entity.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '12px' }}>
                        {entity.visibility}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(entity)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(entity.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
