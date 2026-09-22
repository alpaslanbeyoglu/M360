import React from 'react';
import { X, Check, Star, Zap, Shield, Sparkles } from 'lucide-react';
import { PackageOptionItem, PackageTier } from '../../types';
import { formatCurrency } from '../../utils/cadMath';

interface PackageMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageMatrix: PackageOptionItem[];
  selectedTier: PackageTier;
  onSelectTier: (tier: PackageTier) => void;
}

export const PackageMatrixModal: React.FC<PackageMatrixModalProps> = ({
  isOpen,
  onClose,
  packageMatrix,
  selectedTier,
  onSelectTier
}) => {
  if (!isOpen) return null;

  // Paket toplam ek maliyetleri
  const comfortPlusExtraTotal = packageMatrix
    .filter((item) => item.comfortPlusIncluded && !item.standardIncluded)
    .reduce((sum, item) => sum + item.extraCostM2, 0);

  const premiumExtraTotal = packageMatrix
    .filter((item) => item.premiumIncluded && !item.standardIncluded)
    .reduce((sum, item) => sum + item.extraCostM2, 0);

  const categories = Array.from(new Set(packageMatrix.map((item) => item.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Başlığı */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Teknik Şartname & Paket Seçenek Matrisi</h2>
              <p className="text-xs text-slate-400">
                Standart, Konfor Plus ve Premium teknik donanım karşılaştırması ve birim m² farkları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tablo İçeriği */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 3 Paket Kartı Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Standart Paket */}
            <div
              onClick={() => onSelectTier('standard')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTier === 'standard'
                  ? 'bg-slate-800 border-sky-500 ring-2 ring-sky-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                  <Shield className="w-4 h-4 text-sky-400" />
                  Standart Paket
                </span>
                {selectedTier === 'standard' && (
                  <span className="bg-sky-500/20 text-sky-400 text-[10px] px-2 py-0.5 rounded font-bold">
                    Seçili
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3 min-h-[36px]">
                Yüksek mukavemetli deprem güvenliği, C35 beton, radyatörlü ısıtma ve kaliteli yerli malzemeler.
              </p>
              <div className="text-lg font-bold text-slate-100 font-mono">
                Taban Fiyat <span className="text-xs text-slate-400 font-normal">(Fark: 0 TL/m²)</span>
              </div>
            </div>

            {/* Konfor Plus */}
            <div
              onClick={() => onSelectTier('comfort_plus')}
              className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                selectedTier === 'comfort_plus'
                  ? 'bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-bl">
                En Popüler
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Konfor Plus
                </span>
                {selectedTier === 'comfort_plus' && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">
                    Seçili
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3 min-h-[36px]">
                Sulu yerden ısıtma, klima altyapısı, akıllı kilit sistemi ve merkezi bina su filtreleme.
              </p>
              <div className="text-lg font-bold text-amber-400 font-mono">
                +{formatCurrency(comfortPlusExtraTotal)} <span className="text-xs text-slate-400 font-normal">/ m²</span>
              </div>
            </div>

            {/* Premium Prestij */}
            <div
              onClick={() => onSelectTier('premium')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTier === 'premium'
                  ? 'bg-violet-950/20 border-violet-500 ring-2 ring-violet-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-violet-300 flex items-center gap-1.5 text-sm">
                  <Star className="w-4 h-4 text-violet-400" />
                  Premium Prestij
                </span>
                {selectedTier === 'premium' && (
                  <span className="bg-violet-500/20 text-violet-400 text-[10px] px-2 py-0.5 rounded font-bold">
                    Seçili
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3 min-h-[36px]">
                İtalyan lake mutfak & ankastre set, kapalı otoparkta EV şarj istasyonu, çatı GES ve lüks mimari detaylar.
              </p>
              <div className="text-lg font-bold text-violet-400 font-mono">
                +{formatCurrency(premiumExtraTotal)} <span className="text-xs text-slate-400 font-normal">/ m²</span>
              </div>
            </div>
          </div>

          {/* Kalem Kalem Detaylı Karşılaştırma Tablosu */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                    <th className="p-3 w-1/2">Donanım & İmalat Kalemi</th>
                    <th className="p-3 text-center w-1/6">Standart</th>
                    <th className="p-3 text-center w-1/6 text-amber-400">Konfor Plus</th>
                    <th className="p-3 text-center w-1/6 text-violet-400">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {categories.map((category) => {
                    const categoryItems = packageMatrix.filter((item) => item.category === category);
                    return (
                      <React.Fragment key={category}>
                        <tr className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <td colSpan={4} className="px-3 py-2 bg-slate-950/60">
                            {category}
                          </td>
                        </tr>
                        {categoryItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-slate-200">{item.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                              {item.extraCostM2 > 0 && (
                                <span className="inline-block mt-1 text-[10px] text-amber-400 font-mono">
                                  İlave Maliyet: {formatCurrency(item.extraCostM2)}/m²
                                </span>
                              )}
                            </td>
                            {/* Standart */}
                            <td className="p-3 text-center">
                              {item.standardIncluded ? (
                                <div className="inline-flex p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : (
                                <span className="text-slate-600 font-mono">-</span>
                              )}
                            </td>
                            {/* Konfor Plus */}
                            <td className="p-3 text-center bg-amber-500/5">
                              {item.comfortPlusIncluded ? (
                                <div className="inline-flex p-1 rounded-full bg-amber-500/20 text-amber-400">
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : (
                                <span className="text-slate-600 font-mono">-</span>
                              )}
                            </td>
                            {/* Premium */}
                            <td className="p-3 text-center bg-violet-500/5">
                              {item.premiumIncluded ? (
                                <div className="inline-flex p-1 rounded-full bg-violet-500/20 text-violet-400">
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : (
                                <span className="text-slate-600 font-mono">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Alt Barı */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Seçili Paket: <strong className="text-slate-200 capitalize">{selectedTier.replace('_', ' ')}</strong>
          </div>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition-colors"
          >
            Seçimi Kaydet & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
