import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  Percent,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { OwnerRecord, CompanyProfile, ProjectFinancials, PackageTier } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/cadMath';
import { OwnerContractModal } from './OwnerContractModal';

interface OwnerLedgerProps {
  owners: OwnerRecord[];
  company: CompanyProfile;
  financials: ProjectFinancials;
  onUpdateOwners: (owners: OwnerRecord[]) => void;
}

export const OwnerLedger: React.FC<OwnerLedgerProps> = ({
  owners,
  company,
  financials,
  onUpdateOwners
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOwnerForContract, setSelectedOwnerForContract] = useState<OwnerRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<OwnerRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<OwnerRecord>>({
    fullName: '',
    tcOrId: '',
    phone: '',
    currentShareM2: 70,
    currentShareRatio: '700/8400',
    currentUnitDescription: '',
    assignedUnitNo: '',
    assignedFloor: '',
    assignedUnitType: '3+1',
    assignedGrossM2: 130,
    assignedNetM2: 98,
    packageChoice: 'comfort_plus',
    serefiyeScore: 0,
    calculatedGrossCost: 3200000,
    packageCostDifference: 180000,
    stateGrantBenefit: 700000,
    stateLoanBenefit: 700000,
    netOwnerDebt: 1980000,
    paymentPlan: {
      downPayment: 500000,
      installmentCount: 24,
      monthlyInstallment: 45000,
      deliveryPayment: 400000
    },
    agreementStatus: 'Görüşülüyor'
  });

  // İstatistikler
  const totalOwners = owners.length;
  const signedCount = owners.filter((o) => o.agreementStatus === 'Sözleşme İmzalandı' || o.agreementStatus === 'Onaylandı').length;
  const agreementPercentage = totalOwners > 0 ? Math.round((signedCount / totalOwners) * 100) : 0;
  const isMajorityReached = agreementPercentage >= 67; // 2/3 Çoğunluk Kuralı

  const totalGrossDebt = owners.reduce((sum, o) => sum + o.calculatedGrossCost, 0);
  const totalStateGrantDistributed = owners.reduce((sum, o) => sum + o.stateGrantBenefit, 0);
  const totalNetOwnersDebt = owners.reduce((sum, o) => sum + o.netOwnerDebt, 0);

  // Filtreleme
  const filteredOwners = owners.filter((o) => {
    const matchesSearch =
      o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.assignedUnitNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tcOrId.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.agreementStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // CSV Dışa Aktarma
  const handleExportCSV = () => {
    const headers = [
      'Malik Adı Soyadı',
      'TC No',
      'Telefon',
      'Mevcut Arsa m2',
      'Eski Daire',
      'Yeni Daire No',
      'Kat/Konum',
      'Tip',
      'Net m2',
      'Paket',
      'Toplam İmalat Tutarı',
      'Paket Farkı',
      'Devlet Hibesi',
      'Net Malik Borcu',
      'Peşinat',
      'Taksit (24 Ay)',
      'Durum'
    ];

    const rows = owners.map((o) => [
      `"${o.fullName}"`,
      `"${o.tcOrId}"`,
      `"${o.phone}"`,
      o.currentShareM2,
      `"${o.currentUnitDescription}"`,
      `"${o.assignedUnitNo}"`,
      `"${o.assignedFloor}"`,
      o.assignedUnitType,
      o.assignedNetM2,
      o.packageChoice,
      o.calculatedGrossCost,
      o.packageCostDifference,
      o.stateGrantBenefit,
      o.netOwnerDebt,
      o.paymentPlan.downPayment,
      o.paymentPlan.monthlyInstallment,
      o.agreementStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Muteahhit360_Malik_Borclandirma_Tablosu_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Malik Durumu Hızlı Değiştir
  const handleStatusChange = (id: string, newStatus: OwnerRecord['agreementStatus']) => {
    onUpdateOwners(
      owners.map((o) => (o.id === id ? { ...o, agreementStatus: newStatus } : o))
    );
  };

  // Malik Sil
  const handleDeleteOwner = (id: string) => {
    if (confirm('Bu malik kaydını silmek istediğinize emin misiniz?')) {
      onUpdateOwners(owners.filter((o) => o.id !== id));
    }
  };

  // Form Kaydet
  const handleSaveOwner = () => {
    if (!formData.fullName || !formData.assignedUnitNo) {
      alert('Lütfen malik adı ve yeni daire numarasını giriniz.');
      return;
    }

    // Otomatik Borç Hesaplama
    const grossCost = Number(formData.calculatedGrossCost || 3000000);
    const pkgDiff = formData.packageChoice === 'comfort_plus' ? 180000 : formData.packageChoice === 'premium' ? 450000 : 0;
    const grant = Number(formData.stateGrantBenefit || 700000);
    const netDebt = Math.max(0, grossCost + pkgDiff - grant);
    const downPayment = Math.round(netDebt * 0.3);
    const monthlyInstallment = Math.round((netDebt - downPayment - Math.round(netDebt * 0.15)) / 24);

    const recordToSave: OwnerRecord = {
      id: editingOwner ? editingOwner.id : `own-${Date.now()}`,
      fullName: formData.fullName || '',
      tcOrId: formData.tcOrId || '12345678901',
      phone: formData.phone || '05XX XXX XX XX',
      currentShareM2: Number(formData.currentShareM2 || 70),
      currentShareRatio: formData.currentShareRatio || '700/8400',
      currentUnitDescription: formData.currentUnitDescription || 'Eski Kat Daire',
      assignedUnitNo: formData.assignedUnitNo || 'D: 1',
      assignedFloor: formData.assignedFloor || 'Kat 1',
      assignedUnitType: (formData.assignedUnitType as any) || '3+1',
      assignedGrossM2: Number(formData.assignedGrossM2 || 130),
      assignedNetM2: Number(formData.assignedNetM2 || 98),
      packageChoice: (formData.packageChoice as PackageTier) || 'comfort_plus',
      serefiyeScore: Number(formData.serefiyeScore || 0),
      calculatedGrossCost: grossCost,
      packageCostDifference: pkgDiff,
      stateGrantBenefit: grant,
      stateLoanBenefit: Number(formData.stateLoanBenefit || 700000),
      netOwnerDebt: netDebt,
      paymentPlan: {
        downPayment,
        installmentCount: 24,
        monthlyInstallment,
        deliveryPayment: Math.round(netDebt * 0.15)
      },
      agreementStatus: (formData.agreementStatus as any) || 'Görüşülüyor'
    };

    if (editingOwner) {
      onUpdateOwners(owners.map((o) => (o.id === editingOwner.id ? recordToSave : o)));
    } else {
      onUpdateOwners([...owners, recordToSave]);
    }

    setIsAddModalOpen(false);
    setEditingOwner(null);
  };

  const openEditModal = (owner: OwnerRecord) => {
    setEditingOwner(owner);
    setFormData(owner);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-4 lg:p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Üst Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                Malik Pay & Borçlandırma Tablosu
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Kat irtifakı daire dağılım matrisi, paket farkları, "Yarısı Bizden" hibe düşümü ve kişiye özel borç dökümleri
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Excel/CSV Dışa Aktar</span>
            </button>
            <button
              id="add-owner-btn"
              onClick={() => {
                setEditingOwner(null);
                setFormData({
                  fullName: '',
                  tcOrId: '',
                  phone: '',
                  currentShareM2: 70,
                  currentShareRatio: '700/8400',
                  currentUnitDescription: '',
                  assignedUnitNo: `D: ${owners.length + 1}`,
                  assignedFloor: 'Kat 2',
                  assignedUnitType: '3+1',
                  assignedGrossM2: 135,
                  assignedNetM2: 102,
                  packageChoice: 'comfort_plus',
                  calculatedGrossCost: 3200000,
                  packageCostDifference: 185000,
                  stateGrantBenefit: 700000,
                  stateLoanBenefit: 700000,
                  netOwnerDebt: 1985000,
                  paymentPlan: {
                    downPayment: 600000,
                    installmentCount: 24,
                    monthlyInstallment: 45000,
                    deliveryPayment: 300000
                  },
                  agreementStatus: 'Görüşülüyor'
                });
                setIsAddModalOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yeni Malik Ekle</span>
            </button>
          </div>
        </div>

        {/* 4 Özet İstatistik Kartı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Çoğunluk & Mutabakat Durumu */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>2/3 Çoğunluk Mutabakat</span>
              <Percent className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-100 flex items-baseline gap-2">
              %{agreementPercentage}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isMajorityReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isMajorityReached ? 'Yeterli Çoğunluk Sağlandı' : '%67 Bekleniyor'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {signedCount} / {totalOwners} Malik Onay / İmzalı
            </div>
          </div>

          {/* 2. Toplam İnşaat İmalat Hacmi */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Toplam İmalat Değeri</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-400">
              {formatCurrency(totalGrossDebt)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Proje Kaba + İnce İmalat Toplamı
            </div>
          </div>

          {/* 3. Düşülen Devlet Hibesi */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Devlet Hibe Desteği</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              -{formatCurrency(totalStateGrantDistributed)}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-2">
              "Yarısı Bizden" Karşılıksız Destek
            </div>
          </div>

          {/* 4. Maliklerin Toplam Net Borcu */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 bg-gradient-to-br from-slate-900 to-amber-950/20">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1 font-semibold">
              <span>Malikler Net Borç Toplamı</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black font-mono text-amber-300">
              {formatCurrency(totalNetOwnersDebt)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Malik Başı Ort: <strong className="font-mono text-slate-200">{formatCurrency(totalNetOwnersDebt / (totalOwners || 1))}</strong>
            </div>
          </div>
        </div>

        {/* Filtre ve Arama Çubuğu */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Malik adı, daire no veya TC ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tüm Malikler ({owners.length})</option>
              <option value="Sözleşme İmzalandı">Sözleşme İmzalandı</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="Görüşülüyor">Görüşülüyor</option>
              <option value="İtirazlı">İtirazlı</option>
            </select>
          </div>
        </div>

        {/* Malikler Ana Tablosu */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700 select-none">
                  <th className="p-3.5">Malik & İletişim</th>
                  <th className="p-3.5">Mevcut Arsa Payı</th>
                  <th className="p-3.5">Yeni Tahsis Daire</th>
                  <th className="p-3.5">Paket Tercihi</th>
                  <th className="p-3.5 text-right">İmalat Tutarı</th>
                  <th className="p-3.5 text-right text-emerald-400">Devlet Hibesi</th>
                  <th className="p-3.5 text-right text-amber-400 font-bold">Net Malik Borcu</th>
                  <th className="p-3.5">Ödeme Planı (Peşinat / Taksit)</th>
                  <th className="p-3.5 text-center">Durum</th>
                  <th className="p-3.5 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400">
                      Arama kriterlerine uygun malik kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => {
                    const statusBadgeClass =
                      owner.agreementStatus === 'Sözleşme İmzalandı'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : owner.agreementStatus === 'Onaylandı'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : owner.agreementStatus === 'Görüşülüyor'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                    return (
                      <tr key={owner.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Malik Bilgisi */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-100">{owner.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            TC: {owner.tcOrId} • {owner.phone}
                          </div>
                        </td>

                        {/* Mevcut Arsa Payı */}
                        <td className="p-3.5">
                          <div className="font-mono font-semibold text-slate-200">{owner.currentShareM2} m²</div>
                          <div className="text-[10px] text-slate-400 truncate">{owner.currentUnitDescription}</div>
                        </td>

                        {/* Yeni Tahsis */}
                        <td className="p-3.5">
                          <div className="font-bold text-amber-400 flex items-center gap-1.5">
                            <span>{owner.assignedUnitNo}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                              {owner.assignedUnitType}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {owner.assignedFloor} • {owner.assignedNetM2} m² Net
                          </div>
                        </td>

                        {/* Paket Tercihi */}
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              owner.packageChoice === 'standard'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                                : owner.packageChoice === 'comfort_plus'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                            }`}
                          >
                            {owner.packageChoice === 'standard'
                              ? 'Standart'
                              : owner.packageChoice === 'comfort_plus'
                              ? 'Konfor Plus'
                              : 'Premium'}
                          </span>
                          {owner.packageCostDifference > 0 && (
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              +{formatCurrency(owner.packageCostDifference)}
                            </div>
                          )}
                        </td>

                        {/* İmalat Tutarı */}
                        <td className="p-3.5 text-right font-mono text-slate-300">
                          {formatCurrency(owner.calculatedGrossCost)}
                        </td>

                        {/* Devlet Hibesi */}
                        <td className="p-3.5 text-right font-mono text-emerald-400 font-semibold">
                          -{formatCurrency(owner.stateGrantBenefit)}
                        </td>

                        {/* Net Malik Borcu */}
                        <td className="p-3.5 text-right font-mono font-bold text-amber-300 text-sm">
                          {formatCurrency(owner.netOwnerDebt)}
                        </td>

                        {/* Ödeme Planı */}
                        <td className="p-3.5 text-[11px] font-mono">
                          <div>Peşinat: <strong className="text-slate-200">{formatCurrency(owner.paymentPlan.downPayment)}</strong></div>
                          <div className="text-slate-400">{owner.paymentPlan.installmentCount} Ay x {formatCurrency(owner.paymentPlan.monthlyInstallment)}</div>
                        </td>

                        {/* Durum */}
                        <td className="p-3.5 text-center">
                          <select
                            value={owner.agreementStatus}
                            onChange={(e) => handleStatusChange(owner.id, e.target.value as any)}
                            className={`text-[10px] font-bold px-2 py-1 rounded border bg-slate-900 cursor-pointer ${statusBadgeClass}`}
                          >
                            <option value="Görüşülüyor">Görüşülüyor</option>
                            <option value="Onaylandı">Onaylandı</option>
                            <option value="Sözleşme İmzalandı">Sözleşme İmzalandı</option>
                            <option value="İtirazlı">İtirazlı</option>
                          </select>
                        </td>

                        {/* İşlemler */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedOwnerForContract(owner)}
                              className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                              title="Malik Sözleşme & Protokol Belgesi Yazdır"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(owner)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOwner(owner.id)}
                              className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Malik Ekleme / Düzenleme Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingOwner ? 'Malik Bilgilerini Düzenle' : 'Yeni Malik & Daire Tahsisi Ekle'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Malik Adı Soyadı *</label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    placeholder="Örn: Mehmet Özkan"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">T.C. Kimlik No</label>
                  <input
                    type="text"
                    value={formData.tcOrId || ''}
                    onChange={(e) => setFormData({ ...formData, tcOrId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    placeholder="11 haneli TC No"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    placeholder="0532 ..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mevcut Arsa Payı (m²)</label>
                  <input
                    type="number"
                    value={formData.currentShareM2 || ''}
                    onChange={(e) => setFormData({ ...formData, currentShareM2: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Eski Daire Tanımı</label>
                  <input
                    type="text"
                    value={formData.currentUnitDescription || ''}
                    onChange={(e) => setFormData({ ...formData, currentUnitDescription: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    placeholder="Kat 2 No 4"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <span className="font-bold text-amber-400 block">Yeni Projedeki Tahsis:</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Yeni Daire No *</label>
                    <input
                      type="text"
                      value={formData.assignedUnitNo || ''}
                      onChange={(e) => setFormData({ ...formData, assignedUnitNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold"
                      placeholder="D: 8"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Kat & Konum</label>
                    <input
                      type="text"
                      value={formData.assignedFloor || ''}
                      onChange={(e) => setFormData({ ...formData, assignedFloor: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                      placeholder="Kat 4 (Güney-Doğu)"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Daire Tipi</label>
                    <select
                      value={formData.assignedUnitType}
                      onChange={(e) => setFormData({ ...formData, assignedUnitType: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="Dubleks">Dubleks</option>
                      <option value="Dükkan">Dükkan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Brüt / Net m²</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        placeholder="Brüt"
                        value={formData.assignedGrossM2 || ''}
                        onChange={(e) => setFormData({ ...formData, assignedGrossM2: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded p-1.5"
                      />
                      <input
                        type="number"
                        placeholder="Net"
                        value={formData.assignedNetM2 || ''}
                        onChange={(e) => setFormData({ ...formData, assignedNetM2: Number(e.target.value) })}
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded p-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Paket Tercihi</label>
                    <select
                      value={formData.packageChoice}
                      onChange={(e) => setFormData({ ...formData, packageChoice: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="standard">Standart Paket</option>
                      <option value="comfort_plus">Konfor Plus</option>
                      <option value="premium">Premium Prestij</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Protokol Durumu</label>
                    <select
                      value={formData.agreementStatus}
                      onChange={(e) => setFormData({ ...formData, agreementStatus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="Görüşülüyor">Görüşülüyor</option>
                      <option value="Onaylandı">Onaylandı</option>
                      <option value="Sözleşme İmzalandı">Sözleşme İmzalandı</option>
                      <option value="İtirazlı">İtirazlı</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleSaveOwner}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg"
              >
                Kaydet & Hesapla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sözleşme & Protokol Belgesi Modalı */}
      <OwnerContractModal
        isOpen={!!selectedOwnerForContract}
        onClose={() => setSelectedOwnerForContract(null)}
        owner={selectedOwnerForContract}
        company={company}
        financials={financials}
      />
    </div>
  );
};
