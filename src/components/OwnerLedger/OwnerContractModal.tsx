import React from 'react';
import { X, Printer, Building2, CheckCircle2, Shield } from 'lucide-react';
import { OwnerRecord, CompanyProfile, ProjectFinancials } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/cadMath';

interface OwnerContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: OwnerRecord | null;
  company: CompanyProfile;
  financials: ProjectFinancials;
}

export const OwnerContractModal: React.FC<OwnerContractModalProps> = ({
  isOpen,
  onClose,
  owner,
  company,
  financials
}) => {
  if (!isOpen || !owner) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Başlık Barı (No-Print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 no-print">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-100 text-sm">
              Malik Mutabakat & Kentsel Dönüşüm Ön Protokolü
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir Antetli Sözleşme Sayfası */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900 font-sans print:p-0">
          <div className="max-w-3xl mx-auto space-y-6 text-xs leading-relaxed">
            {/* Antet Başlığı */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    crossOrigin="anonymous"
                  />
                )}
                <div>
                  <h1 className="text-base font-bold text-slate-950 tracking-tight uppercase">
                    {company.tradeTitle}
                  </h1>
                  <p className="text-[10px] text-slate-600">
                    {company.address} • Tel: {company.phone} • {company.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {company.taxOffice} - V.No: {company.taxNumber} • {company.chambersRegistrationNo}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-amber-50 border border-amber-300 text-amber-900 font-bold px-2 py-1 rounded text-[10px]">
                  KENTSEL DÖNÜŞÜM ÖN PROTOKOLÜ
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Tarih: {new Date().toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Protokol Konusu */}
            <div className="text-center py-2 bg-slate-100 rounded border border-slate-300">
              <h2 className="font-bold text-slate-950 text-sm">
                ARSA PAYI KARŞILIĞI İNŞAAT & BORÇLANDIRMA MUTABAKAT METNİ
              </h2>
              <p className="text-[10px] text-slate-600">
                (6306 Sayılı Kanun ve 'Yarısı Bizden' Kentsel Dönüşüm Destekleri Kapsamında)
              </p>
            </div>

            {/* 1. Taraflar ve Arsa Bilgisi */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 bg-slate-50">
              <div>
                <span className="font-bold block text-slate-950 mb-1">MÜTEAHHİT FİRMA:</span>
                <p><strong>Unvan:</strong> {company.name}</p>
                <p><strong>Temsilci:</strong> {company.authorizedPerson} ({company.authorizedTitle})</p>
              </div>
              <div>
                <span className="font-bold block text-slate-950 mb-1">MALİK (HAK SAHİBİ):</span>
                <p><strong>Ad Soyad:</strong> {owner.fullName}</p>
                <p><strong>T.C. Kimlik No:</strong> {owner.tcOrId}</p>
                <p><strong>Telefon:</strong> {owner.phone}</p>
              </div>
            </div>

            {/* 2. Mevcut ve Tahsis Edilen Gayrimenkul */}
            <div>
              <h3 className="font-bold text-slate-950 mb-2 border-b border-slate-200 pb-1">
                1. MEVCUT TAŞINMAZ VE YENİ PROJEDE TAHSİS EDİLEN BAĞIMSIZ BÖLÜM
              </h3>
              <table className="w-full border-collapse border border-slate-300 text-left">
                <thead className="bg-slate-100 font-semibold">
                  <tr>
                    <th className="border border-slate-300 p-2">Mevcut Arsa Payı</th>
                    <th className="border border-slate-300 p-2">Mevcut Bağımsız Bölüm</th>
                    <th className="border border-slate-300 p-2">Yeni Tahsis Daire</th>
                    <th className="border border-slate-300 p-2">Kat & Konum</th>
                    <th className="border border-slate-300 p-2">Brüt / Net m²</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-mono">{owner.currentShareM2} m² ({owner.currentShareRatio})</td>
                    <td className="border border-slate-300 p-2">{owner.currentUnitDescription}</td>
                    <td className="border border-slate-300 p-2 font-bold text-amber-800">{owner.assignedUnitNo} ({owner.assignedUnitType})</td>
                    <td className="border border-slate-300 p-2">{owner.assignedFloor}</td>
                    <td className="border border-slate-300 p-2 font-mono">{owner.assignedGrossM2} m² / {owner.assignedNetM2} m²</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Maliyet, Paket Tercihi ve Devlet Hibe Düşümü */}
            <div>
              <h3 className="font-bold text-slate-950 mb-2 border-b border-slate-200 pb-1">
                2. MALİYET HESABI, PAKET FARKI VE HİBE DÜŞÜMÜ
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 text-slate-600">İnşaat İmalat Payı Bedeli (KDV Dahil/Muaf):</td>
                      <td className="p-2 font-mono font-semibold text-right">{formatCurrency(owner.calculatedGrossCost)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Tercih Edilen Teknik Paket Farkı ({owner.packageChoice.toUpperCase()}):</td>
                      <td className="p-2 font-mono font-semibold text-right">+{formatCurrency(owner.packageCostDifference)}</td>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-950 font-bold">
                      <td className="p-2">Düşülen 'Yarısı Bizden' Devlet Hibe Desteği:</td>
                      <td className="p-2 font-mono text-right text-emerald-700">-{formatCurrency(owner.stateGrantBenefit)}</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold text-sm">
                      <td className="p-2 text-slate-950">MALİKİN ÖDEYECEĞİ NET BORÇ TUTARI:</td>
                      <td className="p-2 font-mono text-right text-amber-900">{formatCurrency(owner.netOwnerDebt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Ödeme Planı Tablosu */}
            <div>
              <h3 className="font-bold text-slate-950 mb-2 border-b border-slate-200 pb-1">
                3. ÖDEME PLANI VE VADELENDİRME
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-slate-300 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-500 block">Sözleşme Peşinatı</span>
                  <span className="font-bold font-mono text-sm text-slate-900">{formatCurrency(owner.paymentPlan.downPayment)}</span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-500 block">{owner.paymentPlan.installmentCount} Ay Eşit Taksit</span>
                  <span className="font-bold font-mono text-sm text-slate-900">{formatCurrency(owner.paymentPlan.monthlyInstallment)} / Ay</span>
                </div>
                <div className="border border-slate-300 p-2.5 rounded text-center">
                  <span className="text-[10px] text-slate-500 block">Anahtar Tesliminde</span>
                  <span className="font-bold font-mono text-sm text-slate-900">{formatCurrency(owner.paymentPlan.deliveryPayment)}</span>
                </div>
              </div>
            </div>

            {/* Banka Hesap Bilgileri */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[11px]">
              <span className="font-bold block text-slate-800 mb-1">Ödemelerin Yapılacağı Şirket Banka Hesabı:</span>
              <p><strong>Banka:</strong> {company.bankAccounts[0]?.bank} ({company.bankAccounts[0]?.branch})</p>
              <p className="font-mono"><strong>IBAN:</strong> {company.bankAccounts[0]?.iban}</p>
            </div>

            {/* İmzalar */}
            <div className="pt-6 grid grid-cols-2 gap-12 text-center">
              <div>
                <div className="font-bold text-slate-950 mb-1">MÜTEAHHİT FİRMA YETKİLİSİ</div>
                <div className="text-[11px] text-slate-600">{company.tradeTitle}</div>
                <div className="h-16 flex items-center justify-center italic text-slate-400 text-xs">
                  [Kaşe / İmza]
                </div>
                <div className="font-semibold text-slate-800">{company.authorizedPerson}</div>
              </div>

              <div>
                <div className="font-bold text-slate-950 mb-1">MALİK (HAK SAHİBİ)</div>
                <div className="text-[11px] text-slate-600">Yukarıdaki şartları okudum, kabul ediyorum.</div>
                <div className="h-16 flex items-center justify-center italic text-slate-400 text-xs">
                  [İmza]
                </div>
                <div className="font-semibold text-slate-800">{owner.fullName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
