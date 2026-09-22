import React from 'react';
import {
  Building2,
  Compass,
  Calculator,
  Users,
  HardHat,
  ChevronDown,
  Printer
} from 'lucide-react';
import { CompanyProfile } from '../types';

export type ActiveModule = 'cad' | 'proposal' | 'owners' | 'site';

interface NavbarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  companies: CompanyProfile[];
  activeCompanyId: string;
  onOpenCompanyModal: () => void;
  onOpenPrintPreview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  companies,
  activeCompanyId,
  onOpenCompanyModal,
  onOpenPrintPreview
}) => {
  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];

  const navItems: { id: ActiveModule; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'cad', label: 'CAD Arsa Çizimi', icon: Compass },
    { id: 'proposal', label: 'Teklif & Maliyet Motoru', icon: Calculator },
    { id: 'owners', label: 'Malik Pay & Borçlandırma', icon: Users, badge: 'Yarısı Bizden' },
    { id: 'site', label: 'Şantiye & Finans', icon: HardHat }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0 select-none z-30 shadow-xs">
      {/* Sol: Logo & Firma Seçici (SaaS) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <span>Müteahhit</span>
              <span className="text-amber-600 font-mono">360</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Müteahhitlik & Teklif OS</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Firma Seçici Düğmesi */}
        <button
          id="company-switcher-btn"
          onClick={onOpenCompanyModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all shadow-xs cursor-pointer"
        >
          {activeCompany.logo && (
            <img
              src={activeCompany.logo}
              alt={activeCompany.name}
              className="w-5 h-5 rounded object-cover border border-slate-300"
            />
          )}
          <div className="max-w-[130px] lg:max-w-[200px] truncate">
            <div className="text-xs font-bold text-slate-900 truncate">{activeCompany.name}</div>
            <div className="text-[9px] text-slate-500 truncate">Firma / Logo Değiştir</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Orta: 4 Ana Modül Sekmesi */}
      <nav aria-label="Ana Modül Gezintisi" className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              id={`nav-module-${item.id}`}
              onClick={() => onSelectModule(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sağ: Resmi Teklif Çıktısı & Hızlı Butonlar */}
      <div className="flex items-center gap-2">
        <button
          id="print-proposal-navbar-btn"
          onClick={onOpenPrintPreview}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Antetli Teklif Al</span>
        </button>
      </div>
    </header>
  );
};
