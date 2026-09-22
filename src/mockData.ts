import {
  CompanyProfile,
  PackageOptionItem,
  ProjectFinancials,
  OwnerRecord,
  DailySiteLog,
  ConstructionStage,
  InventoryItem,
  CashTransaction,
  CadShape
} from './types';

export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-1',
    name: 'Kuzey Yapı Taahhüt & Mühendislik A.Ş.',
    tradeTitle: 'Kuzey Yapı İnşaat Taahhüt Sanayi ve Ticaret Anonim Şirketi',
    taxNumber: '6080945123',
    taxOffice: 'Kadıköy Vergi Dairesi',
    phone: '+90 (216) 455 88 90',
    email: 'info@kuzeyyapi.com.tr',
    website: 'www.kuzeyyapi.com.tr',
    address: 'Bağdat Caddesi No: 342 Kat: 4 Daire: 8 Erenköy / Kadıköy / İstanbul',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80',
    authorizedPerson: 'Mimar Burak Demirkan',
    authorizedTitle: 'Yönetim Kurulu Başkanı / Y. Mimar (İTÜ)',
    chambersRegistrationNo: 'İTO: 541289 / ÇSB Yetki: 0034-A-1892',
    themeColor: '#0284c7',
    bankAccounts: [
      { bank: 'T. Garanti Bankası', iban: 'TR42 0006 2000 0012 3456 7890 01', branch: 'Bağdat Cad. Şb.' },
      { bank: 'Türkiye İş Bankası', iban: 'TR76 0006 4000 0014 5678 9012 34', branch: 'Kadıköy Ticari Şb.' }
    ],
    references: [
      { id: 'ref-1', projectName: 'Erenköy Botanik Konakları (28 Daire Kentsel Dönüşüm)', location: 'Kadıköy/İstanbul', totalM2: 4600, year: 2024, type: 'Kentsel Dönüşüm' },
      { id: 'ref-2', projectName: 'Suadiye Prestij Rezidans (36 Daire + 4 Dükkan)', location: 'Kadıköy/İstanbul', totalM2: 7200, year: 2023, type: 'Karma' },
      { id: 'ref-3', projectName: 'Caddebostan Sahil Villaları', location: 'Kadıköy/İstanbul', totalM2: 3800, year: 2022, type: 'Konut' }
    ]
  },
  {
    id: 'comp-2',
    name: 'Atlas Kentsel Dönüşüm & Mimarlık Ltd. Şti.',
    tradeTitle: 'Atlas Kentsel Yenileme Proje ve İnşaat Hizmetleri Ltd. Şti.',
    taxNumber: '1120485901',
    taxOffice: 'Beşiktaş Vergi Dairesi',
    phone: '+90 (212) 288 34 11',
    email: 'teklif@atlasdonusum.com',
    website: 'www.atlasdonusum.com',
    address: 'Büyükdere Caddesi Maya Plaza Kat: 11 No: 102 Şişli / İstanbul',
    logo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&auto=format&fit=crop&q=80',
    authorizedPerson: 'İnş. Müh. Selim Vural',
    authorizedTitle: 'Genel Müdür / İnşaat Yük. Mühendisi (ODTÜ)',
    chambersRegistrationNo: 'İTO: 789421 / ÇSB Yetki: 0034-B-4410',
    themeColor: '#d97706',
    bankAccounts: [
      { bank: 'Yapı Kredi Bankası', iban: 'TR19 0006 7010 0000 8923 4567 89', branch: 'Levent Şb.' }
    ],
    references: [
      { id: 'ref-4', projectName: 'Göztepe Yeşilvadi Sitesi Yenileme Projesi', location: 'Kadıköy/İstanbul', totalM2: 9500, year: 2024, type: 'Kentsel Dönüşüm' },
      { id: 'ref-5', projectName: 'Etiler Akatlar Butik Blok', location: 'Beşiktaş/İstanbul', totalM2: 3200, year: 2023, type: 'Konut' }
    ]
  },
  {
    id: 'comp-3',
    name: 'Zirve İnşaat Taahhüt San. Tic. Ltd. Şti.',
    tradeTitle: 'Zirve Mühendislik Müşavirlik ve Yapı San. Tic. Ltd. Şti.',
    taxNumber: '9940127834',
    taxOffice: 'Ümraniye Vergi Dairesi',
    phone: '+90 (216) 520 19 00',
    email: 'info@zirveyapi.com',
    website: 'www.zirveyapi.com',
    address: 'Ataşehir Finans Merkezi Yanı No: 14/A Ataşehir / İstanbul',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
    authorizedPerson: 'Hakan Özdemir',
    authorizedTitle: 'Şirket Müdürü / Müteahhit',
    chambersRegistrationNo: 'İTO: 334190 / ÇSB Yetki: 0034-C-9812',
    themeColor: '#059669',
    bankAccounts: [
      { bank: 'Ziraat Bankası', iban: 'TR58 0001 0004 5678 9012 3456 78', branch: 'Ataşehir Şb.' }
    ],
    references: [
      { id: 'ref-6', projectName: 'Ataşehir Flora Plaza', location: 'Ataşehir/İstanbul', totalM2: 12000, year: 2024, type: 'Ticari' }
    ]
  }
];

export const PACKAGE_MATRIX: PackageOptionItem[] = [
  {
    id: 'pkg-1',
    title: 'C35/45 Hazır Beton & Nervürlü B420C Çelik Donatı',
    category: 'Kaba & Yalıtım',
    standardIncluded: true,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 0,
    description: 'Deprem yönetmeliğine tam uyumlu yüksek mukavemetli taşıyıcı iskelet ve radye temel.'
  },
  {
    id: 'pkg-2',
    title: 'Taş Yünü Mantolama (8cm) & Ses Yalıtımlı Şap',
    category: 'Kaba & Yalıtım',
    standardIncluded: true,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 0,
    description: 'A sınıfı enerji kimlik belgesi ve katlar arası 24dB darbe sesi yalıtım membranı.'
  },
  {
    id: 'pkg-3',
    title: 'Rehau/Fränkische Sulu Yerden Isıtma Sistemi',
    category: 'Isıtma & Soğutma',
    standardIncluded: false,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 1850,
    description: 'Radyatörsüz, her oda bağımsız dijital termostat kontrollü homojen zemin ısıtma.'
  },
  {
    id: 'pkg-4',
    title: 'Multi-Split / VRF Klima Altyapısı (Tüm Odalar)',
    category: 'Isıtma & Soğutma',
    standardIncluded: false,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 1400,
    description: 'Salon ve yatak odaları için bakır borulama, drenaj ve dış ünite gizli cephe montaj alanı.'
  },
  {
    id: 'pkg-5',
    title: 'Akıllı Ev Otomasyonu & Parmak İzi/Şifreli Çelik Kilit',
    category: 'Akıllı Ev & Güvenlik',
    standardIncluded: false,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 1250,
    description: 'Mobil uygulama üzerinden aydınlatma, su baskın vanası, panjur ve akıllı kapı kilidi kontrolü.'
  },
  {
    id: 'pkg-6',
    title: 'Merkezi Tortu & Kireç Arıtma Sistemi + Hidrofor',
    category: 'Bina Ortak Alan',
    standardIncluded: false,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 650,
    description: 'Bina ana su girişinde filtreleme, paslanmaz hidrofor ve 2 günlük yedek su deposu.'
  },
  {
    id: 'pkg-7',
    title: 'Kapalı Otopark & Her Daireye Elektrikli Araç (EV) Şarj Altyapısı',
    category: 'Bina Ortak Alan',
    standardIncluded: false,
    comfortPlusIncluded: false,
    premiumIncluded: true,
    extraCostM2: 2400,
    description: 'Bodrum kapalı otoparkında tahsisli park yerleri ve 22kW bağımsız sayaçlı şarj prizleri.'
  },
  {
    id: 'pkg-8',
    title: 'İtalyan Lake Mutfak, Kuvars Tezgah & Siemens Ankastre Seti (5\'li)',
    category: 'İç Mekan & Mutfak',
    standardIncluded: false,
    comfortPlusIncluded: false,
    premiumIncluded: true,
    extraCostM2: 3800,
    description: 'Blum ray sistemli özel tasarım lake dolaplar, porselen ada tezgah ve fırın, ocak, davlumbaz, mikrodalga, bulaşık makinesi.'
  },
  {
    id: 'pkg-9',
    title: 'Gizli Motorlu Alüminyum Monoblok Panjur & Lineer Drenajlı Banyo',
    category: 'İç Mekan & Mutfak',
    standardIncluded: true,
    comfortPlusIncluded: true,
    premiumIncluded: true,
    extraCostM2: 0,
    description: 'Gömme rezervuarlar, temperli cam duşakabin ve rüzgara dayanıklı alüminyum otomatik panjurlar.'
  },
  {
    id: 'pkg-10',
    title: 'Çatı Güneş Enerjisi (GES) ile Ortak Alan Sıfır Enerji Sistemi',
    category: 'Bina Ortak Alan',
    standardIncluded: false,
    comfortPlusIncluded: false,
    premiumIncluded: true,
    extraCostM2: 1950,
    description: 'Asansör, koridor aydınlatması ve çevre aydınlatmasının fotovoltaik panellerle karşılanması.'
  }
];

export const INITIAL_FINANCIALS: ProjectFinancials = {
  landAreaM2: 840,
  taks: 0.35,
  kaks: 2.10,
  baseAreaM2: 294, // 840 * 0.35
  totalConstructionM2: 2380, // Otopark ve bodrumlar dahil brüt inşaat
  residentialCount: 12,
  commercialCount: 2,
  floorCount: 8, // Bodrum + Zemin + 5 Normal + Mansart
  floors: [
    { id: 'f-b2', name: '2. Bodrum Kat (Otopark & Sığınak)', type: 'basement', floorNumber: -2, heightMeters: 2.80, areaM2: 294, apartmentCount: 0, description: 'Kapalı otopark ve teknik depolar' },
    { id: 'f-b1', name: '1. Bodrum Kat (Depolar & Tesisat)', type: 'basement', floorNumber: -1, heightMeters: 2.80, areaM2: 294, apartmentCount: 0, description: 'Ortak depo ve hidrofor odası' },
    { id: 'f-gr', name: 'Zemin Kat (Cadde Dükkanları)', type: 'ground', floorNumber: 0, heightMeters: 3.80, areaM2: 294, apartmentCount: 2, description: '2 adet ticari dükkan ve bina girişi' },
    { id: 'f-1', name: '1. Normal Kat', type: 'normal', floorNumber: 1, heightMeters: 2.90, areaM2: 294, apartmentCount: 2, description: 'Standart konut katı (2x 3+1)' },
    { id: 'f-2', name: '2. Normal Kat', type: 'normal', floorNumber: 2, heightMeters: 2.90, areaM2: 294, apartmentCount: 2, description: 'Standart konut katı' },
    { id: 'f-3', name: '3. Normal Kat', type: 'normal', floorNumber: 3, heightMeters: 2.90, areaM2: 294, apartmentCount: 2, description: 'Standart konut katı' },
    { id: 'f-4', name: '4. Normal Kat', type: 'normal', floorNumber: 4, heightMeters: 2.90, areaM2: 294, apartmentCount: 2, description: 'Standart konut katı' },
    { id: 'f-5', name: 'Çatı Katı / Mansart', type: 'mansart', floorNumber: 5, heightMeters: 2.60, areaM2: 238, apartmentCount: 2, description: 'Dubleks üstü / Mansart çatı konut katı' }
  ],
  baseCostPerM2: 23500, // TL/m² güncel kaba+ince ortalama
  selectedPackage: 'comfort_plus',
  contractorProfitMarginPercent: 22, // %22 müteahhitlik kârı
  unexpectedCostBufferPercent: 6, // %6 beklenmeyen gider fonu
  stateSubsidy: {
    active: true,
    grantPerResidentUnit: 700000, // 700 Bin TL hibe
    loanPerResidentUnit: 700000,  // 700 Bin TL uygun kredi
    rentAssistancePerResident: 100000, // 100 Bin TL taşınma desteği
    grantPerCommercialUnit: 350000, // 350 Bin TL dükkan hibesi
    loanPerCommercialUnit: 350000,
    vatExemptionPercent: 20 // %20 KDV istisnası avantajı
  }
};

export const INITIAL_OWNERS: OwnerRecord[] = [
  {
    id: 'own-1',
    fullName: 'Ahmet Mithat Yılmaz',
    tcOrId: '24189012344',
    phone: '0532 411 22 33',
    currentShareM2: 68.5,
    currentShareRatio: '685/8400',
    currentUnitDescription: 'Kat: 1 No: 1 (Eski 3+1)',
    assignedUnitNo: 'D: 1',
    assignedFloor: 'Kat 1 (Güney-Doğu)',
    assignedUnitType: '3+1',
    assignedGrossM2: 135,
    assignedNetM2: 102,
    packageChoice: 'comfort_plus',
    serefiyeScore: 3, // +%3 şerefiye
    calculatedGrossCost: 3200000,
    packageCostDifference: 185000,
    stateGrantBenefit: 700000,
    stateLoanBenefit: 700000,
    netOwnerDebt: 1985000,
    paymentPlan: {
      downPayment: 600000,
      installmentCount: 24,
      monthlyInstallment: 45208,
      deliveryPayment: 300000
    },
    agreementStatus: 'Sözleşme İmzalandı'
  },
  {
    id: 'own-2',
    fullName: 'Emine & Kemal Çetinkaya',
    tcOrId: '10982345098',
    phone: '0533 555 88 12',
    currentShareM2: 74.0,
    currentShareRatio: '740/8400',
    currentUnitDescription: 'Kat: 2 No: 3 (Eski 3+1)',
    assignedUnitNo: 'D: 4',
    assignedFloor: 'Kat 2 (Güney-Batı)',
    assignedUnitType: '3+1',
    assignedGrossM2: 140,
    assignedNetM2: 106,
    packageChoice: 'premium',
    serefiyeScore: 5,
    calculatedGrossCost: 3380000,
    packageCostDifference: 450000,
    stateGrantBenefit: 700000,
    stateLoanBenefit: 700000,
    netOwnerDebt: 2430000,
    paymentPlan: {
      downPayment: 800000,
      installmentCount: 24,
      monthlyInstallment: 55416,
      deliveryPayment: 300000
    },
    agreementStatus: 'Onaylandı'
  },
  {
    id: 'own-3',
    fullName: 'Av. Zeynep Sena Alkan',
    tcOrId: '38290145672',
    phone: '0542 610 90 44',
    currentShareM2: 55.0,
    currentShareRatio: '550/8400',
    currentUnitDescription: 'Kat: 3 No: 6 (Eski 2+1)',
    assignedUnitNo: 'D: 7',
    assignedFloor: 'Kat 4 (Kuzey-Doğu)',
    assignedUnitType: '2+1',
    assignedGrossM2: 98,
    assignedNetM2: 74,
    packageChoice: 'comfort_plus',
    serefiyeScore: 6,
    calculatedGrossCost: 2360000,
    packageCostDifference: 140000,
    stateGrantBenefit: 700000,
    stateLoanBenefit: 700000,
    netOwnerDebt: 1100000,
    paymentPlan: {
      downPayment: 350000,
      installmentCount: 24,
      monthlyInstallment: 25000,
      deliveryPayment: 150000
    },
    agreementStatus: 'Sözleşme İmzalandı'
  },
  {
    id: 'own-4',
    fullName: 'Mustafa & Fatma Karaca',
    tcOrId: '54210983421',
    phone: '0505 321 09 87',
    currentShareM2: 70.0,
    currentShareRatio: '700/8400',
    currentUnitDescription: 'Kat: 4 No: 8 (Eski 3+1)',
    assignedUnitNo: 'D: 9',
    assignedFloor: 'Kat 5 (Ön Cephe Manzaralı)',
    assignedUnitType: '3+1',
    assignedGrossM2: 135,
    assignedNetM2: 102,
    packageChoice: 'standard',
    serefiyeScore: 8,
    calculatedGrossCost: 3260000,
    packageCostDifference: 0,
    stateGrantBenefit: 700000,
    stateLoanBenefit: 700000,
    netOwnerDebt: 1860000,
    paymentPlan: {
      downPayment: 500000,
      installmentCount: 24,
      monthlyInstallment: 44166,
      deliveryPayment: 300000
    },
    agreementStatus: 'Görüşülüyor'
  },
  {
    id: 'own-5',
    fullName: 'Ecz. Serdar Tezel (Dükkan Maliki)',
    tcOrId: '19876543210',
    phone: '0530 890 12 34',
    currentShareM2: 95.0,
    currentShareRatio: '950/8400',
    currentUnitDescription: 'Zemin Kat No: 1 Cadde Dükkan',
    assignedUnitNo: 'Dk: 1',
    assignedFloor: 'Zemin Kat (Cadde Cephe)',
    assignedUnitType: 'Dükkan',
    assignedGrossM2: 175,
    assignedNetM2: 145,
    packageChoice: 'comfort_plus',
    serefiyeScore: 18,
    calculatedGrossCost: 4600000,
    packageCostDifference: 220000,
    stateGrantBenefit: 350000,
    stateLoanBenefit: 350000,
    netOwnerDebt: 4120000,
    paymentPlan: {
      downPayment: 1500000,
      installmentCount: 24,
      monthlyInstallment: 88333,
      deliveryPayment: 500000
    },
    agreementStatus: 'Sözleşme İmzalandı'
  }
];

export const INITIAL_CAD_SHAPES: CadShape[] = [
  // Ana Arsa Parseli
  {
    id: 'shape-main-parcel',
    name: 'Parsel 104 (Ana Arsa)',
    layer: 'boundary',
    color: '#10b981',
    strokeWidth: 3,
    fillColor: 'rgba(16, 185, 129, 0.08)',
    isClosed: true,
    areaM2: 840,
    perimeterMeters: 118,
    points: [
      { x: 120, y: 100 },
      { x: 440, y: 100 },
      { x: 480, y: 380 },
      { x: 140, y: 360 }
    ],
    meta: {
      parselNo: '104',
      adaNo: '12',
      isOverflown: false,
      setbackDistances: { front: 5.0, back: 3.0, sides: 3.0 }
    }
  },
  // Komşu Parsel (Tevhit Analizi için)
  {
    id: 'shape-neighbour-parcel',
    name: 'Parsel 105 (Tevhit Komşu Parseli)',
    layer: 'tevhidi',
    color: '#f59e0b',
    strokeWidth: 2,
    fillColor: 'rgba(245, 158, 11, 0.06)',
    isClosed: true,
    areaM2: 520,
    perimeterMeters: 96,
    points: [
      { x: 440, y: 100 },
      { x: 640, y: 100 },
      { x: 670, y: 390 },
      { x: 480, y: 380 }
    ],
    meta: {
      parselNo: '105',
      adaNo: '12',
      isOverflown: false
    }
  },
  // Bina Oturumu / Dış Duvar
  {
    id: 'shape-outer-building',
    name: 'Bina Taban Oturumu (TAKS %35)',
    layer: 'outer_wall',
    color: '#3b82f6',
    strokeWidth: 3,
    fillColor: 'rgba(59, 130, 246, 0.12)',
    isClosed: true,
    areaM2: 294,
    perimeterMeters: 74,
    points: [
      { x: 190, y: 160 },
      { x: 380, y: 160 },
      { x: 400, y: 310 },
      { x: 200, y: 300 }
    ]
  },
  // Taşkın & Çekme Analiz Bölgesi (Yol Çekme Mesafesi)
  {
    id: 'shape-setback-front',
    name: 'Ön Bahçe Çekme Sınırı (5.00m)',
    layer: 'setback_flood',
    color: '#ef4444',
    strokeWidth: 1.5,
    fillColor: 'rgba(239, 68, 68, 0.08)',
    isClosed: true,
    areaM2: 120,
    points: [
      { x: 120, y: 100 },
      { x: 440, y: 100 },
      { x: 430, y: 145 },
      { x: 125, y: 145 }
    ]
  }
];

export const INITIAL_SITE_LOGS: DailySiteLog[] = [
  {
    id: 'log-1',
    date: '2026-09-22',
    weather: 'Güneşli',
    temperatureC: 24,
    workersCount: {
      demirciler: 6,
      kalipçilar: 8,
      duvarcılar: 4,
      elektrikçiler: 2,
      tesisatçilar: 2,
      muhendisler: 2,
      diger: 3
    },
    workDone: '3. Kat tavan döşemesi Q14/Q16 donatı bağlama işleri tamamlandı. Elektrik buat borulamaları döşendi. Yarın saat 09:30 beton mikserleri (C35/45 hazır beton 140 m³) ve pompa rezervasyonu yapıldı.',
    incomingMaterials: '18 Ton Nervürlü Demir (Çolakoğlu Metalurji), 2 Palet Elektrik Borusu ve Dirsekleri teslim alındı.',
    safetyNotes: 'Dış cephe güvenlik fileleri kontrol edildi. Tüm personelde baret, fosforlu yelek ve paraşüt tipi emniyet kemeri denetimi yapıldı.',
    supervisorName: 'Şantiye Şefi İnş. Müh. Ali Kemal Dağdelen'
  },
  {
    id: 'log-2',
    date: '2026-09-21',
    weather: 'Bulutlu',
    temperatureC: 21,
    workersCount: {
      demirciler: 6,
      kalipçilar: 8,
      duvarcılar: 0,
      elektrikçiler: 1,
      tesisatçilar: 0,
      muhendisler: 2,
      diger: 2
    },
    workDone: '3. Kat kolon kalıpları söküldü, döşeme teleskopik dikmeleri ve plywood kalıp montajı %85 oranında tamamlandı. Lazer nivo ile kot kontrolleri yapıldı.',
    incomingMaterials: '40 Tabaka Plywood, 100 Adet Ahşap H20 Kiriş geldi.',
    safetyNotes: 'Şantiye vinci aylık periyodik kontrol raporu dosyalandı.',
    supervisorName: 'Şantiye Şefi İnş. Müh. Ali Kemal Dağdelen'
  }
];

export const INITIAL_STAGES: ConstructionStage[] = [
  {
    id: 'stg-1',
    name: 'İksa, Kazı & Temel Hafriyatı',
    category: 'Kaba Yapı',
    plannedDays: 30,
    completionPercent: 100,
    status: 'Tamamlandı',
    startDate: '2026-05-10',
    endDate: '2026-06-12'
  },
  {
    id: 'stg-2',
    name: 'Radye Temel & Bodrum Perdeleri',
    category: 'Kaba Yapı',
    plannedDays: 40,
    completionPercent: 100,
    status: 'Tamamlandı',
    startDate: '2026-06-15',
    endDate: '2026-07-28'
  },
  {
    id: 'stg-3',
    name: 'Betonarme Karkas (Zemin + 6 Kat)',
    category: 'Kaba Yapı',
    plannedDays: 90,
    completionPercent: 55,
    status: 'Devam Ediyor',
    startDate: '2026-08-01',
    endDate: '2026-11-15'
  },
  {
    id: 'stg-4',
    name: 'Tuğla Duvar Örümü & Yalıtım',
    category: 'İnce İşler',
    plannedDays: 45,
    completionPercent: 20,
    status: 'Devam Ediyor',
    startDate: '2026-09-10',
    endDate: '2026-10-30'
  },
  {
    id: 'stg-5',
    name: 'Elektrik & Sıhhi Tesisat Altyapısı',
    category: 'Tesisat & Mekanik',
    plannedDays: 60,
    completionPercent: 25,
    status: 'Devam Ediyor',
    startDate: '2026-09-15',
    endDate: '2026-11-20'
  },
  {
    id: 'stg-6',
    name: 'Yerden Isıtma & Şap Dökümü',
    category: 'Tesisat & Mekanik',
    plannedDays: 30,
    completionPercent: 0,
    status: 'Planlandı',
    startDate: '2026-11-25',
    endDate: '2026-12-25'
  },
  {
    id: 'stg-7',
    name: 'Dış Cephe Kompozit & Taşyünü Mantolama',
    category: 'Dış Cephe & Çevre',
    plannedDays: 50,
    completionPercent: 0,
    status: 'Planlandı',
    startDate: '2026-12-01',
    endDate: '2027-01-20'
  },
  {
    id: 'stg-8',
    name: 'İç Mekan Seramik, Parke & Mutfak Montajı',
    category: 'İnce İşler',
    plannedDays: 60,
    completionPercent: 0,
    status: 'Planlandı',
    startDate: '2027-01-10',
    endDate: '2027-03-15'
  },
  {
    id: 'stg-9',
    name: 'İskan & Yapı Kullanım İzin Belgesi',
    category: 'Ruhsat & İskan',
    plannedDays: 45,
    completionPercent: 0,
    status: 'Planlandı',
    startDate: '2027-03-20',
    endDate: '2027-05-05'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Nervürlü Donatı Çeliği (Ø12, Ø14, Ø16)',
    category: 'Demir & Çelik',
    currentStock: 24.5,
    unit: 'Ton',
    minThreshold: 10,
    unitPriceTL: 28500,
    supplier: 'Çolakoğlu Metalurji A.Ş.'
  },
  {
    id: 'inv-2',
    name: 'C35/45 Hazır Beton',
    category: 'Beton & Harç',
    currentStock: 40,
    unit: 'm³',
    minThreshold: 30,
    unitPriceTL: 2650,
    supplier: 'Akçansa Çimento'
  },
  {
    id: 'inv-3',
    name: '13.5cm Blok Tuğla & Gazbeton (Ytong)',
    category: 'Tuğla & Gazbeton',
    currentStock: 65,
    unit: 'Palet',
    minThreshold: 20,
    unitPriceTL: 4200,
    supplier: 'Türk Ytong San. A.Ş.'
  },
  {
    id: 'inv-4',
    name: '150 Dansite Taş Yünü Mantolama Plakası (8cm)',
    category: 'Yalıtım & Kimyasal',
    currentStock: 450,
    unit: 'm²',
    minThreshold: 200,
    unitPriceTL: 380,
    supplier: 'İzocam Ticaret A.Ş.'
  },
  {
    id: 'inv-5',
    name: 'Oksijen Bariyerli Yerden Isıtma Borusu (PEX-A)',
    category: 'Boru & Kablo',
    currentStock: 1800,
    unit: 'Metre',
    minThreshold: 500,
    unitPriceTL: 42,
    supplier: 'Fränkische Türkiye'
  }
];

export const INITIAL_PACKAGE_MATRIX = PACKAGE_MATRIX;
export const INITIAL_PROJECT_FINANCIALS = INITIAL_FINANCIALS;
export const INITIAL_CONSTRUCTION_STAGES = INITIAL_STAGES;

export const INITIAL_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'tx-1',
    date: '2026-09-20',
    type: 'Gelir',
    category: 'Malik Peşinatı',
    amountTL: 600000,
    description: 'Ahmet Mithat Yılmaz 1. Taksit / Peşinat Ödemesi',
    payerOrPayee: 'Ahmet Mithat Yılmaz',
    invoiceNo: 'MK-2026-041'
  },
  {
    id: 'tx-2',
    date: '2026-09-18',
    type: 'Gider',
    category: 'Demir Alımı',
    amountTL: 513000,
    description: '18 Ton B420C Donatı Demiri Tedariği',
    payerOrPayee: 'Çolakoğlu Metalurji A.Ş.',
    invoiceNo: 'FAT-89213'
  },
  {
    id: 'tx-3',
    date: '2026-09-15',
    type: 'Gelir',
    category: 'Hibe Desteği',
    amountTL: 2100000,
    description: 'Kentsel Dönüşüm Başkanlığı "Yarısı Bizden" 1. Hakediş Hibe Aktarımı',
    payerOrPayee: 'T.C. Çevre Şehircilik ve İklim Değişikliği Bakanlığı'
  },
  {
    id: 'tx-4',
    date: '2026-09-12',
    type: 'Gider',
    category: 'Beton Dökümü',
    amountTL: 371000,
    description: '3. Kat Kolon ve Perde Betonu (140 m³ C35/45)',
    payerOrPayee: 'Akçansa Çimento',
    invoiceNo: 'FAT-77401'
  },
  {
    id: 'tx-5',
    date: '2026-09-10',
    type: 'Gider',
    category: 'İşçilik Hakedişi',
    amountTL: 240000,
    description: 'Kalıp ve Demir İşçiliği 4. Ara Hakediş Ödemesi',
    payerOrPayee: 'Taşeron Usta Ekibi (Recep Usta)'
  }
];
