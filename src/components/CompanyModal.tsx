import React, { useState, useRef } from 'react';
import {
  Building2,
  X,
  Plus,
  Briefcase,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { CompanyProfile, CompanyReference } from '../types';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyProfile[];
  activeCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  onUpdateCompany: (company: CompanyProfile) => void;
  onAddCompany: (company: CompanyProfile) => void;
}

const PRESET_LOGOS = [
  { name: 'Gökdelen Mimari', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80' },
  { name: 'Modern İnşaat', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80' },
  { name: 'Çelik & Beton', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&auto=format&fit=crop&q=80' },
  { name: 'Minimalist Taahhüt', url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=200&auto=format&fit=crop&q=80' },
];

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompanyId,
  onSelectCompany,
  onUpdateCompany,
  onAddCompany
}) => {
  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];
  const [formData, setFormData] = useState<CompanyProfile>(activeCompany);
  const [isEditing, setIsEditing] = useState(false);
  const [logoMode, setLogoMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newRef, setNewRef] = useState<Partial<CompanyReference>>({
    projectName: '',
    location: 'İstanbul',
    totalM2: 5000,
    year: 2024,
    type: 'Kentsel Dönüşüm'
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateCompany(formData);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, logo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReference = () => {
    if (!newRef.projectName) return;
    const refItem: CompanyReference = {
      id: `ref-${Date.now()}`,
      projectName: newRef.projectName || '',
      location: newRef.location || 'İstanbul',
      totalM2: Number(newRef.totalM2 || 4000),
      year: Number(newRef.year || 2024),
      type: (newRef.type as any) || 'Kentsel Dönüşüm'
    };

    setFormData({
      ...formData,
      references: [...formData.references, refItem]
    });
    setNewRef({ projectName: '', location: 'İstanbul', totalM2: 5000, year: 2024, type: 'Kentsel Dönüşüm' });
  };

  const handleCreateNewCompany = () => {
    const newComp: CompanyProfile = {
      id: `comp-${Date.now()}`,
      name: 'Yeni Müteahhitlik A.Ş.',
      tradeTitle: 'Yeni Proje İnşaat Taahhüt San. ve Tic. A.Ş.',
      taxNumber: '1234567890',
      taxOffice: 'Kadıköy V.D.',
      phone: '+90 (216) 000 00 00',
      email: 'info@yeniyapi.com.tr',
      website: 'www.yeniyapi.com.tr',
      address: 'İstanbul',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
      authorizedPerson: 'Mimar / Mühendis',
      authorizedTitle: 'Şirket Müdürü',
      chambersRegistrationNo: 'İTO: 123456 / ÇSB Yetki: 0034-A-0000',
      themeColor: '#0284c7',
      bankAccounts: [
        { bank: 'T. Garanti Bankası', iban: 'TR00 0000 0000 0000 0000 0000 00', branch: 'Merkez Şb.' }
      ],
      references: []
    };

    onAddCompany(newComp);
    onSelectCompany(newComp.id);
    setFormData(newComp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Modal Başlığı */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Firma Profili & Çoklu Şirket Yönetimi</h2>
              <p className="text-xs text-slate-500">
                SaaS mantığıyla çoklu müteahhit firma geçişi, logo yönetimi, resmi antetli kağıt bilgileri ve referanslar
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firma Seçici Tabları */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto bg-slate-50">
          <div className="flex items-center gap-2">
            {companies.map((comp) => {
              const isSelected = comp.id === activeCompanyId;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    onSelectCompany(comp.id);
                    setFormData(comp);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                    isSelected
                      ? 'border-amber-600 text-amber-900 bg-white shadow-xs rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>{comp.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCreateNewCompany}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 shrink-0 pb-2 px-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Firma Ekle</span>
          </button>
        </div>

        {/* Modal Gövdesi */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-slate-50/30">
          {/* Firma Kartı & Düzenleme */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={formData.logo}
                    alt={formData.name}
                    className="w-18 h-18 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-xs"
                  />
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold cursor-pointer"
                    title="Logoyu Değiştir"
                  >
                    <Upload className="w-4 h-4 mb-0.5" />
                    Değiştir
                  </button>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{formData.name}</h3>
                  <p className="text-slate-600 text-[11px] font-medium">{formData.tradeTitle}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{formData.taxOffice} - V.No: {formData.taxNumber}</span>
                    <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{formData.chambersRegistrationNo}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-2 rounded-lg font-bold transition-colors shadow-xs ${
                  isEditing
                    ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isEditing ? 'Düzenlemeyi Kapat' : 'Firma & Logo Bilgilerini Düzenle'}
              </button>
            </div>

            {/* Düzenleme Formu & Logo Yükleyici */}
            {isEditing && (
              <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in">
                {/* Logo Yönetimi Bölümü */}
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      Firma Logosu Yükle / Değiştir
                    </span>
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setLogoMode('upload')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          logoMode === 'upload' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Dosyadan Yükle
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoMode('presets')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          logoMode === 'presets' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Hazır Logolar
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoMode('url')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          logoMode === 'url' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        URL Gir
                      </button>
                    </div>
                  </div>

                  {logoMode === 'upload' && (
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="company-logo-upload-input"
                      />
                      <label
                        htmlFor="company-logo-upload-input"
                        className="flex-1 cursor-pointer border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/50 rounded-xl p-3 flex items-center justify-center gap-2 text-slate-700 font-semibold transition-all shadow-xs"
                      >
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Cihazınızdan Logo Dosyası Seçin (PNG, JPG, SVG)</span>
                      </label>
                    </div>
                  )}

                  {logoMode === 'presets' && (
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_LOGOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, logo: p.url })}
                          className={`p-1.5 rounded-lg border text-left flex items-center gap-2 bg-white transition-all cursor-pointer ${
                            formData.logo === p.url
                              ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="w-8 h-8 rounded object-cover" />
                          <span className="text-[10px] font-medium text-slate-700 truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {logoMode === 'url' && (
                    <div>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Metin Bilgileri Formu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kısa Firma Adı</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Resmi Ticari Unvan</label>
                    <input
                      type="text"
                      value={formData.tradeTitle}
                      onChange={(e) => setFormData({ ...formData, tradeTitle: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Vergi Dairesi & No</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="V. Dairesi"
                        value={formData.taxOffice}
                        onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                        className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                      />
                      <input
                        type="text"
                        placeholder="Vergi No"
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900 shadow-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Yetkili Kişi & Unvan</label>
                    <input
                      type="text"
                      value={formData.authorizedPerson}
                      onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">ÇSB Müteahhitlik Belge No</label>
                    <input
                      type="text"
                      value={formData.chambersRegistrationNo}
                      onChange={(e) => setFormData({ ...formData, chambersRegistrationNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Telefon</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">E-posta</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Web Sitesi</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Açık Adres</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Referans Projeler */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-amber-600" />
              Firmanın Tamamlanan Referans Projeleri
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.references.map((ref: CompanyReference) => (
                <div key={ref.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ref.projectName}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono border border-slate-200">
                      {ref.year}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between font-medium">
                    <span>{ref.location} • {ref.type}</span>
                    <span className="font-mono font-bold text-emerald-700">{ref.totalM2.toLocaleString('tr-TR')} m²</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Yeni Referans Ekle */}
            <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 space-y-2.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-700 block">Yeni Referans Proje Ekle</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Proje Adı"
                  value={newRef.projectName || ''}
                  onChange={(e) => setNewRef({ ...newRef, projectName: e.target.value })}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 col-span-2 shadow-xs"
                />
                <input
                  type="number"
                  placeholder="Toplam m²"
                  value={newRef.totalM2 || ''}
                  onChange={(e) => setNewRef({ ...newRef, totalM2: Number(e.target.value) })}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono shadow-xs"
                />
                <button
                  onClick={handleAddReference}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                >
                  + Projeyi Ekle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Alt Barı */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-slate-600 text-[11px]">
            Aktif Antetli Firma: <strong className="text-amber-700 font-bold">{activeCompany.name}</strong>
          </div>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
