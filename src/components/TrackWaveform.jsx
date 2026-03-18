import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

/** Simple seeded random for consistent bar heights per track */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MAX_BARS = 1000;
const BAR_WIDTH_PX = 1.5;
const GAP_PX = 0.5;
const SEGMENT_PX = BAR_WIDTH_PX + GAP_PX;

const HOVER_DELAY_MS = 150;

function TrackWaveform({ trackNum = 1, className = '', accentColor, accentRange, accentRanges, outlineRange, outlineHeightScale = 1, outlineOverlayText, outlineOverlayTimestamp, outlineOverlaySegmentTime, overlayThumbnail, overlayTitle, overlaySubtitle }) {
  const containerRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const outlineHideTimeoutRef = useRef(null);
  const [barCount, setBarCount] = useState(80);
  const [accentHovered, setAccentHovered] = useState(false);
  const [outlineHovered, setOutlineHovered] = useState(false);
  const [overlayRect, setOverlayRect] = useState(null);
  const [outlineOverlayRect, setOutlineOverlayRect] = useState(null);
  const hoveredRangeIndexRef = useRef(0);

  const showOverlay = (rangeIndex = 0) => {
    hoveredRangeIndexRef.current = rangeIndex;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setAccentHovered(true);
    if (overlayThumbnail && ranges.length > 0) {
      setTimeout(updateOverlayRect, 0);
    }
  };

  const scheduleHide = () => {
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      setAccentHovered(false);
    }, HOVER_DELAY_MS);
  };

  const showOutlineOverlay = () => {
    if (outlineHideTimeoutRef.current) {
      clearTimeout(outlineHideTimeoutRef.current);
      outlineHideTimeoutRef.current = null;
    }
    setOutlineHovered(true);
  };

  const scheduleOutlineHide = () => {
    outlineHideTimeoutRef.current = setTimeout(() => {
      outlineHideTimeoutRef.current = null;
      setOutlineHovered(false);
    }, HOVER_DELAY_MS);
  };

  const heights = useMemo(() => {
    const arr = [];
    for (let i = 0; i < MAX_BARS; i++) {
      arr.push(0.15 + seededRandom(trackNum * 1000 + i) * 0.85);
    }
    return arr;
  }, [trackNum]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setBarCount(Math.max(1, Math.floor(w / SEGMENT_PX)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ranges = useMemo(() => {
    const raw = accentRanges ?? (accentRange ? [accentRange] : []);
    return Array.isArray(raw) ? raw.filter((r) => Array.isArray(r) && r.length >= 2) : [];
  }, [accentRanges, accentRange]);

  const updateOverlayRect = () => {
    const el = containerRef.current;
    if (!el || ranges.length === 0 || !overlayThumbnail) return;
    const r = el.getBoundingClientRect();
    const totalBars = Math.max(1, Math.floor(r.width / SEGMENT_PX));
    const idx = hoveredRangeIndexRef.current;
    const range = ranges[Math.min(idx, ranges.length - 1)];
    if (!Array.isArray(range) || range.length < 2) return;
    const [start, end] = range;
    const startPct = start / totalBars;
    const endPct = Math.min(1, end / totalBars);
    const centerX = r.left + r.width * ((startPct + endPct) / 2);
    setOverlayRect({
      left: centerX,
      top: r.top,
      width: r.width * (endPct - startPct),
    });
  };

  const updateOutlineOverlayRect = () => {
    const el = containerRef.current;
    if (!el || !outlineOverlayText || !document.body.contains(el)) return;
    if (!Array.isArray(outlineRange) || outlineRange.length < 2) return;
    try {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const totalBars = Math.max(1, Math.floor(r.width / SEGMENT_PX));
      const [start, end] = outlineRange;
      const startPct = Math.min(1, start / totalBars);
      const endPct = Math.min(1, end / totalBars);
      const centerX = r.left + r.width * ((startPct + endPct) / 2);
      const leftX = r.left + r.width * startPct;
      const rightX = r.left + r.width * endPct;
      const scaleH = r.height;
      const outlineScale = outlineHeightScale || 1;
      const offsetTop = scaleH * (outlineScale - 1) / 2;
      setOutlineOverlayRect({
        left: centerX,
        top: r.top,
        leftEdge: leftX,
        rightEdge: rightX,
        topEdge: r.top - offsetTop,
        bottomEdge: r.bottom + offsetTop,
      });
    } catch (_) {
      /* ignore layout errors */
    }
  };

  useLayoutEffect(() => {
    if (!accentHovered || !overlayThumbnail) return;
    updateOverlayRect();
    window.addEventListener('scroll', updateOverlayRect, true);
    window.addEventListener('resize', updateOverlayRect);
    return () => {
      window.removeEventListener('scroll', updateOverlayRect, true);
      window.removeEventListener('resize', updateOverlayRect);
    };
  }, [accentHovered, overlayThumbnail, ranges]);

  useLayoutEffect(() => {
    if (!outlineHovered || !outlineOverlayText) return;
    const raf = { id: null };
    const scheduleUpdate = () => {
      if (raf.id) cancelAnimationFrame(raf.id);
      raf.id = requestAnimationFrame(updateOutlineOverlayRect);
    };
    updateOutlineOverlayRect();
    window.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      if (raf.id) cancelAnimationFrame(raf.id);
    };
  }, [outlineHovered, outlineOverlayText, outlineRange]);

  useEffect(() => () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (outlineHideTimeoutRef.current) clearTimeout(outlineHideTimeoutRef.current);
  }, []);

  const totalWidth = barCount * SEGMENT_PX;
  const maxHeight = 1;
  const hasAccent = accentColor && ranges.length > 0;
  const firstRange = ranges[0];
  const accentStartX = hasAccent && firstRange ? firstRange[0] * SEGMENT_PX : 0;
  const accentWidth = hasAccent && firstRange ? (firstRange[1] - firstRange[0]) * SEGMENT_PX : 0;

  const inAccentRange = (i) =>
    hasAccent && ranges.some(([s, e]) => i >= s && i < e);

  const inOutlineRange = (i) =>
    outlineRange && i >= outlineRange[0] && i < outlineRange[1];

  const inHighlightRange = (i) => inAccentRange(i) || inOutlineRange(i);

  const shouldGrayNonHighlighted = outlineRange && !hasAccent;

  const getBarFill = (i) => {
    if (inAccentRange(i)) return accentColor;
    if (shouldGrayNonHighlighted && !inOutlineRange(i)) return 'rgba(255, 255, 255, 0.25)';
    return 'currentColor';
  };

  const overlay = accentHovered && overlayThumbnail && overlayRect && createPortal(
    <div
      className="track-waveform-sounds-like-overlay"
      style={{
        position: 'fixed',
        left: overlayRect.left,
        top: overlayRect.top - 2,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
        paddingBottom: 16,
      }}
      onMouseEnter={showOverlay}
      onMouseLeave={scheduleHide}
    >
      <div className="track-waveform-sounds-like-overlay-inner">
        <div
          className="track-waveform-sounds-like-overlay-thumb"
          style={{ backgroundImage: `url('${overlayThumbnail}')` }}
        />
        <div className="track-waveform-sounds-like-overlay-content">
          <div className="track-waveform-sounds-like-row">
            <span className="track-waveform-sounds-like-tag">SOUNDS LIKE</span>
            <span className="track-waveform-sounds-like-title">{overlayTitle || ''}</span>
          </div>
          {overlaySubtitle && (
            <span className="track-waveform-sounds-like-subtitle">{overlaySubtitle}</span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  const strokeRectValid = outlineOverlayRect && outlineOverlayRect.leftEdge != null && typeof outlineOverlayRect.topEdge === 'number' && outlineOverlayRect.rightEdge > outlineOverlayRect.leftEdge && outlineOverlayRect.bottomEdge > outlineOverlayRect.topEdge;
  const outlineStrokeOverlay = outlineHovered && outlineRange && strokeRectValid && createPortal(
    <div
      style={{
        position: 'fixed',
        left: outlineOverlayRect.leftEdge,
        top: outlineOverlayRect.topEdge,
        width: outlineOverlayRect.rightEdge - outlineOverlayRect.leftEdge,
        height: outlineOverlayRect.bottomEdge - outlineOverlayRect.topEdge,
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 2,
          height: '100%',
          background: '#ffffff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 2,
          height: '100%',
          background: '#ffffff',
        }}
      />
    </div>,
    document.body
  );

  const outlineOverlay = outlineHovered && outlineOverlayText && outlineOverlayRect && createPortal(
    <div
      className="track-waveform-segment-overlay"
      style={{
        position: 'fixed',
        left: outlineOverlayRect.left,
        top: outlineOverlayRect.top - 8,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
        paddingBottom: 16,
      }}
      onMouseEnter={showOutlineOverlay}
      onMouseLeave={scheduleOutlineHide}
    >
      <div className="track-waveform-segment-overlay-inner">
        {outlineOverlaySegmentTime && (
          <span className="track-waveform-segment-overlay-time">{outlineOverlaySegmentTime}</span>
        )}
        {outlineOverlayTimestamp && (
          <span className="track-waveform-segment-overlay-timestamp">{outlineOverlayTimestamp}</span>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={containerRef} className="track-waveform-wrap">
      <svg
        className={className}
        viewBox={`0 0 ${totalWidth} ${maxHeight}`}
        preserveAspectRatio="none"
        overflow={outlineRange && outlineHeightScale > 1 ? 'visible' : undefined}
        xmlns="http://www.w3.org/2000/svg"
      >
        {heights.slice(0, barCount).map((h, i) => (
          <rect
            key={i}
            x={i * SEGMENT_PX}
            y={(maxHeight - h) / 2}
            width={BAR_WIDTH_PX}
            height={h}
            fill={getBarFill(i)}
          />
        ))}
        {hasAccent && overlayThumbnail && ranges.map(([start, end], idx) => (
          <rect
            key={idx}
            x={start * SEGMENT_PX}
            y={0}
            width={(end - start) * SEGMENT_PX}
            height={maxHeight}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => showOverlay(idx)}
            onMouseLeave={scheduleHide}
          />
        ))}
        {outlineRange && (
          <>
            <rect
              x={outlineRange[0] * SEGMENT_PX}
              y={-maxHeight * (outlineHeightScale - 1) / 2}
              width={(outlineRange[1] - outlineRange[0]) * SEGMENT_PX}
              height={maxHeight * outlineHeightScale}
              fill="rgba(255, 255, 255, 0.2)"
              style={outlineOverlayText ? { cursor: 'pointer' } : undefined}
              onMouseEnter={outlineOverlayText ? showOutlineOverlay : undefined}
              onMouseLeave={outlineOverlayText ? scheduleOutlineHide : undefined}
            />
          </>
        )}
      </svg>
      {overlay}
      {outlineStrokeOverlay}
      {outlineOverlay}
    </div>
  );
}

export default TrackWaveform;
