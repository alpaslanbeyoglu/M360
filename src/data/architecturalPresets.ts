import { CadBlockType, CadLayerType, CadPoint, CadShape } from '../types';
import {
  findContainingRoomPolygon,
  calculatePolygonAreaM2,
  calculatePolygonPerimeterMeters,
  calculatePolygonBoundingBox
} from '../utils/cadMath';

export interface ArchitecturalPreset {
  id: string;
  category: 'KAPI' | 'PENCERE' | 'DUVAR' | 'BANYO_WC' | 'MUTFAK' | 'ODALAR_TEFRİS' | 'MAHAL_ETİKETİ';
  categoryTitle: string;
  name: string;
  code: string;
  blockType: CadBlockType;
  widthMeters: number;
  depthMeters: number;
  heightMeters?: number;
  layer: CadLayerType;
  color: string;
  fillColor: string;
  regulationNote: string; // Planlı Alanlar İmar Yönetmeliği resmi notu
  standardDimensionLabel: string;
}

export const ARCHITECTURAL_PRESETS: ArchitecturalPreset[] = [
  // --- KAPILAR ---
  {
    id: 'preset-door-outer',
    category: 'KAPI',
    categoryTitle: 'Kapılar',
    name: 'Dış Giriş Çelik Kapı',
    code: 'K01',
    blockType: 'door_outer',
    widthMeters: 1.00,
    depthMeters: 0.15,
    heightMeters: 2.10,
    layer: 'door_window',
    color: '#d97706',
    fillColor: 'rgba(217, 119, 6, 0.12)',
    regulationNote: 'Planlı Alanlar İmar Yön. Madde 41: Bağımsız bölüm giriş kapısı net temiz geçiş en az 1.00 metre olmalıdır.',
    standardDimensionLabel: '100 x 210 cm'
  },
  {
    id: 'preset-door-outer-double',
    category: 'KAPI',
    categoryTitle: 'Kapılar',
    name: 'Bina Ana Giriş Kapısı (Çift Kanat)',
    code: 'K00',
    blockType: 'door_outer_double',
    widthMeters: 1.50,
    depthMeters: 0.20,
    heightMeters: 2.10,
    layer: 'door_window',
    color: '#b45309',
    fillColor: 'rgba(180, 83, 9, 0.15)',
    regulationNote: 'Yönetmelik Madde 41: Bina giriş kapılarında net geçiş 1.50m, ana kanat en az 1.00m olmalıdır.',
    standardDimensionLabel: '150 x 210 cm (100+50)'
  },
  {
    id: 'preset-door-inner',
    category: 'KAPI',
    categoryTitle: 'Kapılar',
    name: 'İç Oda Kapısı (Ahşap Panel)',
    code: 'K02',
    blockType: 'door_inner',
    widthMeters: 0.90,
    depthMeters: 0.10,
    heightMeters: 2.10,
    layer: 'door_window',
    color: '#d97706',
    fillColor: 'rgba(217, 119, 6, 0.10)',
    regulationNote: 'Yönetmelik Madde 41: Yaşam mahallerinin kapı genişliği net 0.90 metreden az olamaz.',
    standardDimensionLabel: '90 x 210 cm'
  },
  {
    id: 'preset-door-bath',
    category: 'KAPI',
    categoryTitle: 'Kapılar',
    name: 'Banyo / Islak Hacim Kapısı',
    code: 'K03',
    blockType: 'door_bath',
    widthMeters: 0.80,
    depthMeters: 0.10,
    heightMeters: 2.10,
    layer: 'door_window',
    color: '#d97706',
    fillColor: 'rgba(217, 119, 6, 0.10)',
    regulationNote: 'Yönetmelik Madde 41: Tuvalet, banyo ve soyunma kapıları net 0.80 metreye kadar düşürülebilir.',
    standardDimensionLabel: '80 x 210 cm'
  },
  {
    id: 'preset-door-balcony',
    category: 'KAPI',
    categoryTitle: 'Kapılar',
    name: 'Balkon Çıkış Kapısı',
    code: 'K04',
    blockType: 'door_balcony',
    widthMeters: 0.80,
    depthMeters: 0.10,
    heightMeters: 2.10,
    layer: 'door_window',
    color: '#d97706',
    fillColor: 'rgba(217, 119, 6, 0.10)',
    regulationNote: 'Yönetmelik Madde 41: Balkon kapısı genişliği en az 0.80 metredir.',
    standardDimensionLabel: '80 x 210 cm'
  },

  // --- PENCERELER ---
  {
    id: 'preset-window-std',
    category: 'PENCERE',
    categoryTitle: 'Pencereler',
    name: 'Standart Oda Penceresi (Çift Kanat)',
    code: 'P01',
    blockType: 'window_std',
    widthMeters: 1.40,
    depthMeters: 0.20,
    heightMeters: 1.50,
    layer: 'door_window',
    color: '#0284c7',
    fillColor: 'rgba(2, 132, 199, 0.15)',
    regulationNote: 'TSE 825 & Standart: Parapet 90 cm, 140x150 cm çift açılır ısıcam.',
    standardDimensionLabel: '140 x 150 cm (h:90)'
  },
  {
    id: 'preset-window-wide',
    category: 'PENCERE',
    categoryTitle: 'Pencereler',
    name: 'Salon / Geniş Cephe Penceresi',
    code: 'P02',
    blockType: 'window_wide',
    widthMeters: 2.00,
    depthMeters: 0.20,
    heightMeters: 1.50,
    layer: 'door_window',
    color: '#0284c7',
    fillColor: 'rgba(2, 132, 199, 0.15)',
    regulationNote: 'Salon aydınlatma & havalandırma geniş cephe doğraması.',
    standardDimensionLabel: '200 x 150 cm (h:90)'
  },
  {
    id: 'preset-window-french',
    category: 'PENCERE',
    categoryTitle: 'Pencereler',
    name: 'Fransız Balkon / Boy Pencere',
    code: 'P03',
    blockType: 'window_french',
    widthMeters: 1.60,
    depthMeters: 0.20,
    heightMeters: 2.20,
    layer: 'door_window',
    color: '#0284c7',
    fillColor: 'rgba(2, 132, 199, 0.20)',
    regulationNote: 'Parapet 0-10 cm, cam kırılmaz lamine emniyet korkuluklu.',
    standardDimensionLabel: '160 x 220 cm'
  },
  {
    id: 'preset-window-bath',
    category: 'PENCERE',
    categoryTitle: 'Pencereler',
    name: 'Banyo / WC Havalandırma Vasistası',
    code: 'P04',
    blockType: 'window_bath',
    widthMeters: 0.60,
    depthMeters: 0.20,
    heightMeters: 0.60,
    layer: 'door_window',
    color: '#0284c7',
    fillColor: 'rgba(2, 132, 199, 0.15)',
    regulationNote: 'Yönetmelik Madde 31: Islak hacim havalandırma penceresi net 0.30x0.30 metreden az olamaz.',
    standardDimensionLabel: '60 x 60 cm'
  },

  // --- ODA BÖLME DUVARLARI ---
  {
    id: 'preset-wall-10',
    category: 'DUVAR',
    categoryTitle: 'Bölme Duvarlar',
    name: '10 cm Hafif Bölme Duvarı',
    code: 'D10',
    blockType: 'wall_partition_10',
    widthMeters: 2.50,
    depthMeters: 0.10,
    heightMeters: 2.70,
    layer: 'inner_wall',
    color: '#6366f1',
    fillColor: 'rgba(99, 102, 241, 0.15)',
    regulationNote: 'Oda içi bölme ve alçıpan/hafif tuğla duvar standart kalınlığı.',
    standardDimensionLabel: '10 cm Kalınlık x 2.50 m'
  },
  {
    id: 'preset-wall-15',
    category: 'DUVAR',
    categoryTitle: 'Bölme Duvarlar',
    name: '15 cm Standart İç Duvar',
    code: 'D15',
    blockType: 'wall_partition_15',
    widthMeters: 3.00,
    depthMeters: 0.15,
    heightMeters: 2.70,
    layer: 'inner_wall',
    color: '#4f46e5',
    fillColor: 'rgba(79, 70, 229, 0.20)',
    regulationNote: 'Oda ve koridor ayıran standart gazbeton/tuğla duvar.',
    standardDimensionLabel: '15 cm Kalınlık x 3.00 m'
  },
  {
    id: 'preset-wall-20',
    category: 'DUVAR',
    categoryTitle: 'Bölme Duvarlar',
    name: '20 cm Daireler Arası Ses Yalıtımlı Duvar',
    code: 'D20',
    blockType: 'wall_partition_20',
    widthMeters: 4.00,
    depthMeters: 0.20,
    heightMeters: 2.70,
    layer: 'outer_wall',
    color: '#2563eb',
    fillColor: 'rgba(37, 99, 235, 0.25)',
    regulationNote: 'Binaların Gürültüye Karşı Korunması Yön: İki bağımsız bölüm arası en az 20 cm ses yalıtımlı duvar.',
    standardDimensionLabel: '20 cm Kalınlık x 4.00 m'
  },

  // --- BANYO & WC TEFRİŞ SİMGELERİ ---
  {
    id: 'preset-toilet',
    category: 'BANYO_WC',
    categoryTitle: 'Banyo & Islak Hacim',
    name: 'Klozet & Gömme Rezervuar',
    code: 'WC01',
    blockType: 'toilet',
    widthMeters: 0.40,
    depthMeters: 0.70,
    layer: 'furniture_fixture',
    color: '#0891b2',
    fillColor: 'rgba(8, 145, 178, 0.15)',
    regulationNote: 'TSE Standart klozet montaj aksı: Duvara min 40cm, ön serbest alan min 60cm.',
    standardDimensionLabel: '40 x 70 cm'
  },
  {
    id: 'preset-shower',
    category: 'BANYO_WC',
    categoryTitle: 'Banyo & Islak Hacim',
    name: 'Duşakabin & Tekne',
    code: 'DU01',
    blockType: 'shower',
    widthMeters: 0.90,
    depthMeters: 0.90,
    layer: 'furniture_fixture',
    color: '#0891b2',
    fillColor: 'rgba(8, 145, 178, 0.20)',
    regulationNote: 'Standart konut banyo köşe duş kabini ölçüsü.',
    standardDimensionLabel: '90 x 90 cm'
  },
  {
    id: 'preset-bathtub',
    category: 'BANYO_WC',
    categoryTitle: 'Banyo & Islak Hacim',
    name: 'Akrilik Küvet',
    code: 'KV01',
    blockType: 'bathtub',
    widthMeters: 1.50,
    depthMeters: 0.75,
    layer: 'furniture_fixture',
    color: '#0891b2',
    fillColor: 'rgba(8, 145, 178, 0.15)',
    regulationNote: 'Standart düz banyo küveti montaj ölçüsü.',
    standardDimensionLabel: '150 x 75 cm'
  },
  {
    id: 'preset-sink',
    category: 'BANYO_WC',
    categoryTitle: 'Banyo & Islak Hacim',
    name: 'Banyo Lavabosu & Dolap',
    code: 'LV01',
    blockType: 'sink',
    widthMeters: 0.60,
    depthMeters: 0.50,
    layer: 'furniture_fixture',
    color: '#0891b2',
    fillColor: 'rgba(8, 145, 178, 0.15)',
    regulationNote: 'Standart asma dolaplı lavabo ünitesi.',
    standardDimensionLabel: '60 x 50 cm'
  },
  {
    id: 'preset-washing-machine',
    category: 'BANYO_WC',
    categoryTitle: 'Banyo & Islak Hacim',
    name: 'Çamaşır Makinesi',
    code: 'CM01',
    blockType: 'washing_machine',
    widthMeters: 0.60,
    depthMeters: 0.60,
    layer: 'furniture_fixture',
    color: '#0891b2',
    fillColor: 'rgba(8, 145, 178, 0.12)',
    regulationNote: 'TSE Beyaz Eşya Standart montaj boşluğu.',
    standardDimensionLabel: '60 x 60 cm'
  },

  // --- MUTFAK TEFRİŞ SİMGELERİ ---
  {
    id: 'preset-kitchen-counter',
    category: 'MUTFAK',
    categoryTitle: 'Mutfak',
    name: 'Mutfak Tezgahı & Çift Eviye',
    code: 'MT01',
    blockType: 'kitchen_counter',
    widthMeters: 2.00,
    depthMeters: 0.60,
    layer: 'furniture_fixture',
    color: '#ea580c',
    fillColor: 'rgba(234, 88, 12, 0.15)',
    regulationNote: 'Ergonomik mutfak tezgah derinliği standart 60 cm dir.',
    standardDimensionLabel: '200 x 60 cm (Derinlik: 60cm)'
  },
  {
    id: 'preset-stove',
    category: 'MUTFAK',
    categoryTitle: 'Mutfak',
    name: 'Ankastre Ocak & Fırın',
    code: 'OC01',
    blockType: 'stove',
    widthMeters: 0.60,
    depthMeters: 0.60,
    layer: 'furniture_fixture',
    color: '#ea580c',
    fillColor: 'rgba(234, 88, 12, 0.15)',
    regulationNote: 'Standart 4 gözlü ankastre gazlı/elektrikli ocak.',
    standardDimensionLabel: '60 x 60 cm'
  },
  {
    id: 'preset-fridge',
    category: 'MUTFAK',
    categoryTitle: 'Mutfak',
    name: 'Buzdolabı (Kombi Tipi)',
    code: 'BD01',
    blockType: 'fridge',
    widthMeters: 0.70,
    depthMeters: 0.70,
    layer: 'furniture_fixture',
    color: '#ea580c',
    fillColor: 'rgba(234, 88, 12, 0.15)',
    regulationNote: 'Standart No-Frost buzdolabı niş boşluğu.',
    standardDimensionLabel: '70 x 70 cm'
  },
  {
    id: 'preset-dishwasher',
    category: 'MUTFAK',
    categoryTitle: 'Mutfak',
    name: 'Bulaşık Makinesi',
    code: 'BM01',
    blockType: 'dishwasher',
    widthMeters: 0.60,
    depthMeters: 0.60,
    layer: 'furniture_fixture',
    color: '#ea580c',
    fillColor: 'rgba(234, 88, 12, 0.12)',
    regulationNote: 'Tezgah altı standart ankastre bulaşık makinesi.',
    standardDimensionLabel: '60 x 60 cm'
  },

  // --- SALON & YATAK ODASI TEFRİŞLERİ ---
  {
    id: 'preset-bed-double',
    category: 'ODALAR_TEFRİS',
    categoryTitle: 'Oda Tefrişleri',
    name: 'Çift Kişilik Yatak & Komodinler',
    code: 'YT01',
    blockType: 'bed_double',
    widthMeters: 1.80,
    depthMeters: 2.00,
    layer: 'furniture_fixture',
    color: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.15)',
    regulationNote: 'Ebeveyn yatak odası (160x200 yatak + 2x40 komodin)',
    standardDimensionLabel: '180 x 200 cm'
  },
  {
    id: 'preset-bed-single',
    category: 'ODALAR_TEFRİS',
    categoryTitle: 'Oda Tefrişleri',
    name: 'Tek Kişilik Genç Yatağı',
    code: 'YT02',
    blockType: 'bed_single',
    widthMeters: 0.90,
    depthMeters: 2.00,
    layer: 'furniture_fixture',
    color: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.12)',
    regulationNote: 'Çocuk/Genç odası standart yatak ölçüsü.',
    standardDimensionLabel: '90 x 200 cm'
  },
  {
    id: 'preset-sofa',
    category: 'ODALAR_TEFRİS',
    categoryTitle: 'Oda Tefrişleri',
    name: '3\'lü Salon Koltuğu / Kanepe',
    code: 'KL01',
    blockType: 'sofa',
    widthMeters: 2.20,
    depthMeters: 0.90,
    layer: 'furniture_fixture',
    color: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.15)',
    regulationNote: 'Salon oturma grubu ana kanepe ölçüsü.',
    standardDimensionLabel: '220 x 90 cm'
  },
  {
    id: 'preset-dining-table',
    category: 'ODALAR_TEFRİS',
    categoryTitle: 'Oda Tefrişleri',
    name: 'Yemek Masası & 6 Sandalye',
    code: 'YM01',
    blockType: 'dining_table',
    widthMeters: 1.60,
    depthMeters: 0.90,
    layer: 'furniture_fixture',
    color: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.15)',
    regulationNote: '6 kişilik standart dikdörtgen yemek masası.',
    standardDimensionLabel: '160 x 90 cm'
  },

  // --- MAHAL VE PİYES ALAN ETİKETLERİ ---
  {
    id: 'preset-room-salon',
    category: 'MAHAL_ETİKETİ',
    categoryTitle: 'Mahal Etiketleri',
    name: 'Salon / Oturma Odası Damgası',
    code: 'M_SALON',
    blockType: 'room_label',
    widthMeters: 3.50,
    depthMeters: 4.50,
    layer: 'boundary',
    color: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.10)',
    regulationNote: 'Yönetmelik Madde 29: Oturma odası en az 12.00 m², dar kenarı en az 3.00m olmalıdır.',
    standardDimensionLabel: 'Min: 12.00 m² (Dar Kenar: 3.00m)'
  },
  {
    id: 'preset-room-bed',
    category: 'MAHAL_ETİKETİ',
    categoryTitle: 'Mahal Etiketleri',
    name: 'Yatak Odası Damgası',
    code: 'M_YATAK',
    blockType: 'room_label',
    widthMeters: 3.00,
    depthMeters: 3.50,
    layer: 'boundary',
    color: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.10)',
    regulationNote: 'Yönetmelik Madde 29: Yatak odası en az 9.00 m², dar kenarı en az 2.50m olmalıdır.',
    standardDimensionLabel: 'Min: 9.00 m² (Dar Kenar: 2.50m)'
  },
  {
    id: 'preset-room-kitchen',
    category: 'MAHAL_ETİKETİ',
    categoryTitle: 'Mahal Etiketleri',
    name: 'Mutfak Damgası',
    code: 'M_MUTFAK',
    blockType: 'room_label',
    widthMeters: 2.00,
    depthMeters: 3.00,
    layer: 'boundary',
    color: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.10)',
    regulationNote: 'Yönetmelik Madde 29: Mutfak en az 3.30 m², dar kenarı en az 1.50m olmalıdır.',
    standardDimensionLabel: 'Min: 3.30 m² (Dar Kenar: 1.50m)'
  },
  {
    id: 'preset-room-bath',
    category: 'MAHAL_ETİKETİ',
    categoryTitle: 'Mahal Etiketleri',
    name: 'Banyo / Islak Hacim Damgası',
    code: 'M_BANYO',
    blockType: 'room_label',
    widthMeters: 1.80,
    depthMeters: 2.00,
    layer: 'boundary',
    color: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.10)',
    regulationNote: 'Yönetmelik Madde 29: Banyo en az 3.00 m², dar kenarı en az 1.50m olmalıdır.',
    standardDimensionLabel: 'Min: 3.00 m² (Dar Kenar: 1.50m)'
  },
  {
    id: 'preset-room-hall',
    category: 'MAHAL_ETİKETİ',
    categoryTitle: 'Mahal Etiketleri',
    name: 'Antre / Koridor Damgası',
    code: 'M_ANTRE',
    blockType: 'room_label',
    widthMeters: 1.50,
    depthMeters: 3.00,
    layer: 'boundary',
    color: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.10)',
    regulationNote: 'Yönetmelik Madde 29: Konut içi koridor ve hol genişliği 1.20 metreden az olamaz.',
    standardDimensionLabel: 'Min Genişlik: 1.20 m'
  }
];

/**
 * Bir mimari şablondan dünya koordinatlarına göre CadShape üretir
 */
export function createShapeFromPreset(
  preset: ArchitecturalPreset,
  centerWorldPt: CadPoint,
  scaleMetersPerPixel: number,
  rotationAngleRad: number = 0,
  existingShapes?: CadShape[]
): CadShape {
  // 1. MAHAL / PİYES ETİKETİ DİNAMİK ALAN UYUMU (Çizilen kapalı oda sınırlarını otomatik devralma)
  if ((preset.category === 'MAHAL_ETİKETİ' || preset.blockType === 'room_label') && existingShapes && existingShapes.length > 0) {
    const hostRoom = findContainingRoomPolygon(centerWorldPt, existingShapes);
    if (hostRoom) {
      const roomPoints = hostRoom.points.map((p) => ({ ...p }));
      const areaM2 = calculatePolygonAreaM2(roomPoints, scaleMetersPerPixel);
      const perimeterMeters = calculatePolygonPerimeterMeters(roomPoints, scaleMetersPerPixel, true);
      const bbox = calculatePolygonBoundingBox(roomPoints, scaleMetersPerPixel);
      const minArea = preset.widthMeters * preset.depthMeters;

      const cleanName = preset.name.replace(' Damgası', '').replace(' / Oturma Odası', '').trim();

      return {
        id: `arch-room-${Date.now()}`,
        name: `${cleanName} (${areaM2.toFixed(1)} m²)`,
        layer: 'boundary',
        points: roomPoints,
        color: '#059669',
        strokeWidth: 2,
        fillColor: 'rgba(5, 150, 105, 0.08)',
        isClosed: true,
        areaM2,
        perimeterMeters,
        blockType: 'room_label',
        parentHostShapeId: hostRoom.id,
        dimensions: {
          widthMeters: bbox.widthMeters,
          depthMeters: bbox.depthMeters,
          heightMeters: preset.heightMeters || 2.8
        },
        rotation: 0,
        roomLabel: {
          name: cleanName,
          minAreaM2: minArea,
          regulationCode: preset.code,
          regulationNote: preset.regulationNote
        }
      };
    }
  }

  // 2. STANDART YERLEŞTİRME (BAĞIMSIZ / ÇİZİLMİŞ ALAN DIŞI)
  const widthPx = preset.widthMeters / scaleMetersPerPixel;
  const depthPx = preset.depthMeters / scaleMetersPerPixel;

  const halfW = widthPx / 2;
  const halfD = depthPx / 2;

  const cos = Math.cos(rotationAngleRad);
  const sin = Math.sin(rotationAngleRad);

  const rotatePoint = (lx: number, ly: number) => ({
    x: centerWorldPt.x + (lx * cos - ly * sin),
    y: centerWorldPt.y + (lx * sin + ly * cos)
  });

  const points: CadPoint[] = [
    rotatePoint(-halfW, -halfD),
    rotatePoint(halfW, -halfD),
    rotatePoint(halfW, halfD),
    rotatePoint(-halfW, halfD)
  ];

  const areaM2 = Number((preset.widthMeters * preset.depthMeters).toFixed(2));
  const perimeterMeters = Number(((preset.widthMeters + preset.depthMeters) * 2).toFixed(2));

  return {
    id: `arch-${preset.blockType}-${Date.now()}`,
    name: `${preset.name} (${preset.standardDimensionLabel})`,
    layer: preset.layer,
    points,
    color: preset.color,
    strokeWidth: preset.category === 'DUVAR' ? 3 : 2,
    fillColor: preset.fillColor,
    isClosed: true,
    areaM2,
    perimeterMeters,
    blockType: preset.blockType,
    dimensions: {
      widthMeters: preset.widthMeters,
      depthMeters: preset.depthMeters,
      heightMeters: preset.heightMeters
    },
    rotation: 0,
    roomLabel: preset.category === 'MAHAL_ETİKETİ' ? {
      name: preset.name.replace(' Damgası', ''),
      minAreaM2: preset.widthMeters * preset.depthMeters,
      regulationCode: preset.code
    } : undefined
  };
}
