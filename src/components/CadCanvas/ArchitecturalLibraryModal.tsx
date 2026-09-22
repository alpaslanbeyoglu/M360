import React, { useState } from 'react';
import {
  X,
  Plus,
  DoorClosed,
  AppWindow,
  Maximize2,
  Bath,
  Utensils,
  BedDouble,
  Tag,
  ShieldCheck,
  Info,
  Search,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { ARCHITECTURAL_PRESETS, ArchitecturalPreset } from '../../data/architecturalPresets';

interface ArchitecturalLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: ArchitecturalPreset) => void;
}

export const ArchitecturalLibraryModal: React.FC<ArchitecturalLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', name: 'Tüm Kütüphane', icon: Layers, count: ARCHITECTURAL_PRESETS.length },
    { id: 'KAPI', name: 'Kapılar (İç/Dış)', icon: DoorClosed, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'KAPI').length },
    { id: 'PENCERE', name: 'Pencereler', icon: AppWindow, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'PENCERE').length },
    { id: 'DUVAR', name: 'Bölme Duvarlar', icon: Maximize2, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'DUVAR').length },
    { id: 'BANYO_WC', name: 'Banyo & WC', icon: Bath, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'BANYO_WC').length },
    { id: 'MUTFAK', name: 'Mutfak Tefriş', icon: Utensils, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'MUTFAK').length },
    { id: 'ODALAR_TEFRİS', name: 'Oda Tefrişleri', icon: BedDouble, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'ODALAR_TEFRİS').length },
    { id: 'MAHAL_ETİKETİ', name: 'Mahal & Piyes', icon: Tag, count: ARCHITECTURAL_PRESETS.filter(p => p.category === 'MAHAL_ETİKETİ').length }
  ];

  const filteredPresets = ARCHITECTURAL_PRESETS.filter((preset) => {
    const matchesCategory = selectedCategory === 'ALL' || preset.category === selectedCategory;
    const matchesSearch =
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.standardDimensionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.regulationNote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Üst Başlık & Yönetmelik Bilgilendirmesi */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Planlı Alanlar İmar Yönetmeliği Uyumlu
              </span>
              <span className="text-slate-400 text-xs">| TSE & Mimari Standartlar</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">Mimari Kat Planı Kütüphanesi & Tefriş Ekle</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Arama & Kategori Sekmeleri */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          {/* Arama Çubuğu */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Mimari öğe ara (Örn: Çelik kapı, 140x150 pencere, klozet, 15cm duvar, salon damgası)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Kategori Filtre Hapları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Eleman Listesi (Grid) */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-600">Aradığınız kriterlere uygun mimari eleman bulunamadı.</p>
              <p className="text-xs text-slate-400 mt-1">Farklı bir arama terimi deneyebilir veya kategorileri değiştirebilirsiniz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Üst Bilgi Rozetleri */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {preset.code}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                        {preset.standardDimensionLabel}
                      </span>
                    </div>

                    {/* İsim */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {preset.name}
                    </h3>

                    {/* Resmi Yönetmelik & Standart Notu */}
                    <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {preset.regulationNote}
                      </p>
                    </div>
                  </div>

                  {/* Alt Eylem Butonu */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Boyut: <strong className="text-slate-700">{preset.widthMeters.toFixed(2)}m x {preset.depthMeters.toFixed(2)}m</strong>
                    </div>
                    <button
                      onClick={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer group-hover:ring-2 group-hover:ring-blue-400/40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plana Ekle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Bilgi Çubuğu */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tüm elemanlar <strong>Çevre, Şehircilik ve İklim Değişikliği Bakanlığı</strong> resmi yönetmeliklerine göredir.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
