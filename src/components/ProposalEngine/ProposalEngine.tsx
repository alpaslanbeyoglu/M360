import React, { useState } from 'react';
import {
  Calculator,
  Sliders,
  ShieldCheck,
  Building,
  Coins,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { ProjectFinancials, PackageTier, PackageOptionItem, CompanyProfile } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/cadMath';
import { PackageMatrixModal } from './PackageMatrixModal';

interface ProposalEngineProps {
  financials: ProjectFinancials;
  packageMatrix: PackageOptionItem[];
  company: CompanyProfile;
  onUpdateFinancials: (updated: ProjectFinancials) => void;
  onUpdatePackageMatrix?: (updated: PackageOptionItem[]) => void;
  onNavigateToOwners?: () => void;
  onOpenPrintPreview?: () => void;
  onNavigateToPrint?: () => void;
}

export const ProposalEngine: React.FC<ProposalEngineProps> = ({
  financials,
  packageMatrix,
  company,
  onUpdateFinancials,
  onUpdatePackageMatrix,
  onNavigateToOwners,
  onOpenPrintPreview,
  onNavigateToPrint
}) => {
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const handlePrint = onNavigateToPrint || onOpenPrintPreview || (() => window.print());

  // Paket İlave Maliyetleri
  const comfortPlusExtraPerM2 = packageMatrix
    .filter((item) => item.comfortPlusIncluded && !item.standardIncluded)
    .reduce((sum, item) => sum + item.extraCostM2, 0);

  const premiumExtraPerM2 = packageMatrix
    .filter((item) => item.premiumIncluded && !item.standardIncluded)
    .reduce((sum, item) => sum + item.extraCostM2, 0);

  const currentPackageExtraM2 =
    financials.selectedPackage === 'comfort_plus'
      ? comfortPlusExtraPerM2
      : financials.selectedPackage === 'premium'
      ? premiumExtraPerM2
      : 0;

  // Hesaplamalar
  const totalConstM2 = financials.totalConstructionM2;
  const effectiveCostPerM2 = financials.baseCostPerM2 + currentPackageExtraM2;

  const baseConstructionCost = totalConstM2 * financials.baseCostPerM2;
  const packageExtraCost = totalConstM2 * currentPackageExtraM2;
  const rawSubtotal = baseConstructionCost + packageExtraCost;

  const profitAmount = (rawSubtotal * financials.contractorProfitMarginPercent) / 100;
  const bufferAmount = (rawSubtotal * financials.unexpectedCostBufferPercent) / 100;

  const grossProjectTotal = rawSubtotal + profitAmount + bufferAmount;

  // Devlet Desteği ("Yarısı Bizden" Modeli)
  const isStateSubsidyActive = financials.stateSubsidy.active;
  const residentGrantsTotal = financials.residentialCount * financials.stateSubsidy.grantPerResidentUnit;
  const residentLoansTotal = financials.residentialCount * financials.stateSubsidy.loanPerResidentUnit;
  const commercialGrantsTotal = financials.commercialCount * financials.stateSubsidy.grantPerCommercialUnit;
  const rentAssistanceTotal = financials.residentialCount * financials.stateSubsidy.rentAssistancePerResident;

  const totalStateGrantDeduction = isStateSubsidyActive ? (residentGrantsTotal + commercialGrantsTotal) : 0;
  const totalStateLoanSupport = isStateSubsidyActive ? residentLoansTotal : 0;
  const vatSavings = isStateSubsidyActive ? (grossProjectTotal * (financials.stateSubsidy.vatExemptionPercent / 100)) : 0;

  // Maliklerin Cebinden Çıkacak Net Proje Finansmanı
  const netOwnersFinancingTotal = Math.max(0, grossProjectTotal - totalStateGrantDeduction);

  // Input Değişiklikleri
  const handleChange = <K extends keyof ProjectFinancials>(key: K, value: ProjectFinancials[K]) => {
    onUpdateFinancials({
      ...financials,
      [key]: value
    });
  };

  const handleSubsidyToggle = () => {
    onUpdateFinancials({
      ...financials,
      stateSubsidy: {
        ...financials.stateSubsidy,
        active: !financials.stateSubsidy.active
      }
    });
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-4 lg:p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Üst Başlık & Eylem Çubuğu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Calculator className="w-5 h-5" />
              </span>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Akıllı Teklif & Maliyet Hazırlayıcı Motor</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Birim m² maliyetleri, opsiyonlu paket matrisi ve Kentsel Dönüşüm 'Yarısı Bizden' hibe entegrasyonu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="open-print-preview-btn"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Resmi Teklif Yazdır</span>
            </button>
            <button
              id="go-to-owners-btn"
              onClick={onNavigateToOwners}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Malik Dağılımına Aktar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ana Izgara: Sol Parametreler - Sağ Maliyet Özeti */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Kolon: Proje Parametreleri & Paketler (7 Kolon) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Proje & Yapı Büyüklüğü */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-500" />
                  1. Proje İmar ve İnşaat Alanı Parametreleri
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">CAD Verisiyle Uyumlu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Arsa Alanı (m²)</label>
                  <input
                    type="number"
                    value={financials.landAreaM2}
                    onChange={(e) => handleChange('landAreaM2', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Bina Taban Alanı (TAKS m²)</label>
                  <input
                    type="number"
                    value={financials.baseAreaM2}
                    onChange={(e) => handleChange('baseAreaM2', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-blue-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Toplam Brüt İnşaat (m²)</label>
                  <input
                    type="number"
                    value={financials.totalConstructionM2}
                    onChange={(e) => handleChange('totalConstructionM2', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Konut Sayısı (Adet)</label>
                  <input
                    type="number"
                    value={financials.residentialCount}
                    onChange={(e) => handleChange('residentialCount', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ticari / Dükkan (Adet)</label>
                  <input
                    type="number"
                    value={financials.commercialCount}
                    onChange={(e) => handleChange('commercialCount', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Toplam Kat Sayısı</label>
                  <input
                    type="number"
                    value={financials.floorCount}
                    onChange={(e) => handleChange('floorCount', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Seçenekli Paket Matrisi */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  2. Seçenekli Malzeme & Konfor Paketi
                </h3>
                <button
                  onClick={() => setIsMatrixOpen(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                >
                  Şartnameyi İncele & Değiştir
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Standart Paket */}
                <button
                  onClick={() => handleChange('selectedPackage', 'standard')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    financials.selectedPackage === 'standard'
                      ? 'bg-sky-950/20 border-sky-500 ring-2 ring-sky-500/30 text-sky-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-200 mb-1">Standart Paket</div>
                  <div className="text-[11px] text-slate-400 mb-2">Temel deprem güvenliği, radyatörlü ısıtma</div>
                  <div className="font-mono text-xs text-slate-300">0 TL / m² Fark</div>
                </button>

                {/* Konfor Plus */}
                <button
                  onClick={() => handleChange('selectedPackage', 'comfort_plus')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    financials.selectedPackage === 'comfort_plus'
                      ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 font-bold text-[8px] px-1.5 py-0.2 rounded">
                    Önerilen
                  </div>
                  <div className="font-bold text-xs text-amber-300 mb-1">Konfor Plus</div>
                  <div className="text-[11px] text-slate-400 mb-2">Yerden ısıtma, akıllı kilit, klima alt.</div>
                  <div className="font-mono text-xs text-amber-400 font-bold">+{formatCurrency(comfortPlusExtraPerM2)}/m²</div>
                </button>

                {/* Premium */}
                <button
                  onClick={() => handleChange('selectedPackage', 'premium')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    financials.selectedPackage === 'premium'
                      ? 'bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/30 text-violet-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-violet-300 mb-1">Premium Prestij</div>
                  <div className="text-[11px] text-slate-400 mb-2">İtalyan mutfak, VRF, EV şarj, çatı GES</div>
                  <div className="font-mono text-xs text-violet-400 font-bold">+{formatCurrency(premiumExtraPerM2)}/m²</div>
                </button>
              </div>
            </div>

            {/* 3. Birim Fiyatlar & Kâr Marjı */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                3. Birim Maliyet & Müteahhit Kâr Oranı
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Kaba+İnce Taban Maliyet (TL/m²)</label>
                  <input
                    type="number"
                    step="500"
                    value={financials.baseCostPerM2}
                    onChange={(e) => handleChange('baseCostPerM2', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Müteahhitlik Kâr Oranı (%)</label>
                  <input
                    type="number"
                    value={financials.contractorProfitMarginPercent}
                    onChange={(e) => handleChange('contractorProfitMarginPercent', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Beklenmeyen Risk Fonu (%)</label>
                  <input
                    type="number"
                    value={financials.unexpectedCostBufferPercent}
                    onChange={(e) => handleChange('unexpectedCostBufferPercent', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Efektif Toplam Birim İnşaat Fiyatı:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {formatCurrency(effectiveCostPerM2)} / m²
                </span>
              </div>
            </div>

            {/* 4. Devlet Destekleri (Kentsel Dönüşüm "Yarısı Bizden" Modeli) */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-800/40 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Devlet Destekleri ("Yarısı Bizden" Hibesi)</span>
                </div>
                <button
                  onClick={handleSubsidyToggle}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isStateSubsidyActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isStateSubsidyActive ? '✓ Teşvik Aktif' : 'Pasif'}
                </button>
              </div>

              {isStateSubsidyActive && (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-900/50">
                      <div className="text-slate-400 text-[11px]">Konut Başı Hibe Desteği:</div>
                      <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                        {formatCurrency(financials.stateSubsidy.grantPerResidentUnit)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Toplam {financials.residentialCount} Konut: {formatCurrency(residentGrantsTotal)}
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-900/50">
                      <div className="text-slate-400 text-[11px]">Konut Başı Uygun Faizli Kredi:</div>
                      <div className="text-base font-bold font-mono text-sky-400 mt-0.5">
                        {formatCurrency(financials.stateSubsidy.loanPerResidentUnit)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Malik Kredi Kapasitesi: {formatCurrency(totalStateLoanSupport)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-800/30">
                    <span className="text-emerald-200">Taşınma / Kira Yardımı (Daire Başı 100.000 TL):</span>
                    <span className="font-mono font-bold text-emerald-300">+{formatCurrency(rentAssistanceTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Canlı Maliyet Hesaplama Özeti (5 Kolon) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  Toplam Proje & Teklif Bütçesi
                </h3>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  {financials.totalConstructionM2} m²
                </span>
              </div>

              {/* Kalem Kalem Maliyet Listesi */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 text-slate-300">
                  <span className="text-slate-400">Temel Kaba + İnce İmalat:</span>
                  <span className="font-mono font-semibold">{formatCurrency(baseConstructionCost)}</span>
                </div>

                <div className="flex items-center justify-between py-1 text-slate-300">
                  <span className="text-slate-400">Paket Ek Donanımı ({financials.selectedPackage}):</span>
                  <span className="font-mono font-semibold text-amber-400">
                    +{formatCurrency(packageExtraCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-slate-300">
                  <span className="text-slate-400">Müteahhitlik Kârı (%{financials.contractorProfitMarginPercent}):</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{formatCurrency(profitAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-slate-300">
                  <span className="text-slate-400">Beklenmeyen Gider Fonu (%{financials.unexpectedCostBufferPercent}):</span>
                  <span className="font-mono font-semibold text-slate-300">
                    +{formatCurrency(bufferAmount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-200">
                  <span>Brüt Proje Bedeli (KDV Hariç):</span>
                  <span className="font-mono text-sm">{formatCurrency(grossProjectTotal)}</span>
                </div>

                {/* Devlet Hibesi Düşümü */}
                {isStateSubsidyActive && (
                  <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-300 font-semibold">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        "Yarısı Bizden" Toplam Hibe İndirimi:
                      </span>
                      <span className="font-mono font-bold">-{formatCurrency(totalStateGrantDeduction)}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400/80">
                      Bakanlıkça karşılanan karşılıksız hibe tutarı doğrudan toplam bütçeden düşülmüştür.
                    </div>
                  </div>
                )}
              </div>

              {/* Büyük Vurgulu Net Malik Finansman İhtiyacı */}
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-4 text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Malikler Toplam Net Finansman Borcu
                </div>
                <div className="text-2xl lg:text-3xl font-black font-mono text-amber-300">
                  {formatCurrency(netOwnersFinancingTotal)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Daire Başına Ortalama: <strong className="text-slate-200 font-mono">{formatCurrency(netOwnersFinancingTotal / (financials.residentialCount || 1))}</strong>
                </div>
              </div>

              {/* Maliyet Kırılım Grafiği (Ağırlık Yüzdeleri) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Maliyet Dağılım Ağırlıkları
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: '40%' }} title="Kaba Yapı & Betonarme Demir (%40)"></div>
                  <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="İnce İşler & Kaplamalar (%25)"></div>
                  <div className="bg-violet-500 h-full" style={{ width: '15%' }} title="Mekanik & Tesisat (%15)"></div>
                  <div className="bg-emerald-500 h-full" style={{ width: '20%' }} title="Kâr & Ruhsat Harçları (%20)"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Kaba Yapı & Demir (%40)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>İnce İşler & Paket (%25)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    <span>Mekanik / Isıtma (%15)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Kâr & Harçlar (%20)</span>
                  </div>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={onNavigateToOwners}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs shadow-lg transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Malik Pay & Borçlandırma Tablosuna Aktar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Şartname Paket Matrisi Modalı */}
      <PackageMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        packageMatrix={packageMatrix}
        selectedTier={financials.selectedPackage}
        onSelectTier={(tier) => handleChange('selectedPackage', tier)}
      />
    </div>
  );
};
