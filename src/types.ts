/**
 * Müteahhit360 - TypeScript Tip Tanımlamaları
 */

export interface CompanyReference {
  id: string;
  projectName: string;
  location: string;
  totalM2: number;
  year: number;
  type: 'Konut' | 'Ticari' | 'Karma' | 'Kentsel Dönüşüm';
}

export interface CompanyProfile {
  id: string;
  name: string;
  tradeTitle: string;
  taxNumber: string;
  taxOffice: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  logo: string;
  authorizedPerson: string;
  authorizedTitle: string;
  chambersRegistrationNo: string; // Müteahhitlik Yetki Belgesi No
  bankAccounts: { bank: string; iban: string; branch: string }[];
  references: CompanyReference[];
  themeColor: string;
}

export type CadLayerType = 
  | 'boundary'          // Arsa Sınırı (Kırmızı/Yeşil poligon)
  | 'outer_wall'        // Dış Duvar (Kalın yapı konturu)
  | 'inner_wall'        // İç Duvar (Bölmeler)
  | 'door_window'       // Kapı & Pencere
  | 'furniture_fixture' // Tefriş & Banyo/Mutfak Donatıları
  | 'tevhidi'           // Tevhit / İfraz (Komşu Parsel Birleştirme)
  | 'setback_flood';    // Taşkın & Çekme Mesafesi Analizi

export interface CadPoint {
  x: number;
  y: number;
}

export interface CadSegment {
  id: string;
  p1: CadPoint;
  p2: CadPoint;
  lengthMeters: number;
  layer: CadLayerType;
  label?: string;
  subType?: 'door' | 'window' | 'standard';
}

export type CadBlockType =
  | 'door_outer'
  | 'door_outer_double'
  | 'door_inner'
  | 'door_bath'
  | 'door_balcony'
  | 'window_std'
  | 'window_wide'
  | 'window_french'
  | 'window_bath'
  | 'wall_partition_10'
  | 'wall_partition_15'
  | 'wall_partition_20'
  | 'toilet'
  | 'shower'
  | 'bathtub'
  | 'sink'
  | 'washing_machine'
  | 'kitchen_counter'
  | 'stove'
  | 'fridge'
  | 'dishwasher'
  | 'bed_double'
  | 'bed_single'
  | 'sofa'
  | 'dining_table'
  | 'tv_unit'
  | 'room_label';

export interface CadDoorProperties {
  hingeSide: 'left' | 'right';           // Sol Menteşe vs Sağ Menteşe
  swingDirection: 'inward' | 'outward'; // İçe Açılır vs Dışa Açılır
  flipX?: boolean;
  flipY?: boolean;
}

export interface CadFacadeProperties {
  orientation: 'street' | 'garden' | 'blind' | 'courtyard'; // Yola bakan, bahçeye bakan, kör cephe, iç avlu
  glassType: 'double' | 'triple' | 'comfort' | 'acoustic'; // Cam tipi
  balconyType: 'none' | 'french' | 'open' | 'closed' | 'corner'; // Balkon tipi
  balconyWidthMeters?: number; // Balkon genişliği
  notes?: string;
}

export interface CadShape {
  id: string;
  name: string;
  layer: CadLayerType;
  floorId?: string; // Hangi Kat Katmanında Çizildiği (Örn: 'f-gr', 'f-1', 'f-b1', 'global')
  points: CadPoint[];
  color: string;
  strokeWidth: number;
  fillColor?: string;
  isClosed: boolean;
  areaM2?: number;
  perimeterMeters?: number;
  blockType?: CadBlockType;
  parentHostShapeId?: string;
  dimensions?: {
    widthMeters: number;
    depthMeters: number;
    heightMeters?: number;
  };
  rotation?: number; // 0, 90, 180, 270
  facadeProps?: CadFacadeProperties;
  doorProps?: CadDoorProperties;
  roomLabel?: {
    name: string;
    minAreaM2?: number;
    minWidthMeters?: number;
    regulationCode?: string;
    regulationNote?: string;
  };
  meta?: {
    parselNo?: string;
    adaNo?: string;
    isOverflown?: boolean;
    setbackDistances?: { front: number; back: number; sides: number };
  };
}

export type PackageTier = 'standard' | 'comfort_plus' | 'premium';

export interface PackageOptionItem {
  id: string;
  title: string;
  category: 'Kaba & Yalıtım' | 'Isıtma & Soğutma' | 'Akıllı Ev & Güvenlik' | 'İç Mekan & Mutfak' | 'Bina Ortak Alan';
  standardIncluded: boolean;
  comfortPlusIncluded: boolean;
  premiumIncluded: boolean;
  extraCostM2: number; // m² bazlı ilave maliyet (TL)
  description: string;
}

export interface CostBreakdownItem {
  key: string;
  title: string;
  unitCostM2: number;
  totalCost: number;
  percentOfTotal: number;
}

export interface StateSubsidyConfig {
  active: boolean; // Yarısı Bizden Aktif mi?
  grantPerResidentUnit: number; // Konut hibe desteği (Örn: 700.000 TL)
  loanPerResidentUnit: number;  // Uygun faizli kredi (Örn: 700.000 TL)
  rentAssistancePerResident: number; // Taşınma/Kira yardımı (Örn: 100.000 TL)
  grantPerCommercialUnit: number; // Dükkan hibe desteği (Örn: 350.000 TL)
  loanPerCommercialUnit: number;  // Dükkan kredi desteği (Örn: 350.000 TL)
  vatExemptionPercent: number; // KDV Muafiyeti indirimi % (Örn: 20%)
}

export interface BuildingFloor {
  id: string;
  name: string; // Örn: "Bodrum Kat -2", "Zemin Kat", "1. Normal Kat", "Mansart Çatı Katı"
  type: 'basement' | 'ground' | 'normal' | 'mansart' | 'roof';
  floorNumber: number; // -2, -1, 0, 1, 2, 3...
  heightMeters: number; // Yükseklik (örn: 2.80m)
  areaM2: number; // Brüt alan (m²)
  apartmentCount: number; // Daire / Bağımsız bölüm adedi
  description?: string;
  isCadCalculated?: boolean; // CAD Çizim katmanından otomatik hesaplandı mı
  cadShapeCount?: number; // Bu kat katmanında çizilen eleman adedi
}

export interface ProjectFinancials {
  landAreaM2: number;
  taks: number; // Taban Alanı Katsayısı (Örn: 0.40)
  kaks: number; // Kat Alanı Kat Sayısı / Emsal (Örn: 1.80)
  baseAreaM2: number;
  totalConstructionM2: number;
  residentialCount: number;
  commercialCount: number;
  floorCount: number;
  floors?: BuildingFloor[];
  baseCostPerM2: number; // Standart m² kaba+ince maliyeti
  selectedPackage: PackageTier;
  contractorProfitMarginPercent: number; // Müteahhit Kâr Oranı %
  unexpectedCostBufferPercent: number;  // Beklenmeyen Gider Payı %
  stateSubsidy: StateSubsidyConfig;
}

export interface OwnerRecord {
  id: string;
  fullName: string;
  tcOrId: string;
  phone: string;
  currentShareM2: number; // Mevcut arsa payı m²
  currentShareRatio: string; // Hisse oranı örn: "120/1200"
  currentUnitDescription: string; // Mevcut Daire (Örn: Kat 2 No: 5)
  assignedUnitNo: string;
  assignedFloor: string;
  assignedUnitType: '2+1' | '3+1' | '4+1' | 'Dubleks' | 'Dükkan';
  assignedGrossM2: number;
  assignedNetM2: number;
  packageChoice: PackageTier;
  serefiyeScore: number; // Şerefiye Katsayısı (-%10 ila +%20 arası)
  calculatedGrossCost: number; // İnşaat maliyet payı
  packageCostDifference: number; // Paket farkı
  stateGrantBenefit: number; // Yarısı bizden hibe düşümü
  stateLoanBenefit: number;  // Yarısı bizden kredi karşılığı
  netOwnerDebt: number; // Malik net ödeyeceği tutar
  paymentPlan: {
    downPayment: number; // Peşinat (%20-%40)
    installmentCount: number; // Taksit adedi (12/24/36 ay)
    monthlyInstallment: number;
    deliveryPayment: number; // Teslimde ödenecek
  };
  agreementStatus: 'Onaylandı' | 'Görüşülüyor' | 'İtirazlı' | 'Sözleşme İmzalandı';
}

export interface DailySiteLog {
  id: string;
  date: string;
  weather: 'Güneşli' | 'Bulutlu' | 'Yağmurlu' | 'Karlı' | 'Rüzgarlı';
  temperatureC: number;
  workersCount: {
    demirciler: number;
    kalipçilar: number;
    duvarcılar: number;
    elektrikçiler: number;
    tesisatçilar: number;
    muhendisler: number;
    diger: number;
  };
  workDone: string;
  incomingMaterials: string;
  safetyNotes: string;
  supervisorName: string;
}

export interface ConstructionStage {
  id: string;
  name: string;
  category: 'Kaba Yapı' | 'İnce İşler' | 'Tesisat & Mekanik' | 'Dış Cephe & Çevre' | 'Ruhsat & İskan';
  plannedDays: number;
  completionPercent: number;
  status: 'Tamamlandı' | 'Devam Ediyor' | 'Beklemede' | 'Planlandı';
  startDate: string;
  endDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Demir & Çelik' | 'Beton & Harç' | 'Tuğla & Gazbeton' | 'Yalıtım & Kimyasal' | 'Boru & Kablo' | 'Kaplama & Seramik';
  currentStock: number;
  unit: 'Ton' | 'm³' | 'Palet' | 'm²' | 'Metre' | 'Torba' | 'Adet';
  minThreshold: number;
  unitPriceTL: number;
  supplier: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'Gelir' | 'Gider';
  category: 'Malik Peşinatı' | 'Malik Taksiti' | 'Hibe Desteği' | 'Demir Alımı' | 'Beton Dökümü' | 'İşçilik Hakedişi' | 'Ruhsat & Harç' | 'Alt Yüklenici';
  amountTL: number;
  description: string;
  payerOrPayee: string;
  invoiceNo?: string;
}
