# Phase 2: Çekirdek Veri Seti (Core Dataset) - Data Structure Guide

**Tarih:** 6 Ağustos 2026  
**Durum:** 🟡 Hazırlanıyor  
**Amaç:** Türkiye'de sermayenin gücü ve direniş alanlarını gösteren ilk doğrulanmış dataset

---

## 📋 Veri Hazırlama Süreci

### Aşama 1: Entity (Varlık) Seçimi

İlk dataset'te odaklanılacak 3-4 büyük holding ve bağlantıları:

#### Holding 1: Koç Holding A.Ş.
```
Kuruluş: 1926
Sektörler: Otomotiv, Enerji, Finans, Perakende, Tekstil
Kişi Sayısı: 80,000+
Ana Alt Şirketi: 
  - Arçelik
  - Borusan Grup
  - Koç Bank
  - Tofaş
  - Enerjisa
  - Migros
```

**Bağlantılar:**
- Devlet kontratları (Savunma, Enerji)
- Medya sahipliği (Hürriyet, Radikal)
- Sendika ilişkileri (sarı ve bağımsız)
- Uluslararası ortaklıklar

**Araştırılacak Mücadeleler:**
- Borusan Mannesmann tesisleri (çelik)
- Tofaş otomotiv fabrikaları
- Arçelik beyaz eşya tesisleri
- Enerjisa enerji projeleri


#### Holding 2: Sabancı Holding
```
Kuruluş: 1954
Sektörler: Petrokimya, Tekstil, Gıda, Finans, Enerji
Kişi Sayısı: 90,000+
Ana Alt Şirketi:
  - Aksa Akrilik
  - Akçansa Çimento
  - Carrefour (franchise)
  - Akbank
  - DÜN Enerji
```

#### Holding 3: Kale Holding
```
Kuruluş: 1957
Sektörler: Otomotiv, Savunma, Elektrik
Kişi Sayısı: 25,000+
Bağlantı: Militarizm, İHracat Kontratları
```

#### Holding 4: Cengiz İnşaat
```
Kuruluş: 1995
Sektörler: İnşaat, Altyapı, Enerji Projeleri
Proje Tipi: Mega projelerde yüklenici, özel konsesyon
Çevresel Etkisi: Yüksek (madencilik, baraj, enerji)
```

---

## 📊 Mücadele Verisinin Hazırlanması

### Veri Kaynakları

#### Birincil Kaynaklar (Güvenilir)
- Sendika raporları ve basın açıklamaları
- Gazeteci araştırmaları (doğrulanmış)
- Resmi kaza raporları ve soruşturmalar
- Ebe insan hakları raporu

#### İkincil Kaynaklar (Moderatee güvenilir)
- Haberci ajans haberleri
- Bağımsız medya araştırmaları
- Sosyal medya arşivleri (tarihlenmiş kanıt ile)

#### Üçüncü Kaynaklar (İtiraz edilebilir)
- Sosyal medya postaları (doğrulama gerekli)
- Ağızdan ağıza tanıklıklar (diğer kaynaklara karşı kontrol)

### Veri Doğrulama Statüleri

```typescript
enum VerificationStatus {
  verified        // İki+ bağımsız kaynaktan doğrulanmış
  needs_review    // Bir kaynaktan bilgi, diğer kaynaklar bekleniyor
  source_required // Tanıklık/çıkarım, kaynak dokümantasyonu gerekli
  unverified      // Henüz doğrulanmayan iddia
  conflicting     // Farklı kaynaklar çelişkili bilgi veriyor
}
```

---

## 🔗 İlişki Yapısı: Sermaye ↔ Direniş

### Mücadele Türlerinin Sermaye Bağlantıları

#### İşçi Direniş (worker_resistance)
```
Koç Holding
├── Borusan (çelik) → İşçi direniş 2023
├── Tofaş (oto) → Fabrika yönetimi çatışmaları
├── Migros (perakende) → Kasa görevliler mücadelesi
└── Arçelik (white goods) → Üretim hızı protesto

Sabancı Holding  
├── Aksa Akrilik → Kimya işçi direniş
├── Akçansa Çimento → Madenciler direniş
└── Carrefour → Mağaza çalışanları ücret
```

#### Enerji Projesi Karşıtı (energy_project)
```
Cengiz İnşaat
├── HES projeleri → Köyler sel risk
├── Termik santral → Hava kirliliği eylemler
└── Rüzgar enerjisi → Tarım arazisi kayıp

Koç Holding
├── Enerjisa → Elektrik fiyat protestoları
└── Thermal power → Çevre karşıtı hareketler
```

#### Madencilik Karşıtı (mining_project)
```
Cengiz Holding
└── Çeşitli altın/bakır → Çevre örgütleri eylemi

Harita Yönetimi
└── Çeşitli türevler → Köylü ayaklanmaları
```

#### Ekoloji Mücadelesi (ecological_battle)
```
Enerji Şirketleri
└── Termik santraller → Hava/su kirliliği

Tarım/Finans
└── Su kaynakları tahribatı → Çiftçi mücadelesi
```

---

## 📝 Mücadele Kaydı Oluşturma Şablonu

```typescript
interface StruggleRecord {
  // BASİT BİLGİLER
  title: string,           // "Borusan Mannesmann Grevisti 2023"
  type: StruggleType,      // 10 tip den seçim
  status: StruggleStatus,  // active/completed/ongoing/historical
  
  // KONUM VE ZAMAN
  startDate: Date,
  endDate?: Date,
  location: string,        // "İstanbul, Tuzla" veya "Ege Bölgesi"
  
  // AÇIKLAMA (500-2000 sözcük)
  description: string,     // Neler oldu? Neden? Sonuç?
  
  // KATILIMCI VE SONUÇ
  participants: string,    // "800 fabrika işçisi, 2 sendika"
  outcome: string,         // Ne başarıldı? Hangi tavızlar?
  lessons: string,         // Tarihsel ders nedir?
  
  // ETIKETLER
  tags: string[],          // ["işçi-direniş", "metal-endüstri", "ücret"]
  
  // İLİŞKİLİ VARLIKLAR
  relatedEntities: string, // JSON: ["koç-holding", "borusan-grup"]
  
  // KAYNAKLAR
  sourceEvidence: [{
    sourceId: string,      // Veritabanında kayıtlı kaynak ID
    excerpt: string,       // Doğrudan alıntı
    pageNumber?: number,
    notes: string,         // "Gazete sayfa 5 haber"
  }],
  
  // VERİFİKASYON
  verificationStatus: 'verified' | 'needs_review' | 'source_required',
}
```

---

## 🔐 Doğrulama Kontrol Listesi

Mücadele kaydı yayınlanmadan önce:

- [ ] En az bir tarihlendirilmiş, yazılı kaynak (gazete/rapor)
- [ ] Katılımcılar tanımlanmış ve makul (sayı örneğin "800" değil "yaklaşık 800")
- [ ] Çıktı/sonuç anlaşılabilir ("kısmen başarılı", "devam ediyor", vs.)
- [ ] Yer bilgisi spesifik (ülke/il/ilçe)
- [ ] Etiketler uygun ve birleştirici değil (örn. "işçi-direniş" değil "işçi-direniş-metal")
- [ ] Varlık bağlantıları araştırılmış (holding adı, konuyla bağlantı)
- [ ] Tarihler ileriye dönük değil (şimdiki zaman en iyisi)

---

## 📤 İçe Aktarma Yöntemleri

### 1. Admin Panel (Manuel)
- `/admin/dashboard/struggles` sayfasında "Yeni Mücadele" butonu
- Formu doldurun, kaynakları ekleyin, kaydedin
- Tek tek yükleme için uygun

### 2. Bulk Import (Planlama)
- CSV/JSON dosyadan toplu yükleme
- API endpoint: `POST /api/v1/struggles/bulk` (gelecek)
- Hazırlanacak: Phase 3 sonunda

### 3. SQL Seed Script
- `packages/database/seed.ts` güncellenecek
- Development ve test ortamı için
- Üretim veri migrasyon sonra elle kontrol

---

## 📅 Phase 2 Takvimi

| Hafta | Hedef | Beklenen Çıktı |
|-------|-------|------------|
| **Hafta 2** | Holding 1 (Koç) verisini topla | 3-5 mücadele kaydı |
| **Hafta 3** | Holding 2-3 verisini topla | 10+ mücadele kaydı |
| **Hafta 4** | İlişkileri bağla, doğrula | Entity-Struggle links |
| **Hafta 5** | İlk 15-20 mücadeleyi API'ye yükle | Tamamlanmış dataset |

---

## 🎯 İlk Dataset Hedefleri

```
Toplam Mücadele Kaydı: 15-20
Doğrulanmış Kayıtlar: 80%+
İlişkili Varlıklar: 4 ana holding + 20+ alt şirketi
Çevre Mücadeleler: 4-5 kayıt
İşçi Direniş: 6-8 kayıt
Enerji Projeleri: 3-4 kayıt
Ekoloji Hareketleri: 2-3 kayıt
```

---

## 📚 Referans Kaynaklar

### Önerilen Araştırma Kaynakları
- Bianet (bağımsız haber)
- Evrensel Gazetesi (sendika haberleri)
- Sendikal Raporlar (DİSK, Birleşik Metal, vb.)
- International Trade Union Confederation (ITUC)
- Human Rights Watch Türkiye Raporları
- Akademik Araştırmalar (İ.Ü. İktisat, Mimar Sinan, ODTÜ)

### Doğrulama Araçları
- Wayback Machine (eski haber siteleri)
- Google Scholar (akademik makaleler)
- Wikipedia (geçmiş olaylar)
- Government Databases (resmi raporlar)

---

## 💡 Notlar

- **Dil:** Türkçe mücadele tanımları, İngilizce/Türkçe kaynaklar karışık
- **Tariheleme:** Olabildiğince spesifik (ay/gün kaydı)
- **Kasıt Ağrısız:** Propaganda araç değil, gerçek kayıt
- **Arşivleme:** Haber bağlantıları değişebilir; alıntı ve referans important

**Güncelleme Tarihi:** 6 Ağustos 2026  
**Sorumlu:** Veri Seti Koordinatörü (Kimse Atanmamış)
