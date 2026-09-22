import React from 'react';
import { Printer, ArrowLeft, Building2, CheckCircle2, Shield } from 'lucide-react';
import { CompanyProfile, ProjectFinancials, OwnerRecord, PackageOptionItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/cadMath';

interface ProposalPrintViewProps {
  company: CompanyProfile;
  financials: ProjectFinancials;
  owners: OwnerRecord[];
  packageMatrix: PackageOptionItem[];
  onBack: () => void;
}

export const ProposalPrintView: React.FC<ProposalPrintViewProps> = ({
  company,
  financials,
  owners,
  packageMatrix,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

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

  const totalConstM2 = financials.totalConstructionM2;
  const baseCost = totalConstM2 * financials.baseCostPerM2;
  const packageCost = totalConstM2 * currentPackageExtraM2;
  const rawSubtotal = baseCost + packageCost;
  const profitAmount = (rawSubtotal * financials.contractorProfitMarginPercent) / 100;
  const bufferAmount = (rawSubtotal * financials.unexpectedCostBufferPercent) / 100;
  const grossProjectTotal = rawSubtotal + profitAmount + bufferAmount;

  // Devlet Hibe Düşümü
  const isStateSubsidyActive = financials.stateSubsidy.active;
  const totalStateGrant = isStateSubsidyActive
    ? financials.residentialCount * financials.stateSubsidy.grantPerResidentUnit +
      financials.commercialCount * financials.stateSubsidy.grantPerCommercialUnit
    : 0;

  const netOwnersFinancing = Math.max(0, grossProjectTotal - totalStateGrant);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 p-4 lg:p-8 flex flex-col items-center">
      {/* Üst Eylem Barı (No-Print) */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between no-print bg-slate-800 p-3 rounded-xl border border-slate-700">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Uygulamaya Geri Dön</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-mono">Antetli Resmi Müteahhitlik Teklifi</span>
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Yazdır / PDF Olarak Kaydet</span>
          </button>
        </div>
      </div>

      {/* A4 Antetli Teklif Kağıdı */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-8 sm:p-12 space-y-6 text-xs text-slate-900 leading-relaxed font-sans print:shadow-none print:p-0 print:rounded-none">
        {/* 1. Antet Başlığı */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-950 gap-4">
          <div className="flex items-center gap-4">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="w-16 h-16 rounded-lg object-cover border border-slate-300 shrink-0"
                crossOrigin="anonymous"
              />
            )}
            <div>
              <h1 className="text-lg font-extrabold text-slate-950 uppercase tracking-tight">
                {company.tradeTitle}
              </h1>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {company.address}
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-1 flex flex-wrap gap-x-3">
                <span>Tel: {company.phone}</span>
                <span>E-posta: {company.email}</span>
                <span>Web: {company.website}</span>
              </div>
              <div className="text-[10px] text-slate-700 font-mono font-semibold mt-0.5">
                {company.taxOffice} - V.No: {company.taxNumber} • {company.chambersRegistrationNo}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded">
              RESMİ PROJE TEKLİFİ
            </span>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Teklif No: M360-{new Date().getFullYear()}-089
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Tarih: {new Date().toLocaleDateString('tr-TR')}
            </div>
          </div>
        </div>

        {/* Belge Başlığı */}
        <div className="text-center py-2.5 bg-slate-100 rounded-lg border border-slate-200">
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
            KENTSEL DÖNÜŞÜM & KAT KARŞILIĞI MÜTEAHHİTLİK TAAHHÜT TEKLİFİ
          </h2>
          <p className="text-[10px] text-slate-600">
            (Arsa Payı Dağıtımı, Seçenekli Şartname Matrisi ve 'Yarısı Bizden' Hibe Entegrasyonu)
          </p>
        </div>

        {/* 2. Proje İmar ve Yapı Özeti Tablosu */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider border-b border-slate-300 pb-1">
            1. İMAR, ARSA VE YAPI METRAJ BİLGİLERİ
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Arsa Parsel Alanı</span>
              <strong className="font-mono text-slate-900">{formatNumber(financials.landAreaM2)} m²</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Bina Taban Oturumu (TAKS)</span>
              <strong className="font-mono text-slate-900">{formatNumber(financials.baseAreaM2)} m² (%35)</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Toplam Brüt İnşaat</span>
              <strong className="font-mono text-slate-900">{formatNumber(financials.totalConstructionM2)} m²</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Bağımsız Bölüm Sayısı</span>
              <strong className="text-slate-900">{financials.residentialCount} Konut + {financials.commercialCount} Dükkan</strong>
            </div>
          </div>
        </div>

        {/* 3. Seçilen Teknik Şartname & Paket */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider border-b border-slate-300 pb-1 flex items-center justify-between">
            <span>2. TEKNİK ŞARTNAME & İMALAT PAKETİ: <strong className="text-amber-700 capitalize">{financials.selectedPackage.replace('_', ' ')}</strong></span>
            <span className="font-mono text-[10px] text-slate-600 font-normal">
              {currentPackageExtraM2 > 0 ? `+${formatCurrency(currentPackageExtraM2)}/m² Dahil` : 'Standart Dahil'}
            </span>
          </h3>
          <p className="text-slate-700 text-[11px]">
            Bu teklif kapsamında projenin taşıyıcı sistemi C35/45 hazır beton ve nervürlü donatı çeliği ile radye temel üzerine inşa edilecek olup, dış cephede 8cm taşyünü ısı yalıtımı, katlar arası akustik şap, Rehau/Fränkische yerden ısıtma borulaması, multi-split klima altyapısı, akıllı kapı kilidi ve bina ana arıtma sistemi taahhüt edilmektedir.
          </p>
        </div>

        {/* 4. Maliyet ve Bütçe Tablosu */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider border-b border-slate-300 pb-1">
            3. MALİYET KIRILIMI VE DEVLET HİBE DÜŞÜMÜ
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 text-slate-700">Toplam Brüt İnşaat İmalat Bedeli (Kaba + İnce):</td>
                <td className="border border-slate-300 p-2 font-mono font-semibold text-right">{formatCurrency(baseCost)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-slate-700">Seçilen Donanım Paketi Ek İmalat Maliyeti:</td>
                <td className="border border-slate-300 p-2 font-mono font-semibold text-right">+{formatCurrency(packageCost)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-slate-700">Müteahhitlik Hizmet Bedeli & Risk Payı:</td>
                <td className="border border-slate-300 p-2 font-mono font-semibold text-right">+{formatCurrency(profitAmount + bufferAmount)}</td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td className="border border-slate-300 p-2 text-slate-950">BRÜT TOPLAM PROJE BEDELİ:</td>
                <td className="border border-slate-300 p-2 font-mono text-right">{formatCurrency(grossProjectTotal)}</td>
              </tr>
              {isStateSubsidyActive && (
                <tr className="bg-emerald-50 text-emerald-950 font-bold">
                  <td className="border border-slate-300 p-2">
                    Düşülen 'Yarısı Bizden' Kentsel Dönüşüm Hibe Desteği:
                  </td>
                  <td className="border border-slate-300 p-2 font-mono text-right text-emerald-700">
                    -{formatCurrency(totalStateGrant)}
                  </td>
                </tr>
              )}
              <tr className="bg-amber-100 font-black text-sm">
                <td className="border border-slate-300 p-2.5 text-slate-950">
                  MALİKLERİN TOPLAM NET FİNANSMAN BORCU:
                </td>
                <td className="border border-slate-300 p-2.5 font-mono text-right text-amber-950">
                  {formatCurrency(netOwnersFinancing)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. Malik Dağıtım Özeti (İlk 5 Malik) */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider border-b border-slate-300 pb-1">
            4. MALİK DAĞITIM VE BORÇLANDIRMA ÖZETİ
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-left text-[10px]">
            <thead className="bg-slate-100 font-semibold">
              <tr>
                <th className="border border-slate-300 p-1.5">Malik Adı</th>
                <th className="border border-slate-300 p-1.5">Yeni Daire</th>
                <th className="border border-slate-300 p-1.5">Tip / Net m²</th>
                <th className="border border-slate-300 p-1.5 text-right">Toplam Pay</th>
                <th className="border border-slate-300 p-1.5 text-right text-emerald-700">Devlet Hibesi</th>
                <th className="border border-slate-300 p-1.5 text-right font-bold">Net Malik Borcu</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id}>
                  <td className="border border-slate-300 p-1.5 font-semibold">{o.fullName}</td>
                  <td className="border border-slate-300 p-1.5 font-mono text-amber-800 font-bold">{o.assignedUnitNo}</td>
                  <td className="border border-slate-300 p-1.5">{o.assignedUnitType} ({o.assignedNetM2} m²)</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(o.calculatedGrossCost + o.packageCostDifference)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono text-emerald-700">-{formatCurrency(o.stateGrantBenefit)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-slate-950">{formatCurrency(o.netOwnerDebt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Banka Hesapları ve Şartlar */}
        <div className="grid grid-cols-2 gap-4 pt-2 text-[10px]">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Şirket Resmi Banka Hesabı:</span>
            <p><strong>Banka:</strong> {company.bankAccounts[0]?.bank} ({company.bankAccounts[0]?.branch})</p>
            <p className="font-mono"><strong>IBAN:</strong> {company.bankAccounts[0]?.iban}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Geçerlilik ve Teslim Süresi:</span>
            <p><strong>Teklif Geçerlilik:</strong> 30 İş Günü</p>
            <p><strong>İnşaat Süresi:</strong> Ruhsat onayından itibaren 18 Ay</p>
          </div>
        </div>

        {/* 7. Kaşe ve İmzalar */}
        <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="font-bold text-slate-950 mb-1">MÜTEAHHİT FİRMA YETKİLİSİ</div>
            <div className="text-[10px] text-slate-600">{company.tradeTitle}</div>
            <div className="h-16 flex items-center justify-center italic text-slate-400 text-xs">
              [İmza / Şirket Kaşesi]
            </div>
            <div className="font-semibold text-slate-800">{company.authorizedPerson}</div>
            <div className="text-[10px] text-slate-500">{company.authorizedTitle}</div>
          </div>

          <div>
            <div className="font-bold text-slate-950 mb-1">BİNA / SİTE MALİKLER HEYETİ</div>
            <div className="text-[10px] text-slate-600">Teklif İnceleme ve Kabul Onayı</div>
            <div className="h-16 flex items-center justify-center italic text-slate-400 text-xs">
              [Malik Temsilcileri İmzaları]
            </div>
            <div className="font-semibold text-slate-800">Bina Temsilcisi / Yönetici</div>
          </div>
        </div>
      </div>
    </div>
  );
};
