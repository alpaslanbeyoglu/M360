import React, { useState } from 'react';
import {
  HardHat,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Boxes,
  Plus,
  TrendingUp,
  TrendingDown,
  Sun,
  CloudRain,
  Shield,
  FileCheck,
  Building,
  AlertCircle
} from 'lucide-react';
import { DailySiteLog, ConstructionStage, InventoryItem, CashTransaction } from '../../types';
import { formatCurrency } from '../../utils/cadMath';

interface SiteTrackerProps {
  logs: DailySiteLog[];
  stages: ConstructionStage[];
  inventory: InventoryItem[];
  transactions: CashTransaction[];
  onAddLog: (log: DailySiteLog) => void;
  onUpdateStage: (stages: ConstructionStage[]) => void;
  onAddTransaction: (tx: CashTransaction) => void;
  onUpdateInventory: (items: InventoryItem[]) => void;
}

export const SiteTracker: React.FC<SiteTrackerProps> = ({
  logs,
  stages,
  inventory,
  transactions,
  onAddLog,
  onUpdateStage,
  onAddTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'logs' | 'finance' | 'inventory'>('stages');
  const [isNewLogModalOpen, setIsNewLogModalOpen] = useState(false);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // Günlük Rapor Form State
  const [newLogData, setNewLogData] = useState<Partial<DailySiteLog>>({
    date: new Date().toISOString().split('T')[0],
    weather: 'Güneşli',
    temperatureC: 22,
    workersCount: {
      demirciler: 6,
      kalipçilar: 8,
      duvarcılar: 4,
      elektrikçiler: 2,
      tesisatçilar: 2,
      muhendisler: 2,
      diger: 2
    },
    workDone: '',
    incomingMaterials: '',
    safetyNotes: 'Baret ve iş güvenliği donanımları kontrol edildi. Uygun.',
    supervisorName: 'Şantiye Şefi İnş. Müh. Ali Kemal Dağdelen'
  });

  // Yeni Finans İşlemi State
  const [newTxData, setNewTxData] = useState<Partial<CashTransaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Gider',
    category: 'Demir Alımı',
    amountTL: 150000,
    description: '',
    payerOrPayee: ''
  });

  // Toplam İlerleme Yüzdesi
  const overallProgress = Math.round(
    stages.reduce((sum, stg) => sum + stg.completionPercent, 0) / (stages.length || 1)
  );

  // Finans Toplamları
  const totalIncome = transactions.filter((t) => t.type === 'Gelir').reduce((sum, t) => sum + t.amountTL, 0);
  const totalExpense = transactions.filter((t) => t.type === 'Gider').reduce((sum, t) => sum + t.amountTL, 0);
  const netBalance = totalIncome - totalExpense;

  // Depo Toplam Değeri
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.currentStock * item.unitPriceTL, 0);

  // İlerleme Güncelleme
  const handleStagePercentChange = (id: string, newPercent: number) => {
    const updated = stages.map((s) => {
      if (s.id === id) {
        const p = Math.max(0, Math.min(100, newPercent));
        const status: ConstructionStage['status'] =
          p === 100 ? 'Tamamlandı' : p > 0 ? 'Devam Ediyor' : 'Planlandı';
        return { ...s, completionPercent: p, status };
      }
      return s;
    });
    onUpdateStage(updated);
  };

  // Yeni Log Kaydet
  const handleSaveLog = () => {
    if (!newLogData.workDone) {
      alert('Lütfen yapılan işler açıklamasını giriniz.');
      return;
    }

    const logToSave: DailySiteLog = {
      id: `log-${Date.now()}`,
      date: newLogData.date || new Date().toISOString().split('T')[0],
      weather: (newLogData.weather as any) || 'Güneşli',
      temperatureC: Number(newLogData.temperatureC || 20),
      workersCount: newLogData.workersCount || {
        demirciler: 0,
        kalipçilar: 0,
        duvarcılar: 0,
        elektrikçiler: 0,
        tesisatçilar: 0,
        muhendisler: 1,
        diger: 0
      },
      workDone: newLogData.workDone || '',
      incomingMaterials: newLogData.incomingMaterials || 'Gelen malzeme yok',
      safetyNotes: newLogData.safetyNotes || 'İSG kontrolleri yapıldı',
      supervisorName: newLogData.supervisorName || 'Şantiye Şefi'
    };

    onAddLog(logToSave);
    setIsNewLogModalOpen(false);
  };

  // Yeni Finans İşlemi Kaydet
  const handleSaveTransaction = () => {
    if (!newTxData.amountTL || !newTxData.description) {
      alert('Lütfen tutar ve açıklama giriniz.');
      return;
    }

    const txToSave: CashTransaction = {
      id: `tx-${Date.now()}`,
      date: newTxData.date || new Date().toISOString().split('T')[0],
      type: (newTxData.type as any) || 'Gider',
      category: (newTxData.category as any) || 'Demir Alımı',
      amountTL: Number(newTxData.amountTL),
      description: newTxData.description || '',
      payerOrPayee: newTxData.payerOrPayee || 'Firma/Şahıs'
    };

    onAddTransaction(txToSave);
    setIsNewTxModalOpen(false);
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-4 lg:p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Başlık Barı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <HardHat className="w-5 h-5" />
              </span>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                Şantiye, Hakediş & Finans Takip Paneli
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Günlük şantiye raporları, hakediş aşamaları, nakit akışı ve depo malzeme stok kontrolü
            </p>
          </div>

          {/* Alt Sekme Geçişleri */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('stages')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'stages'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hakediş & İlerleme (%{overallProgress})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Günlük Şantiye Raporları ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'finance'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nakit Akışı & Finans
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Depo & Stok ({inventory.length})
            </button>
          </div>
        </div>

        {/* 1. SEKME: İLERLEME & HAKEDİŞ AŞAMALARI */}
        {activeTab === 'stages' && (
          <div className="space-y-6">
            {/* Büyük İlerleme Özeti */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Toplam Proje Fiziksel İlerleme Oranı
                  </span>
                  <div className="text-3xl font-black font-mono text-amber-400 flex items-baseline gap-2">
                    %{overallProgress}
                    <span className="text-xs text-slate-400 font-normal">
                      (9 Ana İmalat Aşaması)
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 text-xs">
                  <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tamamlanan:</span>
                    <span className="font-bold text-emerald-400">
                      {stages.filter((s) => s.status === 'Tamamlandı').length} Aşama
                    </span>
                  </div>
                  <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Devam Eden:</span>
                    <span className="font-bold text-sky-400">
                      {stages.filter((s) => s.status === 'Devam Ediyor').length} Aşama
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Aşama Kartları Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stages.map((stage) => {
                const statusColor =
                  stage.status === 'Tamamlandı'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : stage.status === 'Devam Ediyor'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700';

                return (
                  <div key={stage.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {stage.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                        {stage.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{stage.name}</h4>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Hakediş / İlerleme:</span>
                        <span className="font-bold font-mono text-amber-400">%{stage.completionPercent}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stage.completionPercent}
                        onChange={(e) => handleStagePercentChange(stage.id, Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                      <span>{stage.startDate}</span>
                      <span>→</span>
                      <span>{stage.endDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. SEKME: GÜNLÜK ŞANTİYE RAPORLARI */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200">Günlük İmalat & Puantaj Kayıtları</h3>
              <button
                onClick={() => setIsNewLogModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Günlük Rapor Ekle</span>
              </button>
            </div>

            <div className="space-y-4">
              {logs.map((log) => {
                const totalWorkers = Object.values(log.workersCount).reduce((a, b) => a + b, 0);

                return (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-xs">
                          {log.date}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          {log.weather === 'Güneşli' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <CloudRain className="w-4 h-4 text-sky-400" />
                          )}
                          <span>{log.weather} ({log.temperatureC}°C)</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">
                        Toplam Sahada: <strong className="text-amber-400 font-mono font-bold">{totalWorkers} Personel / Usta</strong>
                      </div>
                    </div>

                    {/* Personel Puantaj Dağılımı */}
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Demirci</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.demirciler}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Kalıpçı</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.kalipçilar}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Duvarcı</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.duvarcılar}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Elektrikçi</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.elektrikçiler}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Tesisatçı</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.tesisatçilar}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Mühendis</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.muhendisler}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400">Diğer</div>
                        <div className="font-bold font-mono text-slate-200">{log.workersCount.diger}</div>
                      </div>
                    </div>

                    {/* Yapılan İmalatlar */}
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="font-bold text-slate-300 block mb-1">Günün İmalat Özeti:</span>
                        <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                          {log.workDone}
                        </p>
                      </div>

                      {log.incomingMaterials && (
                        <div>
                          <span className="font-bold text-slate-300 block mb-1">Gelen Malzemeler:</span>
                          <p className="text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                            {log.incomingMaterials}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 gap-2">
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Shield className="w-3.5 h-3.5" />
                          <span>{log.safetyNotes}</span>
                        </div>
                        <div className="font-semibold text-slate-300">
                          Raporu Hazırlayan: {log.supervisorName}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SEKME: NAKİT AKIŞI & FİNANS */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* 3 Finans Kartı */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Toplam Tahsil Edilen Gelir</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {formatCurrency(totalIncome)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Malik Ödemeleri & Hibe Aktarımları</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Toplam Şantiye Giderleri</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-bold font-mono text-rose-400">
                  {formatCurrency(totalExpense)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Demir, Beton, İşçilik & Malzeme</div>
              </div>

              <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 bg-gradient-to-br from-slate-900 to-amber-950/20">
                <div className="flex items-center justify-between text-amber-400 text-xs mb-1 font-semibold">
                  <span>Net Kasa / Şantiye Bakiyesi</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-black font-mono text-amber-300">
                  {formatCurrency(netBalance)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Aktif Nakit Durumu</div>
              </div>
            </div>

            {/* İşlem Listesi */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Finansal Hareketler & Makbuzlar</h3>
                <button
                  onClick={() => setIsNewTxModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Gelir/Gider Ekle</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                      <th className="p-3">Tarih</th>
                      <th className="p-3">Tür</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3">Muhatap / Firma</th>
                      <th className="p-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-slate-400">{tx.date}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'Gelir'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{tx.category}</td>
                        <td className="p-3 text-slate-300">{tx.description}</td>
                        <td className="p-3 text-slate-400">{tx.payerOrPayee}</td>
                        <td className={`p-3 text-right font-mono font-bold ${
                          tx.type === 'Gelir' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {tx.type === 'Gelir' ? '+' : '-'}{formatCurrency(tx.amountTL)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SEKME: DEPO & MALZEME STOKLARI */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Şantiye Depo Stok Durumu & Kritik Seviyeler</h3>
                <p className="text-xs text-slate-400">Toplam Depo Envanter Değeri: <strong className="font-mono text-amber-400">{formatCurrency(totalInventoryValue)}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => {
                const isCritical = item.currentStock <= item.minThreshold;

                return (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isCritical ? 'Kritik Stok Uyarısı' : 'Yeterli Stok'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>

                    <div className="flex items-baseline justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400">Mevcut Stok:</div>
                        <div className="text-xl font-bold font-mono text-slate-100">
                          {item.currentStock} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Birim Fiyat:</div>
                        <div className="font-mono text-xs text-amber-400">{formatCurrency(item.unitPriceTL)}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Tedarikçi: {item.supplier}</span>
                      <span>Min Eşik: {item.minThreshold} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Yeni Rapor Modalı */}
      {isNewLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Yeni Günlük Şantiye Raporu</h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tarih</label>
                  <input
                    type="date"
                    value={newLogData.date}
                    onChange={(e) => setNewLogData({ ...newLogData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hava / Sıcaklık (°C)</label>
                  <div className="flex gap-2">
                    <select
                      value={newLogData.weather}
                      onChange={(e) => setNewLogData({ ...newLogData, weather: e.target.value as any })}
                      className="bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 flex-1"
                    >
                      <option value="Güneşli">Güneşli</option>
                      <option value="Bulutlu">Bulutlu</option>
                      <option value="Yağmurlu">Yağmurlu</option>
                      <option value="Rüzgarlı">Rüzgarlı</option>
                    </select>
                    <input
                      type="number"
                      value={newLogData.temperatureC}
                      onChange={(e) => setNewLogData({ ...newLogData, temperatureC: Number(e.target.value) })}
                      className="w-16 bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Yapılan İmalatlar ve Açıklamalar *</label>
                <textarea
                  rows={3}
                  value={newLogData.workDone}
                  onChange={(e) => setNewLogData({ ...newLogData, workDone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Bugün sahada tamamlanan işleri yazınız..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Gelen Malzemeler & İrsaliye</label>
                <input
                  type="text"
                  value={newLogData.incomingMaterials}
                  onChange={(e) => setNewLogData({ ...newLogData, incomingMaterials: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Örn: 20 Ton Çelik Demir, 50 Torba Çimento"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Şantiye Şefi</label>
                <input
                  type="text"
                  value={newLogData.supervisorName}
                  onChange={(e) => setNewLogData({ ...newLogData, supervisorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsNewLogModalOpen(false)}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleSaveLog}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs"
              >
                Raporu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Finans İşlemi Modalı */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Yeni Kasa Gelir/Gider Kaydı</h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">İşlem Türü</label>
                  <select
                    value={newTxData.type}
                    onChange={(e) => setNewTxData({ ...newTxData, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    <option value="Gelir">Gelir (+)</option>
                    <option value="Gider">Gider (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tutar (TL) *</label>
                  <input
                    type="number"
                    value={newTxData.amountTL}
                    onChange={(e) => setNewTxData({ ...newTxData, amountTL: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Açıklama *</label>
                <input
                  type="text"
                  value={newTxData.description}
                  onChange={(e) => setNewTxData({ ...newTxData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Örn: 2. Kat Kalıp İşçiliği Ödemesi"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Muhatap / Firma / Malik</label>
                <input
                  type="text"
                  value={newTxData.payerOrPayee}
                  onChange={(e) => setNewTxData({ ...newTxData, payerOrPayee: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Örn: Akçansa Çimento veya Malik Adı"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleSaveTransaction}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs"
              >
                İşlemi Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
