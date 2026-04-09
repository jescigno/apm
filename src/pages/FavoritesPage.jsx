import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import TrackList, { TrackListTabs, TrackListTrackCount } from '../components/TrackList';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';

function BreadcrumbSegment({ label }) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const check = () => {
      const containerWidth = container.offsetWidth;
      const contentWidth = measure.scrollWidth;
      setIsTruncated(contentWidth > containerWidth);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, [label]);

  const updateTooltipRect = () => {
    const el = containerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setTooltipRect({ left: r.left, bottom: r.top });
    }
  };

  useEffect(() => {
    if (!isHovered || !isTruncated) return;
    updateTooltipRect();
    const onUpdate = () => updateTooltipRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isHovered, isTruncated]);

  const tooltip = isTruncated && isHovered && tooltipRect && createPortal(
    <span
      className="breadcrumb-tooltip breadcrumb-tooltip-portal"
      role="tooltip"
      style={{
        left: tooltipRect.left,
        bottom: window.innerHeight - tooltipRect.bottom + 6,
      }}
    >
      {label}
    </span>,
    document.body
  );

  return (
    <>
      <span
        ref={containerRef}
        className="breadcrumb-segment-wrap"
        onMouseEnter={() => {
          setIsHovered(true);
          updateTooltipRect();
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="breadcrumb-segment">{label}</span>
        <span ref={measureRef} className="breadcrumb-segment-measure" aria-hidden="true">
          {label}
        </span>
      </span>
      {tooltip}
    </>
  );
}

function BreadcrumbText({ children }) {
  return (
    <span className="breadcrumb-text-wrap">
      <span className="breadcrumb-text">{children}</span>
    </span>
  );
}

const MOBILE_MQ = '(max-width: 480px)';

export default function FavoritesPage({
  soundsLikePanelOpen,
  onSoundsLikeClick,
  tracks,
  enterHighlightTrackNum,
  scrollToBottomSignal,
}) {
  const [activeTab, setActiveTab] = useState('tracks');
  const [isCompactLayout, setIsCompactLayout] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setIsCompactLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <>
      <div className="breadcrumb-row breadcrumb-row--favorites">
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb">
            <span className="breadcrumb-highlight">
              <BreadcrumbText>
                <BreadcrumbSegment label="Favorites" />
              </BreadcrumbText>
            </span>
          </span>
          <TrackListTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="breadcrumb-tabs"
            showSearchesTab
          />
          <TrackListTrackCount activeTab={activeTab} tracks={tracks} />
        </div>
        <div className="breadcrumb-actions">
          <button type="button" className="btn-secondary"><img src="/Customize.svg" alt="" /> CUSTOMIZE</button>
          <button type="button" className="btn-secondary"><img src="/Sort.svg" alt="" /> SORT</button>
        </div>
      </div>

      <TrackList
        soundsLikePanelOpen={soundsLikePanelOpen}
        onSoundsLikeClick={onSoundsLikeClick}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabsInBreadcrumb={!isCompactLayout}
        showSearchesTab
        tracks={tracks}
        enableTrackDetailsOverlay
        trackTitleBadges={{ 2: 'VERSION', 4: 'STEM' }}
        enterHighlightTrackNum={enterHighlightTrackNum}
        scrollToBottomSignal={scrollToBottomSignal}
        showVersionsStems
      />
    </>
  );
}
