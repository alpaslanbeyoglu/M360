import React, { useState } from 'react';
import {
  INITIAL_COMPANIES,
  INITIAL_CAD_SHAPES,
  INITIAL_PROJECT_FINANCIALS,
  INITIAL_OWNERS,
  INITIAL_PACKAGE_MATRIX,
  INITIAL_SITE_LOGS,
  INITIAL_CONSTRUCTION_STAGES,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS
} from './mockData';
import {
  CompanyProfile,
  CadShape,
  ProjectFinancials,
  OwnerRecord,
  PackageOptionItem,
  DailySiteLog,
  ConstructionStage,
  InventoryItem,
  CashTransaction
} from './types';
import { Navbar, ActiveModule } from './components/Navbar';
import { CadWorkspace } from './components/CadCanvas/CadWorkspace';
import { ProposalEngine } from './components/ProposalEngine/ProposalEngine';
import { OwnerLedger } from './components/OwnerLedger/OwnerLedger';
import { SiteTracker } from './components/SiteTracker/SiteTracker';
import { CompanyModal } from './components/CompanyModal';
import { ProposalPrintView } from './components/ProposalPrintView';
import { Compass, Calculator, Users, HardHat } from 'lucide-react';

export default function App() {
  // State: Şirketler ve Seçili Firma
  const [companies, setCompanies] = useState<CompanyProfile[]>(INITIAL_COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(INITIAL_COMPANIES[0].id);

  // State: CAD Şekilleri & Verileri
  const [cadShapes, setCadShapes] = useState<CadShape[]>(INITIAL_CAD_SHAPES);

  // State: Teklif & Finansal Hesaplamalar
  const [financials, setFinancials] = useState<ProjectFinancials>(INITIAL_PROJECT_FINANCIALS);

  // State: Paket Karşılaştırma Matrisi
  const [packageMatrix, setPackageMatrix] = useState<PackageOptionItem[]>(INITIAL_PACKAGE_MATRIX);

  // State: Malik Listesi & Borçlandırma
  const [owners, setOwners] = useState<OwnerRecord[]>(INITIAL_OWNERS);

  // State: Şantiye Takibi & Raporları
  const [siteLogs, setSiteLogs] = useState<DailySiteLog[]>(INITIAL_SITE_LOGS);
  const [stages, setStages] = useState<ConstructionStage[]>(INITIAL_CONSTRUCTION_STAGES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [transactions, setTransactions] = useState<CashTransaction[]>(INITIAL_TRANSACTIONS);

  // State: UI Durumları
  const [activeModule, setActiveModule] = useState<ActiveModule>('cad');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];

  // CAD Alanlarını Teklif Motoruna Otomatik Aktarma
  const handleSyncAreasToProposal = (landAreaM2: number, baseAreaM2: number) => {
    const totalConst = Math.round(baseAreaM2 * financials.floorCount * 1.25);
    setFinancials((prev) => ({
      ...prev,
      landAreaM2,
      baseAreaM2,
      totalConstructionM2: totalConst,
      residentialCount: Math.max(4, Math.round(totalConst / 140))
    }));
    setActiveModule('proposal');
  };

  // Firma Ekleme & Güncelleme
  const handleUpdateCompany = (updated: CompanyProfile) => {
    setCompanies(companies.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAddCompany = (newCompany: CompanyProfile) => {
    setCompanies([...companies, newCompany]);
  };

  // Yazdırma Görünümü Aktifse Tam Sayfa Antetli Teklifi Göster
  if (isPrintViewOpen) {
    return (
      <ProposalPrintView
        company={activeCompany}
        financials={financials}
        owners={owners}
        packageMatrix={packageMatrix}
        onBack={() => setIsPrintViewOpen(false)}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden text-slate-900 font-sans select-none">
      {/* Üst Navigasyon Çubuğu */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        companies={companies}
        activeCompanyId={activeCompanyId}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenPrintPreview={() => setIsPrintViewOpen(true)}
      />

      {/* Ana Çalışma Alanı (Modüler Render) */}
      <main className="flex-1 flex overflow-hidden relative bg-slate-50">
        {activeModule === 'cad' && (
          <CadWorkspace
            shapes={cadShapes}
            financials={financials}
            onUpdateShapes={setCadShapes}
            onUpdateFinancials={setFinancials}
            onSyncAreasToProposal={handleSyncAreasToProposal}
          />
        )}

        {activeModule === 'proposal' && (
          <ProposalEngine
            financials={financials}
            packageMatrix={packageMatrix}
            company={activeCompany}
            onUpdateFinancials={setFinancials}
            onUpdatePackageMatrix={setPackageMatrix}
            onNavigateToPrint={() => setIsPrintViewOpen(true)}
          />
        )}

        {activeModule === 'owners' && (
          <OwnerLedger
            owners={owners}
            company={activeCompany}
            financials={financials}
            onUpdateOwners={setOwners}
          />
        )}

        {activeModule === 'site' && (
          <SiteTracker
            logs={siteLogs}
            stages={stages}
            inventory={inventory}
            transactions={transactions}
            onAddLog={(log) => setSiteLogs([log, ...siteLogs])}
            onUpdateStage={setStages}
            onAddTransaction={(tx) => setTransactions([tx, ...transactions])}
            onUpdateInventory={setInventory}
          />
        )}
      </main>

      {/* Mobil Alt Gezinme Barı (Small screens) */}
      <div className="md:hidden h-14 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-20 shadow-xs">
        <button
          onClick={() => setActiveModule('cad')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-bold transition-colors ${
            activeModule === 'cad' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>CAD</span>
        </button>
        <button
          onClick={() => setActiveModule('proposal')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-bold transition-colors ${
            activeModule === 'proposal' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Teklif</span>
        </button>
        <button
          onClick={() => setActiveModule('owners')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-bold transition-colors ${
            activeModule === 'owners' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Malikler</span>
        </button>
        <button
          onClick={() => setActiveModule('site')}
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-bold transition-colors ${
            activeModule === 'site' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Şantiye</span>
        </button>
      </div>

      {/* Firma & SaaS Yönetim Modalı */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        companies={companies}
        activeCompanyId={activeCompanyId}
        onSelectCompany={setActiveCompanyId}
        onUpdateCompany={handleUpdateCompany}
        onAddCompany={handleAddCompany}
      />
    </div>
  );
}
