import React from 'react';
import {
  Square,
  Building2,
  Columns,
  DoorOpen,
  GitMerge,
  ShieldAlert,
  Grid,
  Magnet,
  Maximize2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Trash2,
  ArrowRightCircle,
  HelpCircle,
  RotateCcw,
  Minus,
  Move,
  MousePointer,
  PenTool,
  PlusCircle,
  Layers,
  Edit3,
  Crosshair,
  RotateCw,
  AppWindow,
  Bath,
  Utensils,
  BedDouble,
  Tag,
  ShieldCheck,
  DoorClosed,
  Undo2,
  Redo2
} from 'lucide-react';
import { CadLayerType, CadShape, CadDoorProperties, BuildingFloor } from '../../types';
import { ARCHITECTURAL_PRESETS, ArchitecturalPreset } from '../../data/architecturalPresets';

export type CadDrawMode = 'polygon' | 'line';

interface CadToolbarProps {
  currentTool: 'draw' | 'select' | 'pan';
  drawMode: CadDrawMode;
  activeLayer: CadLayerType;
  floors?: BuildingFloor[];
  activeFloorId?: string;
  onSelectFloorId?: (floorId: string) => void;
  onCreateFloorLayerClick?: () => void;
  showGhostFloors?: boolean;
  onToggleGhostFloors?: () => void;
  snapToGrid: boolean;
  orthoMode: boolean;
  showDimensions: boolean;
  showGrid: boolean;
  isDrawing: boolean;
  pointCount: number;
  selectedShape: CadShape | null;
  selectedVertexIndex: number | null;
  selectedEdgeIndex: number | null;
  onToolChange: (tool: 'draw' | 'select' | 'pan') => void;
  onDrawModeChange: (mode: CadDrawMode) => void;
  onLayerChange: (layer: CadLayerType) => void;
  onChangeSelectedShapeLayer: (layer: CadLayerType) => void;
  onToggleSnap: () => void;
  onToggleOrtho: () => void;
  onToggleDimensions: () => void;
  onToggleGrid: () => void;
  onFinishShape: () => void;
  onFinishLine: () => void;
  onUndoPoint: () => void;
  onClearCanvas: () => void;
  onDeleteSelectedVertex: () => void;
  onAddVertexToSelectedEdge: () => void;
  onDeleteSelectedShape: () => void;
  onRotateSelectedShape?: () => void;
  onFlipDoorHinge?: () => void;
  onFlipDoorSwing?: () => void;
  onUpdateDoorProps?: (doorProps: CadDoorProperties) => void;
  onOpenArchitecturalLibrary: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onLoadTemplate: (templateType: 'corner' | 'standard' | 'tevhidi') => void;
  onSyncWithProposal: () => void;
  onUpdateSelectedShapeFacadeProps?: (facadeProps: any) => void;
  onSelectPreset: (preset: ArchitecturalPreset) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const CadToolbar: React.FC<CadToolbarProps> = ({
  currentTool,
  drawMode,
  activeLayer,
  floors = [],
  activeFloorId,
  onSelectFloorId,
  onCreateFloorLayerClick,
  showGhostFloors = true,
  onToggleGhostFloors,
  snapToGrid,
  orthoMode,
  showDimensions,
  showGrid,
  isDrawing,
  pointCount,
  selectedShape,
  selectedVertexIndex,
  selectedEdgeIndex,
  onToolChange,
  onDrawModeChange,
  onLayerChange,
  onChangeSelectedShapeLayer,
  onToggleSnap,
  onToggleOrtho,
  onToggleDimensions,
  onToggleGrid,
  onFinishShape,
  onFinishLine,
  onUndoPoint,
  onClearCanvas,
  onDeleteSelectedVertex,
  onAddVertexToSelectedEdge,
  onDeleteSelectedShape,
  onRotateSelectedShape,
  onFlipDoorHinge,
  onFlipDoorSwing,
  onUpdateDoorProps,
  onOpenArchitecturalLibrary,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onLoadTemplate,
  onSyncWithProposal,
  onUpdateSelectedShapeFacadeProps,
  onSelectPreset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [openAccordionCategory, setOpenAccordionCategory] = React.useState<string | null>('KAPI');
  const categories = [
    { id: 'KAPI', name: 'Kapılar (İç/Dış)', icon: DoorClosed, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'KAPI') },
    { id: 'PENCERE', name: 'Pencereler', icon: AppWindow, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'PENCERE') },
    { id: 'DUVAR', name: 'Bölme Duvarlar', icon: Maximize2, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'DUVAR') },
    { id: 'BANYO_WC', name: 'Banyo & WC', icon: Bath, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'BANYO_WC') },
    { id: 'MUTFAK', name: 'Mutfak Tefriş', icon: Utensils, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'MUTFAK') },
    { id: 'ODALAR_TEFRİS', name: 'Oda Tefrişleri', icon: BedDouble, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'ODALAR_TEFRİS') },
    { id: 'MAHAL_ETİKETİ', name: 'Mahal & Piyes', icon: Tag, presets: ARCHITECTURAL_PRESETS.filter(p => p.category === 'MAHAL_ETİKETİ') }
  ];
  const layers: { id: CadLayerType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { id: 'boundary', label: 'Arsa Sınırı', icon: Square, color: 'text-emerald-700 bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400', desc: 'Parsel poligonu & alan' },
    { id: 'outer_wall', label: 'Dış Duvar / Taban', icon: Building2, color: 'text-blue-700 bg-blue-50 border-blue-300 ring-1 ring-blue-400', desc: 'Bina oturumu & TAKS' },
    { id: 'inner_wall', label: 'İç Duvar / Bölme', icon: Columns, color: 'text-indigo-700 bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400', desc: 'Oda, koridor & tek hat' },
    { id: 'door_window', label: 'Kapı & Pencere', icon: DoorOpen, color: 'text-amber-700 bg-amber-50 border-amber-300 ring-1 ring-amber-400', desc: 'Açıklık ve doğrama' },
    { id: 'furniture_fixture', label: 'Tefriş & Donatı', icon: Bath, color: 'text-cyan-700 bg-cyan-50 border-cyan-300 ring-1 ring-cyan-400', desc: 'Banyo, Mutfak, Mobilya' },
    { id: 'tevhidi', label: 'Tevhit (Parsel Birleşim)', icon: GitMerge, color: 'text-purple-700 bg-purple-50 border-purple-300 ring-1 ring-purple-400', desc: 'Komşu parsel analizi' },
    { id: 'setback_flood', label: 'Taşkın & Çekme Analizi', icon: ShieldAlert, color: 'text-rose-700 bg-rose-50 border-rose-300 ring-1 ring-rose-400', desc: 'Yol çekme ve risk zonu' },
  ];

  const isEditMode = currentTool === 'select';

  return (
    <aside aria-label="CAD Çizim ve Katman Araç Çubuğu" className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-3 lg:w-72 flex flex-col gap-3 text-xs select-none overflow-y-auto shadow-xs">
      {/* 1. CAD ANA ÇALIŞMA MODU SEÇİCİ */}
      <div className="bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Çalışma Modu
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            !isEditMode ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {!isEditMode ? 'Çizim Aktif' : 'Düzenleme Aktif'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="tool-draw-btn"
            onClick={() => onToolChange('draw')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
              !isEditMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300/60'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>✏️ Çizim Modu</span>
          </button>
          <button
            id="tool-select-btn"
            onClick={() => onToolChange('select')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
              isEditMode
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-300/60'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>🛠️ Düzenleme Modu</span>
          </button>
        </div>
      </div>

      {/* ↺ GERİ AL & ↻ İLERİ AL BUTONLARI (Undo / Redo) */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
        <button
          id="btn-cad-undo"
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
            canUndo
              ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs active:scale-95'
              : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
          }`}
          title="Son işlemi geri al (Ctrl + Z)"
        >
          <Undo2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Geri Al</span>
        </button>

        <button
          id="btn-cad-redo"
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
            canRedo
              ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs active:scale-95'
              : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
          }`}
          title="İleri al (Ctrl + Y)"
        >
          <Redo2 className="w-3.5 h-3.5 text-blue-600" />
          <span>İleri Al</span>
        </button>
      </div>

      {/* 🏢 KAT KATMANI YÖNETİMİ & MALIYET SENKRONİZASYONU */}
      <div className="bg-slate-900 text-white p-2.5 rounded-xl space-y-2 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Kat Çizim Katmanları</span>
          </span>
          <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
            {floors.length} Kat
          </span>
        </div>

        {/* Aktif Kat Katmanı Seçici Dropdown */}
        <div>
          <label className="block text-[10px] text-slate-400 font-semibold mb-1">
            Aktif Çizim Katı:
          </label>
          <select
            value={activeFloorId || (floors[0] ? floors[0].id : '')}
            onChange={(e) => onSelectFloorId && onSelectFloorId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.type === 'ground' ? '🏬' : f.type === 'basement' ? '🏢' : f.type === 'mansart' ? '🏠' : '🏙️'} {f.name} ({f.areaM2} m²)
              </option>
            ))}
          </select>
        </div>

        {/* Eylemler: Kat Katmanı Oluştur + Hayalet İz Toggle */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            onClick={onCreateFloorLayerClick}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Zemin, Bodrum veya Normal Kat Katmanı Ekle"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Kat Oluştur</span>
          </button>

          <button
            type="button"
            onClick={onToggleGhostFloors}
            className={`font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer border ${
              showGhostFloors
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title="Alt ve Üst Kat Çizim İzlerini Saydam Göster"
          >
            {showGhostFloors ? '👁️ İzler Açık' : '👁️‍🗨️ İzler Kapalı'}
          </button>
        </div>
      </div>

      {/* 🏛️ MİMARİ KAT PLANI KÜTÜPHANESİ BUTONU (Öne Çıkan Ana Özellik) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-2.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mimari Kat Planı & Tefriş</span>
          </span>
          <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
            İmar Standart
          </span>
        </div>

        <button
          id="btn-open-arch-library"
          onClick={onOpenArchitecturalLibrary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-xs cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>Mimari Eleman / Tefriş Ekle</span>
        </button>

        <div className="text-[10px] text-slate-600 leading-tight">
          Kapılar (100/90/80cm), Pencereler (140/200cm), Bölme Duvarlar (10/15/20cm), Banyo-Mutfak & Mahal Damgaları.
        </div>
      </div>

      {/* --- DÜZENLEME MODU ÖZEL ARAÇLARI --- */}
      {isEditMode ? (
        <div className="space-y-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-blue-600" />
              Seçim & Düzenleme Araçları
            </span>
          </div>

          {/* Seçili Öğe Durumu */}
          {selectedShape ? (
            <div className="bg-white p-2 rounded-lg border border-blue-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selectedShape.color }}></span>
                  <span className="truncate">{selectedShape.name}</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                  {selectedShape.blockType ? 'Tefriş Blok' : selectedShape.isClosed ? 'Poligon' : 'Çizgi'}
                </span>
              </div>

              {/* Blok Ölçüleri & Yönetmelik Rozeti */}
              {selectedShape.dimensions && (
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                  <span className="text-slate-600">Ölçü:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedShape.dimensions.widthMeters.toFixed(2)}m x {selectedShape.dimensions.depthMeters.toFixed(2)}m
                  </span>
                </div>
              )}

              {/* Seçili Nokta veya Kenar Bilgisi */}
              <div className="text-[11px] text-slate-600 space-y-1">
                {selectedVertexIndex !== null ? (
                  <div className="bg-amber-50 p-1.5 rounded border border-amber-200 text-amber-900 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-amber-600" />
                      <span>Seçili Köşe: <strong>#{selectedVertexIndex + 1}</strong></span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700">
                      ({((selectedShape.points[selectedVertexIndex]?.x || 0) * 0.05).toFixed(1)}m, {((selectedShape.points[selectedVertexIndex]?.y || 0) * 0.05).toFixed(1)}m)
                    </span>
                  </div>
                ) : selectedEdgeIndex !== null ? (
                  <div className="bg-indigo-50 p-1.5 rounded border border-indigo-200 text-indigo-900 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Minus className="w-3 h-3 text-indigo-600" />
                      <span>Seçili Kenar: <strong>#{selectedEdgeIndex + 1}</strong></span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700">Kenar Seçili</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-blue-500" />
                    <span>Şeklin tümü seçili. Köşe veya kenara tıklayarak esnetin.</span>
                  </div>
                )}
              </div>

              {/* 🚪 Mimari Kapı Açılım Yönü Kontrolleri (Kapı seçilince aktif) */}
              {selectedShape.blockType?.startsWith('door_') && (
                <div className="mt-2 bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <DoorClosed className="w-3.5 h-3.5 text-amber-700" />
                      <span>Kapı Açılım Yönü (Mimari)</span>
                    </span>
                    <span className="text-[9px] font-bold bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded font-mono">
                      {(selectedShape.doorProps?.hingeSide === 'right' || selectedShape.doorProps?.flipX) ? 'Sağ' : 'Sol'}-
                      {(selectedShape.doorProps?.swingDirection === 'outward' || selectedShape.doorProps?.flipY) ? 'Dışa' : 'İçe'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={onFlipDoorHinge}
                      className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-[10px] shadow-2xs cursor-pointer transition-all"
                      title="Menteşe yönünü Sol veya Sağ olarak değiştir (Kısayol: F)"
                    >
                      <span>↔️ Sol/Sağ Menteşe (F)</span>
                    </button>

                    <button
                      onClick={onFlipDoorSwing}
                      className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-[10px] shadow-2xs cursor-pointer transition-all"
                      title="Kapı açılım yönünü İçe veya Dışa olarak değiştir (Kısayol: V)"
                    >
                      <span>↕️ İçe/Dışa Açılım (V)</span>
                    </button>
                  </div>

                  {/* Hazır Yön Kombinasyon Butonları */}
                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-amber-200/60">
                    <button
                      onClick={() => onUpdateDoorProps && onUpdateDoorProps({ hingeSide: 'left', swingDirection: 'inward', flipX: false, flipY: false })}
                      className={`text-[9.5px] py-1 px-1 rounded font-medium border text-center transition-all cursor-pointer ${
                        (!selectedShape.doorProps?.flipX && !selectedShape.doorProps?.flipY)
                          ? 'bg-amber-600 text-white font-bold border-amber-700'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      🚪 Sol - İçe
                    </button>
                    <button
                      onClick={() => onUpdateDoorProps && onUpdateDoorProps({ hingeSide: 'right', swingDirection: 'inward', flipX: true, flipY: false })}
                      className={`text-[9.5px] py-1 px-1 rounded font-medium border text-center transition-all cursor-pointer ${
                        (selectedShape.doorProps?.flipX && !selectedShape.doorProps?.flipY)
                          ? 'bg-amber-600 text-white font-bold border-amber-700'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      🚪 Sağ - İçe
                    </button>
                    <button
                      onClick={() => onUpdateDoorProps && onUpdateDoorProps({ hingeSide: 'left', swingDirection: 'outward', flipX: false, flipY: true })}
                      className={`text-[9.5px] py-1 px-1 rounded font-medium border text-center transition-all cursor-pointer ${
                        (!selectedShape.doorProps?.flipX && selectedShape.doorProps?.flipY)
                          ? 'bg-amber-600 text-white font-bold border-amber-700'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      🚪 Sol - Dışa
                    </button>
                    <button
                      onClick={() => onUpdateDoorProps && onUpdateDoorProps({ hingeSide: 'right', swingDirection: 'outward', flipX: true, flipY: true })}
                      className={`text-[9.5px] py-1 px-1 rounded font-medium border text-center transition-all cursor-pointer ${
                        (selectedShape.doorProps?.flipX && selectedShape.doorProps?.flipY)
                          ? 'bg-amber-600 text-white font-bold border-amber-700'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      🚪 Sağ - Dışa
                    </button>
                  </div>
                </div>
              )}

              {/* Düzenleme Aksiyon Butonları */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {/* 🔄 Döndürme Butonu (Rotate) */}
                {onRotateSelectedShape && (
                  <button
                    id="btn-rotate-shape"
                    onClick={onRotateSelectedShape}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer border border-slate-200"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>90° Sağa Döndür (Rotate)</span>
                  </button>
                )}

                {selectedVertexIndex !== null && (
                  <button
                    id="btn-delete-vertex"
                    onClick={onDeleteSelectedVertex}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Seçili Noktayı Sil (Del)</span>
                  </button>
                )}

                {selectedEdgeIndex !== null && (
                  <button
                    id="btn-add-vertex-edge"
                    onClick={onAddVertexToSelectedEdge}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Bu Kenara Yeni Nokta Ekle (Böl)</span>
                  </button>
                )}

                <button
                  id="btn-delete-shape"
                  onClick={onDeleteSelectedShape}
                  className="w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 border border-slate-200 font-semibold py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Şekli / Tefrişi Sil</span>
                </button>
              </div>

              {/* Katman Değiştirme */}
              <div className="pt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">
                  Şekil Katmanını Değiştir:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {layers.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onChangeSelectedShapeLayer(l.id)}
                      className={`text-[10px] py-1 px-1.5 rounded border text-left font-medium truncate cursor-pointer transition-colors ${
                        selectedShape.layer === l.id
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cephe Özellikleri (Yön, Cam Tipi, Balkon) */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cephe & Mahal Özellikleri</span>
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Cephe Yönü / Konumu</label>
                    <select
                      value={selectedShape.facadeProps?.orientation || 'street'}
                      onChange={(e) => {
                        if (onUpdateSelectedShapeFacadeProps) {
                          onUpdateSelectedShapeFacadeProps({
                            ...(selectedShape.facadeProps || { glassType: 'comfort', balconyType: 'open', balconyWidthMeters: 1.5 }),
                            orientation: e.target.value
                          });
                        }
                      }}
                      className="w-full text-[11px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="street">Yola Bakan</option>
                      <option value="garden">Bahçeye Bakan</option>
                      <option value="blind">Kör Cephe (Sağır)</option>
                      <option value="courtyard">İç Avlu / Işıklık</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Cam Tipi</label>
                    <select
                      value={selectedShape.facadeProps?.glassType || 'comfort'}
                      onChange={(e) => {
                        if (onUpdateSelectedShapeFacadeProps) {
                          onUpdateSelectedShapeFacadeProps({
                            ...(selectedShape.facadeProps || { orientation: 'street', balconyType: 'open', balconyWidthMeters: 1.5 }),
                            glassType: e.target.value
                          });
                        }
                      }}
                      className="w-full text-[11px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="double">Çift Isıcam (Normal)</option>
                      <option value="comfort">Konfor Isıcam S</option>
                      <option value="triple">Triplex Güvenlik Camı</option>
                      <option value="acoustic">Akustik Ses Yalıtımlı</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Balkon Tipi</label>
                    <select
                      value={selectedShape.facadeProps?.balconyType || 'open'}
                      onChange={(e) => {
                        if (onUpdateSelectedShapeFacadeProps) {
                          onUpdateSelectedShapeFacadeProps({
                            ...(selectedShape.facadeProps || { orientation: 'street', glassType: 'comfort', balconyWidthMeters: 1.5 }),
                            balconyType: e.target.value
                          });
                        }
                      }}
                      className="w-full text-[11px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="none">Balkonsuz</option>
                      <option value="french">Fransız Balkon</option>
                      <option value="open">Açık Balkon</option>
                      <option value="closed">Cam Balkon Kapamalı</option>
                      <option value="corner">Köşe Balkon</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Balkon Gen. (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedShape.facadeProps?.balconyWidthMeters ?? 1.5}
                      onChange={(e) => {
                        if (onUpdateSelectedShapeFacadeProps) {
                          onUpdateSelectedShapeFacadeProps({
                            ...(selectedShape.facadeProps || { orientation: 'street', glassType: 'comfort', balconyType: 'open' }),
                            balconyWidthMeters: parseFloat(e.target.value) || 1.5
                          });
                        }
                      }}
                      className="w-full text-[11px] font-mono font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:bg-white focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 rounded-lg border border-dashed border-blue-300 text-center text-slate-500 space-y-1.5">
              <MousePointer className="w-5 h-5 text-blue-500 mx-auto" />
              <p className="font-semibold text-slate-800 text-[11px]">
                Düzenlemek İçin Bir Öğe Seçin
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Kanvastaki herhangi bir <strong>köşe noktasına</strong>, <strong>çizgiye</strong>, <strong>duvara</strong> veya <strong>tefrişe</strong> tıklayın.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* --- ÇİZİM MODU ÖZEL ARAÇLARI --- */
        <>
          {/* Geometri Tipi: Kapalı Poligon vs Tek Çizgi */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Geometri Şekli
            </span>
            <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                id="draw-mode-polygon-btn"
                onClick={() => onDrawModeChange('polygon')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  drawMode === 'polygon'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>Kapalı Poligon</span>
              </button>
              <button
                id="draw-mode-line-btn"
                onClick={() => onDrawModeChange('line')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  drawMode === 'line'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Minus className="w-3 h-3" />
                <span>Tek Çizgi / Hat</span>
              </button>
            </div>
          </div>

          {/* Mimari Eleman / Tefriş Menüsü (Akordiyon) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Mimari Eleman & Tefriş Menüsü</span>
              </span>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">Akordiyon</span>
            </div>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isOpen = openAccordionCategory === cat.id;
                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setOpenAccordionCategory(isOpen ? null : cat.id)}
                      className="w-full flex items-center justify-between p-2 text-left bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer font-bold text-slate-800 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <CatIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>{cat.name}</span>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                          {cat.presets.length}
                        </span>
                      </div>
                      <span className="text-slate-400 font-bold text-xs">{isOpen ? '−' : '+'}</span>
                    </button>

                    {isOpen && (
                      <div className="p-1.5 space-y-1 bg-white border-t border-slate-100 max-h-48 overflow-y-auto scrollbar-thin">
                        {cat.presets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => onSelectPreset(preset)}
                            className="w-full text-left p-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-blue-700 text-[11px] truncate">
                                {preset.name}
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono">
                                {preset.standardDimensionLabel} • {preset.code}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 px-1.5 py-0.5 rounded">
                              Ekle
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Çizim Durumu & Kapatma / Tek Çizgi Bitirme */}
          {isDrawing && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Çizim Devam Ediyor
                </span>
                <span className="text-amber-900 font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-200">
                  {pointCount} Nokta
                </span>
              </div>

              <div className="space-y-1.5 mt-2">
                {pointCount >= 2 && (
                  <button
                    id="cad-finish-line-btn"
                    onClick={onFinishLine}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Tek Çizgi / Hat Olarak Bitir</span>
                  </button>
                )}

                {pointCount >= 3 && (
                  <button
                    id="cad-finish-shape-btn"
                    onClick={onFinishShape}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Poligonu Kapat (Alan m²)</span>
                  </button>
                )}

                <button
                  id="cad-undo-point-btn"
                  onClick={onUndoPoint}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 py-1 rounded-md flex items-center justify-center gap-1 text-[10px] font-semibold border border-slate-300 shadow-2xs cursor-pointer"
                  title="Son Noktayı Geri Al"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Son Noktayı Geri Al</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CAD Kılavuz & Hassasiyet Ayarları */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
          CAD Kılavuz & Hassasiyet
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="cad-toggle-snap-btn"
            onClick={onToggleSnap}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-colors cursor-pointer ${
              snapToGrid
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Magnet className="w-3.5 h-3.5 text-amber-600" />
            <span>Grid Snap ({snapToGrid ? 'Açık' : 'Kapalı'})</span>
          </button>
          <button
            id="cad-toggle-ortho-btn"
            onClick={onToggleOrtho}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-colors cursor-pointer ${
              orthoMode
                ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Ortho 90° ({orthoMode ? 'Açık' : 'Kapalı'})</span>
          </button>
          <button
            id="cad-toggle-dim-btn"
            onClick={onToggleDimensions}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-colors cursor-pointer ${
              showDimensions
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="font-mono font-bold text-emerald-700">m</span>
            <span>Ölçü Etiketleri</span>
          </button>
          <button
            id="cad-toggle-grid-btn"
            onClick={onToggleGrid}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-colors cursor-pointer ${
              showGrid
                ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-purple-600" />
            <span>Grid Izgara</span>
          </button>
        </div>
      </div>

      {/* Hazır Parsel Şablonları */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
          Hazır Parsel Şablonları
        </span>
        <div className="grid grid-cols-3 gap-1">
          <button
            id="cad-template-corner"
            onClick={() => onLoadTemplate('corner')}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1 px-1 rounded text-[10px] text-center font-medium transition-colors cursor-pointer"
          >
            Köşe (840m²)
          </button>
          <button
            id="cad-template-standard"
            onClick={() => onLoadTemplate('standard')}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1 px-1 rounded text-[10px] text-center font-medium transition-colors cursor-pointer"
          >
            Dar (560m²)
          </button>
          <button
            id="cad-template-tevhidi"
            onClick={() => onLoadTemplate('tevhidi')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 py-1 px-1 rounded text-[10px] text-center font-semibold transition-colors cursor-pointer"
          >
            Tevhit (1360m²)
          </button>
        </div>
      </div>

      {/* Görünüm & Yakınlaştırma */}
      <div>
        <div className="flex gap-1">
          <button
            id="cad-zoom-in-btn"
            onClick={onZoomIn}
            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-md flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer"
            title="Yakınlaş"
          >
            <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            id="cad-zoom-out-btn"
            onClick={onZoomOut}
            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-md flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer"
            title="Uzaklaş"
          >
            <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            id="cad-zoom-reset-btn"
            onClick={onResetZoom}
            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-md flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer text-[10px]"
            title="Sıfırla"
          >
            <span>%100</span>
          </button>
          <div className="relative">
            <button
              id="cad-clear-canvas-btn"
              onClick={() => setShowClearConfirm(true)}
              className="w-full h-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-2.5 py-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
              title="Tüm Çizimi Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {showClearConfirm && (
              <div className="absolute bottom-10 right-0 z-50 bg-white p-3 rounded-xl shadow-xl border border-rose-200 w-56 space-y-2 animate-in fade-in zoom-in-95 text-left">
                <p className="text-xs font-bold text-slate-900">Çizimler Temizlensin mi?</p>
                <p className="text-[10px] text-slate-500">Tüm katmanlar ve şekiller silinecektir.</p>
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold py-1 rounded transition-colors cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => {
                      onClearCanvas();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold py-1 rounded transition-colors cursor-pointer shadow-sm"
                  >
                    Evet, Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teklif Motoru Aktarımı */}
      <div className="mt-auto pt-2 border-t border-slate-200">
        <button
          id="cad-sync-proposal-btn"
          onClick={onSyncWithProposal}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-xs cursor-pointer"
        >
          <ArrowRightCircle className="w-4 h-4" />
          <span>Hesaplanan Alanı Teklife Aktar</span>
        </button>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Arsa m² ve Taban m² otomatik bütçelenir</span>
        </div>
      </div>
    </aside>
  );
};
