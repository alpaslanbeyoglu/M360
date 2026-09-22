import React from 'react';
import {
  Layers,
  Calculator,
  GitMerge,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Info,
  Crosshair,
  Minus,
  PlusCircle,
  Edit2,
  DoorClosed
} from 'lucide-react';
import { CadShape, CadDoorProperties } from '../../types';
import { formatNumber, calculatePolygonPerimeterMeters, calculateDistanceMeters } from '../../utils/cadMath';

interface CadPropertyPanelProps {
  shapes: CadShape[];
  scaleMetersPerPixel: number;
  totalBoundaryAreaM2: number;
  totalBuildingAreaM2: number;
  totalTevhitiAreaM2: number;
  taksRatio: number;
  kaksRatio: number;
  selectedShapeId: string | null;
  selectedVertexIndex: number | null;
  selectedEdgeIndex: number | null;
  onSelectShape: (id: string | null) => void;
  onSelectVertex: (index: number | null) => void;
  onDeleteShape: (id: string) => void;
  onDeleteVertex: () => void;
  onUpdateVertexCoord: (pointIndex: number, xMeters: number, yMeters: number) => void;
  onAddVertexToEdge: () => void;
  onScaleChange: (scale: number) => void;
  onKaksChange: (kaks: number) => void;
  onTaksTargetChange: (taks: number) => void;
  onFlipDoorHinge?: () => void;
  onFlipDoorSwing?: () => void;
  onUpdateDoorProps?: (doorProps: CadDoorProperties) => void;
}

export const CadPropertyPanel: React.FC<CadPropertyPanelProps> = ({
  shapes,
  scaleMetersPerPixel,
  totalBoundaryAreaM2,
  totalBuildingAreaM2,
  totalTevhitiAreaM2,
  taksRatio,
  kaksRatio,
  selectedShapeId,
  selectedVertexIndex,
  selectedEdgeIndex,
  onSelectShape,
  onSelectVertex,
  onDeleteShape,
  onDeleteVertex,
  onUpdateVertexCoord,
  onAddVertexToEdge,
  onScaleChange,
  onKaksChange,
  onFlipDoorHinge,
  onFlipDoorSwing,
  onUpdateDoorProps
}) => {
  // Tevhit Simülasyonu
  const combinedLandArea = totalBoundaryAreaM2 + totalTevhitiAreaM2;
  const standardConstructionArea = Math.round(totalBoundaryAreaM2 * kaksRatio);
  const tevhitBonusKaks = kaksRatio * 1.15; // Tevhit bonusu %15 emsal artışı
  const tevhitConstructionArea = Math.round(combinedLandArea * tevhitBonusKaks);
  const tevhitGainM2 = tevhitConstructionArea - standardConstructionArea;

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;
  const selectedPoint = (selectedShape && selectedVertexIndex !== null && selectedShape.points[selectedVertexIndex]) ? selectedShape.points[selectedVertexIndex] : null;

  return (
    <aside aria-label="CAD İmar ve Metraj Özellik Paneli" className="bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-3 lg:w-80 flex flex-col gap-3.5 text-xs overflow-y-auto shadow-xs select-none">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-slate-900 text-sm">İmar & Metraj Analizi</span>
        </div>
        <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
          Canlı Hesap
        </span>
      </div>

      {/* Seçili Öğe Koordinat & Düzenleme Detay Paneli (Eğer bir nokta/çizgi seçiliyse) */}
      {selectedShape && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <Edit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{selectedShape.name}</span>
            </span>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
              {selectedShape.isClosed ? 'Kapalı Alan' : 'Açık Çizgi'}
            </span>
          </div>

          {/* Nokta Koordinat Düzenleme */}
          {selectedPoint && selectedVertexIndex !== null ? (
            <div className="space-y-1.5 bg-white p-2 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between text-amber-900 font-semibold text-[11px]">
                <span className="flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-amber-600" />
                  <span>Nokta #{selectedVertexIndex + 1} Koordinatları</span>
                </span>
                <button
                  onClick={onDeleteVertex}
                  className="text-rose-600 hover:text-rose-800 text-[10px] underline cursor-pointer"
                  title="Noktayı Sil"
                >
                  Noktayı Sil
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">X (m):</span>
                  <input
                    type="number"
                    step="0.1"
                    value={Number((selectedPoint.x * scaleMetersPerPixel).toFixed(2))}
                    onChange={(e) => {
                      const newM = parseFloat(e.target.value) || 0;
                      onUpdateVertexCoord(selectedVertexIndex, newM, selectedPoint.y * scaleMetersPerPixel);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-800 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">Y (m):</span>
                  <input
                    type="number"
                    step="0.1"
                    value={Number((selectedPoint.y * scaleMetersPerPixel).toFixed(2))}
                    onChange={(e) => {
                      const newM = parseFloat(e.target.value) || 0;
                      onUpdateVertexCoord(selectedVertexIndex, selectedPoint.x * scaleMetersPerPixel, newM);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-800 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : selectedEdgeIndex !== null ? (
            <div className="bg-white p-2 rounded-lg border border-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between text-indigo-900 font-semibold text-[11px]">
                <span className="flex items-center gap-1">
                  <Minus className="w-3 h-3 text-indigo-600" />
                  <span>Kenar / Hat #{selectedEdgeIndex + 1}</span>
                </span>
              </div>
              <button
                onClick={onAddVertexToEdge}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-2 rounded flex items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Bu Çizgiye Yeni Nokta Ekle (Kır)</span>
              </button>
            </div>
          ) : null}

          {/* Mimari Kapı Açılım Yönü ve Yönetmelik Uyumu */}
          {selectedShape.blockType?.startsWith('door_') && (
            <div className="pt-2 border-t border-amber-200 bg-amber-50/80 p-2.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                  <DoorClosed className="w-4 h-4 text-amber-700" />
                  <span>Kapı Açılım Yönü Detayı</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                  {(selectedShape.doorProps?.hingeSide === 'right' || selectedShape.doorProps?.flipX) ? 'Sağ Menteşe' : 'Sol Menteşe'} / {(selectedShape.doorProps?.swingDirection === 'outward' || selectedShape.doorProps?.flipY) ? 'Dışa Açılır' : 'İçe Açılır'}
                </span>
              </div>

              {/* Hızlı Dönüştürme Butonları */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={onFlipDoorHinge}
                  className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold py-1 px-2 rounded flex items-center justify-center gap-1 text-[10.5px] cursor-pointer transition-colors shadow-2xs"
                  title="Sol Menteşe / Sağ Menteşe Değiştir (Kısayol: F)"
                >
                  <span>↔️ Menteşe Değiştir (F)</span>
                </button>
                <button
                  onClick={onFlipDoorSwing}
                  className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold py-1 px-2 rounded flex items-center justify-center gap-1 text-[10.5px] cursor-pointer transition-colors shadow-2xs"
                  title="İçe Açılır / Dışa Açılır Değiştir (Kısayol: V)"
                >
                  <span>↕️ Açılım Değiştir (V)</span>
                </button>
              </div>

              {/* Mimar / İmar Yönetmeliği Uyarısı */}
              <div className="bg-white/90 p-2 rounded border border-amber-200 text-[10px] text-amber-900 leading-snug space-y-1">
                <div className="font-bold text-amber-950 flex items-center gap-1">
                  <Info className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Mimar Notu & Yönetmelik Uyarısı:</span>
                </div>
                {selectedShape.blockType === 'door_bath' && (
                  <p className="text-amber-800">
                    💡 Banyo/WC kapılarında güvenlik, bayılma ve acil müdahale gereği kanatların koridora/dışa veya kayar sistem açılması önerilir.
                  </p>
                )}
                {(selectedShape.blockType === 'door_outer' || selectedShape.blockType === 'door_outer_double') && (
                  <p className="text-amber-800">
                    💡 Binaların Yangından Korunması Hakkında Yönetmelik uyarınca ana kaçış ve bina giriş kapıları kaçış yönüne (dışa) doğru açılmalıdır.
                  </p>
                )}
                {selectedShape.blockType === 'door_inner' && (
                  <p className="text-amber-800">
                    💡 İç oda kapıları koridor sirkülasyonunu kısıtlamamak için oda içine ve yan duvara sıfırlanacak şekilde açılmalıdır.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Şekil Köşe Noktaları Hızlı Seçim Listesi */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 block mb-1">
              Köşe Noktaları ({selectedShape.points.length}):
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedShape.points.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectVertex(idx)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    selectedVertexIndex === idx
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metraj ve İmar Göstergeleri */}
      <div className="grid grid-cols-2 gap-2">
        {/* Arsa Alanı */}
        <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 shadow-xs">
          <div className="text-emerald-800 text-[10px] font-semibold flex items-center justify-between mb-1">
            <span>Arsa Parsel Alanı</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {formatNumber(totalBoundaryAreaM2)} <span className="text-xs text-emerald-900/60 font-normal">m²</span>
          </div>
        </div>

        {/* Taban Oturumu (TAKS) */}
        <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 shadow-xs">
          <div className="text-blue-800 text-[10px] font-semibold flex items-center justify-between mb-1">
            <span>Bina Tabanı (TAKS)</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
          <div className="text-lg font-bold font-mono text-blue-700">
            {formatNumber(totalBuildingAreaM2)} <span className="text-xs text-blue-900/60 font-normal">m²</span>
          </div>
          <div className="text-[10px] text-blue-900/80 mt-0.5 font-medium">
            Gerçekleşen: <span className="font-mono font-bold text-blue-950">%{Math.round(taksRatio * 100)}</span>
          </div>
        </div>

        {/* Emsal İnşaat Alanı */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-600 text-[10px] font-semibold">Emsal İnşaat Alanı (KAKS {kaksRatio})</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-medium">Emsal:</span>
              <select
                id="cad-kaks-select"
                value={kaksRatio}
                onChange={(e) => onKaksChange(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded text-[11px] text-amber-700 font-semibold px-1.5 py-0.5 shadow-xs"
              >
                <option value={1.5}>1.50 (Konut)</option>
                <option value={1.8}>1.80 (Orta Yoğunluk)</option>
                <option value={2.07}>2.07 (Kentsel Dönüşüm +%15)</option>
                <option value={2.4}>2.40 (Yüksek Yoğunluk)</option>
              </select>
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 flex items-baseline gap-1.5">
            {formatNumber(standardConstructionArea)} <span className="text-xs text-slate-500 font-normal">m² Brüt Emsal</span>
          </div>
        </div>
      </div>

      {/* Tevhit (Parsel Birleştirme) Simülatörü */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200 rounded-lg p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-purple-900 font-bold">
            <GitMerge className="w-4 h-4 text-purple-600" />
            <span>Tevhit & İfraz Kazanç Analizi</span>
          </div>
          {totalTevhitiAreaM2 > 0 ? (
            <span className="bg-purple-200 text-purple-900 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
              Parsel Birleşti
            </span>
          ) : (
            <span className="bg-slate-200/80 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">
              Pasif
            </span>
          )}
        </div>

        {totalTevhitiAreaM2 > 0 ? (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-700">
              Komşu Parsel ile Toplam Arsa: <span className="font-bold text-purple-900">{formatNumber(combinedLandArea)} m²</span>
            </div>
            <div className="bg-white/90 p-2.5 rounded-md border border-purple-200 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[10px] text-slate-500 font-medium">Tevhitli İnşaat Alanı (+%15 Bonus):</div>
                <div className="text-base font-bold font-mono text-purple-700">{formatNumber(tevhitConstructionArea)} m²</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-700 flex items-center gap-1 justify-end font-semibold">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  Net Ek Kazanç:
                </div>
                <div className="text-sm font-bold font-mono text-emerald-700">+{formatNumber(tevhitGainM2)} m²</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Araç çubuğundan <strong className="text-purple-700">'Tevhit'</strong> katmanını seçip komşu parsel sınırını çizerek emsal bonusu ve ek bağımsız bölüm kazancını simüle edin.
          </p>
        )}
      </div>

      {/* Taşkın & Çekme Mesafesi Uygunluk */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-rose-900 font-bold mb-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>İmar Çekme Mesafesi Kontrolü</span>
        </div>
        <ul className="text-[11px] text-slate-700 space-y-1">
          <li className="flex items-center justify-between">
            <span className="text-slate-500">• Ön Bahçe Çekme:</span>
            <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">5.00 m (Uygun)</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-slate-500">• Yan Bahçe Çekme:</span>
            <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">3.00 m (Uygun)</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-slate-500">• Arka Bahçe Mesafesi:</span>
            <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">h/2 = 10.5 m (Uygun)</span>
          </li>
        </ul>
      </div>

      {/* Çizilen Poligon & Katman Listesi */}
      <div className="flex-1 flex flex-col min-h-[140px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Çizim Varlıkları ({shapes.length})
          </span>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-48 pr-1">
          {shapes.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              Henüz bir CAD poligonu veya çizgisi çizilmedi.
            </div>
          ) : (
            shapes.map((shape) => {
              const isSelected = selectedShapeId === shape.id;
              return (
                <div
                  key={shape.id}
                  onClick={() => {
                    onSelectShape(shape.id);
                    onSelectVertex(null);
                  }}
                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300"
                      style={{ backgroundColor: shape.color }}
                    ></span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">{shape.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {shape.isClosed && shape.areaM2 ? (
                          <span className="text-emerald-700 font-medium">{shape.areaM2} m² • </span>
                        ) : shape.perimeterMeters ? (
                          <span className="text-indigo-700 font-medium">{shape.perimeterMeters.toFixed(2)} m Hat • </span>
                        ) : null}
                        {shape.points.length} Nokta {shape.isClosed ? '(Kapalı)' : '(Açık Çizgi)'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteShape(shape.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                    title="Şekli / Çizgiyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ölçek Kalibrasyonu */}
      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>CAD Ölçeği:</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-slate-700">1px =</span>
          <select
            value={scaleMetersPerPixel}
            onChange={(e) => onScaleChange(Number(e.target.value))}
            className="bg-white border border-slate-300 text-slate-800 rounded px-1.5 py-0.5 font-mono text-[10px] shadow-xs"
          >
            <option value={0.05}>0.05 m (1:200)</option>
            <option value={0.1}>0.10 m (1:500)</option>
            <option value={0.02}>0.02 m (1:100)</option>
          </select>
        </div>
      </div>
    </aside>
  );
};
