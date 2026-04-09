import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const PROJECT_IMAGES = [
  '/project-thumb-1.png',
  '/project-thumb-2.png',
  '/project-thumb-3.png',
  '/project-thumb-4.png',
];

const PROJECT_TITLE = 'Winter Olympics 2026 - Contemporary Italy (Update 10.28.25)';
const PROJECT_TITLE_TOOLTIP = 'Winter Olympics 2026 - Contemporary Italy\n(Update 10.28.25)';
const MOBILE_HEADER_TITLE = 'Winter Olympics 2026 - Contemporary Italy';
const PROJECT_DESCRIPTION =
  'Duis nibh posuere elit ultrices. Nibh et id elementum et dolor leo. Sit lacus in purus orci. Egestas massa, tincidunt scelerisque lorem. Lacus vitae commodo in vulputate fusce placerat. Sapien quis id ut mattis mattis pharetra, vitae tristique sed.';

const KEYWORDS = ['Sound Design', 'Menacing', 'Ponderous/Heavy', 'Ponderous/Heavy', 'Aggressive', 'Flowing'];

const GRID_HEIGHTS = [
  { mq: '(max-width: 880px)', height: 110 },
  { mq: '(max-width: 1000px)', height: 130 },
  { mq: '(max-width: 1140px)', height: 150 },
  { mq: '(max-width: 1280px)', height: 170 },
  { mq: '', height: 220 },
];

function ProjectCard({ soundsLikePanelOpen, onSoundsLikeClick }) {
  const contentRef = useRef(null);
  const measureRef = useRef(null);
  const titleRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [gridHeight, setGridHeight] = useState(220);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [titleTooltipRect, setTitleTooltipRect] = useState(null);

  useEffect(() => {
    const update = () => {
      for (const { mq, height } of GRID_HEIGHTS) {
        if (!mq || window.matchMedia(mq).matches) {
          setGridHeight(height);
          break;
        }
      }
    };
    update();
    const mql = GRID_HEIGHTS.filter((g) => g.mq).map((g) => window.matchMedia(g.mq));
    mql.forEach((m) => m.addEventListener('change', update));
    return () => mql.forEach((m) => m.removeEventListener('change', update));
  }, []);

  useEffect(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;
    const VIEW_FULL_DETAILS_HEIGHT = 32;
    const check = () => {
      const maxContentHeight = gridHeight - VIEW_FULL_DETAILS_HEIGHT;
      setIsTruncated(measureEl.scrollHeight > maxContentHeight);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(measureEl);
    return () => ro.disconnect();
  }, [isExpanded, gridHeight]);

  useEffect(() => {
    if (!isOverlayOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOverlayOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOverlayOpen]);

  const updateTitleTooltipRect = () => {
    const el = titleRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setTitleTooltipRect({ left: r.left, bottom: r.top });
    }
  };

  useEffect(() => {
    if (!isTitleHovered) return;
    updateTitleTooltipRect();
    const onUpdate = () => updateTitleTooltipRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isTitleHovered]);

  const overlayPanel = (
    <div className="project-details-overlay">
      <div
        className="project-details-overlay-backdrop"
        onClick={() => setIsOverlayOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOverlayOpen(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close overlay"
      />
      <div className="project-details-overlay-panel-wrap">
        <button
          type="button"
          className="project-details-overlay-close"
          onClick={() => setIsOverlayOpen(false)}
          aria-label="Close overlay"
        >
          <img src="/icons/Close.svg" alt="" />
        </button>
        <div className="project-details-overlay-panel">
          <div className="project-details-overlay-panel-scroll">
            <h3 className="project-details-overlay-title">{PROJECT_TITLE}</h3>
            <p className="project-details-overlay-description">{PROJECT_DESCRIPTION}</p>
            <div className="project-details-overlay-keywords">
              {KEYWORDS.map((kw, i) => (
                <span key={i} className="keyword">
                  {kw} <button type="button" className="remove">×</button>
                </span>
              ))}
              <button type="button" className="add-keyword">+ Add Keyword</button>
            </div>
            <div className="project-details-overlay-metadata metadata">
              Created by <span className="metadata-value">Matthew For Netflix</span> Created on <span className="metadata-value">1/5/22</span> Last updated <span className="metadata-value">8/2/22</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="project-mobile-hero" aria-labelledby="project-mobile-hero-title">
        <h1 id="project-mobile-hero-title" className="project-mobile-hero__title">
          {MOBILE_HEADER_TITLE}
        </h1>
        <div className="project-mobile-hero__row">
          <div className="project-mobile-hero__visuals" aria-hidden="true">
            <div className="image-grid single">
              {PROJECT_IMAGES.map((src, i) => (
                <img key={i} className="grid-img" src={src} alt="" />
              ))}
            </div>
          </div>
          <div className="project-mobile-hero__text">
            <p className="project-mobile-hero__desc">{PROJECT_DESCRIPTION}</p>
            <button
              type="button"
              className="project-mobile-hero__details"
              onClick={() => setIsOverlayOpen(true)}
            >
              View Full Details
            </button>
            <div className="project-mobile-hero__actions">
              <img src="/Actions.svg" alt="" className="project-actions-icons" />
            </div>
          </div>
        </div>
      </section>
      {!soundsLikePanelOpen && (
        <div className="sounds-like-box project-mobile-hero__sounds-like">
          <p>Find tracks that sound like this project</p>
          <button type="button" className="btn-sounds-like" onClick={onSoundsLikeClick}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.73242 1.26757C8.1425 1.24947 8.49219 1.62908 8.49219 2.02734V2.0459C8.50405 2.50778 8.49219 2.97363 8.49219 3.43847V13.4394C8.49219 13.865 8.1425 14.1816 7.73242 14.2002C7.32214 14.2186 6.97168 13.8379 6.97168 13.4394V13.4219C6.95981 12.96 6.97168 12.4941 6.97168 12.0293L6.97168 2.02734C6.97168 1.60162 7.32214 1.28539 7.73242 1.26757ZM4.83594 3.11035C5.24618 3.09199 5.5957 3.47173 5.5957 3.87011L5.5957 11.334C5.59544 11.7594 5.24603 12.0753 4.83594 12.0937C4.42582 12.1121 4.07645 11.7322 4.07617 11.334V3.87011C4.07617 3.44143 4.42566 3.12816 4.83594 3.11035ZM10.3643 3.11035C10.7744 3.09216 11.124 3.47182 11.124 3.87011V11.334C11.1238 11.7593 10.7742 12.0752 10.3643 12.0937C9.95414 12.1121 9.6038 11.7322 9.60352 11.334V3.87011C9.60352 3.44143 9.95398 3.12816 10.3643 3.11035ZM1.99707 4.39257C2.40726 4.37423 2.75675 4.75402 2.75684 5.15234L2.75684 10.0508C2.75662 10.4763 2.40718 10.7921 1.99707 10.8105C1.58693 10.8289 1.23754 10.449 1.2373 10.0508L1.2373 5.15234C1.23739 4.72729 1.58386 4.41098 1.99707 4.39257ZM13.2012 4.39257C13.6114 4.37417 13.9618 4.75399 13.9619 5.15234V10.0508C13.9617 10.4763 13.6113 10.7921 13.2012 10.8105C12.7912 10.8287 12.4416 10.4489 12.4414 10.0508V5.15234C12.4415 4.72742 12.7911 4.41115 13.2012 4.39257Z"/></svg>
            Sounds like
          </button>
        </div>
      )}
      <div className="project-card project-card--desktop">
      <div className="project-visuals">
        <div className="image-grid single">
          {PROJECT_IMAGES.map((src, i) => (
            <img key={i} className="grid-img" src={src} alt="" />
          ))}
        </div>
        <div className="project-actions project-actions-inline">
          <img src="/Actions.svg" alt="Project actions" className="project-actions-icons" />
        </div>
      </div>
      <div className="project-details">
        <div className="project-content-row">
          <div className="project-text-block">
            {!isExpanded ? (
              <div
                className="project-info-wrapper"
                style={{ maxHeight: gridHeight }}
              >
                <div
                  ref={measureRef}
                  className="project-info-measure"
                  aria-hidden="true"
                >
                  <div className="project-title-row">
                    <div className="project-title-wrap">
                      <h2 className="project-title">{PROJECT_TITLE}</h2>
                    </div>
                  </div>
                  <div className="project-description">
                    <p>{PROJECT_DESCRIPTION}</p>
                  </div>
                  <div className="keywords">
                    {KEYWORDS.map((kw, i) => (
                      <span key={i} className="keyword">
                        {kw} <button type="button" className="remove">×</button>
                      </span>
                    ))}
                    <button type="button" className="add-keyword">+ Add Keyword</button>
                  </div>
                </div>
                <div ref={contentRef} className="project-info-content project-info-content-constrained">
                  <div className="project-title-row">
                    <div
                      ref={titleRef}
                      className="project-title-wrap"
                      onMouseEnter={() => { setIsTitleHovered(true); updateTitleTooltipRect(); }}
                      onMouseLeave={() => setIsTitleHovered(false)}
                    >
                      <h2 className="project-title">{PROJECT_TITLE}</h2>
                      {isTitleHovered && titleTooltipRect && createPortal(
                        <span
                          className="project-title-tooltip project-title-tooltip-portal"
                          role="tooltip"
                          style={{
                            left: titleTooltipRect.left,
                            bottom: window.innerHeight - titleTooltipRect.bottom + 6,
                          }}
                        >
                          {PROJECT_TITLE_TOOLTIP}
                        </span>,
                        document.body
                      )}
                    </div>
                  </div>
                  <div className="project-description">
                    <p>{PROJECT_DESCRIPTION}</p>
                  </div>
                  {!isTruncated && (
                    <div className="keywords">
                      {KEYWORDS.map((kw, i) => (
                        <span key={i} className="keyword">
                          {kw} <button type="button" className="remove">×</button>
                        </span>
                      ))}
                      <button type="button" className="add-keyword">+ Add Keyword</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div ref={contentRef} className="project-info-content">
                <div className="project-title-row">
                  <div
                    ref={titleRef}
                    className="project-title-wrap"
                    onMouseEnter={() => { setIsTitleHovered(true); updateTitleTooltipRect(); }}
                    onMouseLeave={() => setIsTitleHovered(false)}
                  >
                    <h2 className="project-title">{PROJECT_TITLE}</h2>
                    {isTitleHovered && titleTooltipRect && createPortal(
                      <span
                        className="project-title-tooltip project-title-tooltip-portal"
                        role="tooltip"
                        style={{
                          left: titleTooltipRect.left,
                          bottom: window.innerHeight - titleTooltipRect.bottom + 6,
                        }}
                      >
                        {PROJECT_TITLE_TOOLTIP}
                      </span>,
                      document.body
                    )}
                  </div>
                </div>
                <div className="project-description">
                  <p>{PROJECT_DESCRIPTION}</p>
                </div>
                <div className="keywords">
                  {KEYWORDS.map((kw, i) => (
                    <span key={i} className="keyword">
                      {kw} <button type="button" className="remove">×</button>
                    </span>
                  ))}
                  <button type="button" className="add-keyword">+ Add Keyword</button>
                </div>
              </div>
            )}
            <div className="metadata">
              Created by <span className="metadata-value">Matthew For Netflix</span> Created on <span className="metadata-value">1/5/22</span> Last updated <span className="metadata-value">8/2/22</span>
            </div>
          </div>
          {!soundsLikePanelOpen && (
            <div className="sounds-like-box">
              <p>Find tracks that sound like this project</p>
              <button type="button" className="btn-sounds-like" onClick={onSoundsLikeClick}>
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.73242 1.26757C8.1425 1.24947 8.49219 1.62908 8.49219 2.02734V2.0459C8.50405 2.50778 8.49219 2.97363 8.49219 3.43847V13.4394C8.49219 13.865 8.1425 14.1816 7.73242 14.2002C7.32214 14.2186 6.97168 13.8379 6.97168 13.4394V13.4219C6.95981 12.96 6.97168 12.4941 6.97168 12.0293L6.97168 2.02734C6.97168 1.60162 7.32214 1.28539 7.73242 1.26757ZM4.83594 3.11035C5.24618 3.09199 5.5957 3.47173 5.5957 3.87011L5.5957 11.334C5.59544 11.7594 5.24603 12.0753 4.83594 12.0937C4.42582 12.1121 4.07645 11.7322 4.07617 11.334V3.87011C4.07617 3.44143 4.42566 3.12816 4.83594 3.11035ZM10.3643 3.11035C10.7744 3.09216 11.124 3.47182 11.124 3.87011V11.334C11.1238 11.7593 10.7742 12.0752 10.3643 12.0937C9.95414 12.1121 9.6038 11.7322 9.60352 11.334V3.87011C9.60352 3.44143 9.95398 3.12816 10.3643 3.11035ZM1.99707 4.39257C2.40726 4.37423 2.75675 4.75402 2.75684 5.15234L2.75684 10.0508C2.75662 10.4763 2.40718 10.7921 1.99707 10.8105C1.58693 10.8289 1.23754 10.449 1.2373 10.0508L1.2373 5.15234C1.23739 4.72729 1.58386 4.41098 1.99707 4.39257ZM13.2012 4.39257C13.6114 4.37417 13.9618 4.75399 13.9619 5.15234V10.0508C13.9617 10.4763 13.6113 10.7921 13.2012 10.8105C12.7912 10.8287 12.4416 10.4489 12.4414 10.0508V5.15234C12.4415 4.72742 12.7911 4.41115 13.2012 4.39257Z"/></svg>
                Sounds like
              </button>
            </div>
          )}
        </div>
        {isTruncated && !isExpanded && (
          <div className="project-view-full-details-wrap">
            <button
              type="button"
              className="project-view-full-details"
              onClick={() => setIsOverlayOpen(true)}
            >
              View full details
            </button>
          </div>
        )}
      </div>
    </div>
    {isOverlayOpen && createPortal(overlayPanel, document.body)}
    </>
  );
}

export default ProjectCard;
