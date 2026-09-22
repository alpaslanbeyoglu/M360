import React, { useState } from 'react';
import { Layers, Plus, Copy, Check, X, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { BuildingFloor, CadShape } from '../../types';

interface CreateFloorLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingFloors: BuildingFloor[];
  existingShapes: CadShape[];
  onCreateFloorLayer: (
    newFloor: BuildingFloor,
    copiedShapesFromFloorId?: string
  ) => void;
}

export const CreateFloorLayerModal: React.FC<CreateFloorLayerModalProps> = ({
  isOpen,
  onClose,
  existingFloors,
  existingShapes,
  onCreateFloorLayer
}) => {
  const [floorType, setFloorType] = useState<'basement' | 'ground' | 'normal' | 'mansart' | 'roof'>('normal');
  const [floorName, setFloorName] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [heightMeters, setHeightMeters] = useState<number>(2.90);
  const [apartmentCount, setApartmentCount] = useState<number>(2);
  const [shouldCopyDrawing, setShouldCopyDrawing] = useState<boolean>(true);
  const [sourceFloorId, setSourceFloorId] = useState<string>('');

  // Auto-fill values when floorType or existingFloors change
  React.useEffect(() => {
    if (!isOpen) return;

    if (existingFloors.length > 0) {
      if (!sourceFloorId) {
        const ground = existingFloors.find(f => f.type === 'ground') || existingFloors[0];
        setSourceFloorId(ground ? ground.id : existingFloors[0].id);
      }

      if (floorType === 'normal') {
        const normalFloors = existingFloors.filter(f => f.type === 'normal');
        const nextNum = normalFloors.length > 0
          ? Math.max(...normalFloors.map(f => f.floorNumber)) + 1
          : 1;
        setFloorNumber(nextNum);
        setFloorName(`${nextNum}. Normal Kat`);
        setHeightMeters(2.90);
        setApartmentCount(2);
      } else if (floorType === 'basement') {
        const basementFloors = existingFloors.filter(f => f.type === 'basement');
        const minNum = basementFloors.length > 0
          ? Math.min(...basementFloors.map(f => f.floorNumber)) - 1
          : -1;
        setFloorNumber(minNum);
        setFloorName(`${Math.abs(minNum)}. Bodrum Kat (Depo / Otopark)`);
        setHeightMeters(2.80);
        setApartmentCount(0);
      } else if (floorType === 'ground') {
        setFloorNumber(0);
        setFloorName('Zemin Kat (Giriş / Ticari)');
        setHeightMeters(3.80);
        setApartmentCount(2);
      } else if (floorType === 'mansart' || floorType === 'roof') {
        const maxNum = Math.max(...existingFloors.map(f => f.floorNumber), 0) + 1;
        setFloorNumber(maxNum);
        setFloorName('Çatı Katı / Mansart');
        setHeightMeters(2.60);
        setApartmentCount(2);
      }
    } else {
      setFloorNumber(1);
      setFloorName('1. Normal Kat');
    }
  }, [floorType, isOpen, existingFloors]);

  if (!isOpen) return null;

  const handleTypeChange = (type: 'basement' | 'ground' | 'normal' | 'mansart' | 'roof') => {
    setFloorType(type);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const sourceFloor = existingFloors.find(f => f.id === sourceFloorId);
    const initialArea = sourceFloor ? sourceFloor.areaM2 : 294;

    const newFloorId = `floor-${Date.now()}`;
    const newFloor: BuildingFloor = {
      id: newFloorId,
      name: floorName || `${floorNumber}. Kat`,
      type: floorType,
      floorNumber: Number(floorNumber),
      heightMeters: Number(heightMeters),
      areaM2: initialArea,
      apartmentCount: Number(apartmentCount),
      description: `CAD Çizim Katmanı (${floorType})`,
      isCadCalculated: false
    };

    onCreateFloorLayer(newFloor, shouldCopyDrawing ? sourceFloorId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans">Yeni Kat Katmanı Oluştur</h2>
              <p className="text-xs text-blue-100">
                CAD üzerinde zemin, bodrum veya normal kat çizim katmanı ekleyin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
          {/* Kat Tipi Seçimi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kat Tipi / Kategorisi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('normal')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  floorType === 'normal'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-black">🏙️ Normal Kat</div>
                <div className="text-[10px] text-slate-500 font-normal">Konut / Daire Katı</div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('ground')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  floorType === 'ground'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-black">🏬 Zemin Kat</div>
                <div className="text-[10px] text-slate-500 font-normal">Giriş / Cadde Dükkan</div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('basement')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  floorType === 'basement'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-black">🏢 Bodrum Kat</div>
                <div className="text-[10px] text-slate-500 font-normal">Otopark / Sığınak</div>
              </button>
            </div>
          </div>

          {/* Kat İsmi ve Kat Numarası */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kat Katmanı Adı
              </label>
              <input
                type="text"
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
                placeholder="Örn: 2. Normal Kat"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kat No
              </label>
              <input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(parseInt(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold text-center text-slate-800"
              />
            </div>
          </div>

          {/* Kat Yüksekliği & Daire Sayısı */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kat Yüksekliği (m)
              </label>
              <input
                type="number"
                step="0.05"
                value={heightMeters}
                onChange={(e) => setHeightMeters(parseFloat(e.target.value) || 2.9)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bağımsız Bölüm (Daire/Dükkan)
              </label>
              <input
                type="number"
                value={apartmentCount}
                onChange={(e) => setApartmentCount(parseInt(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Çizim Kopyalama / Klonlama Kutusu */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={shouldCopyDrawing}
                  onChange={(e) => setShouldCopyDrawing(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <Copy className="w-4 h-4 text-blue-600" />
                <span>Başka Bir Katın Çizim Planını Kopyala</span>
              </label>
            </div>

            {shouldCopyDrawing && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kopyalanacak Kaynak Kat Katmanı:
                </label>
                <select
                  value={sourceFloorId}
                  onChange={(e) => setSourceFloorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {existingFloors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.areaM2} m²)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Seçilen katın dış duvarları, iç bölmeleri ve tefriş elemanları yeni kat katmanına kopyalanır.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Kat Katmanını Oluştur & Çizime Başla</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
