'use client';

import { useEffect, useState } from 'react';

interface Struggle {
  id: string;
  title: string;
  type: string;
  status: string;
  visibility: string;
  startDate?: string;
  location?: string;
  createdAt: string;
}

interface CreateStruggleForm {
  title: string;
  type: string;
  status: string;
  visibility: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

const STRUGGLE_TYPES = [
  { value: 'worker_resistance', label: 'İşçi Direniş' },
  { value: 'union_pressure', label: 'Sendikal Baskı' },
  { value: 'wage_theft', label: 'Ücret Gasp' },
  { value: 'workplace_death', label: 'İş Cinayeti' },
  { value: 'forced_expropriation', label: 'Zorunlu Kamulaştırma' },
  { value: 'mining_project', label: 'Madencilik Karşıtı' },
  { value: 'energy_project', label: 'Enerji Projesi Karşıtı' },
  { value: 'ecological_battle', label: 'Ekoloji Mücadelesi' },
  { value: 'land_struggle', label: 'Arazi Mücadelesi' },
  { value: 'other', label: 'Diğer' },
];

const STATUSES = [
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'ongoing', label: 'Devam Ediyor' },
  { value: 'historical', label: 'Tarihi' },
];

const VISIBILITIES = [
  { value: 'public', label: 'Halk Açık' },
  { value: 'internal', label: 'İç' },
  { value: 'private', label: 'Özel' },
];

export default function StrugglesPage() {
  const [struggles, setStruggles] = useState<Struggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<CreateStruggleForm>({
    title: '',
    type: 'worker_resistance',
    status: 'active',
    visibility: 'internal',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  });

  useEffect(() => {
    fetchStruggles();
  }, []);

  const fetchStruggles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/v1/struggles');
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
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || s.type === filterType;
    const matchesStatus = !filterStatus || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `http://localhost:3001/api/v1/struggles/${editingId}`
        : 'http://localhost:3001/api/v1/struggles';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          type: 'worker_resistance',
          status: 'active',
          visibility: 'internal',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
        });
        fetchStruggles();
      }
    } catch (err) {
      console.error('İşlem başarısız:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mücadele kaydını silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/v1/struggles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStruggles();
      }
    } catch (err) {
      console.error('Silme işlemi başarısız:', err);
    }
  };

  const handleEdit = (struggle: Struggle) => {
    setFormData({
      title: struggle.title,
      type: struggle.type,
      status: struggle.status,
      visibility: struggle.visibility,
      description: '',
      startDate: struggle.startDate || '',
      endDate: '',
      location: struggle.location || '',
    });
    setEditingId(struggle.id);
    setShowForm(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
            Mücadeleler & Direniş
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                title: '',
                type: 'worker_resistance',
                status: 'active',
                visibility: 'internal',
                description: '',
                startDate: '',
                endDate: '',
                location: '',
              });
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {showForm && !editingId ? 'İptal' : '+ Yeni Mücadele'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>
              {editingId ? 'Mücadele Güncelle' : 'Yeni Mücadele Ekle'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                    Başlık *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                    Tür *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {STRUGGLE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                    Durum
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                    Görünürlük
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {VISIBILITIES.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                  Konum
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Şehir, ilçe veya tesis adı"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1a1a1a' }}>
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mücadelenin detaylı açıklaması..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {editingId ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e5e5e5',
                    color: '#1a1a1a',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e5e5',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '12px',
        }}>
          <input
            type="text"
            placeholder="Başlıkta ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="">Tüm Türler</option>
            {STRUGGLE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="">Tüm Durumlar</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div style={{ color: '#666', fontSize: '14px', padding: '10px' }}>
            {filteredStruggles.length} mücadele bulundu
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Yükleniyor...
          </div>
        ) : filteredStruggles.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            textAlign: 'center',
            color: '#666',
          }}>
            Mücadele kaydı bulunamadı
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f8f6', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                    Başlık
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                    Tür
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                    Durum
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                    Konum
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStruggles.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '12px', color: '#1a1a1a', fontSize: '14px' }}>
                      {s.title}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                      {STRUGGLE_TYPES.find(t => t.value === s.type)?.label || s.type}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: s.status === 'active' ? '#dcfce7' : '#f3f4f6',
                        color: s.status === 'active' ? '#166534' : '#374151',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        {STATUSES.find(st => st.value === s.status)?.label || s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                      {s.location || '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      <button
                        onClick={() => handleEdit(s)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '8px',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#991b1b',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
