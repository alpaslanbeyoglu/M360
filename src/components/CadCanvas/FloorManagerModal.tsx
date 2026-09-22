import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Building2, Check, X, ArrowUpDown, Sparkles } from 'lucide-react';
import { BuildingFloor } from '../../types';

interface FloorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  floors: BuildingFloor[];
  onUpdateFloors: (floors: BuildingFloor[]) => void;
  onSyncToFinancials: (totalConstM2: number, totalResCount: number, floorCount: number, baseAreaM2: number) => void;
}

export const FloorManagerModal: React.FC<FloorManagerModalProps> = ({
  isOpen,
  onClose,
  floors,
  onUpdateFloors,
  onSyncToFinancials
}) => {
  const [floorList, setFloorList] = useState<BuildingFloor[]>(floors);

  useEffect(() => {
    setFloorList(floors);
  }, [floors, isOpen]);

  if (!isOpen) return null;

  // Canlı Senkronizasyon Yardımcısı
  const notifyParentSync = (updatedList: BuildingFloor[]) => {
    onUpdateFloors(updatedList);
    const totalConst = updatedList.reduce((acc, f) => acc + (f.areaM2 || 0), 0);
    const totalRes = updatedList.reduce((acc, f) => acc + (f.apartmentCount || 0), 0);
    const ground = updatedList.find((f) => f.type === 'ground') || updatedList[updatedList.length - 1];
    const baseM2 = ground ? ground.areaM2 : 294;
    onSyncToFinancials(totalConst, totalRes, updatedList.length, baseM2);
  };

  // Yeni Kat Ekleme (Varsayılan Normal Kat)
  const handleAddFloor = () => {
    const newId = `floor-${Date.now()}`;
    const maxNum = floorList.length > 0 ? Math.max(...floorList.map(f => f.floorNumber)) : 0;
    const nextNum = maxNum + 1;

    const newFloor: BuildingFloor = {
      id: newId,
      name: `${nextNum}. Normal Kat`,
      type: 'normal',
      floorNumber: nextNum,
      heightMeters: 2.90,
      areaM2: 294,
      apartmentCount: 2,
      description: 'Standart konut katı'
    };

    const updated = [...floorList, newFloor].sort((a, b) => b.floorNumber - a.floorNumber);
    setFloorList(updated);
    notifyParentSync(updated);
  };

  // Toplu Normal Kat Ekle (Örn: 2 veya 4 Kat Daha Ekle)
  const handleBulkAddNormalFloors = (count: number) => {
    let currentList = [...floorList];
    const maxNum = currentList.length > 0 ? Math.max(...currentList.filter(f => f.type === 'normal').map(f => f.floorNumber), 0) : 0;

    for (let i = 1; i <= count; i++) {
      const num = maxNum + i;
      currentList.push({
        id: `floor-${Date.now()}-${i}`,
        name: `${num}. Normal Kat`,
        type: 'normal',
        floorNumber: num,
        heightMeters: 2.90,
        areaM2: 294,
        apartmentCount: 2,
        description: 'Standart daire katı (Aynı tip)'
      });
    }

    const updated = currentList.sort((a, b) => b.floorNumber - a.floorNumber);
    setFloorList(updated);
    notifyParentSync(updated);
  };

  // Kat Güncelleme
  const handleUpdateFloor = (id: string, field: keyof BuildingFloor, value: any) => {
    const updated = floorList.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          [field]: value,
          isCadCalculated: field === 'areaM2' ? false : f.isCadCalculated
        };
      }
      return f;
    });
    setFloorList(updated);
    notifyParentSync(updated);
  };

  // Kat Silme
  const handleDeleteFloor = (id: string) => {
    const updated = floorList.filter((f) => f.id !== id);
    setFloorList(updated);
    notifyParentSync(updated);
  };

  // Hesaplamalar & Senkronizasyon
  const totalConstM2 = floorList.reduce((acc, f) => acc + (f.areaM2 || 0), 0);
  const totalResCount = floorList.reduce((acc, f) => acc + (f.apartmentCount || 0), 0);
  const totalFloorCount = floorList.length;
  
  // Zemin kat alanı veya ilk normal kat alanı taban alanı (baseAreaM2) olarak alınır
  const groundFloor = floorList.find(f => f.type === 'ground') || floorList[floorList.length - 1];
  const baseAreaM2 = groundFloor ? groundFloor.areaM2 : 294;

  const handleSaveAndSync = () => {
    onUpdateFloors(floorList);
    onSyncToFinancials(totalConstM2, totalResCount, totalFloorCount, baseAreaM2);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Başlığı */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans">Kat Planı & Bina Kat Yönetim Sistemi</h2>
              <p className="text-xs text-slate-300">
                Bodrum, zemin, normal ve çatı katlarını yapılandırın. Teklif ve metraj hesaplarıyla otomatik senkronize olur.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Özet Metrik Şeridi */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-4 gap-4 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Kat Adedi</span>
            <span className="text-lg font-extrabold text-slate-800">{totalFloorCount} Kat</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brüt İnşaat Alanı</span>
            <span className="text-lg font-extrabold text-blue-600">{totalConstM2.toLocaleString()} m²</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bağımsız Bölüm / Daire</span>
            <span className="text-lg font-extrabold text-emerald-600">{totalResCount} Adet</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taban Oturumu (TAKS)</span>
            <span className="text-lg font-extrabold text-indigo-600">{baseAreaM2} m²</span>
          </div>
        </div>

        {/* Hızlı Eylem Çubuğu */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Hızlı İşlemler:</span>
            <button
              onClick={() => handleBulkAddNormalFloors(2)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+2 Normal Kat Ekle</span>
            </button>
            <button
              onClick={() => handleBulkAddNormalFloors(4)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+4 Normal Kat Ekle</span>
            </button>
          </div>

          <button
            onClick={handleAddFloor}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Özel Kat Ekle</span>
          </button>
        </div>

        {/* Katlar Tablosu (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {floorList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Henüz kat eklenmemiş.</p>
              <p className="text-xs">Yukarıdaki butonları kullanarak bina katlarını tanımlayın.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {floorList.map((floor, index) => (
                <div
                  key={floor.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex items-center gap-4"
                >
                  {/* Kat Sıra Rozeti */}
                  <div className="w-12 text-center">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200 block">
                      {floor.floorNumber > 0 ? `+${floor.floorNumber}` : floor.floorNumber}
                    </span>
                  </div>

                  {/* Kat Adı */}
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Kat Adı & Tanımı</label>
                    <input
                      type="text"
                      value={floor.name}
                      onChange={(e) => handleUpdateFloor(floor.id, 'name', e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Kat Tipi */}
                  <div className="w-36">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Kat Tipi</label>
                    <select
                      value={floor.type}
                      onChange={(e) => handleUpdateFloor(floor.id, 'type', e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="basement">Bodrum Kat</option>
                      <option value="ground">Zemin / Giriş</option>
                      <option value="normal">Normal Kat</option>
                      <option value="mansart">Mansart / Çatı</option>
                      <option value="roof">Teras / Çatı Arası</option>
                    </select>
                  </div>

                  {/* Yükseklik */}
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Yükseklik (m)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={floor.heightMeters}
                      onChange={(e) => handleUpdateFloor(floor.id, 'heightMeters', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-none text-center"
                    />
                  </div>

                  {/* Brüt Alan (m²) */}
                  <div className="w-28">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Brüt Alan (m²)</label>
                    <input
                      type="number"
                      value={floor.areaM2}
                      onChange={(e) => handleUpdateFloor(floor.id, 'areaM2', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold text-blue-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-none text-center"
                    />
                  </div>

                  {/* Daire / Bağımsız Bölüm Sayısı */}
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Daire Adedi</label>
                    <input
                      type="number"
                      value={floor.apartmentCount}
                      onChange={(e) => handleUpdateFloor(floor.id, 'apartmentCount', parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold text-emerald-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-blue-500 focus:outline-none text-center"
                    />
                  </div>

                  {/* Sil Butonu */}
                  <div className="pt-5">
                    <button
                      onClick={() => handleDeleteFloor(floor.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                      title="Bu Katı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Alt Bilgi ve Kaydet */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Tüm kat metrajları, daire sayıları ve yapı yükseklikleri otomatik olarak teklif motoruyla senkronize edilir.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSaveAndSync}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Katları Kaydet & Senkronize Et</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
