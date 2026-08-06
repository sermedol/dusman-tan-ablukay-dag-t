# Umut-Sen Platform — Ürün Kapsamı

## Proje Tanımı

**"Düşmanı Tanı, Ablukayı Dağıt!"**

Türkiye'deki sermaye gruplarını, bağlı şirketleri, tesisleri, finans ilişkilerini, kamu bağlantılarını, ihaleleri, projeleri, sendikaları, işçi direnişlerini, iş cinayetlerini, davaları, ekoloji mücadelelerini ve bunlara dayanak oluşturan belgeleri **tek bir veri sistemi içinde ilişkilendiren** araştırma, haritalandırma ve ilişki analizi platformu.

## Hedef Kitle

1. **Ziyaretçi** — Üyelik olmadan araştırma, harita keşfi, kaynak görüntüleme
2. **Araştırmacı** — Taslak oluşturma, kaynak ekleme, değişiklik önerme
3. **Doğrulayıcı/Editör** — Taslak inceleme, onay, ilişki düzeltme
4. **Yönetici** — Kullanıcı yönetimi, sistem ayarları, toplu işlemler

## Temel İlkeler

1. **Anlaşılabilirlik** — Kullanıcı 10 saniyede ne yapabileceğini anlayabilmelidir
2. **Bağlantı** — Hiçbir holding içine kilitlenmemeli; ağ özgürce gezilebilmeli
3. **Aşama** — En az bir kaynağa bağlı olmayan bilgi yayımlanmamalıdır
4. **Tarih** — Her ilişki yönlü, türü belirli ve tarih aralığına sahip olabilir
5. **Sadelik** — Veri yapısı karmaşık olsa bile arayüz sade olmalıdır
6. **Taşınabilirlik** — Sistem başka altyapıya kısa sürede taşınabilir olmalıdır

## Ana Özellikler

### Halka Açık (Public)
- **Arama** — Türkçe karakter, alias, yazım hatası toleransı
- **Harita** — MapLibre GL, cluster, filtreler, URL durumu
- **İlişki Ağı** — Sigma.js, kademeli yükleme, en kısa yol
- **Varlık Profilleri** — Holding, şirket, kamu kurumu, banka, sendika, vs.
- **Mücadeleler** — Liste, kart, harita, zaman çizelgesi görünümleri
- **Belgeler** — PDF, görsel, video, arşiv kaynakları
- **İstatistikler** — Açık veri kataloğu, metrikler

### Admin Paneli
- Varlık ve ilişki düzenleme
- Kaynak yönetimi
- Doğrulama akışı (inceleme → onay → yayın)
- CSV/XLSX/JSON içe aktarma
- Google Drive senkronizasyonu
- Kullanıcı ve rol yönetimi
- Taksonomileri yönetme

## Kullanım Akışı Örneği

```
Holding
  ↓
Bağlı Şirket
  ↓
Fabrika/Proje
  ↓
Ana Yüklenici
  ↓
Taşeron
  ↓
Kamu İhalesi
  ↓
İhaleyi Veren Kurum
  ↓
Finansman Sağlayan Banka
  ↓
İşçi Direnişi
  ↓
Dava
  ↓
Resmî Belge (kaynak)
```

## Veri Tabanı Modeli — Üst Düzey

```
Entity (Varlık)
├─ EntityType (Holding, Şirket, Kurum, Banka, Sendika, vs.)
├─ EntityAlias (Eski isimler, kısaltmalar, ticari adlar)
├─ Source (Belge, haber, resmi kayıt)
├─ Location (Konum)
└─ Revision (Geçmiş sürümleri)

Relation (İlişki)
├─ RelationType (owns, works_for, financed_by, protested_against, vs.)
├─ Source (Kanıt)
└─ Revision

Evidence (Kanıt Bağlantısı)
├─ Entity ↔ Source
└─ Relation ↔ Source
```

## Yayın Akışı

```
Draft → Submitted → Under Review
    ↓
    └─ Changes Requested → Revised → Submitted
    
Approved → Published
    ↓
    └─ Unpublished (gerekirse)
```

**Kural:** Kayıt en az bir kaynağa bağlı olmadan yayımlanamaz.

## Erişim Sürekliliği ve Taşınabilirlik

Platform tek sağlayıcıya, tek domain'e, tek veri giriş yöntemine bağımlı değildir:

- **Kod** — Git repository bundle
- **Veri** — PostgreSQL dump + export paketleri
- **Dosyalar** — Object storage (S3-uyumlu)
- **Yapılandırma** — Ortam değişkenleri ve dosyaları
- **Yedekler** — Farklı sağlayıcılarda

**Hedef:** Yeni sunucuda `pnpm platform:restore` komutuyla sistem kurulabilir.

## Veri Giriş Kaynakları

1. **Admin Paneli** — Manuel form girişi
2. **Excel/XLSX/CSV** — Toplu import
3. **Google Drive** — Otomatik senkronizasyon
4. **API** — Programlı giriş

Tüm kaynaklar aynı doğrulama ve yayın akışına girer; doğrudan veritabanına yazmazlar.

## Faz Planı

| Faz | Odak | Çıktı |
|-----|------|-------|
| 0 | Teknik Temel | Monorepo, Docker, CI, logging |
| 1 | Veri Omurgası | Entity, Relation, Source, RBAC |
| 2 | Admin MVP | Giriş, oluşturma, doğrulama, yayın |
| 3 | Public MVP | Arama, profil, mücadeleler |
| 4 | Harita | MapLibre, PostGIS, cluster |
| 5 | İlişki Ağı | Sigma.js, kademeli yükleme |
| 6 | İçe Aktarma | XLSX/CSV/Drive import |
| 7 | Sertleştirme | Güvenlik, a11y, perf, deployment |

## Başarı Ölçütleri

- Lighthouse ≥ 90 (performance)
- WCAG 2.2 AA uyum
- LCP < 2.5s, CLS < 0.1, INP < 200ms
- Kritik E2E testler çalışıyor
- Platform taşıma paketi çalışıyor
- README ile `pnpm dev` komutuyla başlatılabiliyor
