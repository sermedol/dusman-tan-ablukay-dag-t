'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ImportBatch {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ImportRow {
  id: string;
  batchId: string;
  rowNumber: number;
  data: Record<string, any>;
  status: 'pending' | 'processed' | 'error';
  errorMessage?: string;
  createdAt: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchBatches();
  }, [router]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/imports', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchRows = async (batchId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/v1/imports/${batchId}/rows`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch batch rows');
      const data = await response.json();
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleBatchSelect = async (batch: ImportBatch) => {
    setSelectedBatch(batch);
    await fetchBatchRows(batch.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/v1/imports/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');
      setFile(null);
      await fetchBatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f8f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Veri İçeri Aktar</h1>
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
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Upload Form */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '32px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ margin: '0 0 20px 0' }}>Dosya Yükle</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                CSV veya Excel Dosyası (.csv, .xlsx) *
              </label>
              <input
                type="file"
                required
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                Desteklenen formatlar: CSV, Excel (.xlsx, .xls)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={!file || uploading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? 'Yükleniyor...' : 'Yükle'}
              </button>
            </div>
          </form>
        </div>

        {/* Batches List */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e5e5' }}>
            <h2 style={{ margin: 0 }}>İçeri Aktarma Geçmişi</h2>
          </div>

          {batches.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
              Henüz aktarılan dosya yok
            </div>
          ) : (
            <div style={{ overflow: 'x-auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f8f6', borderBottom: '1px solid #e5e5e5' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Dosya Adı</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Durum</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>Satırlar</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>Başarılı</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>Hata</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Tarih</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{batch.filename}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor:
                            batch.status === 'completed' ? '#dcfce7' :
                            batch.status === 'failed' ? '#fee2e2' :
                            '#fef3c7',
                          color:
                            batch.status === 'completed' ? '#166534' :
                            batch.status === 'failed' ? '#991b1b' :
                            '#92400e',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}>
                          {batch.status === 'completed' ? 'Tamamlandı' :
                           batch.status === 'failed' ? 'Başarısız' :
                           batch.status === 'processing' ? 'İşleniyor' : 'Beklemede'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px' }}>
                        {batch.totalRows}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#166534' }}>
                        {batch.successCount}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#991b1b' }}>
                        {batch.errorCount}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {new Date(batch.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleBatchSelect(batch)}
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
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Batch Details */}
        {selectedBatch && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5', marginTop: '32px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{selectedBatch.filename} - Ayrıntılar</h2>
              <button
                onClick={() => {
                  setSelectedBatch(null);
                  setRows([]);
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Kapat
              </button>
            </div>

            {rows.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                Satır bulunamadı
              </div>
            ) : (
              <div style={{ overflow: 'x-auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f8f6', borderBottom: '1px solid #e5e5e5' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Satır</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Durum</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Hata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{row.rowNumber}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor:
                              row.status === 'processed' ? '#dcfce7' :
                              row.status === 'error' ? '#fee2e2' : '#fef3c7',
                            color:
                              row.status === 'processed' ? '#166534' :
                              row.status === 'error' ? '#991b1b' : '#92400e',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}>
                            {row.status === 'processed' ? 'İşlendi' :
                             row.status === 'error' ? 'Hata' : 'Beklemede'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666' }}>
                          {row.errorMessage || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
