import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Compass, Ruler, Sparkles, MousePointerClick, Zap, Minus, Move, Edit3, Trash2, PlusCircle, CheckCircle2, Crosshair, PenTool, RotateCw, X, ShieldCheck, Layers, Eye, EyeOff, Plus, Building2, ChevronRight, Copy } from 'lucide-react';
import { CadLayerType, CadPoint, CadShape, BuildingFloor, CadDoorProperties } from '../../types';
import {
  calculateDistanceMeters,
  calculatePolygonAreaM2,
  calculatePolygonPerimeterMeters,
  snapToGridPoint,
  applyOrthoConstraint,
  getSmartSnap,
  findHoveredVertex,
  findCoincidentVertices,
  findHoveredEdge,
  projectPointOnSegment,
  isPointInPolygon,
  syncDependentRoomLabels,
  weldPointToShapeEdges,
  weldAllShapesTogether,
  SnapResult,
  VertexRef,
  EdgeRef
} from '../../utils/cadMath';
import { CadToolbar, CadDrawMode } from './CadToolbar';
import { CadPropertyPanel } from './CadPropertyPanel';
import { ArchitecturalLibraryModal } from './ArchitecturalLibraryModal';
import { FloorManagerModal } from './FloorManagerModal';
import { CreateFloorLayerModal } from './CreateFloorLayerModal';
import { ArchitecturalPreset, createShapeFromPreset } from '../../data/architecturalPresets';
import { renderArchitecturalBlock } from '../../utils/cadRenderers';
import { INITIAL_CAD_SHAPES } from '../../mockData';

interface CadWorkspaceProps {
  shapes?: CadShape[];
  financials?: any;
  onUpdateShapes?: (shapes: CadShape[]) => void;
  onUpdateFinancials?: (financials: any) => void;
  onSyncAreasToProposal: (landM2: number, baseM2: number) => void;
}

type DraggedObject =
  | {
      type: 'vertex';
      shapeId: string;
      pointIndex: number;
      initialPoint: CadPoint;
      coincidentList: VertexRef[];
    }
  | {
      type: 'shape';
      shapeId: string;
      startWorldPt: CadPoint;
      initialPoints: CadPoint[];
    };

export const CadWorkspace: React.FC<CadWorkspaceProps> = ({
  shapes: externalShapes,
  financials,
  onUpdateShapes,
  onUpdateFinancials,
  onSyncAreasToProposal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // CAD Durumları
  const [internalShapes, setInternalShapes] = useState<CadShape[]>(INITIAL_CAD_SHAPES);
  const shapes = externalShapes || internalShapes;
  const [scaleMetersPerPixel, setScaleMetersPerPixel] = useState<number>(0.05); // 1px = 0.05m

  // --- GERİ AL / İLERİ AL (UNDO / REDO) TARİHÇE SİSTEMİ ---
  const [history, setHistory] = useState<CadShape[][]>([INITIAL_CAD_SHAPES]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoCall = useRef<boolean>(false);

  // Tarihçeye Yeni Şekil Durumu Ekleme
  const pushToHistory = useCallback((newShapes: CadShape[]) => {
    if (isUndoRedoCall.current) {
      isUndoRedoCall.current = false;
      return;
    }
    setHistory((prevHist) => {
      const sliced = prevHist.slice(0, historyIndex + 1);
      const nextHist = [...sliced, newShapes];
      if (nextHist.length > 50) return nextHist.slice(nextHist.length - 50);
      return nextHist;
    });
    setHistoryIndex((prevIdx) => Math.min(prevIdx + 1, 49));
  }, [historyIndex]);

  const setShapes = useCallback((action: React.SetStateAction<CadShape[]>) => {
    if (onUpdateShapes) {
      if (typeof action === 'function') {
        const rawNext = action(externalShapes || internalShapes);
        const next = syncDependentRoomLabels(rawNext, scaleMetersPerPixel);
        onUpdateShapes(next);
        pushToHistory(next);
      } else {
        const next = syncDependentRoomLabels(action, scaleMetersPerPixel);
        onUpdateShapes(next);
        pushToHistory(next);
      }
    } else {
      setInternalShapes((prev) => {
        const rawNext = typeof action === 'function' ? action(prev) : action;
        const next = syncDependentRoomLabels(rawNext, scaleMetersPerPixel);
        pushToHistory(next);
        return next;
      });
    }
  }, [externalShapes, internalShapes, onUpdateShapes, pushToHistory, scaleMetersPerPixel]);

  // Çalışma Modu: 'draw' (Çizim Modu) | 'select' (Düzenleme Modu) | 'pan'
  const [currentTool, setCurrentTool] = useState<'draw' | 'select' | 'pan'>('draw');
  const [drawMode, setDrawMode] = useState<CadDrawMode>('polygon'); // 'polygon' (kapalı) veya 'line' (tek çizgi/açık hat)
  const [activeLayer, setActiveLayer] = useState<CadLayerType>('boundary');

  // Çizim Sırasındaki Noktalar
  const [currentPoints, setCurrentPoints] = useState<CadPoint[]>([]);
  const [hoverPoint, setHoverPoint] = useState<CadPoint | null>(null);
  const [activeSnap, setActiveSnap] = useState<SnapResult | null>(null);

  // Mimari Kütüphane & Kat Yönetimi Durumları
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isFloorManagerOpen, setIsFloorManagerOpen] = useState<boolean>(false);
  const [isCreateFloorLayerOpen, setIsCreateFloorLayerOpen] = useState<boolean>(false);
  const [showGhostFloors, setShowGhostFloors] = useState<boolean>(true);
  const [placingPreset, setPlacingPreset] = useState<ArchitecturalPreset | null>(null);

  const floors: BuildingFloor[] = financials?.floors || [];
  const [activeFloorId, setActiveFloorId] = useState<string>(() => {
    if (floors.length > 0) {
      const ground = floors.find((f) => f.type === 'ground');
      return ground ? ground.id : floors[0].id;
    }
    return 'f-gr';
  });

  // Keep activeFloorId valid if floors change
  useEffect(() => {
    if (floors.length > 0 && !floors.some((f) => f.id === activeFloorId)) {
      const ground = floors.find((f) => f.type === 'ground');
      setActiveFloorId(ground ? ground.id : floors[0].id);
    }
  }, [floors, activeFloorId]);

  // Kat Güncelleme & Senkronizasyon
  const handleUpdateFloors = useCallback((newFloors: BuildingFloor[]) => {
    if (!onUpdateFinancials || !financials) return;
    const totalConstM2 = newFloors.reduce((acc, f) => acc + (f.areaM2 || 0), 0);
    const totalResCount = newFloors.reduce((acc, f) => acc + (f.apartmentCount || 0), 0);
    const floorCount = newFloors.length;
    const groundFloor = newFloors.find(f => f.type === 'ground') || newFloors[newFloors.length - 1];
    const baseAreaM2 = groundFloor ? groundFloor.areaM2 : financials.baseAreaM2;

    onUpdateFinancials({
      ...financials,
      floors: newFloors,
      totalConstructionM2: totalConstM2,
      residentialCount: totalResCount,
      floorCount,
      baseAreaM2
    });
  }, [financials, onUpdateFinancials]);

  // Yeni Kat Katmanı Oluşturma (Çizim Kopyalama Destekli)
  const handleCreateFloorLayer = (newFloor: BuildingFloor, copiedShapesFromFloorId?: string) => {
    const updatedFloors = [...floors, newFloor].sort((a, b) => b.floorNumber - a.floorNumber);

    if (copiedShapesFromFloorId) {
      const sourceShapes = shapes.filter(
        (s) => s.floorId === copiedShapesFromFloorId || (!s.floorId && copiedShapesFromFloorId === 'f-gr')
      );
      const clonedShapes: CadShape[] = sourceShapes.map((s, idx) => ({
        ...s,
        id: `shape-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        floorId: newFloor.id,
        name: s.name.includes('(') ? `${s.name.split('(')[0].trim()} (${newFloor.name})` : `${s.name} (${newFloor.name})`
      }));
      setShapes((prev) => [...prev, ...clonedShapes]);
    }

    handleUpdateFloors(updatedFloors);
    setActiveFloorId(newFloor.id);
  };

  // Dinamik CAD Kat Alanı Senkronizasyonu (Çizilen dış duvar ve alanların proje maliyetine eş zamanlı yansıması)
  const syncFloorAreasWithFinancials = useCallback((currentShapes: CadShape[], currentFloors: BuildingFloor[]) => {
    if (!onUpdateFinancials || !financials || !currentFloors || currentFloors.length === 0) return;

    let hasChanges = false;
    const updatedFloors = currentFloors.map((floor) => {
      const floorShapes = currentShapes.filter(
        (s) => s.floorId === floor.id || (!s.floorId && floor.id === 'f-gr')
      );

      // Kat alanını oluşturan Dış Duvar / Taban Poligonları
      const outerWallShapes = floorShapes.filter(
        (s) => s.layer === 'outer_wall' && s.isClosed && s.areaM2 && s.areaM2 > 0
      );

      let cadAreaForFloor = 0;
      if (outerWallShapes.length > 0) {
        cadAreaForFloor = outerWallShapes.reduce((sum, s) => sum + (s.areaM2 || 0), 0);
      } else {
        // Eğer dış duvar yoksa çizilmiş mahal damgaları veya kapalı iç oda toplamını al
        const roomShapes = floorShapes.filter(
          (s) => (s.blockType === 'room_label' || (s.isClosed && s.layer === 'inner_wall')) && s.areaM2 && s.areaM2 > 0
        );
        if (roomShapes.length > 0) {
          cadAreaForFloor = roomShapes.reduce((sum, s) => sum + (s.areaM2 || 0), 0);
        }
      }

      if (cadAreaForFloor > 0) {
        const roundedArea = Number(cadAreaForFloor.toFixed(1));
        if (floor.areaM2 !== roundedArea || !floor.isCadCalculated) {
          hasChanges = true;
          return {
            ...floor,
            areaM2: roundedArea,
            isCadCalculated: true,
            cadShapeCount: floorShapes.length
          };
        }
      }
      return {
        ...floor,
        cadShapeCount: floorShapes.length
      };
    });

    if (hasChanges) {
      const totalConstM2 = updatedFloors.reduce((acc, f) => acc + (f.areaM2 || 0), 0);
      const totalResCount = updatedFloors.reduce((acc, f) => acc + (f.apartmentCount || 0), 0);
      const groundFloor = updatedFloors.find((f) => f.type === 'ground') || updatedFloors[0];
      const baseAreaM2 = groundFloor ? groundFloor.areaM2 : financials.baseAreaM2;

      onUpdateFinancials({
        ...financials,
        floors: updatedFloors,
        totalConstructionM2: totalConstM2,
        residentialCount: totalResCount,
        floorCount: updatedFloors.length,
        baseAreaM2
      });
    }
  }, [financials, onUpdateFinancials]);

  // CAD Çizim veya Kat Değişikliğinde Otomatik Maliyet & Metraj Senkronizasyonu
  useEffect(() => {
    if (financials?.floors && financials.floors.length > 0) {
      syncFloorAreasWithFinancials(shapes, financials.floors);
    }
  }, [shapes, financials?.floors, syncFloorAreasWithFinancials]);

  // Düzenleme Modu Seçim Durumları
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number | null>(null);

  // Hover Durumları
  const [hoveredVertex, setHoveredVertex] = useState<VertexRef | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<EdgeRef | null>(null);

  // Taşıma Durumu
  const [draggedObject, setDraggedObject] = useState<DraggedObject | null>(null);

  // Kılavuz & CAD Ayarları
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [orthoMode, setOrthoMode] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSizePixels] = useState<number>(20); // 1 grid kutusu = 1 metre (20px * 0.05m = 1.0m)

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // İmar Katsayıları
  const [kaksRatio, setKaksRatio] = useState<number>(2.07); // Kentsel dönüşüm teşvikli


  // Metraj Hesaplamaları
  const boundaryShape = shapes.find((s) => s.layer === 'boundary');
  const totalBoundaryAreaM2 = boundaryShape?.areaM2 || 840;
  
  const outerWallShape = shapes.find((s) => s.layer === 'outer_wall');
  const totalBuildingAreaM2 = outerWallShape?.areaM2 || 294;

  const tevhidiShape = shapes.find((s) => s.layer === 'tevhidi');
  const totalTevhitiAreaM2 = tevhidiShape?.areaM2 || 0;

  const taksRatio = totalBoundaryAreaM2 > 0 ? totalBuildingAreaM2 / totalBoundaryAreaM2 : 0.35;

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;

  // Ekran koordinatlarını Canvas dünya koordinatlarına dönüştürme
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): CadPoint => {
      const worldX = (screenX - pan.x) / zoom;
      const worldY = (screenY - pan.y) / zoom;
      return { x: worldX, y: worldY };
    },
    [pan, zoom]
  );

  // Şekli veya Tek Çizgiyi Kapat & Kaydet
  const finishCurrentShape = useCallback((asLineOverride?: boolean) => {
    const isLine = asLineOverride !== undefined ? asLineOverride : drawMode === 'line';

    if (isLine) {
      if (currentPoints.length < 2) {
        setCurrentPoints([]);
        setHoverPoint(null);
        setActiveSnap(null);
        return;
      }

      const totalLength = calculatePolygonPerimeterMeters(currentPoints, scaleMetersPerPixel, false);

      const layerColors: Record<CadLayerType, { stroke: string; fill: string; name: string }> = {
        boundary: { stroke: '#059669', fill: 'transparent', name: 'Arsa Sınır Hattı' },
        outer_wall: { stroke: '#2563eb', fill: 'transparent', name: 'Dış Duvar Hattı' },
        inner_wall: { stroke: '#6366f1', fill: 'transparent', name: 'İç Duvar / Bölme' },
        door_window: { stroke: '#d97706', fill: 'transparent', name: 'Doğrama / Açıklık' },
        furniture_fixture: { stroke: '#0891b2', fill: 'transparent', name: 'Tefriş Donatı' },
        tevhidi: { stroke: '#7c3aed', fill: 'transparent', name: 'Tevhit Sınır Çizgisi' },
        setback_flood: { stroke: '#e11d48', fill: 'transparent', name: 'Çekme / Taşkın Hattı' }
      };

      const style = layerColors[activeLayer] || layerColors.inner_wall;

      const isGlobal = activeLayer === 'boundary' || activeLayer === 'tevhidi' || activeLayer === 'setback_flood';
      const assignedFloorId = isGlobal ? 'global' : activeFloorId;

      const newShape: CadShape = {
        id: `line-${Date.now()}`,
        name: `${style.name} (${totalLength.toFixed(2)}m)`,
        layer: activeLayer,
        floorId: assignedFloorId,
        points: currentPoints,
        color: style.stroke,
        strokeWidth: activeLayer === 'inner_wall' ? 2.5 : 3,
        fillColor: 'transparent',
        isClosed: false,
        areaM2: 0,
        perimeterMeters: totalLength
      };

      setShapes((prev) => {
        const merged = [...prev, newShape];
        const welded = weldAllShapesTogether(merged, scaleMetersPerPixel, 14 / zoom, activeFloorId);
        return syncDependentRoomLabels(welded, scaleMetersPerPixel);
      });
      setSelectedShapeId(newShape.id);
      setCurrentPoints([]);
      setHoverPoint(null);
      setActiveSnap(null);
      return;
    }

    if (currentPoints.length < 3) {
      if (currentPoints.length === 2) {
        finishCurrentShape(true);
        return;
      }
      setCurrentPoints([]);
      setHoverPoint(null);
      setActiveSnap(null);
      return;
    }

    const areaM2 = calculatePolygonAreaM2(currentPoints, scaleMetersPerPixel);
    const perimeterMeters = calculatePolygonPerimeterMeters(currentPoints, scaleMetersPerPixel, true);

    const layerColors: Record<CadLayerType, { stroke: string; fill: string; name: string }> = {
      boundary: { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.14)', name: 'Arsa Sınırı' },
      outer_wall: { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.16)', name: 'Bina Tabanı' },
      inner_wall: { stroke: '#6366f1', fill: 'transparent', name: 'İç Duvar' },
      door_window: { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.22)', name: 'Doğrama/Kapı' },
      furniture_fixture: { stroke: '#0891b2', fill: 'rgba(8, 145, 178, 0.16)', name: 'Tefriş Donatı' },
      tevhidi: { stroke: '#7c3aed', fill: 'rgba(124, 58, 237, 0.14)', name: 'Tevhit Parsel' },
      setback_flood: { stroke: '#e11d48', fill: 'rgba(225, 29, 72, 0.14)', name: 'Taşkın/Çekme Sınırı' }
    };

    const style = layerColors[activeLayer] || layerColors.boundary;

    const isGlobal = activeLayer === 'boundary' || activeLayer === 'tevhidi' || activeLayer === 'setback_flood';
    const assignedFloorId = isGlobal ? 'global' : activeFloorId;

    const newShape: CadShape = {
      id: `shape-${Date.now()}`,
      name: `${style.name} (${areaM2} m²)`,
      layer: activeLayer,
      floorId: assignedFloorId,
      points: currentPoints,
      color: style.stroke,
      strokeWidth: activeLayer === 'boundary' ? 3 : 2,
      fillColor: style.fill,
      isClosed: true,
      areaM2,
      perimeterMeters
    };

    setShapes((prev) => {
      const merged = [...prev, newShape];
      const welded = weldAllShapesTogether(merged, scaleMetersPerPixel, 14 / zoom, activeFloorId);
      return syncDependentRoomLabels(welded, scaleMetersPerPixel);
    });
    setSelectedShapeId(newShape.id);
    setCurrentPoints([]);
    setHoverPoint(null);
    setActiveSnap(null);
  }, [currentPoints, drawMode, activeLayer, scaleMetersPerPixel, setShapes]);

  // Çizim İşlemleri
  const handleUndoPoint = () => {
    setCurrentPoints((prev) => prev.slice(0, -1));
  };

  const handleClearCanvas = () => {
    setShapes([]);
    setCurrentPoints([]);
    setSelectedShapeId(null);
    setSelectedVertexIndex(null);
    setSelectedEdgeIndex(null);
  };

  const handleDeleteShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    if (selectedShapeId === id) {
      setSelectedShapeId(null);
      setSelectedVertexIndex(null);
      setSelectedEdgeIndex(null);
    }
  }, [selectedShapeId, setShapes]);

  // Seçili Noktayı Sil
  const handleDeleteSelectedVertex = useCallback(() => {
    if (!selectedShapeId || selectedVertexIndex === null) return;
    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId) return s;
        if (s.points.length <= (s.isClosed ? 3 : 2)) {
          // Çok az nokta kaldıysa şekli silebilir veya uyarı verebiliriz
          return s;
        }
        const updatedPoints = s.points.filter((_, idx) => idx !== selectedVertexIndex);
        const areaM2 = s.isClosed ? calculatePolygonAreaM2(updatedPoints, scaleMetersPerPixel) : 0;
        const perimeterMeters = calculatePolygonPerimeterMeters(updatedPoints, scaleMetersPerPixel, s.isClosed);
        return {
          ...s,
          points: updatedPoints,
          areaM2,
          perimeterMeters
        };
      });
    });
    setSelectedVertexIndex(null);
  }, [selectedShapeId, selectedVertexIndex, scaleMetersPerPixel, setShapes]);

  // Seçili Çizgiye/Kenara Yeni Nokta Ekle (Çizgiyi Böl)
  const handleAddVertexToSelectedEdge = useCallback(() => {
    if (!selectedShapeId || selectedEdgeIndex === null) return;
    const targetShape = shapes.find((s) => s.id === selectedShapeId);
    if (!targetShape || targetShape.points.length < 2) return;

    const p1 = targetShape.points[selectedEdgeIndex];
    const p2 = targetShape.points[(selectedEdgeIndex + 1) % targetShape.points.length];
    const midPoint: CadPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId) return s;
        const newPoints = [...s.points];
        newPoints.splice(selectedEdgeIndex + 1, 0, midPoint);
        const areaM2 = s.isClosed ? calculatePolygonAreaM2(newPoints, scaleMetersPerPixel) : 0;
        const perimeterMeters = calculatePolygonPerimeterMeters(newPoints, scaleMetersPerPixel, s.isClosed);
        return {
          ...s,
          points: newPoints,
          areaM2,
          perimeterMeters
        };
      });
    });

    setSelectedVertexIndex(selectedEdgeIndex + 1);
    setSelectedEdgeIndex(null);
  }, [selectedShapeId, selectedEdgeIndex, shapes, scaleMetersPerPixel, setShapes]);

  // Nokta Koordinatlarını Manuel Güncelleme
  const handleUpdateVertexCoord = useCallback((pointIndex: number, xMeters: number, yMeters: number) => {
    if (!selectedShapeId) return;
    const worldX = xMeters / scaleMetersPerPixel;
    const worldY = yMeters / scaleMetersPerPixel;

    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId) return s;
        const updatedPoints = [...s.points];
        if (pointIndex >= 0 && pointIndex < updatedPoints.length) {
          updatedPoints[pointIndex] = { x: worldX, y: worldY };
        }
        const areaM2 = s.isClosed ? calculatePolygonAreaM2(updatedPoints, scaleMetersPerPixel) : 0;
        const perimeterMeters = calculatePolygonPerimeterMeters(updatedPoints, scaleMetersPerPixel, s.isClosed);
        return {
          ...s,
          points: updatedPoints,
          areaM2,
          perimeterMeters
        };
      });
    });
  }, [selectedShapeId, scaleMetersPerPixel, setShapes]);

  // Seçili Şeklin Katmanını Değiştirme
  const handleChangeSelectedShapeLayer = useCallback((newLayer: CadLayerType) => {
    if (!selectedShapeId) return;
    const layerColors: Record<CadLayerType, { stroke: string; fill: string; name: string }> = {
      boundary: { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.14)', name: 'Arsa Sınırı' },
      outer_wall: { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.16)', name: 'Bina Tabanı' },
      inner_wall: { stroke: '#6366f1', fill: 'transparent', name: 'İç Duvar' },
      door_window: { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.22)', name: 'Doğrama/Kapı' },
      furniture_fixture: { stroke: '#0891b2', fill: 'rgba(8, 145, 178, 0.16)', name: 'Tefriş Donatı' },
      tevhidi: { stroke: '#7c3aed', fill: 'rgba(124, 58, 237, 0.14)', name: 'Tevhit Parsel' },
      setback_flood: { stroke: '#e11d48', fill: 'rgba(225, 29, 72, 0.14)', name: 'Taşkın/Çekme Sınırı' }
    };
    const style = layerColors[newLayer] || layerColors.boundary;

    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId) return s;
        return {
          ...s,
          layer: newLayer,
          color: style.stroke,
          fillColor: s.isClosed ? style.fill : 'transparent'
        };
      });
    });
  }, [selectedShapeId, setShapes]);

  // Seçili Şekil Cephe Özelliklerini Güncelleme
  const handleUpdateSelectedShapeFacadeProps = useCallback((facadeProps: any) => {
    if (!selectedShapeId) return;
    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId) return s;
        return {
          ...s,
          facadeProps: {
            ...(s.facadeProps || { orientation: 'street', glassType: 'comfort', balconyType: 'open', balconyWidthMeters: 1.5 }),
            ...facadeProps
          }
        };
      });
    });
  }, [selectedShapeId, setShapes]);

  // Kapı Menteşe Yönü Değiştirme (Sol/Sağ)
  const handleFlipDoorHinge = useCallback((shapeIdOverride?: string) => {
    const targetId = shapeIdOverride || selectedShapeId;
    if (!targetId) return;
    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== targetId) return s;
        const currentHinge = s.doorProps?.hingeSide || (s.doorProps?.flipX ? 'right' : 'left');
        const newHinge = currentHinge === 'left' ? 'right' : 'left';
        return {
          ...s,
          doorProps: {
            hingeSide: newHinge,
            swingDirection: s.doorProps?.swingDirection || (s.doorProps?.flipY ? 'outward' : 'inward'),
            flipX: newHinge === 'right',
            flipY: s.doorProps?.flipY || false
          }
        };
      });
    });
  }, [selectedShapeId, setShapes]);

  // Kapı Açılım Yönü Değiştirme (İçe/Dışa)
  const handleFlipDoorSwing = useCallback((shapeIdOverride?: string) => {
    const targetId = shapeIdOverride || selectedShapeId;
    if (!targetId) return;
    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== targetId) return s;
        const currentSwing = s.doorProps?.swingDirection || (s.doorProps?.flipY ? 'outward' : 'inward');
        const newSwing = currentSwing === 'inward' ? 'outward' : 'inward';
        return {
          ...s,
          doorProps: {
            hingeSide: s.doorProps?.hingeSide || (s.doorProps?.flipX ? 'right' : 'left'),
            swingDirection: newSwing,
            flipX: s.doorProps?.flipX || false,
            flipY: newSwing === 'outward'
          }
        };
      });
    });
  }, [selectedShapeId, setShapes]);

  // Kapı Özellikleri Güncelleme
  const handleUpdateDoorProps = useCallback((doorProps: CadDoorProperties) => {
    if (!selectedShapeId) return;
    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId) return s;
        return {
          ...s,
          doorProps
        };
      });
    });
  }, [selectedShapeId, setShapes]);

  // Geri Al (Undo)
  const handleUndo = useCallback(() => {
    // 1. Çizim esnasında poligon/çizgi noktalarını tek tek geri al
    if (currentPoints.length > 0) {
      setCurrentPoints((prev) => {
        const next = prev.slice(0, -1);
        if (next.length === 0) {
          setHoverPoint(null);
          setActiveSnap(null);
        }
        return next;
      });
      return;
    }

    // 2. Şekil tarihçesinden geri al
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      const targetShapes = history[targetIdx];
      isUndoRedoCall.current = true;
      setHistoryIndex(targetIdx);
      if (onUpdateShapes) {
        onUpdateShapes(targetShapes);
      } else {
        setInternalShapes(targetShapes);
      }
      setSelectedShapeId(null);
      setSelectedVertexIndex(null);
      setSelectedEdgeIndex(null);
    }
  }, [currentPoints.length, historyIndex, history, onUpdateShapes]);

  // İleri Al (Redo)
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIdx = historyIndex + 1;
      const targetShapes = history[targetIdx];
      isUndoRedoCall.current = true;
      setHistoryIndex(targetIdx);
      if (onUpdateShapes) {
        onUpdateShapes(targetShapes);
      } else {
        setInternalShapes(targetShapes);
      }
      setSelectedShapeId(null);
      setSelectedVertexIndex(null);
      setSelectedEdgeIndex(null);
    }
  }, [historyIndex, history, onUpdateShapes]);

  const canUndo = currentPoints.length > 0 || historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Mimari Tefriş Seçimi
  const handleSelectPreset = useCallback((preset: ArchitecturalPreset) => {
    setPlacingPreset(preset);
    setIsLibraryOpen(false);
    setCurrentTool('select');
  }, []);

  // Seçili Şekli veya Mimari Tefrişi 90° Döndür
  const handleRotateSelectedShape = useCallback(() => {
    if (!selectedShapeId) return;
    setShapes((prev) => {
      return prev.map((s) => {
        if (s.id !== selectedShapeId || s.points.length === 0) return s;

        // Merkez noktasını hesapla
        let cx = 0, cy = 0;
        s.points.forEach((p) => { cx += p.x; cy += p.y; });
        cx /= s.points.length;
        cy /= s.points.length;

        // Noktaları merkez etrafında 90 derece (PI/2) döndür
        const angle = Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const rotatedPoints = s.points.map((p) => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          return {
            x: cx + (dx * cos - dy * sin),
            y: cy + (dx * sin + dy * cos)
          };
        });

        const newRotation = ((s.rotation || 0) + 90) % 360;

        // Ölçüleri de tersine çevir (Genişlik ve Derinlik yer değişir)
        let newDimensions = s.dimensions;
        if (s.dimensions) {
          newDimensions = {
            ...s.dimensions,
            widthMeters: s.dimensions.depthMeters,
            depthMeters: s.dimensions.widthMeters
          };
        }

        return {
          ...s,
          points: rotatedPoints,
          rotation: newRotation,
          dimensions: newDimensions
        };
      });
    });
  }, [selectedShapeId, setShapes]);


  // Hazır Şablon Yükleme
  const handleLoadTemplate = (type: 'corner' | 'standard' | 'tevhidi') => {
    if (type === 'corner') {
      const cornerShapes: CadShape[] = [
        {
          id: 'b-corner',
          name: 'Köşe Parsel Sınırı (840 m²)',
          layer: 'boundary',
          points: [
            { x: 100, y: 100 },
            { x: 700, y: 100 },
            { x: 700, y: 380 },
            { x: 100, y: 380 }
          ],
          color: '#059669',
          strokeWidth: 3,
          fillColor: 'rgba(5, 150, 105, 0.12)',
          isClosed: true,
          areaM2: 840,
          perimeterMeters: 116
        },
        {
          id: 'w-corner',
          name: 'Bina Oturumu - TAKS (294 m²)',
          layer: 'outer_wall',
          points: [
            { x: 200, y: 160 },
            { x: 550, y: 160 },
            { x: 550, y: 328 },
            { x: 200, y: 328 }
          ],
          color: '#2563eb',
          strokeWidth: 2.5,
          fillColor: 'rgba(37, 99, 235, 0.18)',
          isClosed: true,
          areaM2: 294,
          perimeterMeters: 68.8
        },
        {
          id: 'line-corridor',
          name: 'Ana Bölme Aksı (17.50m)',
          layer: 'inner_wall',
          points: [
            { x: 375, y: 160 },
            { x: 375, y: 328 }
          ],
          color: '#6366f1',
          strokeWidth: 2.5,
          fillColor: 'transparent',
          isClosed: false,
          areaM2: 0,
          perimeterMeters: 8.4
        }
      ];
      setShapes(cornerShapes);
    } else if (type === 'standard') {
      const stdShapes: CadShape[] = [
        {
          id: 'b-std',
          name: 'Ara Parsel Sınırı (560 m²)',
          layer: 'boundary',
          points: [
            { x: 150, y: 100 },
            { x: 550, y: 100 },
            { x: 550, y: 380 },
            { x: 150, y: 380 }
          ],
          color: '#059669',
          strokeWidth: 3,
          fillColor: 'rgba(5, 150, 105, 0.12)',
          isClosed: true,
          areaM2: 560,
          perimeterMeters: 96
        },
        {
          id: 'w-std',
          name: 'Bina Tabanı (196 m²)',
          layer: 'outer_wall',
          points: [
            { x: 220, y: 160 },
            { x: 480, y: 160 },
            { x: 480, y: 310 },
            { x: 220, y: 310 }
          ],
          color: '#2563eb',
          strokeWidth: 2.5,
          fillColor: 'rgba(37, 99, 235, 0.18)',
          isClosed: true,
          areaM2: 196,
          perimeterMeters: 56
        }
      ];
      setShapes(stdShapes);
    } else if (type === 'tevhidi') {
      const tevhitShapes: CadShape[] = [
        {
          id: 'b-main',
          name: 'Ana Parsel Sınırı (840 m²)',
          layer: 'boundary',
          points: [
            { x: 100, y: 100 },
            { x: 700, y: 100 },
            { x: 700, y: 380 },
            { x: 100, y: 380 }
          ],
          color: '#059669',
          strokeWidth: 3,
          fillColor: 'rgba(5, 150, 105, 0.12)',
          isClosed: true,
          areaM2: 840,
          perimeterMeters: 116
        },
        {
          id: 'b-tevhidi',
          name: 'Tevhit Edilen Komşu Parsel (520 m²)',
          layer: 'tevhidi',
          points: [
            { x: 700, y: 100 },
            { x: 1050, y: 100 },
            { x: 1050, y: 380 },
            { x: 700, y: 380 }
          ],
          color: '#7c3aed',
          strokeWidth: 3,
          fillColor: 'rgba(124, 58, 237, 0.16)',
          isClosed: true,
          areaM2: 520,
          perimeterMeters: 89
        }
      ];
      setShapes(tevhitShapes);
    }
  };

  // Klavyeden Kısayol Tuşları (Delete, Escape, Enter, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Redo: Ctrl+Y / Cmd+Y / Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' || e.key === 'Z') && e.shiftKey || e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedVertexIndex !== null) {
          handleDeleteSelectedVertex();
        } else if (selectedShapeId !== null) {
          handleDeleteShape(selectedShapeId);
        } else if (shapes.length > 0) {
          handleDeleteShape(shapes[shapes.length - 1].id);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedShapeId !== null) {
          handleRotateSelectedShape();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (selectedShapeId !== null) {
          handleFlipDoorHinge();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        if (selectedShapeId !== null) {
          handleFlipDoorSwing();
        }
      } else if (e.key === 'Escape') {
        if (placingPreset) {
          setPlacingPreset(null);
        } else if (currentPoints.length > 0) {
          setCurrentPoints([]);
          setHoverPoint(null);
          setActiveSnap(null);
        } else {
          setSelectedShapeId(null);
          setSelectedVertexIndex(null);
          setSelectedEdgeIndex(null);
        }
      } else if (e.key === 'Enter') {
        if (currentPoints.length >= 2) {
          finishCurrentShape();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTool, selectedVertexIndex, selectedShapeId, currentPoints, shapes, placingPreset, handleDeleteSelectedVertex, handleDeleteShape, finishCurrentShape, handleRotateSelectedShape, handleFlipDoorHinge, handleFlipDoorSwing, handleUndo, handleRedo]);


  // Canvas Çizim Motoru
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Grid Izgarası Çizimi
    if (showGrid) {
      const startX = -pan.x / zoom;
      const startY = -pan.y / zoom;
      const endX = (canvas.width - pan.x) / zoom;
      const endY = (canvas.height - pan.y) / zoom;

      const majorGrid = gridSizePixels * 5; // Her 5 metrede ana çizgi
      const minorGrid = gridSizePixels; // 1 metre

      ctx.lineWidth = 0.5 / zoom;
      ctx.strokeStyle = '#e2e8f0';

      ctx.beginPath();
      for (let x = Math.floor(startX / minorGrid) * minorGrid; x < endX; x += minorGrid) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / minorGrid) * minorGrid; y < endY; y += minorGrid) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      ctx.lineWidth = 1 / zoom;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      for (let x = Math.floor(startX / majorGrid) * majorGrid; x < endX; x += majorGrid) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / majorGrid) * majorGrid; y < endY; y += majorGrid) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    }

    // 2. Orijin (0,0) Göstergesi
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5 / zoom;
    ctx.beginPath();
    ctx.moveTo(-15 / zoom, 0);
    ctx.lineTo(35 / zoom, 0);
    ctx.moveTo(0, -15 / zoom);
    ctx.lineTo(0, 35 / zoom);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${9 / zoom}px monospace`;
    ctx.fillText('(0,0)', 4 / zoom, -4 / zoom);
    ctx.restore();

    // 3. Hayalet Katmanlar (Diğer Katların Çizim İzleri)
    if (showGhostFloors) {
      shapes.forEach((shape) => {
        const isGlobal = shape.floorId === 'global' || shape.layer === 'boundary' || shape.layer === 'tevhidi' || shape.layer === 'setback_flood';
        const isCurrentFloor = shape.floorId === activeFloorId || (!shape.floorId && activeFloorId === 'f-gr');

        if (!isGlobal && !isCurrentFloor && shape.points.length >= 2) {
          ctx.save();
          ctx.globalAlpha = 0.28;
          ctx.setLineDash([6 / zoom, 4 / zoom]);

          if (shape.blockType) {
            renderArchitecturalBlock(ctx, shape, zoom, false);
          } else {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            if (shape.isClosed) ctx.closePath();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();
          }
          ctx.restore();
        }
      });
    }

    // 4. Mevcut Aktif Kat & Global Şekiller
    shapes.forEach((shape) => {
      if (shape.points.length < 2) return;

      const isGlobal = shape.floorId === 'global' || shape.layer === 'boundary' || shape.layer === 'tevhidi' || shape.layer === 'setback_flood';
      const isCurrentFloor = shape.floorId === activeFloorId || (!shape.floorId && activeFloorId === 'f-gr');

      if (!isGlobal && !isCurrentFloor) return; // Sadece aktif kat ve arsa parsel çizimlerini göster

      const isSelected = selectedShapeId === shape.id;

      // Özel Mimari Tefriş Bloku (Kapı, Pencere, Duvar, Banyo, Mutfak, Tefriş vb.)
      if (shape.blockType) {
        renderArchitecturalBlock(ctx, shape, zoom, isSelected);
        return;
      }

      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      if (shape.isClosed) {
        ctx.closePath();
        const baseFill = shape.fillColor || 'rgba(5, 150, 105, 0.14)';
        ctx.fillStyle = isSelected
          ? baseFill.replace('0.14', '0.28').replace('0.16', '0.30').replace('0.12', '0.25') || 'rgba(245, 158, 11, 0.15)'
          : baseFill;
        ctx.fill();
      }

      ctx.strokeStyle = isSelected ? '#f59e0b' : shape.color;
      ctx.lineWidth = (isSelected ? shape.strokeWidth + 2 : shape.strokeWidth) / zoom;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (isSelected) {
        ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        ctx.shadowBlur = 8 / zoom;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Düzenleme Modunda veya Şekil Seçiliyken Köşe Tutamaçları (Handles)
      if (currentTool === 'select' || isSelected) {
        shape.points.forEach((pt, idx) => {
          const isVertexSelected = isSelected && selectedVertexIndex === idx;
          const isVertexHovered = hoveredVertex?.shapeId === shape.id && hoveredVertex?.pointIndex === idx;

          ctx.beginPath();
          const r = (isVertexSelected ? 6.5 : isVertexHovered ? 5.5 : 4) / zoom;
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);

          ctx.fillStyle = isVertexSelected ? '#f59e0b' : isVertexHovered ? '#0284c7' : '#ffffff';
          ctx.fill();
          ctx.strokeStyle = isVertexSelected ? '#78350f' : isVertexHovered ? '#0369a1' : shape.color;
          ctx.lineWidth = (isVertexSelected ? 2.5 : 1.5) / zoom;
          ctx.stroke();

          // Seçili noktanın etrafında hedef halkası
          if (isVertexSelected) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 11 / zoom, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();
          }
        });
      }

      // Kenar Ölçüleri (Metraj Etiketleri)
      if (showDimensions) {
        const segCount = shape.isClosed ? shape.points.length : shape.points.length - 1;
        for (let i = 0; i < segCount; i++) {
          const p1 = shape.points[i];
          const p2 = shape.points[(i + 1) % shape.points.length];
          const distMeters = calculateDistanceMeters(p1, p2, scaleMetersPerPixel);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          const isEdgeSelected = isSelected && selectedEdgeIndex === i;

          ctx.save();
          ctx.translate(midX, midY);

          ctx.fillStyle = isEdgeSelected ? '#4338ca' : 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(-20 / zoom, -9 / zoom, 40 / zoom, 14 / zoom);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${8.5 / zoom}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${distMeters.toFixed(1)}m`, 0, -1 / zoom);
          ctx.restore();
        }

        // Kapalı Alan Merkez Etiketi (m²)
        if (shape.isClosed && shape.areaM2 && shape.areaM2 > 0) {
          let cx = 0, cy = 0;
          shape.points.forEach((p) => { cx += p.x; cy += p.y; });
          cx /= shape.points.length;
          cy /= shape.points.length;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.fillStyle = isSelected ? '#78350f' : 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(-45 / zoom, -14 / zoom, 90 / zoom, 22 / zoom);

          ctx.fillStyle = isSelected ? '#fef3c7' : '#ffffff';
          ctx.font = `bold ${10.5 / zoom}px 'Plus Jakarta Sans', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${shape.areaM2} m²`, 0, -3 / zoom);
          ctx.restore();
        }
      }
    });

    // 4. Çizim Modu: Devam Eden Çizgi & Kauçuk Bant (Rubberband)
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      if (hoverPoint) {
        ctx.lineTo(hoverPoint.x, hoverPoint.y);
      }

      ctx.strokeStyle = drawMode === 'line' ? '#4f46e5' : '#0284c7';
      ctx.lineWidth = 2.2 / zoom;
      ctx.setLineDash([5 / zoom, 4 / zoom]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Aktif Noktalar
      currentPoints.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5 / zoom, 0, Math.PI * 2);
        ctx.fillStyle = drawMode === 'line' ? '#6366f1' : '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / zoom;
        ctx.stroke();
      });

      // İlk Nokta Kapatma Hedefi Göstergesi (Poligon Modunda)
      if (drawMode === 'polygon' && currentPoints.length >= 2) {
        const firstPt = currentPoints[0];
        ctx.beginPath();
        ctx.arc(firstPt.x, firstPt.y, 9 / zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2.5 / zoom;
        ctx.stroke();
      }

      // Canlı Kenar Metre Etiketi
      if (hoverPoint && currentPoints.length > 0) {
        const lastPt = currentPoints[currentPoints.length - 1];
        const liveDist = calculateDistanceMeters(lastPt, hoverPoint, scaleMetersPerPixel);
        const midX = (lastPt.x + hoverPoint.x) / 2;
        const midY = (lastPt.y + hoverPoint.y) / 2;

        ctx.save();
        ctx.translate(midX, midY);
        ctx.fillStyle = drawMode === 'line' ? '#4f46e5' : '#0284c7';
        ctx.fillRect(-26 / zoom, -18 / zoom, 52 / zoom, 16 / zoom);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${10 / zoom}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${liveDist.toFixed(2)}m`, 0, -10 / zoom);
        ctx.restore();
      }

      // Canlı Poligon Yüzey Alanı (En az 3 nokta olduğunda)
      if (drawMode === 'polygon' && currentPoints.length >= 3 && hoverPoint) {
        const polyPts = [...currentPoints, hoverPoint];
        const liveArea = calculatePolygonAreaM2(polyPts, scaleMetersPerPixel);
        let cx = 0, cy = 0;
        polyPts.forEach(p => { cx += p.x; cy += p.y; });
        cx /= polyPts.length;
        cy /= polyPts.length;

        ctx.save();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.moveTo(polyPts[0].x, polyPts[0].y);
        for (let i = 1; i < polyPts.length; i++) {
          ctx.lineTo(polyPts[i].x, polyPts[i].y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.translate(cx, cy);
        const areaLabel = `📐 Canlı Alan: ${liveArea} m²`;
        ctx.font = `bold ${11 / zoom}px 'Plus Jakarta Sans', sans-serif`;
        const aW = ctx.measureText(areaLabel).width + 16 / zoom;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(-aW / 2, -12 / zoom, aW, 24 / zoom);
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(areaLabel, 0, 0);
        ctx.restore();
      }
    }

    // 5. Akıllı Snap Görsel Göstergesi (Snap Indicator & Label)
    if (activeSnap && activeSnap.type !== 'none' && hoverPoint) {
      const snapPt = activeSnap.point;
      ctx.save();

      if (activeSnap.type === 'first_point') {
        ctx.beginPath();
        ctx.arc(snapPt.x, snapPt.y, 12 / zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();
      } else if (activeSnap.type === 'vertex') {
        const size = 12 / zoom;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5 / zoom;
        ctx.strokeRect(snapPt.x - size / 2, snapPt.y - size / 2, size, size);
      } else if (activeSnap.type === 'edge') {
        const size = 10 / zoom;
        ctx.beginPath();
        ctx.moveTo(snapPt.x - size / 2, snapPt.y - size / 2);
        ctx.lineTo(snapPt.x + size / 2, snapPt.y + size / 2);
        ctx.moveTo(snapPt.x - size / 2, snapPt.y + size / 2);
        ctx.lineTo(snapPt.x + size / 2, snapPt.y - size / 2);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
      }

      if (activeSnap.label) {
        ctx.font = `bold ${10 / zoom}px 'Plus Jakarta Sans', sans-serif`;
        const textMetrics = ctx.measureText(activeSnap.label);
        const bWidth = textMetrics.width + 12 / zoom;
        const bHeight = 16 / zoom;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(snapPt.x + 12 / zoom, snapPt.y - 18 / zoom, bWidth, bHeight);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeSnap.label, snapPt.x + 18 / zoom, snapPt.y - 10 / zoom);
      }

      ctx.restore();
    }

    // 6. Düzenleme Modunda Hovered Edge veya Vertex Vurgusu
    if (currentTool === 'select') {
      if (hoveredEdge && (!draggedObject || draggedObject.type !== 'vertex')) {
        // Kenar Vurgusu
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(hoveredEdge.p1.x, hoveredEdge.p1.y);
        ctx.lineTo(hoveredEdge.p2.x, hoveredEdge.p2.y);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
        ctx.lineWidth = 5 / zoom;
        ctx.stroke();

        // Kenar Üzerine Yeni Nokta Ekleme İpucu
        ctx.beginPath();
        ctx.arc(hoveredEdge.projectionPoint.x, hoveredEdge.projectionPoint.y, 4 / zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.restore();
      }
    }

    // 7. Taşıma / Sürükleme Sırasında Canlı Koordinat Bilgi Balonu
    if (draggedObject && hoverPoint) {
      ctx.save();
      const isVert = draggedObject.type === 'vertex';
      const badge = isVert
        ? `Nokta Taşınıyor (X: ${(hoverPoint.x * scaleMetersPerPixel).toFixed(1)}m, Y: ${(hoverPoint.y * scaleMetersPerPixel).toFixed(1)}m)`
        : `Tüm Şekil Taşınıyor`;
      ctx.font = `bold ${11 / zoom}px 'JetBrains Mono', monospace`;
      const metrics = ctx.measureText(badge);
      const bW = metrics.width + 14 / zoom;
      const bH = 18 / zoom;

      ctx.fillStyle = isVert ? '#0284c7' : '#d97706';
      ctx.fillRect(hoverPoint.x + 10 / zoom, hoverPoint.y + 10 / zoom, bW, bH);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badge, hoverPoint.x + 17 / zoom, hoverPoint.y + 19 / zoom);
      ctx.restore();
    }

    // 8. Mimari Tefriş / Eleman Yerleştirme Hayalet Önizlemesi (Ghost Preview) - Eğik/Yamuk duvar açısına uyumlu
    if (placingPreset && hoverPoint) {
      const widthPx = placingPreset.widthMeters / scaleMetersPerPixel;
      const depthPx = placingPreset.depthMeters / scaleMetersPerPixel;
      const halfW = widthPx / 2;
      const halfD = depthPx / 2;

      let ghostAngle = 0;
      const nearestEdge = findHoveredEdge(hoverPoint, shapes, 60 / zoom);
      if (nearestEdge && nearestEdge.distance < (50 / zoom)) {
        ghostAngle = Math.atan2(nearestEdge.p2.y - nearestEdge.p1.y, nearestEdge.p2.x - nearestEdge.p1.x);
      }

      ctx.save();
      ctx.translate(hoverPoint.x, hoverPoint.y);
      ctx.rotate(ghostAngle);

      // Hayalet gövde
      ctx.fillStyle = placingPreset.fillColor || 'rgba(37, 99, 235, 0.15)';
      ctx.fillRect(-halfW, -halfD, widthPx, depthPx);

      ctx.strokeStyle = placingPreset.color;
      ctx.lineWidth = 2.2 / zoom;
      ctx.setLineDash([5 / zoom, 4 / zoom]);
      ctx.strokeRect(-halfW, -halfD, widthPx, depthPx);
      ctx.setLineDash([]);

      // Merkez kılavuz artısı
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.8)';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(-10 / zoom, 0);
      ctx.lineTo(10 / zoom, 0);
      ctx.moveTo(0, -10 / zoom);
      ctx.lineTo(0, 10 / zoom);
      ctx.stroke();

      // Üst Bilgi Etiketi
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      const label = `📍 ${placingPreset.name} (${placingPreset.standardDimensionLabel})`;
      ctx.font = `bold ${10.5 / zoom}px 'Plus Jakarta Sans', sans-serif`;
      const tW = ctx.measureText(label).width + 16 / zoom;
      ctx.fillRect(-tW / 2, -halfD - 26 / zoom, tW, 20 / zoom);
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, -halfD - 16 / zoom);

      ctx.restore();
    }

    ctx.restore();
  }, [
    pan,
    zoom,
    showGrid,
    gridSizePixels,
    shapes,
    selectedShapeId,
    selectedVertexIndex,
    selectedEdgeIndex,
    showDimensions,
    currentPoints,
    hoverPoint,
    activeSnap,
    scaleMetersPerPixel,
    drawMode,
    currentTool,
    hoveredVertex,
    hoveredEdge,
    draggedObject,
    placingPreset,
    activeFloorId,
    showGhostFloors
  ]);


  // Render Trigger
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Fare Koordinatlarını İşle
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isPanning) {
      setPan({
        x: screenX - panStart.x,
        y: screenY - panStart.y
      });
      return;
    }

    let worldPt = screenToWorld(screenX, screenY);

    // 0. Durum: Mimari Tefriş Yerleştirme Modu (Eğik/Yamuk açılı duvarlara otomatik yapışma)
    if (placingPreset) {
      let finalPt = worldPt;
      if (snapToGrid) {
        finalPt = snapToGridPoint(worldPt, gridSizePixels);
      }
      const nearestEdge = findHoveredEdge(finalPt, shapes, 60 / zoom);
      if (nearestEdge && nearestEdge.distance < (50 / zoom)) {
        const proj = projectPointOnSegment(finalPt, nearestEdge.p1, nearestEdge.p2);
        finalPt = proj.point;
      }
      setHoverPoint(finalPt);
      return;
    }

    // 1. Durum: Taşıma / Sürükleme Aktif
    if (draggedObject) {
      if (draggedObject.type === 'vertex') {
        if (snapToGrid) {
          worldPt = snapToGridPoint(worldPt, gridSizePixels);
        }
        if (orthoMode) {
          worldPt = applyOrthoConstraint(draggedObject.initialPoint, worldPt);
        }

        // Bağlı tüm şekillerin noktalarını dinamik olarak esnet (kopmadan)
        setShapes((prevShapes) => {
          return prevShapes.map((shape) => {
            let updatedPoints = [...shape.points];
            let changed = false;

            if (shape.id === draggedObject.shapeId) {
              updatedPoints[draggedObject.pointIndex] = { ...worldPt };
              changed = true;
            }

            draggedObject.coincidentList.forEach((c) => {
              if (c.shapeId === shape.id && c.pointIndex !== draggedObject.pointIndex) {
                updatedPoints[c.pointIndex] = { ...worldPt };
                changed = true;
              }
            });

            if (!changed) return shape;

            const areaM2 = shape.isClosed ? calculatePolygonAreaM2(updatedPoints, scaleMetersPerPixel) : 0;
            const perimeterMeters = calculatePolygonPerimeterMeters(updatedPoints, scaleMetersPerPixel, shape.isClosed);

            return {
              ...shape,
              points: updatedPoints,
              areaM2,
              perimeterMeters
            };
          });
        });

        setHoverPoint(worldPt);
        return;
      } else if (draggedObject.type === 'shape') {
        // Tüm şekli taşı
        let deltaX = worldPt.x - draggedObject.startWorldPt.x;
        let deltaY = worldPt.y - draggedObject.startWorldPt.y;

        if (snapToGrid) {
          deltaX = Math.round(deltaX / gridSizePixels) * gridSizePixels;
          deltaY = Math.round(deltaY / gridSizePixels) * gridSizePixels;
        }

        setShapes((prevShapes) => {
          return prevShapes.map((shape) => {
            if (shape.id !== draggedObject.shapeId) return shape;
            const updatedPoints = draggedObject.initialPoints.map((p) => ({
              x: p.x + deltaX,
              y: p.y + deltaY
            }));
            const areaM2 = shape.isClosed ? calculatePolygonAreaM2(updatedPoints, scaleMetersPerPixel) : 0;
            const perimeterMeters = calculatePolygonPerimeterMeters(updatedPoints, scaleMetersPerPixel, shape.isClosed);
            return {
              ...shape,
              points: updatedPoints,
              areaM2,
              perimeterMeters
            };
          });
        });

        setHoverPoint(worldPt);
        return;
      }
    }

    // 2. Durum: Çizim Modunda Akıllı Manyetik Snap
    if (currentTool === 'draw') {
      const snapTolerance = 14 / zoom;
      const snapRes = getSmartSnap(worldPt, currentPoints, shapes, snapTolerance);

      let finalPt = snapRes.point;

      if (snapRes.type === 'none' && snapToGrid) {
        finalPt = snapToGridPoint(worldPt, gridSizePixels);
      }

      if (orthoMode && currentPoints.length > 0) {
        const lastPt = currentPoints[currentPoints.length - 1];
        finalPt = applyOrthoConstraint(lastPt, finalPt);
      }

      setActiveSnap(snapRes);
      setHoverPoint(finalPt);
      return;
    }

    // 3. Durum: Düzenleme Modunda Hover Tespiti
    if (currentTool === 'select') {
      const snapTolerance = 12 / zoom;
      const hoveredVert = findHoveredVertex(worldPt, shapes, snapTolerance);
      setHoveredVertex(hoveredVert);

      if (!hoveredVert) {
        const hoveredEdg = findHoveredEdge(worldPt, shapes, snapTolerance);
        setHoveredEdge(hoveredEdg);
      } else {
        setHoveredEdge(null);
      }

      setHoverPoint(worldPt);
    }
  };

  // Canvas Tıklama İşlemi
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = screenToWorld(screenX, screenY);

    // --- MİMARİ ELEMAN / TEFRİŞ YERLEŞTİRME TIKLAMASI ---
    if (placingPreset) {
      const placePoint = hoverPoint || (snapToGrid ? snapToGridPoint(worldPt, gridSizePixels) : worldPt);
      let wallAngle = 0;
      const nearestEdge = findHoveredEdge(placePoint, shapes, 60 / zoom);
      if (nearestEdge && nearestEdge.distance < (50 / zoom)) {
        wallAngle = Math.atan2(nearestEdge.p2.y - nearestEdge.p1.y, nearestEdge.p2.x - nearestEdge.p1.x);
      }
      const newShape = createShapeFromPreset(placingPreset, placePoint, scaleMetersPerPixel, wallAngle, shapes);
      newShape.floorId = (newShape.layer === 'boundary' || newShape.layer === 'tevhidi' || newShape.layer === 'setback_flood') ? 'global' : activeFloorId;
      setShapes((prev) => [...prev, newShape]);
      setSelectedShapeId(newShape.id);
      setSelectedVertexIndex(null);
      setSelectedEdgeIndex(null);
      setPlacingPreset(null);
      setCurrentTool('select');
      return;
    }

    // --- DÜZENLEME MODU TIKLAMASI ---
    if (currentTool === 'select') {
      // 1. Köşe Noktası Tıklandı mı?
      const snapTolerance = 12 / zoom;
      const vert = findHoveredVertex(worldPt, shapes, snapTolerance);
      if (vert) {
        setSelectedShapeId(vert.shapeId);
        setSelectedVertexIndex(vert.pointIndex);
        setSelectedEdgeIndex(null);

        const coincident = findCoincidentVertices(vert.point, shapes, Math.max(12 / zoom, 8));
        setDraggedObject({
          type: 'vertex',
          shapeId: vert.shapeId,
          pointIndex: vert.pointIndex,
          initialPoint: { ...vert.point },
          coincidentList: coincident
        });
        return;
      }

      // 2. Kenar/Çizgi Tıklandı mı?
      const edg = findHoveredEdge(worldPt, shapes, snapTolerance);
      if (edg) {
        setSelectedShapeId(edg.shapeId);
        setSelectedEdgeIndex(edg.edgeIndex);
        setSelectedVertexIndex(null);
        return;
      }

      // 3. Poligon İçi Tıklandı mı?
      let clickedInsideShape: CadShape | null = null;
      for (const shape of shapes) {
        if (shape.isClosed && isPointInPolygon(worldPt, shape.points)) {
          clickedInsideShape = shape;
          break;
        }
      }

      if (clickedInsideShape) {
        setSelectedShapeId(clickedInsideShape.id);
        setSelectedVertexIndex(null);
        setSelectedEdgeIndex(null);

        setDraggedObject({
          type: 'shape',
          shapeId: clickedInsideShape.id,
          startWorldPt: worldPt,
          initialPoints: clickedInsideShape.points.map((p) => ({ ...p }))
        });
        return;
      }

      // 4. Boş Alana Tıklandıysa Seçimi Temizle
      setSelectedShapeId(null);
      setSelectedVertexIndex(null);
      setSelectedEdgeIndex(null);
      return;
    }

    // --- ÇİZİM MODU TIKLAMASI ---
    if (currentTool === 'draw') {
      if (activeSnap && activeSnap.type === 'first_point') {
        finishCurrentShape();
        return;
      }

      const pointToAddRaw = hoverPoint || (snapToGrid ? snapToGridPoint(worldPt, gridSizePixels) : worldPt);

      // Otomatik Kenar Bölme ve Çizgiye Yapıştırma (Nokta Değdiği Çizgiye Yapışsın & Bütünleşsin)
      let pointToAdd = pointToAddRaw;
      setShapes((prevShapes) => {
        const { updatedShapes, weldedPoint } = weldPointToShapeEdges(
          pointToAddRaw,
          prevShapes,
          scaleMetersPerPixel,
          14 / zoom,
          activeFloorId
        );
        pointToAdd = weldedPoint;
        return syncDependentRoomLabels(updatedShapes, scaleMetersPerPixel);
      });

      setCurrentPoints((prev) => [...prev, pointToAdd]);
    }
  };

  // Canvas Çift Tıklama (Çizgiye Yeni Nokta Ekle veya Çizimi Bitir)
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = screenToWorld(screenX, screenY);

    if (currentTool === 'select') {
      // Çizgiye çift tıklandıysa anında yeni köşe noktası ekle (böl)
      const edg = findHoveredEdge(worldPt, shapes, 12 / zoom);
      if (edg) {
        const targetShape = shapes.find((s) => s.id === edg.shapeId);
        if (targetShape) {
          setShapes((prev) => {
            return prev.map((s) => {
              if (s.id !== edg.shapeId) return s;
              const newPoints = [...s.points];
              newPoints.splice(edg.edgeIndex + 1, 0, edg.projectionPoint);
              const areaM2 = s.isClosed ? calculatePolygonAreaM2(newPoints, scaleMetersPerPixel) : 0;
              const perimeterMeters = calculatePolygonPerimeterMeters(newPoints, scaleMetersPerPixel, s.isClosed);
              return {
                ...s,
                points: newPoints,
                areaM2,
                perimeterMeters
              };
            });
          });

          setSelectedShapeId(edg.shapeId);
          setSelectedVertexIndex(edg.edgeIndex + 1);
          setSelectedEdgeIndex(null);
        }
      }
    } else if (currentTool === 'draw') {
      finishCurrentShape();
    }
  };

  // Fare Bırakma (Taşıma Sonrası Çizgilere Otomatik Bütünleşme & Birlikte Hareket Bağlantısı)
  const handleMouseUp = () => {
    setIsPanning(false);
    if (draggedObject) {
      if (draggedObject.type === 'vertex') {
        setShapes((prevShapes) => {
          const targetPt = prevShapes.find((s) => s.id === draggedObject.shapeId)?.points[draggedObject.pointIndex];
          if (!targetPt) return prevShapes;
          const { updatedShapes } = weldPointToShapeEdges(
            targetPt,
            prevShapes,
            scaleMetersPerPixel,
            14 / zoom,
            activeFloorId
          );
          return syncDependentRoomLabels(updatedShapes, scaleMetersPerPixel);
        });
      } else if (draggedObject.type === 'shape') {
        setShapes((prevShapes) => {
          const welded = weldAllShapesTogether(prevShapes, scaleMetersPerPixel, 14 / zoom, activeFloorId);
          return syncDependentRoomLabels(welded, scaleMetersPerPixel);
        });
      }
      pushToHistory(shapes);
    }
    setDraggedObject(null);
  };

  // Mouse Wheel ile Yakınlaştırma (Zoom)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.3), 4.0);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    });
    setZoom(newZoom);
  };

  // Sağ Tık Menüsünü Engelle & Çizimi Tamamla
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (currentTool === 'draw' && currentPoints.length >= 2) {
      finishCurrentShape();
    }
  };

  // Canvas Yeniden Boyutlandırma
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        renderCanvas();
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [renderCanvas]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full bg-slate-100">
      {/* Sol CAD Araç & Katman Çubuğu */}
      <CadToolbar
        currentTool={currentTool}
        drawMode={drawMode}
        activeLayer={activeLayer}
        floors={floors}
        activeFloorId={activeFloorId}
        onSelectFloorId={setActiveFloorId}
        onCreateFloorLayerClick={() => setIsCreateFloorLayerOpen(true)}
        showGhostFloors={showGhostFloors}
        onToggleGhostFloors={() => setShowGhostFloors(!showGhostFloors)}
        snapToGrid={snapToGrid}
        orthoMode={orthoMode}
        showDimensions={showDimensions}
        showGrid={showGrid}
        isDrawing={currentPoints.length > 0}
        pointCount={currentPoints.length}
        selectedShape={selectedShape}
        selectedVertexIndex={selectedVertexIndex}
        selectedEdgeIndex={selectedEdgeIndex}
        onToolChange={setCurrentTool}
        onDrawModeChange={setDrawMode}
        onLayerChange={setActiveLayer}
        onChangeSelectedShapeLayer={handleChangeSelectedShapeLayer}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        onToggleOrtho={() => setOrthoMode(!orthoMode)}
        onToggleDimensions={() => setShowDimensions(!showDimensions)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onFinishShape={() => finishCurrentShape(false)}
        onFinishLine={() => finishCurrentShape(true)}
        onUndoPoint={handleUndoPoint}
        onClearCanvas={handleClearCanvas}
        onDeleteSelectedVertex={handleDeleteSelectedVertex}
        onAddVertexToSelectedEdge={handleAddVertexToSelectedEdge}
        onDeleteSelectedShape={() => {
          if (selectedShapeId) {
            handleDeleteShape(selectedShapeId);
          } else if (shapes.length > 0) {
            handleDeleteShape(shapes[shapes.length - 1].id);
          }
        }}
        onRotateSelectedShape={handleRotateSelectedShape}
        onOpenArchitecturalLibrary={() => setIsLibraryOpen(true)}
        onZoomIn={() => setZoom((z) => Math.min(z * 1.2, 4.0))}
        onZoomOut={() => setZoom((z) => Math.max(z / 1.2, 0.3))}
        onResetZoom={() => { setZoom(1.0); setPan({ x: 40, y: 30 }); }}
        onLoadTemplate={handleLoadTemplate}
        onSyncWithProposal={() => onSyncAreasToProposal(totalBoundaryAreaM2, totalBuildingAreaM2)}
        onUpdateSelectedShapeFacadeProps={handleUpdateSelectedShapeFacadeProps}
        onFlipDoorHinge={handleFlipDoorHinge}
        onFlipDoorSwing={handleFlipDoorSwing}
        onUpdateDoorProps={handleUpdateDoorProps}
        onSelectPreset={handleSelectPreset}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Ana Çizim Kanvası */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-slate-900 select-none cursor-crosshair">
        {/* Mimari Tefriş Yerleştirme Aktif Uyarı Bandı */}
        {placingPreset && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-2xl border border-blue-400/50 flex items-center gap-3 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold font-sans">
              📍 <strong>{placingPreset.name}</strong> ({placingPreset.standardDimensionLabel}) Yerleştirmek için Kanvasa Tıklayın
            </span>
            <button
              onClick={() => setPlacingPreset(null)}
              className="ml-2 bg-slate-900/60 hover:bg-slate-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-white/20 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>İptal (ESC)</span>
            </button>
          </div>
        )}

        {/* Üst Canlı Bilgi & Mod Şeridi */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
          {/* Mod Rozeti */}
          <div className={`px-3 py-1.5 rounded-lg shadow-md font-bold text-xs flex items-center gap-2 border pointer-events-auto ${
            currentTool === 'select'
              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/40'
              : 'bg-amber-500 text-white border-amber-400 ring-2 ring-amber-400/40'
          }`}>
            {currentTool === 'select' ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>DÜZENLEME & SEÇİM MODU</span>
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                <span>ÇİZİM MODU ({drawMode === 'polygon' ? 'Kapalı Poligon' : 'Tek Çizgi'})</span>
              </>
            )}
          </div>

          {/* Kat Yönetimi Hızlı Buton */}
          <button
            onClick={() => setIsFloorManagerOpen(true)}
            className="pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kat Yönetimi & Maliyet ({floors.length} Kat)</span>
          </button>

          {/* Koordinat & Ölçek Göstergesi */}
          {hoverPoint && (
            <div className="bg-slate-800/80 backdrop-blur-md text-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-700 shadow-md">
              X: {(hoverPoint.x * scaleMetersPerPixel).toFixed(2)}m | Y: {(hoverPoint.y * scaleMetersPerPixel).toFixed(2)}m
            </div>
          )}
        </div>

        {/* KAT KATMANI NAVİGASYON BARI (Zemin, Bodrum & Normal Katlar) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl max-w-[calc(100%-420px)] overflow-x-auto scrollbar-none pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2 py-1 text-blue-400 font-bold text-xs shrink-0 border-r border-slate-700/80">
            <Layers className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>KAT KATMANLARI:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {floors.map((f) => {
              const isActive = f.id === activeFloorId;
              const shapesOnFloor = shapes.filter(
                (s) => s.floorId === f.id || (!s.floorId && f.id === 'f-gr')
              ).length;

              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFloorId(f.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40 scale-105'
                      : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-sm">
                    {f.type === 'ground' ? '🏬' : f.type === 'basement' ? '🏢' : f.type === 'mansart' ? '🏠' : '🏙️'}
                  </span>
                  <span>{f.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {f.areaM2} m²
                  </span>
                  {shapesOnFloor > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title={`${shapesOnFloor} eleman çizildi`} />
                  )}
                </button>
              );
            })}

            {/* + Kat Katmanı Oluştur Butonu */}
            <button
              onClick={() => setIsCreateFloorLayerOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Yeni Zemin, Bodrum veya Normal Kat Katmanı Ekle"
            >
              <Plus className="w-4 h-4" />
              <span>+ Kat Katmanı Ekle</span>
            </button>
          </div>
        </div>

        {/* Canvas Elementi */}
        <canvas
          id="cad-main-canvas"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onDoubleClick={handleCanvasDoubleClick}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
          className="w-full h-full block"
          style={{ cursor: placingPreset ? 'crosshair' : currentTool === 'select' ? (draggedObject ? 'grabbing' : hoveredVertex ? 'move' : hoveredEdge ? 'pointer' : 'default') : 'crosshair' }}
        />

        {/* Sağ Alt CAD Navigasyon İpucu */}
        <div className="absolute bottom-3 right-3 z-10 bg-slate-900/85 backdrop-blur-md text-slate-300 px-3 py-2 rounded-xl text-[11px] border border-slate-700 shadow-lg pointer-events-none space-y-0.5">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">CAD & Mimari Kontroller:</div>
          <div>• <strong>Sol Tık:</strong> {placingPreset ? 'Tefrişi Yerleştir' : currentTool === 'draw' ? 'Nokta Ekle / Poligon Kapat' : 'Köşe / Çizgi / Şekil Seç'}</div>
          <div>• <strong>Sürükle:</strong> {currentTool === 'select' ? 'Noktayı Esnet / Şekli Taşı' : 'Kauçuk Bant Çizgi'}</div>
          <div>• <strong>R Tuşu:</strong> Seçili Tefrişi / Şekli 90° Döndür</div>
          <div>• <strong>F / V Tuşu:</strong> Kapı Menteşesini (Sol/Sağ) ve Açılımını (İçe/Dışa) Değiştir</div>
          <div>• <strong>Çift Tık:</strong> {currentTool === 'select' ? 'Çizgiye Yeni Nokta Ekle' : 'Çizimi Bitir'}</div>
          <div>• <strong>Delete:</strong> Seçili Noktayı veya Şekli Sil</div>
          <div>• <strong>Ctrl + Z / Y:</strong> Çizimi / İşlemi Geri Al (Undo) / İleri Al (Redo)</div>
          <div>• <strong>Mouse Tekerleği:</strong> Yakınlaş / Uzaklaş (Zoom)</div>
        </div>
      </div>

      {/* Sağ CAD İmar & Metraj Özellik Paneli */}
      <CadPropertyPanel
        shapes={shapes}
        scaleMetersPerPixel={scaleMetersPerPixel}
        totalBoundaryAreaM2={totalBoundaryAreaM2}
        totalBuildingAreaM2={totalBuildingAreaM2}
        totalTevhitiAreaM2={totalTevhitiAreaM2}
        taksRatio={taksRatio}
        kaksRatio={kaksRatio}
        selectedShapeId={selectedShapeId}
        selectedVertexIndex={selectedVertexIndex}
        selectedEdgeIndex={selectedEdgeIndex}
        onSelectShape={setSelectedShapeId}
        onSelectVertex={setSelectedVertexIndex}
        onDeleteShape={handleDeleteShape}
        onDeleteVertex={handleDeleteSelectedVertex}
        onUpdateVertexCoord={handleUpdateVertexCoord}
        onAddVertexToEdge={handleAddVertexToSelectedEdge}
        onScaleChange={setScaleMetersPerPixel}
        onKaksChange={setKaksRatio}
        onTaksTargetChange={() => {}}
        onFlipDoorHinge={handleFlipDoorHinge}
        onFlipDoorSwing={handleFlipDoorSwing}
        onUpdateDoorProps={handleUpdateDoorProps}
      />

      {/* Mimari Tefriş & İmar Yönetmeliği Kütüphane Modalı */}
      <ArchitecturalLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Bina Kat Yönetimi & Planı Modalı */}
      <FloorManagerModal
        isOpen={isFloorManagerOpen}
        onClose={() => setIsFloorManagerOpen(false)}
        floors={financials?.floors || []}
        onUpdateFloors={handleUpdateFloors}
        onSyncToFinancials={(constM2, resCount, fCount, bArea) => {
          if (!onUpdateFinancials || !financials) return;
          onUpdateFinancials({
            ...financials,
            totalConstructionM2: constM2,
            residentialCount: resCount,
            floorCount: fCount,
            baseAreaM2: bArea
          });
          setIsFloorManagerOpen(false);
        }}
      />

      {/* Yeni Kat Katmanı Oluşturma Modalı */}
      <CreateFloorLayerModal
        isOpen={isCreateFloorLayerOpen}
        onClose={() => setIsCreateFloorLayerOpen(false)}
        existingFloors={floors}
        existingShapes={shapes}
        onCreateFloorLayer={handleCreateFloorLayer}
      />
    </div>
  );
};
