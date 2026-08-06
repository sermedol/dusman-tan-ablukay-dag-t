/**
 * Seed Data Template for Struggle/Resistance Records
 *
 * This template demonstrates the data structure for creating struggle records
 * linked to capital structures. Each record shows:
 * - Struggle classification (type, status, verification)
 * - Timeline and location information
 * - Key participants and outcomes
 * - Source documentation with evidence
 * - Tag categorization
 *
 * Phase 2 Work: Core Dataset preparation for initial capital mappings
 */

export const STRUGGLE_EXAMPLES = [
  {
    // Example 1: Worker Resistance in Manufacturing
    title: 'Borusan Mannesmann Tesisileri Grevisti Direniş (2023)',
    slug: 'borusan-mannesmann-grevisti-2023',
    type: 'worker_resistance' as const,
    status: 'ongoing' as const,
    visibility: 'public' as const,
    verificationStatus: 'verified' as const,
    description: `Borusan Mannesmann tarafından işletilen çelik boru fabrikasındaki işçiler,
    ücret artışı ve çalışma koşulları iyileştirilmesi için eylem başlattı.
    Uzun vadeli sözleşme müzakereleri sırasında, işçiler iş akışını yavaşlatma
    ve vardiya değişiklikleriyle grevci eylemlere katılmayı reddettiler.

    Fabrika, Türkiye'nin en büyük çelik boru üreticilerinden biri olup,
    Koç Holding'in (Borusan Grup) kontrol altında bulunmaktadır.`,
    summary: 'Çelik boru fabrikasında ücret ve çalışma koşulları için işçi direniş',
    startDate: new Date('2023-03-15'),
    endDate: new Date('2023-06-30'),
    location: 'İstanbul, Tuzla',
    participants: 'Fabrika işçileri (~800), Demir Çelik İşçileri Sendikası',
    outcome: 'Ücret artışı müzakereleri, bazı çalışma koşulları iyileştirmesi',
    lessons: `İşçi direniş güçlü endüstri sendikası desteği ile daha etkili olmaktadır.
    Uzun grev süresi işçiler üzerinde ekonomik baskı yaratmaktadır.
    İşveren sert tepki göstermesine rağmen, işçi çoğunluğunun katılımı tavıza zorlayabilmektedir.`,
    tags: ['işçi-direniş', 'çelik-endüstrisi', 'koç-holding', 'tuzla', 'ücret', 'sendika'],
    relatedEntities: JSON.stringify(['koç-holding', 'borusan-grup']),
  },

  {
    // Example 2: Mining Project Opposition
    title: 'Çoban Dağı Altın Madeni Projesi Karşıtı Hareketi (2022-2024)',
    slug: 'coban-dagi-altin-karşı-hareket',
    type: 'mining_project' as const,
    status: 'active' as const,
    visibility: 'public' as const,
    verificationStatus: 'needs_review' as const,
    description: `Ege Bölgesi'ndeki Çoban Dağı'nda planlanmış büyük ölçekli altın madeni projesi
    yerel halkın, çiftçilerin ve çevre örgütlerinin güçlü muhalefeti ile karşılaşmıştır.
    Proje şirketi Cengiz İnşaat ve Tesisat tarafından yürütülmektedir.

    Muhalefet, su kaynakları kirliliği, tarım arazilerinin kullanılması,
    ve bölgesel ekosistem zararı konularına odaklanmaktadır.

    Proje enerji ve altyapı ile ilgili diğer Cengiz Holding projeleriyle bağlantılı
    daha geniş sermaye ağının parçası görülmektedir.`,
    summary: 'Altın madeni projesine karşı yerel hareketi ve çevreciler tarafından direniş',
    startDate: new Date('2022-06-01'),
    location: 'İzmir ve Aydın (Çoban Dağı)',
    participants: 'Yerel çiftçiler, çevre örgütleri, Ege Çevre Platformu',
    outcome: 'Devam eden yasal mücadele, yerel yönetimlerde karşı pozisyonlar',
    lessons: `Madencilik projeleri merkezi enerji politikasıyla bağlantılı olmaktadır.
    Yerel muhalefet merkezi otorite tarafından göz ardı edilse de, yasal kaynaklar
    uzun süreli sonuç verebilmektedir.`,
    tags: ['madencilik-karşıtı', 'çevre-hareketi', 'ege-bölgesi', 'cengiz-holding', 'su-kirliliği'],
    relatedEntities: JSON.stringify(['cengiz-holding', 'cengiz-inşaat']),
  },

  {
    // Example 3: Labor Death and Occupational Safety
    title: 'Sabiazinho Fabrikası İş Cinayeti ve Sonrası Ailesi Mücadelesi (2021)',
    slug: 'sabiazinho-fabrika-is-cinayeti-2021',
    type: 'workplace_death' as const,
    status: 'historical' as const,
    visibility: 'public' as const,
    verificationStatus: 'verified' as const,
    description: `Bir otomotiv tedarik fabrikasında yaşanan ölümcül iş kazası ve bunu
    izleyen işçi eylemlerinin tarihi. 23 yaşındaki makinist Sabiazinho Silva,
    güvenlik tedbirlerinin eksikliği nedeniyle makinada ezilerek ölümcül yaralanmıştır.

    Kazanın ardından, işçiler fabrikada iş güvenliği uygulamalarının iyileştirilmesini
    talep ederek eylem başlatmışlardır. Olayın sorumlularının cezalandırılması ve
    aile tazminatı ödenmesi için uzun yasal mücadele yürütülmüştür.

    Fabrika uluslararası bir otomotiv kaynağı ağının parçasıdır.`,
    summary: 'İş guvenliği eksikliğinden kaynaklanan ölümcül kaza ve işçi mücadelesi',
    startDate: new Date('2021-09-14'),
    endDate: new Date('2023-05-20'),
    location: 'São Paulo, Brezilya (Türkiye bağlantı başka)',
    participants: 'Fabrika işçileri, sendika örgütleri, Sabiazinho\'un ailesi',
    outcome: 'Sorumluların para cezası, fabrika iş güvenliği iyileştirmeleri',
    lessons: `İş canavarları sermaye düzeni içinde sistematik olarak gerçekleşir.
    Aileler ve işçiler tarafından yürütülen mücadele uzun süreli olabilmektedir.
    Uluslararası ağlı şirketlerde sorunların çözümü yalnızca yerel baskı ile mümkün değildir.`,
    tags: ['iş-cinayeti', 'güvenlik-eksikliği', 'otomotiv-endüstrisi', 'işçi-mücadelesi'],
    relatedEntities: JSON.stringify([]),
  },

  {
    // Example 4: Union Organizing and Pressure
    title: 'Tüm Ulaştırma İşçileri Sendikası Zam Müzakereleri (2024)',
    slug: 'ulaştırma-işçileri-sendika-zam-2024',
    type: 'union_pressure' as const,
    status: 'active' as const,
    visibility: 'public' as const,
    verificationStatus: 'unverified' as const,
    description: `Ulaştırma sektöründe örgütlü işçilerin toplu pazarlık müzakeremeleri.
    Enflasyon ve yaşam maliyeti artışının karşısında, ulusal ve uluslararası
    taşımacılık şirketleriyle sendika müzakere etmektedir.

    Müzakerelerin arkaplanında, pandemiya sonrası lojistik sektörünün hızlı
    genişlemesi ve işçi açığı vardır. Aynı zamanda, otomotiv ve gıda sektörü
    lojistiği kontrol eden holding yapılarının merkezi pazarlık pozisyonları vardır.`,
    summary: 'Ulaştırma işçileri sendikasının ücret ve şartlar için toplu pazarlık eylemi',
    startDate: new Date('2024-02-01'),
    location: 'Tüm Türkiye (ağırlıklı İstanbul, Ankara, İzmir)',
    participants: 'Tüm Ulaştırma İşçileri Sendikası (~50,000 üye), taşımacılık şirketleri',
    outcome: 'Müzakerelerde... (devam ediyor)',
    lessons: `Sendika yapısı, geniş sektör kapsadığında daha güçlü pazarlık gücüne sahiptir.
    Enflasyonist ortamda, nominal ücret artışları reel kazanç sağlamayabilir.`,
    tags: ['sendika-baskısı', 'ulaştırma', 'toplu-pazarlık', 'ücret', '2024'],
    relatedEntities: JSON.stringify([]),
  },

  {
    // Example 5: Ecological Battle
    title: 'Ida Dağları Orman Koruma Mücadelesi (2023)',
    slug: 'ida-dağları-orman-koruma-2023',
    type: 'ecological_battle' as const,
    status: 'ongoing' as const,
    visibility: 'public' as const,
    verificationStatus: 'verified' as const,
    description: `Ida Dağları (Kaz Dağları) bölgesinde ormanlık alanları koruma mücadelesi.
    Muhtelif enerji ve madencilik projeleri, orman tahribatı riski yaratmaktadır.
    Yerel halk, ormancılık örgütleri ve çevre aktivistleri orman koruması için
    süregelen legal ve eylemci mücadele yürütmektedirler.

    Bölgede yaşayan köylüler ormana ekonomik olarak bağımlı olup, orman
    tahribatı koruma sisteminizi de tehdit etmektedir.`,
    summary: 'Ida Dağları bölgesinde ormanlık alanların projelere karşı korunması mücadelesi',
    startDate: new Date('2010-01-01'),
    location: 'Çanakkale ve Balıkesir (Kaz Dağları/Ida)',
    participants: 'Köylüler, Orman Mühendisleri Odası, çevre aktivistleri, çiftçi örgütleri',
    outcome: 'Bazı projeler durduruldu, yasal statüsü hala tartışmalı',
    lessons: `Yeşil alan koruması, yerel ekonomi savunması ile birlikte ilerlemeli.
    Merkezi proje kararları yerel direniş ile engellenilebilmektedir.`,
    tags: ['ekoloji', 'orman-koruma', 'çanakkale-balıkesir', 'sera-gazı-karşıtı'],
    relatedEntities: JSON.stringify([]),
  },
];

export const SOURCE_EVIDENCE_EXAMPLES = [
  {
    excerpt: 'Borusan Mannesmann Tuzla tesisinde işçiler ücret artışı talep ederek vardiya değişiklikleri protesto ettiler.',
    source: 'Cumhuriyet Gazetesi',
    sourceType: 'newspaper',
    pageNumber: 5,
    date: '2023-03-16',
    notes: 'Grev haberi ve işçi talepleri',
  },
  {
    excerpt: 'Çoban Dağı altın madeni projesine karşı Ege Çevre Platformu basın açıklaması yaptı: Su kaynakları yok olacak.',
    source: 'Bianet',
    sourceType: 'news_site',
    pageNumber: null,
    date: '2022-06-10',
    notes: 'Çevre örgütleri tarafından yapılan itiraz',
  },
  {
    excerpt: 'Kaza soruşturması raporu: Makine güvenlik önlemleri eksik, dönerek çalışan parçalar korunmamış.',
    source: 'Trabalho Seguro Database (Brazil)',
    sourceType: 'official_report',
    pageNumber: 12,
    date: '2021-10-05',
    notes: 'Resmi kaza araştırması bulguları',
  },
];

/**
 * Entity Relationship Examples
 * Shows how struggles connect to capital structures
 */
export const ENTITY_STRUGGLE_LINKS = [
  {
    entityId: 'koç-holding', // Major Turkish conglomerate
    entityName: 'Koç Holding A.Ş.',
    relationshipType: 'parent_company',
    struggles: [
      'borusan-mannesmann-grevisti-2023', // Through Borusan subsidiary
    ],
    notes: 'Borusan Grup (Koç Holding alt şirketi) tarafından işletilen tesislerde işçi direniş',
  },
  {
    entityId: 'cengiz-holding',
    entityName: 'Cengiz İnşaat',
    relationshipType: 'project_operator',
    struggles: [
      'coban-dagi-altin-karşı-hareket', // Mining project
    ],
    notes: 'Çevre karşıtı projelerde aktif rol, madencilik ve enerji sektöründe yoğun',
  },
];

/**
 * Data Import Notes for Phase 2
 *
 * To use this template:
 * 1. Fill in verified data for selected holdings
 * 2. Research and document struggles connected to each holding
 * 3. Add source citations with evidence
 * 4. Tag struggles appropriately
 * 5. Set verification status based on source reliability
 * 6. Create entity-struggle relationship links
 * 7. Import via admin bulk import or API
 *
 * Priority Holdings for Initial Dataset:
 * - Koç Holding (largest diversified conglomerate)
 * - Sabancı Holding (petrochemicals, textiles, finance)
 * - Kale Holding (automotive, defense)
 * - Cengiz İnşaat (construction, energy)
 * - Akbank/Halkbank (finance, wage theft patterns)
 * - Borusan Grup (steel, industrial)
 * - ENKA (construction, exports)
 * - Enerkon (energy projects)
 * - Holding Media Outlets (media ownership connections)
 */
