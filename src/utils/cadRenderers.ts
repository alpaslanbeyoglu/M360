import { CadShape, CadPoint } from '../types';

/**
 * 2D Mimari CAD Blok & Tefriş Çizim Motoru
 */
export function renderArchitecturalBlock(
  ctx: CanvasRenderingContext2D,
  shape: CadShape,
  zoom: number,
  isSelected: boolean
): boolean {
  if (!shape.blockType) return false;

  // ==========================================
  // 🏷️ MAHAL VE PİYES ALAN DAMGALARI (ROOM STAMPS - DİNAMİK POLİGON UYUMU)
  // ==========================================
  if (shape.blockType === 'room_label') {
    if (shape.points.length < 3) return false;

    // 1. Oda Poligonu Kütle Merkezi (Centroid)
    let cx = 0, cy = 0;
    shape.points.forEach((pt) => { cx += pt.x; cy += pt.y; });
    cx /= shape.points.length;
    cy /= shape.points.length;

    // 2. Oda Alan Sınırlarını Yumuşak Renk ve Kesikli Çizgi ile Çiz
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i].x, shape.points[i].y);
    }
    ctx.closePath();

    const baseFill = shape.fillColor || 'rgba(5, 150, 105, 0.08)';
    ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.18)' : baseFill;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#f59e0b' : (shape.color || '#059669');
    ctx.lineWidth = (isSelected ? 2.5 : 1.5) / zoom;
    ctx.setLineDash([6 / zoom, 4 / zoom]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Oda Merkezine Mimarî Mahal Damga Kartı Yerleştir
    ctx.save();
    ctx.translate(cx, cy);

    const cardW = 124 / zoom;
    const cardH = 72 / zoom;
    const halfCW = cardW / 2;
    const halfCH = cardH / 2;

    // Seçim Parlama Efekti
    if (isSelected) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5 / zoom;
      ctx.strokeRect(-halfCW - 2 / zoom, -halfCH - 2 / zoom, cardW + 4 / zoom, cardH + 4 / zoom);
    }

    // Kart Arka Planı & Kenarlık
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(-halfCW, -halfCH, cardW, cardH);
    ctx.strokeStyle = isSelected ? '#d97706' : '#059669';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-halfCW, -halfCH, cardW, cardH);

    // Başlık Şeridi
    ctx.fillStyle = isSelected ? '#d97706' : '#059669';
    ctx.fillRect(-halfCW, -halfCH, cardW, 20 / zoom);

    // Mahal Adı
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${10.5 / zoom}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const rName = shape.roomLabel?.name || shape.name.split('(')[0].replace('Damgası', '').trim() || 'MAHAL';
    ctx.fillText(rName.toUpperCase(), 0, -halfCH + 10 / zoom);

    // Gerçek Hesaplanmış m² Alanı
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${14 / zoom}px 'JetBrains Mono', monospace`;
    const realArea = shape.areaM2 || 0;
    ctx.fillText(`${realArea.toFixed(1)} m²`, 0, -halfCH + 34 / zoom);

    // Kenar Ölçüleri (En × Boy)
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${8.5 / zoom}px monospace`;
    const wM = shape.dimensions?.widthMeters || 0;
    const dM = shape.dimensions?.depthMeters || 0;
    if (wM > 0 && dM > 0) {
      ctx.fillText(`${wM.toFixed(2)}m × ${dM.toFixed(2)}m`, 0, -halfCH + 48 / zoom);
    }

    // İmar Yönetmeliği Uygunluk Durumu
    const minArea = shape.roomLabel?.minAreaM2 || 0;
    const isCompliant = minArea <= 0 || realArea >= minArea;

    ctx.fillStyle = isCompliant ? '#047857' : '#dc2626';
    ctx.font = `bold ${7.5 / zoom}px sans-serif`;
    ctx.fillText(
      isCompliant
        ? (minArea > 0 ? `✓ Uyumlu (Min: ${minArea.toFixed(1)}m²)` : `✓ İmar Yön. Uyumlu`)
        : `⚠️ Yetersiz (Min: ${minArea.toFixed(1)}m²)`,
      0,
      halfCH - 8 / zoom
    );

    ctx.restore();
    return true;
  }

  if (shape.points.length < 4) {
    return false; // Diğer bloklar için 4 nokta şartı
  }

  const p0 = shape.points[0]; // Sol üst
  const p1 = shape.points[1]; // Sağ üst
  const p2 = shape.points[2]; // Sağ alt
  const p3 = shape.points[3]; // Sol alt

  // Merkez, Genişlik, Yükseklik ve Açı
  const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
  const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
  const w = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const h = Math.hypot(p3.x - p0.x, p3.y - p0.y);
  const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const halfW = w / 2;
  const halfH = h / 2;

  // Seçili ise parlama efekti
  if (isSelected) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5 / zoom;
    ctx.strokeRect(-halfW - 2 / zoom, -halfH - 2 / zoom, w + 4 / zoom, h + 4 / zoom);
  }

  const mainColor = isSelected ? '#d97706' : shape.color;
  const fillColor = isSelected ? 'rgba(245, 158, 11, 0.18)' : shape.fillColor || 'rgba(255, 255, 255, 0.85)';

  ctx.strokeStyle = mainColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = 1.8 / zoom;

  switch (shape.blockType) {
    // ==========================================
    // 🚪 KAPILAR (DOORS)
    // ==========================================
    case 'door_outer':
    case 'door_inner':
    case 'door_bath':
    case 'door_balcony': {
      // Yön & Menteşe Durumları
      const isRightHinge = shape.doorProps?.hingeSide === 'right' || shape.doorProps?.flipX;
      const isOutward = shape.doorProps?.swingDirection === 'outward' || shape.doorProps?.flipY;

      // Arka plan
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Kasa Söveleri (Jambs)
      const jambW = Math.min(w * 0.1, 8 / zoom);
      ctx.fillStyle = mainColor;
      ctx.fillRect(-halfW, -halfH, jambW, h);
      ctx.fillRect(halfW - jambW, -halfH, jambW, h);

      // 90 Derece Açılış Kanat Yayı (Swing Arc)
      const hingeX = isRightHinge ? (halfW - jambW) : (-halfW + jambW);
      const hingeY = isOutward ? -halfH : halfH;
      const doorRadius = w - jambW * 2;

      let startAngle = 0;
      let endAngle = 0;

      if (!isRightHinge && !isOutward) {
        startAngle = -Math.PI / 2;
        endAngle = 0;
      } else if (isRightHinge && !isOutward) {
        startAngle = -Math.PI;
        endAngle = -Math.PI / 2;
      } else if (!isRightHinge && isOutward) {
        startAngle = 0;
        endAngle = Math.PI / 2;
      } else {
        startAngle = Math.PI / 2;
        endAngle = Math.PI;
      }

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? '#d97706' : '#f59e0b';
      ctx.lineWidth = 1.2 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);
      ctx.arc(hingeX, hingeY, doorRadius, startAngle, endAngle, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Açık Kapı Kanadı Çizgisi
      const targetY = isOutward ? (hingeY + doorRadius) : (hingeY - doorRadius);
      ctx.beginPath();
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2 / zoom;
      ctx.moveTo(hingeX, hingeY);
      ctx.lineTo(hingeX, targetY);
      ctx.stroke();

      // Menteşe İşaretçisi (Nokta)
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, 2 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Kapı Kolu
      const handleOffset = isRightHinge ? -4 / zoom : 4 / zoom;
      ctx.beginPath();
      ctx.arc(hingeX + handleOffset, hingeY + (isOutward ? doorRadius * 0.85 : -doorRadius * 0.85), 2 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
      ctx.restore();

      // Kod & Ölçü Etiketi
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${8.5 / zoom}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const dimLabel = shape.dimensions ? `${(shape.dimensions.widthMeters * 100).toFixed(0)}x${(shape.dimensions.heightMeters || 2.10) * 100}` : '90x210';
      const swingLabel = `${isRightHinge ? 'Sağ' : 'Sol'}-${isOutward ? 'Dış' : 'İç'}`;
      ctx.fillText(`${dimLabel} (${swingLabel})`, 0, 0);
      break;
    }

    case 'door_outer_double': {
      const isOutward = shape.doorProps?.swingDirection === 'outward' || shape.doorProps?.flipY;
      const hingeY = isOutward ? -halfH : halfH;

      // Çift Kanatlı Kapı (100cm + 50cm kanat)
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      const jambW = Math.min(w * 0.08, 8 / zoom);
      ctx.fillStyle = mainColor;
      ctx.fillRect(-halfW, -halfH, jambW, h);
      ctx.fillRect(halfW - jambW, -halfH, jambW, h);

      const leftRadius = (w - jambW * 2) * 0.65;
      const rightRadius = (w - jambW * 2) * 0.35;

      ctx.save();
      ctx.strokeStyle = isSelected ? '#d97706' : '#f59e0b';
      ctx.lineWidth = 1.2 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);

      if (!isOutward) {
        // Sol Kanat Yayı (İçe)
        ctx.beginPath();
        ctx.arc(-halfW + jambW, hingeY, leftRadius, -Math.PI / 2, 0, false);
        ctx.stroke();

        // Sağ Kanat Yayı (İçe)
        ctx.beginPath();
        ctx.arc(halfW - jambW, hingeY, rightRadius, -Math.PI / 2, -Math.PI, true);
        ctx.stroke();
      } else {
        // Sol Kanat Yayı (Dışa)
        ctx.beginPath();
        ctx.arc(-halfW + jambW, hingeY, leftRadius, 0, Math.PI / 2, false);
        ctx.stroke();

        // Sağ Kanat Yayı (Dışa)
        ctx.beginPath();
        ctx.arc(halfW - jambW, hingeY, rightRadius, Math.PI, Math.PI / 2, true);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Kanat Çizgileri
      const targetLeftY = isOutward ? (hingeY + leftRadius) : (hingeY - leftRadius);
      const targetRightY = isOutward ? (hingeY + rightRadius) : (hingeY - rightRadius);

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-halfW + jambW, hingeY);
      ctx.lineTo(-halfW + jambW, targetLeftY);
      ctx.moveTo(halfW - jambW, hingeY);
      ctx.lineTo(halfW - jambW, targetRightY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${8.5 / zoom}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`150x210 Çift (${isOutward ? 'Dışa' : 'İçe'})`, 0, 0);
      break;
    }

    // ==========================================
    // 🪟 PENCERELER (WINDOWS)
    // ==========================================
    case 'window_std':
    case 'window_wide':
    case 'window_french':
    case 'window_bath': {
      // Dış Çerçeve
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Denizlik Çıkıntısı (Sill)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-halfW - 3 / zoom, halfH);
      ctx.lineTo(halfW + 3 / zoom, halfH);
      ctx.stroke();

      // Çift Cam Hatları (Glazing lines)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH * 0.3);
      ctx.lineTo(halfW, -halfH * 0.3);
      ctx.moveTo(-halfW, halfH * 0.3);
      ctx.lineTo(halfW, halfH * 0.3);
      ctx.stroke();

      // Orta Kayıt (Mullion)
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, -halfH);
      ctx.lineTo(0, halfH);
      ctx.stroke();

      // Ölçü Etiketi
      ctx.fillStyle = '#0369a1';
      ctx.font = `bold ${8.5 / zoom}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const pLabel = shape.dimensions ? `${(shape.dimensions.widthMeters * 100).toFixed(0)}x${(shape.dimensions.heightMeters || 1.50) * 100}` : '140x150';
      ctx.fillText(pLabel, 0, -halfH * 0.65);
      break;
    }

    // ==========================================
    // 🧱 BÖLME DUVARLAR (WALLS)
    // ==========================================
    case 'wall_partition_10':
    case 'wall_partition_15':
    case 'wall_partition_20': {
      // Duvar Gövdesi
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Duvar Taraması (45 Derece Hatch)
      ctx.save();
      ctx.beginPath();
      ctx.rect(-halfW, -halfH, w, h);
      ctx.clip();
      ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 0.8 / zoom;
      const step = 8 / zoom;
      for (let x = -halfW - h; x < halfW + h; x += step) {
        ctx.moveTo(x, -halfH);
        ctx.lineTo(x + h * 1.5, halfH);
      }
      ctx.stroke();
      ctx.restore();

      // Kalınlık Rozeti
      const th = shape.dimensions?.depthMeters ? `${(shape.dimensions.depthMeters * 100).toFixed(0)}cm` : '15cm';
      ctx.fillStyle = '#1e1b4b';
      ctx.font = `bold ${9 / zoom}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Duvar ${th}`, 0, 0);
      break;
    }

    // ==========================================
    // 🚿 BANYO & WC TEFRİŞLERİ (BATHROOM FIXTURES)
    // ==========================================
    case 'toilet': {
      // Rezervuar Kutusu (Cistern)
      const tankH = h * 0.35;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-halfW, -halfH, w, tankH);
      ctx.strokeRect(-halfW, -halfH, w, tankH);

      // Basma Butonu
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, -halfH + tankH / 2, 2.5 / zoom, 0, Math.PI * 2);
      ctx.fill();

      // Klozet Kapağı / Haznesi (Bowl Oval)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      const bowlCenterY = -halfH + tankH + (h - tankH) * 0.45;
      const radiusX = halfW * 0.85;
      const radiusY = (h - tankH) * 0.45;
      ctx.ellipse(0, bowlCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // İç Su Yatağı Çizgisi
      ctx.beginPath();
      ctx.ellipse(0, bowlCenterY + radiusY * 0.15, radiusX * 0.65, radiusY * 0.65, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1 / zoom;
      ctx.stroke();
      break;
    }

    case 'shower': {
      // Duş Kabini Dış Çerçevesi
      ctx.fillStyle = '#f0fdfa';
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Su Gideri Meyil Çapraz Çizgileri
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH);
      ctx.lineTo(halfW, halfH);
      ctx.moveTo(halfW, -halfH);
      ctx.lineTo(-halfW, halfH);
      ctx.stroke();

      // Merkez Süzgeç (Drain)
      ctx.fillStyle = '#0e7490';
      ctx.beginPath();
      ctx.arc(0, 0, 4 / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Cam Kapı Açılış Göstergesi
      ctx.fillStyle = '#115e59';
      ctx.font = `bold ${8 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DUŞ 90x90', 0, halfH - 8 / zoom);
      break;
    }

    case 'bathtub': {
      // Küvet Dış Kenar
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // İç Küvet Haznesi (Oval)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-halfW + 4 / zoom, -halfH + 4 / zoom, w - 8 / zoom, h - 8 / zoom, 12 / zoom);
      ctx.fill();
      ctx.stroke();

      // Gider Deliği
      ctx.fillStyle = '#0891b2';
      ctx.beginPath();
      ctx.arc(-halfW + 12 / zoom, 0, 3 / zoom, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'sink': {
      // Tezgah
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Lavabo Haznesi
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, halfW * 0.75, halfH * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Batarya
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, -halfH * 0.45, 2.5 / zoom, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'washing_machine': {
      // Gövde
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Ön Kapak Çemberi
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 2 / zoom, Math.min(halfW, halfH) * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = '#0369a1';
      ctx.stroke();

      // Kontrol Paneli Üst Çizgisi
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH * 0.6);
      ctx.lineTo(halfW, -halfH * 0.6);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${8 / zoom}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('Ç.MAK', 0, 3 / zoom);
      break;
    }

    // ==========================================
    // 🍳 MUTFAK TEFRİŞLERİ (KITCHEN FIXTURES)
    // ==========================================
    case 'kitchen_counter': {
      // Tezgah
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Çift Gözlü Eviye Haznesi
      const sinkW = w * 0.4;
      const sinkH = h * 0.65;
      const sinkX = -halfW + w * 0.1;
      const sinkY = -sinkH / 2;

      ctx.fillStyle = '#e2e8f0';
      ctx.strokeRect(sinkX, sinkY, sinkW, sinkH);
      ctx.fillRect(sinkX, sinkY, sinkW, sinkH);

      // İki Göz Bölmesi
      ctx.strokeRect(sinkX + 2 / zoom, sinkY + 2 / zoom, sinkW / 2 - 4 / zoom, sinkH - 4 / zoom);
      ctx.strokeRect(sinkX + sinkW / 2 + 2 / zoom, sinkY + 2 / zoom, sinkW / 2 - 4 / zoom, sinkH - 4 / zoom);

      // Batarya
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(sinkX + sinkW / 2, sinkY - 2 / zoom, 2.5 / zoom, 0, Math.PI * 2);
      ctx.fill();

      // Tezgah Damlalık Çizgileri
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1 / zoom;
      const drainX = sinkX + sinkW + 10 / zoom;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(drainX + i * 5 / zoom, -halfH * 0.4);
        ctx.lineTo(drainX + i * 5 / zoom, halfH * 0.4);
        ctx.stroke();
      }

      ctx.fillStyle = '#7c2d12';
      ctx.font = `bold ${8 / zoom}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('MUTFAK TEZGAHI', halfW - 6 / zoom, 0);
      break;
    }

    case 'stove': {
      // Ocak
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // 4 Gözlü Ocak Brülörleri
      const rBig = Math.min(halfW, halfH) * 0.28;
      const rSmall = Math.min(halfW, halfH) * 0.20;

      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#c2410c';

      // Sol Alt (Büyük)
      ctx.beginPath();
      ctx.arc(-halfW * 0.45, halfH * 0.4, rBig, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Sağ Üst (Büyük)
      ctx.beginPath();
      ctx.arc(halfW * 0.45, -halfH * 0.4, rBig, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Sol Üst (Küçük)
      ctx.beginPath();
      ctx.arc(-halfW * 0.45, -halfH * 0.4, rSmall, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Sağ Alt (Küçük)
      ctx.beginPath();
      ctx.arc(halfW * 0.45, halfH * 0.4, rSmall, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      break;
    }

    case 'fridge': {
      // Buzdolabı
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Çift Kapak Çizgisi
      ctx.strokeStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH * 0.2);
      ctx.lineTo(halfW, -halfH * 0.2);
      ctx.stroke();

      // Kapı Kulpları
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(-halfW * 0.8, -halfH * 0.4, 4 / zoom, 8 / zoom);
      ctx.fillRect(-halfW * 0.8, 0, 4 / zoom, 12 / zoom);

      ctx.fillStyle = '#7c2d12';
      ctx.font = `bold ${8.5 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('BUZDOLABI', 0, halfH * 0.45);
      break;
    }

    case 'dishwasher': {
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH * 0.5);
      ctx.lineTo(halfW, -halfH * 0.5);
      ctx.stroke();

      ctx.fillStyle = '#7c2d12';
      ctx.font = `bold ${8 / zoom}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('B.MAK', 0, 3 / zoom);
      break;
    }

    // ==========================================
    // 🛋️ ODA & SALON TEFRİŞLERİ (FURNITURE)
    // ==========================================
    case 'bed_double': {
      // Yatak Gövdesi
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      // Başlık (Headboard)
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(-halfW, -halfH, w, h * 0.15);

      // 2 Yastık
      const pillowW = w * 0.38;
      const pillowH = h * 0.22;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#8b5cf6';
      ctx.strokeRect(-halfW + w * 0.08, -halfH + h * 0.18, pillowW, pillowH);
      ctx.fillRect(-halfW + w * 0.08, -halfH + h * 0.18, pillowW, pillowH);

      ctx.strokeRect(halfW - w * 0.08 - pillowW, -halfH + h * 0.18, pillowW, pillowH);
      ctx.fillRect(halfW - w * 0.08 - pillowW, -halfH + h * 0.18, pillowW, pillowH);

      // Yorgan / Pike Çizgisi
      ctx.strokeStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH + h * 0.48);
      ctx.lineTo(halfW, -halfH + h * 0.48);
      ctx.stroke();

      ctx.fillStyle = '#4c1d95';
      ctx.font = `bold ${8.5 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('160x200 ÇİFT KİŞİLİK YATAK', 0, halfH * 0.65);
      break;
    }

    case 'bed_single': {
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(-halfW, -halfH, w, h * 0.15);

      // Tek Yastık
      ctx.fillStyle = '#ffffff';
      ctx.strokeRect(-halfW * 0.7, -halfH + h * 0.18, w * 0.7, h * 0.22);
      ctx.fillRect(-halfW * 0.7, -halfH + h * 0.18, w * 0.7, h * 0.22);

      ctx.strokeStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH + h * 0.48);
      ctx.lineTo(halfW, -halfH + h * 0.48);
      ctx.stroke();
      break;
    }

    case 'sofa': {
      // Kanepe Arka Sırtlık
      ctx.fillRect(-halfW, -halfH, w, h);
      ctx.strokeRect(-halfW, -halfH, w, h);

      ctx.fillStyle = '#6d28d9';
      ctx.fillRect(-halfW, -halfH, w, h * 0.35);

      // İki Kolçak (Armrests)
      ctx.fillRect(-halfW, -halfH, w * 0.12, h);
      ctx.fillRect(halfW - w * 0.12, -halfH, w * 0.12, h);

      // 3 Oturma Minderi Çizgisi
      ctx.strokeStyle = '#8b5cf6';
      const cushionW = (w * 0.76) / 3;
      const startX = -halfW + w * 0.12;
      ctx.beginPath();
      ctx.moveTo(startX + cushionW, -halfH * 0.2);
      ctx.lineTo(startX + cushionW, halfH);
      ctx.moveTo(startX + cushionW * 2, -halfH * 0.2);
      ctx.lineTo(startX + cushionW * 2, halfH);
      ctx.stroke();
      break;
    }

    case 'dining_table': {
      // Masa Tablası
      ctx.fillRect(-halfW * 0.75, -halfH, w * 0.75, h);
      ctx.strokeRect(-halfW * 0.75, -halfH, w * 0.75, h);

      // 6 Sandalye (3 Sağda, 3 Solda)
      const chairW = w * 0.12;
      const chairH = h * 0.24;
      ctx.fillStyle = '#7c3aed';

      for (let i = 0; i < 3; i++) {
        const y = -halfH + (h / 3) * i + h * 0.05;
        // Sol Sandalyeler
        ctx.fillRect(-halfW, y, chairW, chairH);
        // Sağ Sandalyeler
        ctx.fillRect(halfW - chairW, y, chairW, chairH);
      }
      break;
    }

    default:
      ctx.restore();
      return false;
  }

  ctx.restore();
  return true;
}
