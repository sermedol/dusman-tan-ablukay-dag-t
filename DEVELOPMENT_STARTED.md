# Düşmanı Tanı Ablukayı Dağıt - Proje Başlangıcı

**Tarih:** 6 Ağustos 2026  
**Versiyon:** 1.0 Alpha - Struggle System  
**Durum:** 🟡 Development Started

## 🎯 Proje Amaç
Türkiye'de sermayenin nasıl örgütlendiğini, gücü nerelerinde toplandığını ve farklı direniş alanlarının bu yapıyla nasıl bağlantılı olduğunu görünür kılan etkileşimli bir harita oluşturmak.

**Slogan:** "Düşmanı tanı, ablukayı dağıt" - Gizli bağlantıları ortaya çıkarmak.

## 📊 İlk Hafta: Altyapı & Veri Modeli

### ✅ Tamamlanan İşler

**1. Veritabanı Şeması Genişletildi**
- Struggle (Mücadele) modeli eklendi
- StruggleType enum: 10 direniş türü
- StruggleSourceEvidence: Doğrulama sistemi
- StruggleTag: Etiketleme sistemi

```prisma
model Struggle {
  id, title, slug, description
  type (worker_resistance, wage_theft, workplace_death, etc)
  status (active, completed, ongoing, historical)
  visibility (public/internal/private)
  verificationStatus (unverified/verified/conflicting)
  startDate, endDate, location, coordinates
  participants, outcome, lessons
  sourceEvidence[], tags[]
}
```

**2. Struggles API Modülü**
- `StrugglesService`: Full CRUD operations
- `StrugglesController`: RESTful endpoints
- Authentication guards (JWT)
- Source evidence management
- Tag management

**Endpoints:**
- `POST /struggles` - Yeni mücadele kaydı
- `GET /struggles?type=&status=&search=` - Filtreleme
- `GET /struggles/:id` - Detaylı görünüm
- `PATCH /struggles/:id` - Güncelleme
- `DELETE /struggles/:id` - Silme
- `POST /struggles/:id/sources` - Kaynak ekleme
- `POST /struggles/:id/tags` - Etiket ekleme

**3. Kamu API Entegrasyonu**
Public endpoints for struggle discovery:
- `GET /public/struggles` - Tüm mücadeleler
- `GET /public/struggles/type/:type` - Türe göre filtre
- `GET /public/struggles/:id` - Detaylı profil

**4. Proje Planlaması**
- IMPLEMENTATION_PLAN.md: 9 haftalık geliştirme takvimi
- Veri modeli tamamı dokümante
- İlişki tipleri tanımlandı
- Veri kaynakları belirtildi

## 📈 Sonraki Adımlar (Hafta 2-3)

### Admin Paneli Güncellemeleri
- [ ] Struggles management page
- [ ] Verification workflow UI
- [ ] Source linking interface
- [ ] Tag management

### Çekirdek Veri Seti Hazırlığı
- [ ] 3-4 holding seçimi
- [ ] Veri toplama şablonu
- [ ] Doğrulama prosedürü
- [ ] İlk veri yükleme

### Kamu Web Sitesi Sayfaları
- [ ] Struggles listing page
- [ ] Struggle detail page
- [ ] Timeline visualization
- [ ] Related entities linking

## 💾 Veri Modeli

### Struggle Tipleri
1. **Direkt İşçi Direnişi** (worker_resistance)
2. **Sendikal Baskı** (union_pressure)
3. **Ücret Gasp** (wage_theft)
4. **İş Cinayeti** (workplace_death)
5. **Zorunlu Kamulaştırma** (forced_expropriation)
6. **Madenciliğe Karşı** (mining_project)
7. **Enerji Projesine Karşı** (energy_project)
8. **Ekoloji Mücadelesi** (ecological_battle)
9. **Arazi Mücadelesi** (land_struggle)
10. **Diğer** (other)

### Bağlantı Sistemi
Her mücadele kaydı:
- Hangi şirketi/holdinge karşı → `relatedEntities`
- Ne zaman başladı/bitti → `startDate/endDate`
- Nerede oldu → `location, coordinates`
- Kim katıldı → `participants`
- Sonuç ne oldu → `outcome`
- Ne öğrenildi → `lessons`
- Kanıtlar nelerdir → `sourceEvidence`

### Doğrulama Seviyeleri
- **Unverified** - Henüz kontrol edilmemiş
- **Verified** - Doğrulanmış
- **Needs Review** - İncelemeye hazır
- **Conflicting** - Çelişkili bilgiler
- **Source Required** - Kaynak gerekli

## 🔍 Veri Kaynakları
1. Ticaret Sicili (Commerce Registry)
2. Resmi Gazete (Official Gazette)
3. İhale Kayıtları (Tender Records)
4. Şirket Raporları (Company Reports)
5. Mahkeme Kararları (Court Records)
6. Medya Raporları (Media Reports)
7. Sendika Açıklamaları (Union Statements)
8. Saha Araştırması (Field Research)
9. Akademik Çalışmalar (Academic Research)

## 🛠️ Teknik Stack

**Backend:**
- NestJS (REST API)
- PostgreSQL + Prisma ORM
- JWT Authentication
- Audit Trail (Revision tracking)

**Frontend:**
- Next.js 14 (React)
- MapLibre GL (Interactive map)
- Sigma.js (Network graph)
- TypeScript

**Infrastructure:**
- Docker Compose (Local development)
- GitHub Actions (CI/CD)
- pnpm Workspaces (Monorepo)

## 📊 Proje Metrikleri (Hedefler)

**Timeline:** 1.5-2 ay (20 Eylül 2026)

**Haftalık Milestones:**
- Hafta 1-2: ✅ Veritabanı & API
- Hafta 3-4: Çekirdek veri seti
- Hafta 5-6: Admin UI & Public UI
- Hafta 7-8: Harita & Grafik
- Hafta 9: Optimizasyon & Testing

**Başlangıç Veri:**
- 3-4 büyük holding
- ~50-100 bağlı şirket
- ~200-300 somut ilişki
- ~50+ mücadele kaydı

## 🎨 Tasarım Prensipleri

1. **Açık Bilgi** - Gizli bağlantıları ortaya çıkarmak
2. **Etkileşimli** - Kullanıcılar keşif yapabilir
3. **Doğru** - Sadece doğrulanmış veriler
4. **Sağlam** - Tam audit trail
5. **Mobilize Edilebilir** - Propaganda ve eğitim amaçlı

## 📝 Git Commit

```
commit a3624c6
feat(struggles): add comprehensive struggle/resistance tracking system

- Struggle model with 10 resistance types
- Full API with source linking and tagging
- Public API for struggle discovery
- Verification workflow integration
- Audit trail and historical tracking
```

## 🚀 Başarı Kriterleri

✅ **Phase 1 Başarısı:**
- [ ] Tüm struggle endpoints working
- [ ] Admin UI struggles page
- [ ] Public struggles browsing
- [ ] Verification workflow operational
- [ ] 1 büyük holding örnek veriyle test

---

**Next Update:** 13 Ağustos 2026  
**Developer:** Claude Code  
**Status:** 🟡 In Active Development
