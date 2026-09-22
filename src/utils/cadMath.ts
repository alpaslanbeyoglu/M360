import { CadPoint, CadShape } from '../types';

/**
 * İki nokta arasındaki mesafeyi metre cinsinden hesaplar
 */
export function calculateDistanceMeters(p1: CadPoint, p2: CadPoint, scaleMetersPerPixel: number): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const pixelDistance = Math.hypot(dx, dy);
  return Number((pixelDistance * scaleMetersPerPixel).toFixed(2));
}

/**
 * Shoelace (Gauss Alan) Formülü ile Poligon Alanını m² cinsinden hesaplar
 */
export function calculatePolygonAreaM2(points: CadPoint[], scaleMetersPerPixel: number): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  const pixelArea = Math.abs(area) / 2;
  const m2Area = pixelArea * Math.pow(scaleMetersPerPixel, 2);
  return Math.round(m2Area);
}

/**
 * Poligonun toplam çevre uzunluğunu metre cinsinden hesaplar
 */
export function calculatePolygonPerimeterMeters(points: CadPoint[], scaleMetersPerPixel: number, isClosed: boolean): number {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  const limit = isClosed ? points.length : points.length - 1;
  
  for (let i = 0; i < limit; i++) {
    const nextIdx = (i + 1) % points.length;
    perimeter += calculateDistanceMeters(points[i], points[nextIdx], scaleMetersPerPixel);
  }
  
  return Number(perimeter.toFixed(2));
}

/**
 * Grid Snap fonksiyonu
 */
export function snapToGridPoint(point: CadPoint, gridSizePixels: number): CadPoint {
  return {
    x: Math.round(point.x / gridSizePixels) * gridSizePixels,
    y: Math.round(point.y / gridSizePixels) * gridSizePixels
  };
}

/**
 * Bir noktanın doğru parçası üzerindeki en yakın izdüşümünü hesaplar (Edge Snap)
 */
export function projectPointOnSegment(p: CadPoint, a: CadPoint, b: CadPoint): { point: CadPoint; distance: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    const d = Math.hypot(p.x - a.x, p.y - a.y);
    return { point: { ...a }, distance: d };
  }

  // İzdüşüm parametresi t (0 <= t <= 1)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const distance = Math.hypot(p.x - projX, p.y - projY);

  return {
    point: { x: projX, y: projY },
    distance
  };
}

export interface SnapResult {
  point: CadPoint;
  type: 'none' | 'first_point' | 'vertex' | 'edge' | 'grid';
  label?: string;
  sourceShapeName?: string;
}

/**
 * CAD için akıllı Manyetik Snap (Köşe Noktası, Başlangıç Noktası, Kenar Çizgisi)
 */
export function getSmartSnap(
  mouseWorldPt: CadPoint,
  currentPoints: CadPoint[],
  shapes: { name: string; points: CadPoint[]; isClosed?: boolean }[],
  tolerancePxInWorld: number
): SnapResult {
  // 1. İlk Nokta (Başlangıç Noktası Kapatma)
  if (currentPoints.length >= 3) {
    const firstPt = currentPoints[0];
    const distToFirst = Math.hypot(mouseWorldPt.x - firstPt.x, mouseWorldPt.y - firstPt.y);
    if (distToFirst <= tolerancePxInWorld * 1.5) {
      return {
        point: { x: firstPt.x, y: firstPt.y },
        type: 'first_point',
        label: 'İlk Nokta (Poligonu Kapat)'
      };
    }
  }

  // 2. Mevcut Şekillerin Köşe Noktaları (Vertex Snap)
  let closestVertex: CadPoint | null = null;
  let minVertexDist = tolerancePxInWorld;
  let vertexShapeName = '';

  for (const shape of shapes) {
    for (const pt of shape.points) {
      const dist = Math.hypot(mouseWorldPt.x - pt.x, mouseWorldPt.y - pt.y);
      if (dist < minVertexDist) {
        minVertexDist = dist;
        closestVertex = { x: pt.x, y: pt.y };
        vertexShapeName = shape.name;
      }
    }
  }

  // Aktif çizimin önceki noktaları
  if (currentPoints.length > 0) {
    for (let i = 0; i < currentPoints.length - 1; i++) {
      const pt = currentPoints[i];
      const dist = Math.hypot(mouseWorldPt.x - pt.x, mouseWorldPt.y - pt.y);
      if (dist < minVertexDist) {
        minVertexDist = dist;
        closestVertex = { x: pt.x, y: pt.y };
        vertexShapeName = 'Aktif Çizim';
      }
    }
  }

  if (closestVertex) {
    return {
      point: closestVertex,
      type: 'vertex',
      label: '🧲 Köşe Kilidi (Kopmaz Bağ)',
      sourceShapeName: vertexShapeName
    };
  }

  // 3. Kenar Çizgisi Snap (Edge / Line Snap)
  let closestEdgePt: CadPoint | null = null;
  let minEdgeDist = tolerancePxInWorld * 1.2;
  let edgeShapeName = '';

  for (const shape of shapes) {
    if (shape.points.length < 2) continue;
    const count = shape.isClosed ? shape.points.length : shape.points.length - 1;
    for (let i = 0; i < count; i++) {
      const a = shape.points[i];
      const b = shape.points[(i + 1) % shape.points.length];
      const { point: projPt, distance } = projectPointOnSegment(mouseWorldPt, a, b);
      if (distance < minEdgeDist) {
        minEdgeDist = distance;
        closestEdgePt = projPt;
        edgeShapeName = shape.name;
      }
    }
  }

  if (closestEdgePt) {
    return {
      point: closestEdgePt,
      type: 'edge',
      label: '🧲 Çizgiye Yapış & Bütünleş',
      sourceShapeName: edgeShapeName
    };
  }

  return {
    point: mouseWorldPt,
    type: 'none'
  };
}

/**
 * Ortho (90 derece açı kilitleme)
 */
export function applyOrthoConstraint(start: CadPoint, current: CadPoint): CadPoint {
  const dx = Math.abs(current.x - start.x);
  const dy = Math.abs(current.y - start.y);
  
  if (dx > dy) {
    return { x: current.x, y: start.y };
  } else {
    return { x: start.x, y: current.y };
  }
}

/**
 * Sayı formatlayıcı (Türkçe Lira ve Metre için)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 2
  }).format(amount);
}

export interface VertexRef {
  shapeId: string;
  pointIndex: number;
  point: CadPoint;
}

export interface EdgeRef {
  shapeId: string;
  edgeIndex: number;
  p1: CadPoint;
  p2: CadPoint;
  projectionPoint: CadPoint;
  distance: number;
}

/**
 * Belirli bir koordinata en yakın köşe noktasını bulur (Taşıma / vertex edit için)
 */
export function findHoveredVertex(
  mouseWorldPt: CadPoint,
  shapes: { id: string; points: CadPoint[] }[],
  tolerancePxInWorld: number = 10
): VertexRef | null {
  let closest: VertexRef | null = null;
  let minDist = tolerancePxInWorld;

  for (const shape of shapes) {
    shape.points.forEach((pt, idx) => {
      const dist = Math.hypot(mouseWorldPt.x - pt.x, mouseWorldPt.y - pt.y);
      if (dist < minDist) {
        minDist = dist;
        closest = {
          shapeId: shape.id,
          pointIndex: idx,
          point: { x: pt.x, y: pt.y }
        };
      }
    });
  }

  return closest;
}

/**
 * Aynı koordinatı paylaşan tüm bağlı şekil köşe noktalarını tespit eder (kopmadan birlikte esneme için)
 */
export function findCoincidentVertices(
  targetPoint: CadPoint,
  shapes: { id: string; points: CadPoint[] }[],
  tolerancePxInWorld: number = 8
): VertexRef[] {
  const result: VertexRef[] = [];
  for (const shape of shapes) {
    shape.points.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - targetPoint.x, pt.y - targetPoint.y);
      if (dist <= tolerancePxInWorld) {
        result.push({
          shapeId: shape.id,
          pointIndex: idx,
          point: { x: pt.x, y: pt.y }
        });
      }
    });
  }
  return result;
}

/**
 * Fareye en yakın kenar/çizgi parçasını tespit eder (Kenar seçme & çizgiye nokta ekleme için)
 */
export function findHoveredEdge(
  mouseWorldPt: CadPoint,
  shapes: { id: string; points: CadPoint[]; isClosed?: boolean }[],
  tolerancePxInWorld: number = 10
): EdgeRef | null {
  let closest: EdgeRef | null = null;
  let minDist = tolerancePxInWorld;

  for (const shape of shapes) {
    if (shape.points.length < 2) continue;
    const segCount = shape.isClosed ? shape.points.length : shape.points.length - 1;

    for (let i = 0; i < segCount; i++) {
      const p1 = shape.points[i];
      const p2 = shape.points[(i + 1) % shape.points.length];
      const projResult = projectPointOnSegment(mouseWorldPt, p1, p2);
      const proj = projResult.point;
      const dist = projResult.distance;

      if (dist < minDist) {
        minDist = dist;
        closest = {
          shapeId: shape.id,
          edgeIndex: i,
          p1: { ...p1 },
          p2: { ...p2 },
          projectionPoint: proj,
          distance: dist
        };
      }
    }
  }

  return closest;
}

/**
 * Noktanın kapalı bir poligon içinde olup olmadığını kontrol eder
 */
export function isPointInPolygon(pt: CadPoint, polygonPoints: CadPoint[]): boolean {
  if (polygonPoints.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
    const xj = polygonPoints[j].x, yj = polygonPoints[j].y;

    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
  * Poligonun kütle merkezini (Centroid) hesaplar
  */
export function calculatePolygonCentroid(points: CadPoint[]): CadPoint {
  if (points.length === 0) return { x: 0, y: 0 };
  let sumX = 0;
  let sumY = 0;
  for (const pt of points) {
    sumX += pt.x;
    sumY += pt.y;
  }
  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}

/**
  * Poligonun sınır kutusunu (Bounding Box) ve metre boyutlarını hesaplar
  */
export function calculatePolygonBoundingBox(points: CadPoint[], scaleMetersPerPixel: number): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  widthMeters: number;
  depthMeters: number;
} {
  if (points.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0, widthMeters: 0, depthMeters: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const pt of points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  const widthPx = maxX - minX;
  const depthPx = maxY - minY;
  return {
    minX,
    maxX,
    minY,
    maxY,
    widthMeters: Number((widthPx * scaleMetersPerPixel).toFixed(2)),
    depthMeters: Number((depthPx * scaleMetersPerPixel).toFixed(2))
  };
}

/**
  * Tıklanan noktayı kapsayan en spesifik (en küçük alanlı) kapalı oda / duvar poligonunu bulur
  */
export function findContainingRoomPolygon(placePt: CadPoint, shapes: CadShape[]): CadShape | null {
  const candidates = shapes.filter((s) => {
    if (!s.isClosed || !s.points || s.points.length < 3) return false;
    // Mahal etiketinin kendisini kapsayan alan olarak seçme
    if (s.blockType === 'room_label') return false;
    return isPointInPolygon(placePt, s.points);
  });

  if (candidates.length === 0) return null;

  // En küçük alana sahip odayı seç (örneğin bina sınırından önce iç odayı eşleştir)
  candidates.sort((a, b) => (a.areaM2 || 999999) - (b.areaM2 || 999999));
  return candidates[0];
}

/**
  * Oda duvarları veya köşeleri değiştiğinde, bağlı mahal etiketlerinin alan ve sınırlarını canlı senkronize eder
  */
export function syncDependentRoomLabels(shapes: CadShape[], scaleMetersPerPixel: number): CadShape[] {
  const roomMap = new Map<string, CadShape>();
  shapes.forEach((s) => {
    if (s.isClosed && s.blockType !== 'room_label' && s.points && s.points.length >= 3) {
      roomMap.set(s.id, s);
    }
  });

  return shapes.map((shape) => {
    if (shape.blockType !== 'room_label') return shape;

    // Eğer oda bağlantı kimliği varsa veya oda poligonu içindeyse host duvar poligonunu bul
    let host = shape.parentHostShapeId ? roomMap.get(shape.parentHostShapeId) : null;
    if (!host && shape.points && shape.points.length > 0) {
      const center = calculatePolygonCentroid(shape.points);
      host = findContainingRoomPolygon(center, shapes);
    }

    if (!host) return shape;

    const updatedPoints = host.points.map((p) => ({ ...p }));
    const areaM2 = calculatePolygonAreaM2(updatedPoints, scaleMetersPerPixel);
    const perimeterMeters = calculatePolygonPerimeterMeters(updatedPoints, scaleMetersPerPixel, true);
    const bbox = calculatePolygonBoundingBox(updatedPoints, scaleMetersPerPixel);

    return {
      ...shape,
      parentHostShapeId: host.id,
      points: updatedPoints,
      areaM2,
      perimeterMeters,
      dimensions: {
        ...shape.dimensions,
        widthMeters: bbox.widthMeters,
        depthMeters: bbox.depthMeters,
        heightMeters: shape.dimensions?.heightMeters || 2.8
      }
    };
  });
}

/**
 * Bir noktayı tüm uygun şekillerin çizgilerine / kenarlarına yapıştırır ve çizgileri o noktadan böler.
 * Böylece nokta, çizginin bir parçası (yeni bir köşe noktası) haline gelir ve kopmadan birlikte hareket eder.
 */
export function weldPointToShapeEdges(
  targetPoint: CadPoint,
  shapes: CadShape[],
  scaleMetersPerPixel: number,
  tolerancePx: number = 10,
  activeFloorId?: string
): { updatedShapes: CadShape[]; weldedPoint: CadPoint; didSplit: boolean } {
  let finalPoint = { ...targetPoint };
  let didSplit = false;

  // 1. Önce en yakın köşe noktası var mı kontrol et (Vertex Snap & Weld)
  let bestVertDist = tolerancePx;
  let closestVertexPt: CadPoint | null = null;

  shapes.forEach((s) => {
    if (activeFloorId && s.floorId && s.floorId !== activeFloorId && s.floorId !== 'global') return;

    s.points.forEach((pt) => {
      const d = Math.hypot(targetPoint.x - pt.x, targetPoint.y - pt.y);
      if (d < bestVertDist) {
        bestVertDist = d;
        closestVertexPt = { x: pt.x, y: pt.y };
      }
    });
  });

  if (closestVertexPt) {
    finalPoint = closestVertexPt;
  }

  // 2. Çizgi / Kenar Bölme ve Bütünleştirme (Edge Splitting & Welding)
  const updatedShapes = shapes.map((shape) => {
    if (activeFloorId && shape.floorId && shape.floorId !== activeFloorId && shape.floorId !== 'global') {
      return shape;
    }

    if (!shape.points || shape.points.length < 2) return shape;

    const count = shape.isClosed ? shape.points.length : shape.points.length - 1;
    let edgeToSplitIndex = -1;
    let projPointOnEdge: CadPoint | null = null;
    let minEdgeDist = tolerancePx;

    for (let i = 0; i < count; i++) {
      const p1 = shape.points[i];
      const p2 = shape.points[(i + 1) % shape.points.length];

      // Eğer finalPoint zaten p1 veya p2 ile çakışıyorsa tekrar bölmeye gerek yok
      const distToP1 = Math.hypot(finalPoint.x - p1.x, finalPoint.y - p1.y);
      const distToP2 = Math.hypot(finalPoint.x - p2.x, finalPoint.y - p2.y);

      if (distToP1 < 2.5 || distToP2 < 2.5) {
        continue;
      }

      const proj = projectPointOnSegment(finalPoint, p1, p2);
      if (proj.distance < minEdgeDist) {
        const dProj1 = Math.hypot(proj.point.x - p1.x, proj.point.y - p1.y);
        const dProj2 = Math.hypot(proj.point.x - p2.x, proj.point.y - p2.y);

        if (dProj1 >= 2.5 && dProj2 >= 2.5) {
          minEdgeDist = proj.distance;
          edgeToSplitIndex = i;
          projPointOnEdge = proj.point;
        }
      }
    }

    if (edgeToSplitIndex !== -1 && projPointOnEdge) {
      didSplit = true;
      finalPoint = projPointOnEdge;

      // Çizgiyi bölerek yeni köşe noktasını araya ekle
      const newPoints = [...shape.points];
      newPoints.splice(edgeToSplitIndex + 1, 0, projPointOnEdge);

      const areaM2 = shape.isClosed ? calculatePolygonAreaM2(newPoints, scaleMetersPerPixel) : 0;
      const perimeterMeters = calculatePolygonPerimeterMeters(newPoints, scaleMetersPerPixel, shape.isClosed);

      return {
        ...shape,
        points: newPoints,
        areaM2,
        perimeterMeters
      };
    }

    return shape;
  });

  return {
    updatedShapes,
    weldedPoint: finalPoint,
    didSplit
  };
}

/**
 * Tüm şekillerin köşe noktalarını birbirlerinin çizgilerine / kenarlarına yapıştırır ve çizgileri böler.
 * Böylece birleştirilen tüm duvar ve poligon köşeleri tam olarak bütünleşir ve birlikte hareket eder.
 */
export function weldAllShapesTogether(
  shapes: CadShape[],
  scaleMetersPerPixel: number,
  tolerancePx: number = 10,
  activeFloorId?: string
): CadShape[] {
  let currentShapes = [...shapes];

  for (let sIdx = 0; sIdx < currentShapes.length; sIdx++) {
    const sourceShape = currentShapes[sIdx];
    if (activeFloorId && sourceShape.floorId && sourceShape.floorId !== activeFloorId && sourceShape.floorId !== 'global') {
      continue;
    }

    for (let pIdx = 0; pIdx < sourceShape.points.length; pIdx++) {
      const pt = sourceShape.points[pIdx];
      const weldResult = weldPointToShapeEdges(pt, currentShapes, scaleMetersPerPixel, tolerancePx, activeFloorId);
      
      if (weldResult.didSplit) {
        currentShapes = weldResult.updatedShapes;
        if (currentShapes[sIdx] && currentShapes[sIdx].points[pIdx]) {
          currentShapes[sIdx].points[pIdx] = weldResult.weldedPoint;
        }
      }
    }
  }

  return currentShapes;
}


