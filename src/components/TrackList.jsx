import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, Fragment } from 'react';
import { createPortal, flushSync } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TrackRow, { getStemItems } from './TrackRow';
import TrackDragThumbnail from './TrackDragThumbnail';
import TrackGridCard from './TrackGridCard';
import ProjectFolderRow from './ProjectFolderRow';
import { FolderDragThumbnail } from './ProjectsPanel';
import CustomizeViewMenu from './CustomizeViewMenu';
import SearchCustomizeViewMenu from './SearchCustomizeViewMenu';
import SearchSortMenu from './SearchSortMenu';
import ProjectCustomizeMenus from './ProjectCustomizeMenus';
import ToolbarIconButton, { PlayAllIcon, ShuffleIcon } from './ToolbarIconButton';
import { usePlayer } from '../context/PlayerContext';
import { getFolderTrackCount } from '../constants/projectsPanelTree';
import { getTrackDragId } from '../constants/projectsPanelDnD';
import {
  snapTrackReorderOverlayToCursor,
  TRACK_REORDER_DROP_ANIMATION_MS,
  TRACK_REORDER_FLIP_MS,
  TRACK_REORDER_LAND_MS,
  captureTrackRowRects,
  computeTrackRowFlipOffsets,
  getTrackRowElement,
  isFolderSortableId,
  parseFolderSortableId,
  toFolderSortableId,
} from '../constants/trackReorderDnD';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';
import { DEFAULT_PROJECT_CUSTOMIZE } from '../constants/projectTrackCustomize';
import { ICON_SOUNDS_LIKE, ICON_CUSTOMIZE, ICON_REORDER, ICON_FAVORITE_OUTLINE } from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

export const PROJECTS_CUSTOMIZE_VIEW_OPTIONS = [
  { id: 'condensed', label: 'Condensed' },
  { id: 'simplified', label: 'Simplified' },
  { id: 'expanded', label: 'Expanded' },
];

export const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Random `ABCD-1234` (4 uppercase letters, dash, 4 digits) for track / album `id` shown under the title */
export function generateTrackId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letters = '';
  for (let i = 0; i < 4; i++) {
    letters += alphabet[Math.floor(Math.random() * 26)];
  }
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${letters}-${digits}`;
}

/** One-line catalog-style description for a track added from Sounds Like */
export function generateSoundsLikeTrackDescription() {
  const pool = [
    'High-energy rock with driving drums and bold guitars, ready for broadcast highlights.',
    'Uplifting anthemic layers with punchy hooks and tight, modern production.',
    'Powerful dynamics and soaring guitars built for stadium and arena moments.',
    'Driving percussion and anthemic riffs with a crisp, broadcast-ready mix.',
    'Big-room energy with layered guitars and synth accents for peak moments.',
    'Tight, punchy arrangement with momentum and tension for sports coverage.',
    'Soaring leads and rhythmic grit—ideal for openers and hype segments.',
    'Epic build and release with brass and percussion for championship moments.',
    'Fast-paced rock grooves with off-beat synth melodies and high energy.',
    'Crowd-inspired intensity with bold guitars and a wide, cinematic feel.',
    'Suspenseful tension and dramatic payoff—great for overtime and late-game.',
    'Explosive opener energy with bold drums and anthemic guitar hooks.',
    'Prime-time rock with punchy hooks, polished stems, and a wide stereo image.',
    'Victory-lap energy with celebratory brass and driving rhythm section.',
    'Atmospheric verses and explosive choruses—tailored for highlight reels.',
    'Hard-hitting riffs with synth stabs and a tight, radio-friendly balance.',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

const RECORDED_LABEL_POOL = [
  '02/04/2004',
  '2011',
  '11/20/2018',
  '2015',
  '2019',
  '03/15/2016',
  '2020',
  '2017',
  '10/01/2023',
  '2014',
  '2012',
  '08/12/2019',
];

/** Random "Recorded" suffix — mix of MM/DD/YYYY and year-only */
export function pickRandomRecordedLabel() {
  return RECORDED_LABEL_POOL[Math.floor(Math.random() * RECORDED_LABEL_POOL.length)];
}

const TRACKS_BASE = [
  { num: 1, title: 'Rocking the Stadium', versions: 4, commentCount: 2, desc: 'Big hard-hitting stadium rock sounds with fast paced anthemic rock guitars, high energy riffs and off beat synth melodies.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: '#3 Stadium Anthem - Narrartive Instrumental', versions: 3, commentCount: 5, desc: 'Uplifting anthemic rock with soaring guitars and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Victory March', versions: 5, commentCount: 2, desc: 'Powerful march-style arrangement with brass and percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Game Day Energy- Stem One', versions: 4, commentCount: 3, desc: 'High-energy rock for game day broadcast moments.', audioUrl: SAMPLE_AUDIO },
  { num: 5, title: 'Stadium Roar', versions: 3, commentCount: 7, desc: 'Crowd-inspired intensity with powerful dynamics.', audioUrl: SAMPLE_AUDIO },
  { num: 6, title: 'Touchdown Charge', versions: 4, commentCount: 1, desc: 'Buildup to the big moment with rising tension and payoff.', audioUrl: SAMPLE_AUDIO },
  { num: 7, title: 'Prime Time', versions: 3, commentCount: 4, desc: 'Broadcast-ready rock with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
  { num: 8, title: 'Championship Drive', versions: 5, commentCount: 6, desc: 'Epic climactic themes for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 9, title: 'Kickoff Frenzy', versions: 3, commentCount: 2, desc: 'Explosive opener with driving drums and bold guitars.', audioUrl: SAMPLE_AUDIO },
  { num: 10, title: 'Overtime', versions: 4, commentCount: 9, desc: 'Suspenseful extended tension with dramatic payoff.', audioUrl: SAMPLE_AUDIO },
  { num: 11, title: 'Fourth Quarter Surge', versions: 3, commentCount: 2, desc: 'Late-game momentum with rising drums and bold guitar stabs.', audioUrl: SAMPLE_AUDIO },
  { num: 12, title: 'Halftime Hype', versions: 4, commentCount: 0, desc: 'Mid-show energy lift with anthemic hooks and tight rhythm section.', audioUrl: SAMPLE_AUDIO },
  { num: 13, title: 'Crowd Wave', versions: 5, commentCount: 3, desc: 'Call-and-response rock grooves built for fan cam and stadium cutaways.', audioUrl: SAMPLE_AUDIO },
  { num: 14, title: 'Final Whistle', versions: 3, commentCount: 1, desc: 'Triumphant closing themes with brass hits and celebratory percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 15, title: 'Under the Lights', versions: 4, commentCount: 5, desc: 'Night-game atmosphere with driving bass, synth accents, and wide dynamics.', audioUrl: SAMPLE_AUDIO },
].map((t) => ({
  ...t,
  id: generateTrackId(),
  hasLyrics: Math.random() > 0.45,
  stems: [4, 4, 5, 4, 6, 3, 4, 5, 4, 4, 3, 4, 5, 3, 4][t.num - 1],
  /** Shown as "Recorded …" — mix of full dates (MM/DD/YYYY) and year-only */
  recorded: [
    '02/04/2004',
    '2011',
    '11/20/2018',
    '2015',
    '08/12/2019',
    '2020',
    '2017',
    '03/15/2016',
    '2022',
    '10/01/2023',
    '2018',
    '04/22/2021',
    '2016',
    '09/08/2020',
    '2023',
  ][t.num - 1],
}));

const FAVORITES_TRACKS = TRACKS_BASE.map((t) => {
  if (t.num === 1) return { ...t, commentCount: 0 };
  if (t.num === 3) return { ...t, commentCount: 1 };
  if (t.num === 4) {
    return {
      ...t,
      title: 'Stem - Game Day Energy Drums',
      favoritesStemDisplay: { dimStemIndexes: [1, 2, 3], favoriteStemIndex: 0 },
    };
  }
  if (t.num === 5) return { ...t, title: '#5 Touchdown Change - Underscore' };
  return t;
});

const PROJECTS_TRACKS = TRACKS_BASE.map((t) => {
  if (t.num === 2) return { ...t, title: 'Stadium Anthem' };
  if (t.num === 4) return { ...t, title: 'Game Day Energy' };
  return { ...t };
});

const SEARCH_EXTRA_TRACKS = [
  { num: 16, title: 'Monday Night Opener', versions: 4, commentCount: 2, desc: 'Broadcast opener with bold drums, anthemic guitars, and instant prime-time energy.', audioUrl: SAMPLE_AUDIO },
  { num: 17, title: 'End Zone Celebration', versions: 3, commentCount: 0, desc: 'Triumphant scoring moment with brass stabs, crowd lift, and celebratory percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 18, title: 'Sideline Intensity', versions: 5, commentCount: 4, desc: 'Tight, punchy rock with rhythmic grit for bench reactions and sideline cutaways.', audioUrl: SAMPLE_AUDIO },
  { num: 19, title: 'Replay Highlight', versions: 3, commentCount: 1, desc: 'Dynamic build-and-release groove tailored for slow-motion replay packages.', audioUrl: SAMPLE_AUDIO },
  { num: 20, title: 'Locker Room Victory', versions: 4, commentCount: 3, desc: 'Post-game celebration with soaring hooks, wide dynamics, and championship feel.', audioUrl: SAMPLE_AUDIO },
].map((t) => ({
  ...t,
  id: generateTrackId(),
  hasLyrics: Math.random() > 0.45,
  stems: [4, 3, 5, 3, 4][t.num - 16],
  recorded: ['2019', '06/14/2022', '2021', '11/03/2020', '2024'][t.num - 16],
}));

const SEARCH_RESULTS_TRACKS = [...PROJECTS_TRACKS, ...SEARCH_EXTRA_TRACKS];

export { PROJECTS_TRACKS, FAVORITES_TRACKS, SEARCH_RESULTS_TRACKS };

const ALBUMS = [
  { num: 1, title: 'Stadium Anthems', commentCount: 0, desc: 'Collection of high-energy stadium rock tracks for Monday Night Football.', audioUrl: SAMPLE_AUDIO },
  { num: 2, title: 'Game Day Essentials', commentCount: 1, desc: 'Essential game day music with anthemic rock and driving percussion.', audioUrl: SAMPLE_AUDIO },
  { num: 3, title: 'Championship Pack', commentCount: 0, desc: 'Epic themes and victory marches for championship coverage.', audioUrl: SAMPLE_AUDIO },
  { num: 4, title: 'Prime Time Sounds', commentCount: 0, desc: 'Broadcast-ready tracks with punchy hooks and tight production.', audioUrl: SAMPLE_AUDIO },
  { num: 5, title: 'Victory Lap', commentCount: 2, desc: 'Celebratory anthems for winning moments and post-game highlights.', audioUrl: SAMPLE_AUDIO },
  { num: 6, title: 'Pregame Hype', commentCount: 4, desc: 'High-octane openers to energize the crowd before kickoff.', audioUrl: SAMPLE_AUDIO },
  { num: 7, title: 'Halftime Show', commentCount: 1, desc: 'Dynamic tracks for halftime performances and break segments.', audioUrl: SAMPLE_AUDIO },
  { num: 8, title: 'Overtime Drama', commentCount: 6, desc: 'Suspenseful and tense themes for nail-biting overtime moments.', audioUrl: SAMPLE_AUDIO },
  { num: 9, title: 'Broadcast Bumpers', commentCount: 0, desc: 'Short stingers and transition cues for commercial breaks.', audioUrl: SAMPLE_AUDIO },
  { num: 10, title: 'Fan Favorites', commentCount: 8, desc: 'Crowd-pleasing hits curated from the most requested game day tracks.', audioUrl: SAMPLE_AUDIO },
].map((a) => ({
  ...a,
  id: generateTrackId(),
  hasLyrics: Math.random() > 0.45,
  recorded: [
    '2010',
    '06/22/2014',
    '2018',
    '01/30/2017',
    '2021',
    '09/05/2013',
    '2012',
    '04/18/2019',
    '2023',
    '2016',
  ][a.num - 1],
}));

export function TrackListTabs({ activeTab, onTabChange, className, showSearchesTab, showAlbumsTab = true }) {
  return (
    <div className={`tabs ${className || ''}`.trim()}>
      <button
        type="button"
        data-tab="tracks"
        className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
        onClick={() => onTabChange('tracks')}
      >
        Tracks
      </button>
      {showAlbumsTab && (
        <button
          type="button"
          data-tab="albums"
          className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => onTabChange('albums')}
        >
          Albums
        </button>
      )}
      {showSearchesTab && (
        <button
          type="button"
          data-tab="searches"
          className={`tab ${activeTab === 'searches' ? 'active' : ''}`}
          onClick={() => onTabChange('searches')}
        >
          Searches
        </button>
      )}
    </div>
  );
}

function getTotalVersionCount(tracks) {
  if (!tracks?.length) return 0;
  const hasVersionData = tracks.some((track) => typeof track.versions === 'number');
  if (hasVersionData) {
    return tracks.reduce((sum, track) => sum + (track.versions ?? 4), 0);
  }
  return tracks.length * 4;
}

function formatTrackCountLabel(activeTab, tracks, { isEmptyProject = false } = {}) {
  if (activeTab === 'tracks') {
    const trackCount = tracks.length;
    const versionCount = getTotalVersionCount(tracks);
    return `${trackCount} TITLES ${versionCount} VERSIONS`;
  }
  if (activeTab === 'albums') {
    return isEmptyProject ? '0 Albums' : `${ALBUMS.length} Albums`;
  }
  return '0 Searches';
}

export function TrackListTrackCount({ activeTab, tracks }) {
  const resolvedTracks = tracks || FAVORITES_TRACKS;
  return <span className="track-count">{formatTrackCountLabel(activeTab, resolvedTracks)}</span>;
}

function SelectionBarPortal({ hostRef, active, children }) {
  const [mountNode, setMountNode] = useState(null);

  useLayoutEffect(() => {
    if (!active) {
      setMountNode(null);
      return undefined;
    }

    const syncMountNode = () => {
      setMountNode(hostRef.current ?? null);
    };

    syncMountNode();
    if (!hostRef.current) {
      const frame = requestAnimationFrame(syncMountNode);
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [active, hostRef]);

  if (!active || !mountNode) return null;
  return createPortal(children, mountNode);
}

function TracksSelectionBar({
  selectedCount,
  selectedTrackCount = 0,
  totalCount = 0,
  onPlay,
  onSoundsLike,
  onDeselect,
  onSelectAll,
  showRemove,
  onRemove,
  showSoundsLike = true,
  withSelectAll = false,
}) {
  const theme = useThemeName();
  const selectAllRef = useRef(null);
  const label = selectedCount === 1 ? '1 SELECTED' : `${selectedCount} SELECTED`;
  const allSelected = totalCount > 0 && selectedTrackCount === totalCount;
  const isIndeterminate = selectedCount > 0 && !allSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = isIndeterminate;
    el.checked = allSelected;
  }, [allSelected, isIndeterminate]);

  const handleSelectAllToggle = () => {
    if (allSelected) onDeselect();
    else onSelectAll?.();
  };

  return (
    <div className={`tracks-selection-bar${withSelectAll ? ' tracks-selection-bar--with-select-all' : ''}`}>
      {withSelectAll ? (
        <div className="tracks-selection-lead">
          <div className="tracks-selection-checkbox-col">
            <input
              ref={selectAllRef}
              type="checkbox"
              className="track-checkbox tracks-selection-select-all"
              checked={allSelected}
              onChange={handleSelectAllToggle}
              aria-label={allSelected ? 'Deselect all tracks' : 'Select all tracks'}
            />
          </div>
          <div className="tracks-selection-meta">
            <span className="tracks-selection-count">{label}</span>
            <span className="tracks-selection-divider" aria-hidden="true" />
            <button type="button" className="tracks-selection-deselect" onClick={onDeselect}>
              DESELECT
            </button>
          </div>
        </div>
      ) : (
        <div className="tracks-selection-meta">
          <span className="tracks-selection-count">{label}</span>
          <span className="tracks-selection-divider" aria-hidden="true" />
          <button type="button" className="tracks-selection-deselect" onClick={onDeselect}>
            DESELECT
          </button>
        </div>
      )}
      <div className="tracks-selection-actions">
        <button type="button" className="tracks-selection-action tracks-selection-action--play" onClick={onPlay} aria-label="Play">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="tracks-selection-action-label">Play</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Favorite">
          <img src={resolveThemedAsset(ICON_FAVORITE_OUTLINE, theme)} alt="" />
          <span className="tracks-selection-action-label">Favorite</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Share">
          <img src="/icons/Upload.svg" alt="" />
          <span className="tracks-selection-action-label">Share</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Add">
          <img src="/icons/add.svg" alt="" />
          <span className="tracks-selection-action-label">Add</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Download">
          <img src="/icons/download.svg" alt="" />
          <span className="tracks-selection-action-label">Download</span>
        </button>
        {showSoundsLike && (
          <button type="button" className="tracks-selection-action" onClick={onSoundsLike} aria-label="Sounds like">
            <img src={ICON_SOUNDS_LIKE} alt="" />
            <span className="tracks-selection-action-label">Sounds Like</span>
          </button>
        )}
        {showRemove && (
          <button type="button" className="tracks-selection-action" onClick={onRemove} aria-label="Remove">
            <img src="/icons/close.svg" alt="" />
            <span className="tracks-selection-action-label">Remove</span>
          </button>
        )}
      </div>
    </div>
  );
}

function getReorderDropIndicator({
  sortableId,
  rawId,
  isMultiDragActive,
  activeDragId,
  activeOverId,
  selectedIds,
  sortableIds,
  useLineDropIndicator = false,
}) {
  if (!activeDragId || !activeOverId || sortableId !== activeOverId) {
    return null;
  }
  if (selectedIds.has(rawId)) {
    return null;
  }

  const activeIndex = sortableIds.indexOf(activeDragId);
  const overIndex = sortableIds.indexOf(activeOverId);
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return null;
  }

  if (!useLineDropIndicator && !isMultiDragActive) {
    return null;
  }

  return activeIndex < overIndex ? 'after' : 'before';
}

function TrackReorderDropSlot({ compact, mobileTrackLayout }) {
  const className = [
    'track-reorder-drop-slot',
    compact ? 'track-reorder-drop-slot--compact' : '',
    mobileTrackLayout ? 'track-reorder-drop-slot--mobile' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={className} aria-hidden="true" />;
}

function TrackReorderDropLine() {
  return <div className="track-reorder-drop-line" aria-hidden="true" />;
}

function SortableTrackRow({
  track,
  isSelected,
  activeDragId = null,
  isMultiDragActive = false,
  onReorderRowClick,
  trackReorderLandAnimation = null,
  showReorderModeUi = false,
  useLineDropIndicator = false,
  flipOffset = null,
  isFlipAnimating = false,
  isHiddenDuringSettle = false,
  ...trackRowProps
}) {
  const [isPointerDown, setIsPointerDown] = useState(false);

  const isCompanionSlot =
    !useLineDropIndicator &&
    isMultiDragActive &&
    isSelected &&
    activeDragId != null &&
    track.id !== activeDragId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
    data: { type: 'track-reorder', track },
    disabled: isCompanionSlot,
  });

  useEffect(() => {
    if (!isPointerDown) return undefined;
    const clearPointerDown = () => setIsPointerDown(false);
    window.addEventListener('pointerup', clearPointerDown, { capture: true });
    window.addEventListener('pointercancel', clearPointerDown, { capture: true });
    return () => {
      window.removeEventListener('pointerup', clearPointerDown, { capture: true });
      window.removeEventListener('pointercancel', clearPointerDown, { capture: true });
    };
  }, [isPointerDown]);

  useEffect(() => {
    if (!isDragging && activeDragId == null) {
      setIsPointerDown(false);
    }
  }, [activeDragId, isDragging]);

  const sortableListeners = useMemo(() => {
    if (!useLineDropIndicator || !listeners) return listeners;
    return {
      ...listeners,
      onPointerDown: (event) => {
        listeners.onPointerDown?.(event);
        setIsPointerDown(true);
      },
    };
  }, [listeners, useLineDropIndicator]);

  const isGrabbed =
    useLineDropIndicator &&
    (isPointerDown ||
      isDragging ||
      (isMultiDragActive && isSelected && activeDragId != null));

  const freezeLayout = useLineDropIndicator && (activeDragId != null || isFlipAnimating);
  const flipTransform =
    flipOffset != null ? `translate3d(0, ${flipOffset}px, 0)` : null;
  const sortableTransform = CSS.Transform.toString(transform);
  const style = {
    transform: flipTransform ?? (freezeLayout ? undefined : sortableTransform || undefined),
    transition: isFlipAnimating
      ? `transform ${TRACK_REORDER_FLIP_MS}ms cubic-bezier(0.2, 0, 0, 1)`
      : freezeLayout
        ? undefined
        : transition,
    zIndex: flipOffset != null && Math.abs(flipOffset) > 1 ? 2 : undefined,
  };

  if (isCompanionSlot) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="track-row-sortable track-row-sortable--multi-drag-companion"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-track-id={track.id}
      className={`track-row-sortable${isDragging && !useLineDropIndicator ? ' track-row-sortable--placeholder' : ''}${isDragging && useLineDropIndicator ? ' track-row-sortable--drag-in-place' : ''}${isDragging && isMultiDragActive && !useLineDropIndicator ? ' track-row-sortable--multi-drag-active' : ''}${isFlipAnimating ? ' track-row-sortable--flip-animating' : ''}${isHiddenDuringSettle ? ' track-row-sortable--settle-hidden' : ''}${isSelected ? ' track-row-sortable--selected' : ''}`}
      {...attributes}
      {...sortableListeners}
    >
      <TrackRow
        track={track}
        reorderMode={showReorderModeUi}
        isSortableDragging={useLineDropIndicator ? false : isDragging}
        isGrabbed={isGrabbed}
        isSelected={isSelected}
        onReorderRowClick={onReorderRowClick}
        trackReorderLandAnimation={useLineDropIndicator ? null : trackReorderLandAnimation}
        {...trackRowProps}
      />
    </div>
  );
}

function SortableFolderRow({
  folder,
  trackCount,
  isSelected,
  activeDragId = null,
  onReorderRowClick,
  showReorderModeUi = false,
  folderReorderLandAnimation = null,
  mobileLayout = false,
  onIconClick,
  canCollapseFolders = false,
}) {
  const sortableId = toFolderSortableId(folder.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: { type: 'folder-reorder', folder },
  });

  const freezeLayout = activeDragId != null;
  const style = {
    transform: freezeLayout ? undefined : CSS.Transform.toString(transform) || undefined,
    transition: freezeLayout ? undefined : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-folder-id={folder.id}
      className={`project-folder-row-sortable${isDragging ? ' project-folder-row-sortable--drag-in-place' : ''}${isSelected ? ' project-folder-row-sortable--selected' : ''}`}
      {...attributes}
      {...listeners}
    >
      <ProjectFolderRow
        folder={folder}
        trackCount={trackCount}
        mobileLayout={mobileLayout}
        onIconClick={canCollapseFolders ? onIconClick : undefined}
        isSelected={isSelected}
        reorderMode={showReorderModeUi}
        onReorderRowClick={onReorderRowClick}
        folderReorderLandAnimation={folderReorderLandAnimation}
        showCheckbox={false}
      />
    </div>
  );
}

function TrackReorderSettleGhost({ ghost, onComplete }) {
  const nodeRef = useRef(null);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    node.style.transform = 'translate3d(0, 0, 0)';
    node.style.transition = 'none';

    let completeTimer = null;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        node.style.transition = `transform ${TRACK_REORDER_FLIP_MS}ms cubic-bezier(0.2, 0, 0, 1)`;
        node.style.transform = `translate3d(${ghost.deltaX}px, ${ghost.deltaY}px, 0)`;
      });
    });

    completeTimer = window.setTimeout(onComplete, TRACK_REORDER_FLIP_MS + 40);

    return () => {
      window.cancelAnimationFrame(frame);
      if (completeTimer != null) window.clearTimeout(completeTimer);
    };
  }, [ghost, onComplete]);

  return createPortal(
    <div
      ref={nodeRef}
      className="track-reorder-settle-ghost"
      style={{
        position: 'fixed',
        top: ghost.fromRect.top,
        left: ghost.fromRect.left,
        width: ghost.fromRect.width,
        zIndex: 1200,
        pointerEvents: 'none',
      }}
    >
      <TrackRow track={ghost.track} {...ghost.rowProps} />
    </div>,
    document.body
  );
}

function TrackReorderDragOverlay({ track, selectedCount }) {
  if (!track) return null;

  const isMultiMove = selectedCount > 1;
  return (
    <div className="track-reorder-drag-overlay">
      {isMultiMove ? (
        <div className="projects-track-drag-thumb track-reorder-drag-overlay-multi" aria-hidden>
          <span className="projects-track-drag-thumb-title">
            Move {selectedCount} Tracks
          </span>
        </div>
      ) : (
        <TrackDragThumbnail track={track} />
      )}
    </div>
  );
}

function TrackList({ soundsLikePanelOpen, onSoundsLikeClick, onSoundsLikeWithSelection, activeTab: controlledTab, onTabChange, tabsInBreadcrumb, selectionBarHostRef, compactTrackRows, trackViewMode, onTrackViewModeChange, searchCustomize, onSearchCustomizeChange, searchSortBy, onSearchSortByChange, customizeViewOptions, headerActionsVariant = 'default', hideTrackComments = false, hideCloseAction = false, showSearchesTab = false, tracks: tracksProp, childFolders, onFolderSelect, projectTrackCount = 0, enableTrackDetailsOverlay = false, trackTitleBadges, enterHighlightTrackNum, scrollToBottomSignal, showVersionsStems = false, hideTracksHeader = false, emptyTracksMessage, emptyState, sectionClassName, disableWaveformHighlights = false, onSelectionActiveChange, enableTrackDragToFolder = false, sourceFolderId = null, activeTrackDragId = null, onTracksReorder = null, onTracksReorderCancel = null, onFoldersReorder = null, onFoldersReorderCancel = null }) {
  const tracks = tracksProp ?? FAVORITES_TRACKS;
  const compact = compactTrackRows ?? tabsInBreadcrumb;
  const gridView = trackViewMode === 'grid';
  const defaultListView = trackViewMode === 'default';
  const condensedViewActions = trackViewMode === 'condensed';
  const simplifiedViewActions = trackViewMode === 'simplified';
  const showRemoveFromProject =
    simplifiedViewActions ||
    (condensedViewActions && headerActionsVariant !== 'search');
  const showSelectionRemove = headerActionsVariant !== 'search' && !tabsInBreadcrumb;
  const customizeOptions =
    customizeViewOptions ??
    (onTrackViewModeChange && headerActionsVariant !== 'search'
      ? PROJECTS_CUSTOMIZE_VIEW_OPTIONS
      : undefined);
  const [internalTab, setInternalTab] = useState('tracks');
  const activeTab = controlledTab ?? internalTab;
  const showGridView = gridView && (activeTab === 'tracks' || activeTab === 'albums');
  const setActiveTab = onTabChange ?? setInternalTab;
  const hasChildFolders =
    Array.isArray(childFolders) &&
    childFolders.length > 0;
  const isEmptyProject = emptyState === 'empty-project';
  const foldersOnlyView = hasChildFolders && tracks.length === 0;
  const showChildFolders =
    hasChildFolders &&
    (activeTab === 'tracks' || activeTab === 'albums');
  const showAlbumRows =
    activeTab === 'albums' &&
    !isEmptyProject &&
    !foldersOnlyView;
  const { playTrack, playQueue, togglePlayPause, currentTrack, isPlaying } = usePlayer();
  const listEndRef = useRef(null);
  const [mobileTrackLayout, setMobileTrackLayout] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [foldersCollapsed, setFoldersCollapsed] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [activeReorderTrack, setActiveReorderTrack] = useState(null);
  const [activeReorderFolder, setActiveReorderFolder] = useState(null);
  const [folderReorderLandAnimation, setFolderReorderLandAnimation] = useState(null);
  const [activeReorderSelectedCount, setActiveReorderSelectedCount] = useState(1);
  const [activeReorderOverId, setActiveReorderOverId] = useState(null);
  const [trackReorderLandAnimation, setTrackReorderLandAnimation] = useState(null);
  const [trackFlipOffsets, setTrackFlipOffsets] = useState(null);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const [settleGhost, setSettleGhost] = useState(null);
  const [hiddenSettleTrackIds, setHiddenSettleTrackIds] = useState(null);
  const flipAnimatingTimerRef = useRef(null);
  const settleAnimatingTimerRef = useRef(null);
  const settleRowPropsRef = useRef(null);
  const reorderDragActiveRef = useRef(false);
  const reorderOverlayClearTimerRef = useRef(null);
  const trackReorderLandTimerRef = useRef(null);
  const reorderSnapshotRef = useRef(null);
  const reorderFolderOrderSnapshotRef = useRef(null);
  const childFolderIdsKey = (childFolders ?? []).map((folder) => folder.id).join(',');
  const canReorderTracks =
    headerActionsVariant !== 'search' &&
    Boolean(onTracksReorder) &&
    tracks.length > 1;
  const canReorderFolders =
    headerActionsVariant !== 'search' &&
    Boolean(onFoldersReorder) &&
    hasChildFolders &&
    (childFolders?.length ?? 0) > 1;
  const showReorderModeToggle = canReorderTracks || canReorderFolders;
  const trackSortableIds = useMemo(() => tracks.map((track) => track.id), [tracks]);
  const folderSortableIds = useMemo(
    () => (childFolders ?? []).map((folder) => toFolderSortableId(folder.id)),
    [childFolders]
  );
  const allReorderSortableIds = useMemo(
    () => [...folderSortableIds, ...trackSortableIds],
    [folderSortableIds, trackSortableIds]
  );
  const canCollapseFolders = hasChildFolders && childFolders.length > 1 && !reorderMode;

  const reorderSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setReorderMode(false);
    setActiveReorderTrack(null);
    reorderSnapshotRef.current = null;
  }, [childFolderIdsKey, sourceFolderId]);

  const scheduleReorderOverlayClear = useCallback((afterClear, duration = TRACK_REORDER_DROP_ANIMATION_MS) => {
    if (reorderOverlayClearTimerRef.current != null) {
      window.clearTimeout(reorderOverlayClearTimerRef.current);
    }
    reorderOverlayClearTimerRef.current = window.setTimeout(() => {
      reorderOverlayClearTimerRef.current = null;
      afterClear?.();
    }, duration);
  }, []);

  const clearReorderOverlayTimers = useCallback(() => {
    if (reorderOverlayClearTimerRef.current != null) {
      window.clearTimeout(reorderOverlayClearTimerRef.current);
      reorderOverlayClearTimerRef.current = null;
    }
    if (trackReorderLandTimerRef.current != null) {
      window.clearTimeout(trackReorderLandTimerRef.current);
      trackReorderLandTimerRef.current = null;
    }
    if (flipAnimatingTimerRef.current != null) {
      window.clearTimeout(flipAnimatingTimerRef.current);
      flipAnimatingTimerRef.current = null;
    }
    if (settleAnimatingTimerRef.current != null) {
      window.clearTimeout(settleAnimatingTimerRef.current);
      settleAnimatingTimerRef.current = null;
    }
  }, []);

  const clearSettleGhost = useCallback(() => {
    setSettleGhost(null);
    setHiddenSettleTrackIds(null);
    if (settleAnimatingTimerRef.current != null) {
      window.clearTimeout(settleAnimatingTimerRef.current);
      settleAnimatingTimerRef.current = null;
    }
  }, []);

  const clearSettleAnimation = useCallback(() => {
    clearSettleGhost();
    setTrackFlipOffsets(null);
    setIsFlipAnimating(false);
    if (flipAnimatingTimerRef.current != null) {
      window.clearTimeout(flipAnimatingTimerRef.current);
      flipAnimatingTimerRef.current = null;
    }
  }, [clearSettleGhost]);

  const resetReorderUiState = useCallback(() => {
    setSelectedIds(new Set());
    setActiveReorderTrack(null);
    setActiveReorderFolder(null);
    setActiveReorderSelectedCount(1);
    setActiveReorderOverId(null);
    setTrackReorderLandAnimation(null);
    setFolderReorderLandAnimation(null);
    clearReorderOverlayTimers();
    clearSettleAnimation();
    reorderDragActiveRef.current = false;
  }, [clearReorderOverlayTimers, clearSettleAnimation]);

  const enterReorderMode = useCallback(() => {
    reorderSnapshotRef.current = tracks.map((track) => ({ ...track }));
    reorderFolderOrderSnapshotRef.current = (childFolders ?? []).map((folder) => folder.id);
    setFoldersCollapsed(false);
    setReorderMode(true);
  }, [tracks, childFolders]);

  const finishReorderMode = useCallback(() => {
    reorderSnapshotRef.current = null;
    reorderFolderOrderSnapshotRef.current = null;
    resetReorderUiState();
    setReorderMode(false);
  }, [resetReorderUiState]);

  const cancelReorderMode = useCallback(() => {
    const snapshot = reorderSnapshotRef.current;
    const folderOrderSnapshot = reorderFolderOrderSnapshotRef.current;
    reorderSnapshotRef.current = null;
    reorderFolderOrderSnapshotRef.current = null;
    resetReorderUiState();
    setReorderMode(false);
    if (snapshot) {
      onTracksReorderCancel?.(snapshot);
    }
    if (folderOrderSnapshot && sourceFolderId) {
      onFoldersReorderCancel?.(sourceFolderId, folderOrderSnapshot);
    }
  }, [onFoldersReorderCancel, onTracksReorderCancel, resetReorderUiState, sourceFolderId]);

  useEffect(() => {
    if (!reorderMode) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        cancelReorderMode();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [reorderMode, cancelReorderMode]);

  const handleReorderRowClick = useCallback((trackId) => {
    if (reorderDragActiveRef.current) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  }, []);

  const handleReorderDragStart = useCallback(
    (event) => {
      reorderDragActiveRef.current = true;
      setActiveReorderOverId(null);
      const dragType = event.active.data.current?.type;

      if (dragType === 'folder-reorder') {
        const folder = event.active.data.current?.folder;
        if (!folder) return;
        setActiveReorderFolder(folder);
        setActiveReorderTrack(null);
        setActiveReorderSelectedCount(1);
        return;
      }

      const track = event.active.data.current?.track;
      if (!track) return;
      setActiveReorderFolder(null);
      if (selectedIds.has(track.id)) {
        setActiveReorderSelectedCount(Math.max(1, selectedIds.size));
      } else {
        setActiveReorderSelectedCount(1);
      }
      setActiveReorderTrack(track);
    },
    [selectedIds]
  );

  const handleReorderDragOver = useCallback((event) => {
    const overId = event.over?.id != null ? String(event.over.id) : null;
    setActiveReorderOverId(overId);
  }, []);

  const handleReorderDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      const activeSortableId = String(active.id);
      const overSortableId = over ? String(over.id) : null;

      const finishWithoutReorder = () => {
        clearReorderOverlayTimers();
        setTrackReorderLandAnimation(null);
        setFolderReorderLandAnimation(null);
        setActiveReorderTrack(null);
        setActiveReorderFolder(null);
        setActiveReorderSelectedCount(1);
        setActiveReorderOverId(null);
        reorderDragActiveRef.current = false;
      };

      if (!over || active.id === over.id) {
        finishWithoutReorder();
        return;
      }

      const activeIsFolder = isFolderSortableId(activeSortableId);
      const overIsFolder = isFolderSortableId(overSortableId);
      if (activeIsFolder !== overIsFolder) {
        finishWithoutReorder();
        return;
      }

      if (activeIsFolder) {
        const activeFolderId = parseFolderSortableId(activeSortableId);
        const overFolderId = parseFolderSortableId(overSortableId);
        if (!activeFolderId || !overFolderId || activeFolderId === overFolderId) {
          finishWithoutReorder();
          return;
        }

        clearReorderOverlayTimers();
        setActiveReorderFolder(null);
        setActiveReorderOverId(null);
        reorderDragActiveRef.current = false;

        flushSync(() => {
          onFoldersReorder?.(activeFolderId, overFolderId, sourceFolderId);
        });

        if (trackReorderLandTimerRef.current != null) {
          window.clearTimeout(trackReorderLandTimerRef.current);
        }
        trackReorderLandTimerRef.current = window.setTimeout(() => {
          trackReorderLandTimerRef.current = null;
          setFolderReorderLandAnimation({ folderId: activeFolderId, key: Date.now() });
        }, TRACK_REORDER_DROP_ANIMATION_MS);
        return;
      }

      const activeId = activeSortableId;
      const overId = overSortableId;
      const movingIds = selectedIds.has(activeId) ? [...selectedIds] : [activeId];

      clearReorderOverlayTimers();

      const draggedTrack = event.active.data.current?.track;
      if (!draggedTrack) {
        finishWithoutReorder();
        return;
      }

      const movingIdSet = new Set(movingIds.map(String));
      const beforeRects = captureTrackRowRects(trackSortableIds);
      const fromRect = getTrackRowElement(activeId)?.getBoundingClientRect();

      setActiveReorderTrack(null);
      setActiveReorderSelectedCount(1);
      setActiveReorderOverId(null);
      reorderDragActiveRef.current = false;

      flushSync(() => {
        onTracksReorder?.(activeId, overId, movingIds);
      });

      const toRect = getTrackRowElement(activeId)?.getBoundingClientRect();
      const rowProps = settleRowPropsRef.current?.(draggedTrack);

      if (fromRect && toRect && rowProps) {
        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;

        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          flushSync(() => {
            setHiddenSettleTrackIds(movingIdSet);
            setSettleGhost({
              track: draggedTrack,
              rowProps,
              fromRect: {
                top: fromRect.top,
                left: fromRect.left,
                width: fromRect.width,
              },
              deltaX,
              deltaY,
            });
          });
        }
      }

      const siblingIds = trackSortableIds.filter((id) => !movingIdSet.has(String(id)));
      const siblingOffsets = computeTrackRowFlipOffsets(beforeRects, siblingIds);

      if (Object.keys(siblingOffsets).length > 0) {
        flushSync(() => {
          setTrackFlipOffsets(siblingOffsets);
          setIsFlipAnimating(true);
        });

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setTrackFlipOffsets((prev) => {
              if (!prev) return prev;
              const settled = {};
              for (const id of Object.keys(prev)) settled[id] = 0;
              return settled;
            });
          });
        });

        flipAnimatingTimerRef.current = window.setTimeout(() => {
          flipAnimatingTimerRef.current = null;
          setTrackFlipOffsets(null);
          setIsFlipAnimating(false);
        }, TRACK_REORDER_FLIP_MS + 48);
      }

      settleAnimatingTimerRef.current = window.setTimeout(() => {
        settleAnimatingTimerRef.current = null;
        clearSettleGhost();
      }, TRACK_REORDER_FLIP_MS + 64);
    },
    [clearReorderOverlayTimers, clearSettleGhost, onFoldersReorder, onTracksReorder, selectedIds, sourceFolderId, trackSortableIds]
  );

  const handleReorderDragCancel = useCallback(() => {
    clearReorderOverlayTimers();
    clearSettleAnimation();
    setActiveReorderTrack(null);
    setActiveReorderFolder(null);
    setActiveReorderSelectedCount(1);
    setActiveReorderOverId(null);
    setTrackReorderLandAnimation(null);
    setFolderReorderLandAnimation(null);
    reorderDragActiveRef.current = false;
  }, [clearReorderOverlayTimers, clearSettleAnimation]);

  useEffect(() => {
    if (!folderReorderLandAnimation) return;
    const timer = window.setTimeout(() => setFolderReorderLandAnimation(null), TRACK_REORDER_LAND_MS);
    return () => window.clearTimeout(timer);
  }, [folderReorderLandAnimation]);

  useEffect(() => {
    if (!reorderMode) {
      clearReorderOverlayTimers();
      clearSettleAnimation();
      setTrackReorderLandAnimation(null);
    }
  }, [clearReorderOverlayTimers, clearSettleAnimation, reorderMode]);

  useEffect(() => {
    return () => clearReorderOverlayTimers();
  }, [clearReorderOverlayTimers]);

  useEffect(() => {
    setFoldersCollapsed(false);
  }, [childFolderIdsKey]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileTrackLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (scrollToBottomSignal == null || scrollToBottomSignal === 0) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [scrollToBottomSignal]);

  const isCurrentTrack = (item) =>
    currentTrack && ((item.id && item.id === currentTrack.id) || (item.num === currentTrack.num));

  const hasHeaderContent = !tabsInBreadcrumb && !hideTracksHeader;
  const currentTracks = activeTab === 'tracks' ? tracks : ALBUMS;
  const handlePlayAll = () => playQueue(currentTracks, 0);
  const handleShuffleAll = () => {
    const shuffled = [...currentTracks];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    playQueue(shuffled, 0);
  };

  const handleSelectChange = (id, selected) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const selectedTrackCount = currentTracks.filter((item) => selectedIds.has(item.id)).length;
  const hasSelection = selectedCount > 0 && !reorderMode;
  const selectionBarWithSelectAll =
    headerActionsVariant === 'search' || tabsInBreadcrumb || headerActionsVariant === 'default';
  const hideHeaderTabsOnSelection =
    hasSelection && selectionBarWithSelectAll && (headerActionsVariant === 'search' || !tabsInBreadcrumb);

  useLayoutEffect(() => {
    onSelectionActiveChange?.(hasSelection);
  }, [hasSelection, onSelectionActiveChange]);

  const handlePlaySelected = () => {
    const queue = [];
    for (const item of currentTracks) {
      if (selectedIds.has(item.id)) queue.push(item);
    }
    for (const track of tracks) {
      for (const stem of getStemItems(track)) {
        if (selectedIds.has(stem.id)) {
          queue.push({ ...stem, id: stem.id, num: stem.waveformIndex });
        }
      }
    }
    if (queue.length > 0) playQueue(queue, 0);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      currentTracks.forEach((item) => next.add(item.id));
      if (showChildFolders && !foldersCollapsed) {
        childFolders.forEach((folder) => next.add(folder.id));
      }
      return next;
    });
  };

  const handleRemoveSelected = () => {
    setSelectedIds(new Set());
  };

  const handleSoundsLikeSelected = () => {
    const selected = currentTracks.filter((item) => selectedIds.has(item.id));
    if (selected.length > 0) {
      onSoundsLikeWithSelection?.(selected);
      setSelectedIds(new Set());
    }
  };

  const selectionBar = (
    <TracksSelectionBar
      selectedCount={selectedCount}
      selectedTrackCount={selectedTrackCount}
      totalCount={currentTracks.length}
      onPlay={handlePlaySelected}
      onSoundsLike={handleSoundsLikeSelected}
      onDeselect={handleDeselectAll}
      onSelectAll={handleSelectAll}
      showRemove={showSelectionRemove}
      onRemove={handleRemoveSelected}
      showSoundsLike={headerActionsVariant !== 'search'}
      withSelectAll={selectionBarWithSelectAll}
    />
  );

  const trackCountLabel = formatTrackCountLabel(activeTab, tracks, { isEmptyProject });

  const showEmptyProjectState =
    isEmptyProject &&
    (activeTab === 'tracks' || activeTab === 'albums') &&
    tracks.length === 0 &&
    !hasChildFolders;

  const searchCustomizeMenu =
    onSearchCustomizeChange && headerActionsVariant === 'search' ? (
      <SearchCustomizeViewMenu value={searchCustomize} onChange={onSearchCustomizeChange} />
    ) : null;

  const searchSortMenu = onSearchSortByChange ? (
    <SearchSortMenu value={searchSortBy} onChange={onSearchSortByChange} />
  ) : null;

  const reorderModeActions = showReorderModeToggle ? (
    <>
      <button type="button" className="btn-secondary" onClick={cancelReorderMode}>
        CANCEL
      </button>
      <button type="button" className="btn-invite btn-reorder-done" onClick={finishReorderMode}>
        DONE
      </button>
    </>
  ) : null;

  const projectCustomizeMenu =
    onSearchCustomizeChange && headerActionsVariant !== 'search' ? (
      <ProjectCustomizeMenus
        value={searchCustomize ?? DEFAULT_PROJECT_CUSTOMIZE}
        onChange={onSearchCustomizeChange}
      />
    ) : null;

  const reorderButton = showReorderModeToggle ? (
    <button
      type="button"
      className="btn-secondary tracks-toolbar-reorder-btn"
      onClick={enterReorderMode}
      aria-pressed={false}
      aria-label="Reorder tracks"
    >
      <img src={ICON_REORDER} alt="" />
      <span className="tracks-toolbar-btn-label">Reorder</span>
    </button>
  ) : null;

  const mobileReorderButton = showReorderModeToggle ? (
    <button
      type="button"
      className="btn-secondary tracks-toolbar-reorder-btn tracks-mobile-toolbar-reorder"
      onClick={enterReorderMode}
      aria-pressed={false}
      aria-label="Reorder tracks"
    >
      <img src={ICON_REORDER} alt="" />
      <span className="tracks-toolbar-btn-label">Reorder</span>
    </button>
  ) : null;

  const playShuffleActions = (
    <>
      <ToolbarIconButton label="Play All" onClick={handlePlayAll}>
        <PlayAllIcon />
      </ToolbarIconButton>
      <ToolbarIconButton label="Shuffle" onClick={handleShuffleAll}>
        <ShuffleIcon />
      </ToolbarIconButton>
    </>
  );

  const tracksActions = headerActionsVariant === 'search' ? (
    <>
      {searchCustomizeMenu ?? (
        onTrackViewModeChange ? (
          <CustomizeViewMenu viewMode={trackViewMode} onViewModeChange={onTrackViewModeChange} viewOptions={customizeOptions} />
        ) : (
          <button type="button" className="btn-secondary"><img src={ICON_CUSTOMIZE} alt="" /> CUSTOMIZE</button>
        )
      )}
      {playShuffleActions}
      {searchSortMenu ?? (
        <button type="button" className="btn-secondary">SORT</button>
      )}
    </>
  ) : (
    !showEmptyProjectState && (
      <>
        {reorderMode ? reorderModeActions : null}
        {!reorderMode && (
          <>
            {projectCustomizeMenu}
            {reorderButton}
            <ToolbarIconButton label="Play All" onClick={handlePlayAll}>
              <PlayAllIcon />
            </ToolbarIconButton>
          </>
        )}
      </>
    )
  );

  const selectionBarActive =
    hasSelection && selectionBarWithSelectAll && activeTab !== 'searches';
  const portalSelectionBar =
    Boolean(selectionBarHostRef) && tabsInBreadcrumb && selectionBarActive;

  const trackRowProps = {
    trackList: tracks,
    isLiked: true,
    soundsLikePanelOpen,
    onSoundsLikeClick,
    onPlay: playTrack,
    onTogglePause: togglePlayPause,
    isPlaying,
    compact,
    condensedViewActions,
    simplifiedViewActions,
    showRemoveFromProject,
    mobileTrackLayout,
    enableTrackDetailsOverlay,
    showVersionsStems,
    hideTrackComments,
    hideCloseAction,
    disableWaveformHighlights,
    selectedIds,
    onSelectChange: handleSelectChange,
    enableTrackDragToFolder: enableTrackDragToFolder && !reorderMode,
    sourceFolderId,
  };

  settleRowPropsRef.current = (track) => ({
    ...trackRowProps,
    track,
    reorderMode: true,
    isCurrentTrack: isCurrentTrack(track),
    titleBadge: trackTitleBadges?.[track.num],
    enterHighlight:
      enterHighlightTrackNum != null &&
      Number(track.num) === Number(enterHighlightTrackNum),
    isSelected: selectedIds.has(track.id),
    isTrackDragSource: activeTrackDragId === getTrackDragId(track.id),
  });

  const isMultiDragActive =
    Boolean(activeReorderTrack) && activeReorderSelectedCount > 1;
  const activeReorderDragId = activeReorderFolder
    ? toFolderSortableId(activeReorderFolder.id)
    : activeReorderTrack?.id ?? null;

  const renderFolderRows = () => {
    if (!showChildFolders) return null;

    if (!reorderMode && canCollapseFolders && foldersCollapsed) {
      return (
        <ProjectFolderRow
          key="folder-collapsed-summary"
          collapsedSummary
          folderCount={childFolders.length}
          onIconClick={() => setFoldersCollapsed(false)}
          mobileLayout={mobileTrackLayout}
        />
      );
    }

    return childFolders.map((folder) => {
      if (reorderMode && canReorderFolders) {
        const sortableId = toFolderSortableId(folder.id);
        const dropIndicator = getReorderDropIndicator({
          sortableId,
          rawId: folder.id,
          isMultiDragActive: false,
          activeDragId: activeReorderDragId,
          activeOverId: activeReorderOverId,
          selectedIds,
          sortableIds: folderSortableIds,
          useLineDropIndicator: true,
        });

        return (
          <Fragment key={`folder-${folder.id}`}>
            {dropIndicator === 'before' ? <TrackReorderDropLine /> : null}
            <SortableFolderRow
              folder={folder}
              trackCount={getFolderTrackCount(folder, projectTrackCount)}
              isSelected={selectedIds.has(folder.id)}
              activeDragId={activeReorderDragId}
              onReorderRowClick={handleReorderRowClick}
              showReorderModeUi
              folderReorderLandAnimation={folderReorderLandAnimation}
              mobileLayout={mobileTrackLayout}
              onIconClick={() => setFoldersCollapsed(true)}
              canCollapseFolders={canCollapseFolders}
            />
            {dropIndicator === 'after' ? <TrackReorderDropLine /> : null}
          </Fragment>
        );
      }

      return (
        <ProjectFolderRow
          key={`folder-${folder.id}`}
          folder={folder}
          trackCount={getFolderTrackCount(folder, projectTrackCount)}
          onSelect={onFolderSelect}
          onIconClick={canCollapseFolders ? () => setFoldersCollapsed(true) : undefined}
          mobileLayout={mobileTrackLayout}
          isSelected={selectedIds.has(folder.id)}
          onSelectChange={handleSelectChange}
        />
      );
    });
  };

  const renderTrackRows = () =>
    tracks.map((track) => {
      const sharedProps = {
        ...trackRowProps,
        track,
        isCurrentTrack: isCurrentTrack(track),
        titleBadge: trackTitleBadges?.[track.num],
        enterHighlight:
          enterHighlightTrackNum != null &&
          Number(track.num) === Number(enterHighlightTrackNum),
        isSelected: selectedIds.has(track.id),
        isTrackDragSource: activeTrackDragId === getTrackDragId(track.id),
      };
      if (reorderMode && canReorderTracks) {
        const sortableId = track.id;
        const dropIndicator = getReorderDropIndicator({
          sortableId,
          rawId: track.id,
          isMultiDragActive,
          activeDragId: activeReorderDragId,
          activeOverId: activeReorderOverId,
          selectedIds,
          sortableIds: trackSortableIds,
          useLineDropIndicator: true,
        });
        return (
          <Fragment key={`track-${track.id}`}>
            {dropIndicator === 'before' ? (
              <TrackReorderDropLine />
            ) : null}
            <SortableTrackRow
              track={track}
              isSelected={selectedIds.has(track.id)}
              activeDragId={activeReorderDragId}
              isMultiDragActive={isMultiDragActive}
              onReorderRowClick={handleReorderRowClick}
              showReorderModeUi
              useLineDropIndicator
              flipOffset={trackFlipOffsets?.[track.id] ?? null}
              isFlipAnimating={isFlipAnimating}
              isHiddenDuringSettle={hiddenSettleTrackIds?.has(String(track.id)) ?? false}
              {...sharedProps}
            />
            {dropIndicator === 'after' ? (
              <TrackReorderDropLine />
            ) : null}
          </Fragment>
        );
      }
      return <TrackRow key={`track-${track.num}`} {...sharedProps} />;
    });

  const trackRowsContent =
    activeTab === 'tracks' && !showGridView ? renderTrackRows() : null;

  const reorderListContent = reorderMode ? (
    <DndContext
      sensors={reorderSensors}
      collisionDetection={closestCenter}
      onDragStart={handleReorderDragStart}
      onDragOver={handleReorderDragOver}
      onDragEnd={handleReorderDragEnd}
      onDragCancel={handleReorderDragCancel}
    >
      <SortableContext items={allReorderSortableIds} strategy={verticalListSortingStrategy}>
        {renderFolderRows()}
        {trackRowsContent}
      </SortableContext>
      <DragOverlay
        dropAnimation={null}
        modifiers={[snapTrackReorderOverlayToCursor]}
        className="track-drag-overlay-shell"
        style={{ width: 'auto', height: 'auto' }}
      >
        {activeReorderTrack ? (
          <TrackReorderDragOverlay
            track={activeReorderTrack}
            selectedCount={activeReorderSelectedCount}
          />
        ) : null}
        {activeReorderFolder ? (
          <div className="track-reorder-drag-overlay">
            <FolderDragThumbnail folder={activeReorderFolder} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  ) : (
    <>
      {renderFolderRows()}
      {trackRowsContent}
    </>
  );

  return (
    <div className={`tracks-section${sectionClassName ? ` ${sectionClassName}` : ''}${condensedViewActions ? ' tracks-section--condensed-view' : ''}${defaultListView ? ' tracks-section--default-view' : ''}${simplifiedViewActions ? ' tracks-section--simplified-view' : ''}${showGridView ? ' tracks-section--grid-view' : ''}${showGridView && searchCustomize?.posterSize ? ` tracks-section--grid-poster-${searchCustomize.posterSize}` : ''}${showEmptyProjectState ? ' tracks-section--empty-project' : ''}${reorderMode ? ' tracks-section--reorder-mode' : ''}`}>
      {settleGhost ? (
        <TrackReorderSettleGhost ghost={settleGhost} onComplete={clearSettleGhost} />
      ) : null}
      {selectionBarHostRef ? (
        <SelectionBarPortal hostRef={selectionBarHostRef} active={portalSelectionBar}>
          {selectionBar}
        </SelectionBarPortal>
      ) : null}
      {hasHeaderContent && (
        <div className="tracks-header">
          {!hideHeaderTabsOnSelection && (
            <TrackListTabs activeTab={activeTab} onTabChange={setActiveTab} showSearchesTab={showSearchesTab} />
          )}
          <div className="tracks-header-meta">
            <div
              className={`tracks-header-meta-default${hasSelection ? ' tracks-header-toolbar-slot--hidden' : ''}`}
              aria-hidden={hasSelection}
            >
              {!foldersOnlyView && (
                <span className="track-count">{trackCountLabel}</span>
              )}
              {!foldersOnlyView && tracksActions && (
                <div className="tracks-actions">
                  {tracksActions}
                </div>
              )}
            </div>
            <div
              className={`tracks-header-meta-selection${hasSelection ? '' : ' tracks-header-toolbar-slot--hidden'}`}
              aria-hidden={!hasSelection}
            >
              {selectionBar}
            </div>
          </div>
        </div>
      )}
      {tabsInBreadcrumb && !hideTracksHeader && selectionBarActive && !selectionBarHostRef && (
        <div className="tracks-selection-bar-row">
          {selectionBar}
        </div>
      )}
      {!(hideTracksHeader && activeTab === 'tracks') && !tabsInBreadcrumb && (
        <div className="track-list-boundary track-list-top" aria-hidden="true" />
      )}
      {hideTracksHeader && activeTab === 'tracks' && (hasSelection || !foldersOnlyView) && (
        <div className="tracks-mobile-toolbar">
          <div
            className={`tracks-mobile-toolbar-default${hasSelection ? ' tracks-header-toolbar-slot--hidden' : ''}`}
            aria-hidden={hasSelection}
          >
            {!foldersOnlyView && (
              <span className="tracks-mobile-toolbar-count">{trackCountLabel}</span>
            )}
            {!foldersOnlyView && (
              <div className="tracks-mobile-toolbar-actions">
                {headerActionsVariant === 'search' ? (
                  <>
                    {searchCustomizeMenu ?? (
                      onTrackViewModeChange ? (
                        <CustomizeViewMenu viewMode={trackViewMode} onViewModeChange={onTrackViewModeChange} viewOptions={customizeOptions} />
                      ) : null
                    )}
                    {playShuffleActions}
                    {searchSortMenu ?? (
                      <button type="button" className="btn-secondary tracks-mobile-toolbar-sort">
                        SORT
                      </button>
                    )}
                  </>
                ) : !showEmptyProjectState ? (
                  <>
                    {reorderMode ? reorderModeActions : null}
                    {!reorderMode && onSearchCustomizeChange ? (
                      <>
                        <ProjectCustomizeMenus
                          value={searchCustomize ?? DEFAULT_PROJECT_CUSTOMIZE}
                          onChange={onSearchCustomizeChange}
                        />
                        {mobileReorderButton}
                        {playShuffleActions}
                      </>
                    ) : null}
                  </>
                ) : null}
              </div>
            )}
          </div>
          <div
            className={`tracks-mobile-toolbar-selection${hasSelection ? '' : ' tracks-header-toolbar-slot--hidden'}`}
            aria-hidden={!hasSelection}
          >
            {selectionBar}
          </div>
        </div>
      )}
      <div className="track-list">
        {reorderListContent}
        {activeTab === 'tracks' && showGridView &&
          tracks.map((track) => (
            <TrackGridCard
              key={`track-grid-${track.num}`}
              track={track}
              trackList={tracks}
              onPlay={playTrack}
              onTogglePause={togglePlayPause}
              onSoundsLikeClick={onSoundsLikeClick}
              isCurrentTrack={isCurrentTrack(track)}
              isPlaying={isPlaying}
              isSelected={selectedIds.has(track.id)}
              onSelectChange={handleSelectChange}
              titleBadge={trackTitleBadges?.[track.num]}
              enterHighlight={
                enterHighlightTrackNum != null &&
                Number(track.num) === Number(enterHighlightTrackNum)
              }
            />
          ))}
        {showEmptyProjectState && (
          <div className="track-list-empty-project">
            <div className="track-list-empty-project__panel">
              <h2 className="track-list-empty-project__title">Empty Project</h2>
              <p className="track-list-empty-project__text">
                Looks like you haven&apos;t added any tracks yet. Click the add icon next to any track or album and they will display here.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'tracks' && tracks.length === 0 && !hasChildFolders && !showEmptyProjectState && emptyTracksMessage && (
          <div className="track-list-empty">{emptyTracksMessage}</div>
        )}
        {showAlbumRows && showGridView &&
          ALBUMS.map((album) => (
            <TrackGridCard
              key={`album-grid-${album.num}`}
              album={album}
              variant="album"
              trackList={ALBUMS}
              onPlay={playTrack}
              onTogglePause={togglePlayPause}
              onSoundsLikeClick={onSoundsLikeClick}
              isCurrentTrack={isCurrentTrack(album)}
              isPlaying={isPlaying}
              isSelected={selectedIds.has(album.id)}
              onSelectChange={handleSelectChange}
            />
          ))}
        {showAlbumRows && !showGridView &&
          ALBUMS.map((album) => (
            <TrackRow
              key={`album-${album.num}`}
              album={album}
              trackList={ALBUMS}
              variant="album"
              isLiked
              soundsLikePanelOpen={soundsLikePanelOpen}
              onSoundsLikeClick={onSoundsLikeClick}
              onPlay={playTrack}
              onTogglePause={togglePlayPause}
              isCurrentTrack={isCurrentTrack(album)}
              isPlaying={isPlaying}
              compact={compact}
              compactAlbumTallLayout={compact && !tabsInBreadcrumb && !showVersionsStems}
              condensedViewActions={condensedViewActions}
              simplifiedViewActions={simplifiedViewActions}
              showRemoveFromProject={showRemoveFromProject}
              mobileTrackLayout={mobileTrackLayout}
              enableTrackDetailsOverlay={enableTrackDetailsOverlay}
              showVersionsStems={false}
              hideTrackComments={hideTrackComments}
              hideCloseAction={hideCloseAction}
              disableWaveformHighlights={disableWaveformHighlights}
              isSelected={selectedIds.has(album.id)}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
            />
          ))}
        <div ref={listEndRef} className="track-list-scroll-anchor" aria-hidden="true" />
        {activeTab === 'searches' && (
          <div className="track-list-empty">No saved searches yet.</div>
        )}
      </div>
      <div className="track-list-boundary track-list-bottom" aria-hidden="true" />
    </div>
  );
}

export default TrackList;
