# Düşmanı Tanı Ablukayı Dağıt - Implementation Plan

## 🎯 Proje Vizyonu
Sermayenin gerçek yapısını, gücü nasıl örgütlendiğini ve farklı direniş alanlarının nasıl bağlantılı olduğunu görünür kılan etkileşimli bir harita oluşturmak.

## 📊 Veri Modeli

### Entity Tipleri (Taraflar)
1. **Holding** - Ana sermaye grupları
2. **Şirket** - Bağlı işletmeler
3. **Tesis** - Fabrika, maden, liman, santral
4. **Banka** - Finansal kurumlar
5. **Medya Kuruluşu** - Yayın organları
6. **Vakıf** - Tüzel kişiler
7. **Kamu Kurumu** - Devlet kurumları
8. **Siyasetçi** - Politikacılar
9. **Sendika** - Örgütlü çalışanlar
10. **Direniş Hareketi** - Muhalif örgütler
11. **Mücadele** - İşçi direnişi, ekoloji savaşı, vs.

### İlişki Tipleri (Bağlantılar)
1. **Sahiplik** (Ownership) - Holding → Şirket
2. **Yönetim** (Management) - Siyasetçi → Şirket
3. **Ortaklık** (Partnership) - Şirket ↔ Şirket
4. **İhale** (Tender) - Kamu → Şirket
5. **Kredi** (Loan) - Banka → Şirket
6. **Taşeronluk** (Subcontracting) - Şirket → Şirket
7. **Tedarik** (Supply) - Şirket → Şirket
8. **Medya Sahipliği** (Media Ownership) - Holding → Medya
9. **İşçi İlişkisi** (Labor Relation) - Şirket ↔ İşçi
10. **Ekolojik Etki** (Environmental Impact) - Tesis ↔ Mücadele
11. **Sendikal Baskı** (Union Pressure) - Sendika ↔ Şirket
12. **Ücret Gasp** (Wage Theft) - Şirket → Direniş
13. **İş Cinayeti** (Workplace Death) - Tesis → Direniş

### Veri Kaynakları (Verification Sources)
- **Ticaret Sicili** (Commerce Registry)
- **Resmi Gazete** (Official Gazette)
- **İhale Kayıtları** (Tender Records)
- **Şirket Raporları** (Company Reports)
- **Mahkeme Kararları** (Court Records)
- **Medya Raporları** (Media Reports)
- **Sendika Açıklamaları** (Union Statements)
- **Saha Araştırması** (Field Research)
- **Akademik Çalışmalar** (Academic Research)

## 📈 Geliştirme Aşamaları (1.5-2 ay)

### Hafta 1-2: Veritabanı & Altyapı
- [ ] Prisma schema güncellemesi (yeni entity/relation types)
- [ ] Migration oluşturma
- [ ] Doğrulama sistemi geliştirme (verified/pending/conflict)
- [ ] Audit trail implementation

### Hafta 3-4: Çekirdek Veri Seti
- [ ] 3-4 büyük holding veri toplama
- [ ] Bağlı şirketlerin entegrasyonu
- [ ] İlişkilerin doğrulanması
- [ ] Direniş/mücadele kayıtları eklenmesi

### Hafta 5-6: Admin Arayüzü
- [ ] Entity management (tüm tipler)
- [ ] Relation management (tüm tipler)
- [ ] Source management (doğrulama)
- [ ] Data verification workflow
- [ ] Bulk operations & import

### Hafta 7-8: Kamu Arayüzü
- [ ] İnteraktif harita (MapLibre GL)
- [ ] İlişki ağı grafiği (Sigma.js)
- [ ] Detaylı profil sayfaları
- [ ] Gelişmiş filtreleme
- [ ] Tarihçe görünümü (timeline)

### Hafta 9: Optimization & Testing
- [ ] Performance optimization
- [ ] Veri doğruluk kontrolleri
- [ ] Güvenlik denetimi
- [ ] User testing

## 🔍 Çekirdek Veri Seti (İlk Hedef)
**Başlamak için 3-4 büyük holding seçilecek ve:**
- Tüm bağlı şirketleri
- Yönetim ilişkileri
- Mali bağlantılar
- İşçi direnişi tarihi
- Ekoloji projeler
- Medya sahipliği
- Kamu ihale ilişkileri

Doğrulanmış kaynaklar üzerinde kurulan sağlam bir temel.

## 💾 Veri Yönetimi
- Tüm değişikliklerin tarihi tutulması
- Silinmeyen, sadece güncellenen veriler
- Çoklu doğrulama seviyeleri
- Revision tracking
- Conflict resolution sistemi

## 📡 Propaganda Çıktıları
- **Harita üzerinde gösteriş** - "Neye karşı" sorusunun tek cevabı
- **Zamansal analiz** - Direniş ve sermaye hareketleri
- **Network statistics** - Merkezi aktörler ve bağlantılar
- **Accessible sharing** - PDF, image exports
- **Embed capability** - Sosyal medya ve sitelerine embed

## 🎨 Tasarım Prensipleri
- **Açık Bilgi** - Gizli bağlantıları ortaya çıkarmak
- **Etkileşimli** - Kullanıcı keşif yapabilir
- **Doğru** - Verified data only
- **Sağlam** - Audit trail ve history
- **Mobilize Edilebilir** - Propaganda ve eğitim amaçlı

---

**Timeline:** 6 Ağustos 2026 - ~20 Eylül 2026
**Durum:** Implementation başlangıcı
