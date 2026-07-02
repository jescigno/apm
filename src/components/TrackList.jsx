import { useState, useRef, useEffect } from 'react';
import TrackRow from './TrackRow';
import ProjectFolderRow from './ProjectFolderRow';
import CustomizeViewMenu from './CustomizeViewMenu';
import { usePlayer } from '../context/PlayerContext';
import { getFolderTrackCount } from '../constants/projectsPanelTree';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';

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

export function TrackListTrackCount({ activeTab, tracks }) {
  const trackCount = (tracks || FAVORITES_TRACKS).length;
  const text = activeTab === 'tracks'
    ? `${trackCount} TITLES`
    : activeTab === 'albums'
      ? `${ALBUMS.length} Albums`
      : '0 Searches';
  return <span className="track-count">{text}</span>;
}

function TracksSelectionBar({ selectedCount, onPlay, onSoundsLike, onDeselect, showRemove, onRemove }) {
  const label = selectedCount === 1 ? '1 TRACK SELECTED' : `${selectedCount} TRACKS SELECTED`;

  return (
    <div className="tracks-selection-bar">
      <div className="tracks-selection-meta">
        <span className="tracks-selection-count">{label}</span>
        <span className="tracks-selection-divider" aria-hidden="true" />
        <button type="button" className="tracks-selection-deselect" onClick={onDeselect}>
          DESELECT
        </button>
      </div>
      <div className="tracks-selection-actions">
        <button type="button" className="tracks-selection-action tracks-selection-action--play" onClick={onPlay} aria-label="Play">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="tracks-selection-action-label">Play</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Favorite">
          <img src="/icons/Favorite.svg" alt="" />
          <span className="tracks-selection-action-label">Favorite</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Share">
          <img src="/icons/Upload.svg" alt="" />
          <span className="tracks-selection-action-label">Share</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Add">
          <img src="/icons/Add.svg" alt="" />
          <span className="tracks-selection-action-label">Add</span>
        </button>
        <button type="button" className="tracks-selection-action" aria-label="Download">
          <img src="/icons/Download.svg" alt="" />
          <span className="tracks-selection-action-label">Download</span>
        </button>
        <button type="button" className="tracks-selection-action" onClick={onSoundsLike} aria-label="Sounds like">
          <img src="/SoundsLike.svg" alt="" />
          <span className="tracks-selection-action-label">Sounds Like</span>
        </button>
        {showRemove && (
          <button type="button" className="tracks-selection-action" onClick={onRemove} aria-label="Remove">
            <img src="/icons/Close.svg" alt="" />
            <span className="tracks-selection-action-label">Remove</span>
          </button>
        )}
      </div>
    </div>
  );
}

function TrackList({ soundsLikePanelOpen, onSoundsLikeClick, onSoundsLikeWithSelection, activeTab: controlledTab, onTabChange, tabsInBreadcrumb, compactTrackRows, trackViewMode, onTrackViewModeChange, customizeViewOptions, headerActionsVariant = 'default', hideTrackComments = false, hideCloseAction = false, showSearchesTab = false, tracks: tracksProp, childFolders, onFolderSelect, projectTrackCount = 0, enableTrackDetailsOverlay = false, trackTitleBadges, enterHighlightTrackNum, scrollToBottomSignal, showVersionsStems = false, hideTracksHeader = false, emptyTracksMessage, emptyState, sectionClassName, disableWaveformHighlights = false }) {
  const tracks = tracksProp ?? FAVORITES_TRACKS;
  const compact = compactTrackRows ?? tabsInBreadcrumb;
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
  const setActiveTab = onTabChange ?? setInternalTab;
  const hasChildFolders =
    Array.isArray(childFolders) &&
    childFolders.length > 0;
  const isEmptyProject = emptyState === 'empty-project';
  const foldersOnlyView = hasChildFolders && tracks.length === 0;
  const showChildFolders =
    hasChildFolders &&
    (activeTab === 'tracks' || activeTab === 'albums');
  const canCollapseFolders = hasChildFolders && childFolders.length > 1;
  const showAlbumRows =
    activeTab === 'albums' &&
    !isEmptyProject &&
    !foldersOnlyView;
  const { playTrack, playQueue, togglePlayPause, currentTrack, isPlaying } = usePlayer();
  const listEndRef = useRef(null);
  const [mobileTrackLayout, setMobileTrackLayout] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [foldersCollapsed, setFoldersCollapsed] = useState(false);
  const childFolderIdsKey = (childFolders ?? []).map((folder) => folder.id).join(',');

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

  const handleSelectChange = (id, selected) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  const handlePlaySelected = () => {
    const selected = currentTracks.filter((item) => selectedIds.has(item.id));
    if (selected.length > 0) playQueue(selected, 0);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
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

  const selectionBar = hasSelection ? (
    <TracksSelectionBar
      selectedCount={selectedCount}
      onPlay={handlePlaySelected}
      onSoundsLike={handleSoundsLikeSelected}
      onDeselect={handleDeselectAll}
      showRemove={showSelectionRemove}
      onRemove={handleRemoveSelected}
    />
  ) : null;

  const trackCountLabel = activeTab === 'tracks'
    ? `${tracks.length} TITLES`
    : activeTab === 'albums'
      ? isEmptyProject ? '0 Albums' : `${ALBUMS.length} Albums`
      : '0 Searches';

  const showEmptyProjectState =
    isEmptyProject &&
    (activeTab === 'tracks' || activeTab === 'albums') &&
    tracks.length === 0 &&
    !hasChildFolders;

  const tracksActions = headerActionsVariant === 'search' ? (
    <>
      <button type="button" className="btn-secondary btn-play-all" onClick={handlePlayAll}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> PLAY ALL
      </button>
      {onTrackViewModeChange ? (
        <CustomizeViewMenu viewMode={trackViewMode} onViewModeChange={onTrackViewModeChange} viewOptions={customizeOptions} />
      ) : (
        <button type="button" className="btn-secondary"><img src="/Customize.svg" alt="" /> CUSTOMIZE</button>
      )}
      <button type="button" className="btn-secondary"><img src="/Sort.svg" alt="" /> SORT</button>
    </>
  ) : (
    !showEmptyProjectState && (
      <>
        <button type="button" className="btn-secondary"><img src="/Reorder.svg" alt="" /> REORDER</button>
        <button type="button" className="btn-secondary btn-play-all" onClick={handlePlayAll}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> PLAY ALL
        </button>
        {onTrackViewModeChange ? (
          <CustomizeViewMenu viewMode={trackViewMode} onViewModeChange={onTrackViewModeChange} viewOptions={customizeOptions} />
        ) : (
          <button type="button" className="btn-secondary"><img src="/Customize.svg" alt="" /> CUSTOMIZE</button>
        )}
      </>
    )
  );

  return (
    <div className={`tracks-section${sectionClassName ? ` ${sectionClassName}` : ''}${condensedViewActions ? ' tracks-section--condensed-view' : ''}${simplifiedViewActions ? ' tracks-section--simplified-view' : ''}${showEmptyProjectState ? ' tracks-section--empty-project' : ''}`}>
      {hasHeaderContent && (
        <div className="tracks-header">
          <TrackListTabs activeTab={activeTab} onTabChange={setActiveTab} showSearchesTab={showSearchesTab} />
          <div className="tracks-header-meta">
            {hasSelection ? (
              selectionBar
            ) : (
              <>
                {!foldersOnlyView && (
                  <span className="track-count">{trackCountLabel}</span>
                )}
                {!foldersOnlyView && tracksActions && (
                <div className="tracks-actions">
                  {tracksActions}
                </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {tabsInBreadcrumb && !hideTracksHeader && hasSelection && activeTab !== 'searches' && (
        <div className="tracks-selection-bar-row">
          {selectionBar}
        </div>
      )}
      {!(hideTracksHeader && activeTab === 'tracks') && !tabsInBreadcrumb && (
        <div className="track-list-boundary track-list-top" aria-hidden="true" />
      )}
      {hideTracksHeader && activeTab === 'tracks' && (hasSelection || !foldersOnlyView) && (
        <div className="tracks-mobile-toolbar">
          {hasSelection ? (
            selectionBar
          ) : (
            <>
              {!foldersOnlyView && (
                <span className="tracks-mobile-toolbar-count">{trackCountLabel}</span>
              )}
              {!foldersOnlyView && (
              <div className="tracks-mobile-toolbar-actions">
              {headerActionsVariant === 'search' ? (
                <>
                  {onTrackViewModeChange ? (
                    <CustomizeViewMenu viewMode={trackViewMode} onViewModeChange={onTrackViewModeChange} viewOptions={customizeOptions} />
                  ) : null}
                  <button type="button" className="btn-secondary tracks-mobile-toolbar-sort">
                    <img src="/Sort.svg" alt="" /> SORT
                  </button>
                </>
              ) : !showEmptyProjectState ? (
                <>
                  {onTrackViewModeChange ? (
                    <CustomizeViewMenu viewMode={trackViewMode} onViewModeChange={onTrackViewModeChange} viewOptions={customizeOptions} />
                  ) : null}
                  <button type="button" className="btn-secondary tracks-mobile-toolbar-reorder">
                    <img src="/Reorder.svg" alt="" /> REORDER
                  </button>
                </>
              ) : null}
              </div>
              )}
            </>
          )}
        </div>
      )}
      <div className="track-list">
        {showChildFolders && canCollapseFolders && foldersCollapsed ? (
          <ProjectFolderRow
            key="folder-collapsed-summary"
            collapsedSummary
            folderCount={childFolders.length}
            onIconClick={() => setFoldersCollapsed(false)}
            mobileLayout={mobileTrackLayout}
          />
        ) : (
          showChildFolders &&
          childFolders.map((folder) => (
            <ProjectFolderRow
              key={`folder-${folder.id}`}
              folder={folder}
              trackCount={getFolderTrackCount(folder, projectTrackCount)}
              onSelect={onFolderSelect}
              onIconClick={canCollapseFolders ? () => setFoldersCollapsed(true) : undefined}
              mobileLayout={mobileTrackLayout}
            />
          ))
        )}
        {activeTab === 'tracks' &&
          tracks.map((track) => (
            <TrackRow
              key={`track-${track.num}`}
              track={track}
              trackList={tracks}
              isLiked
              soundsLikePanelOpen={soundsLikePanelOpen}
              onSoundsLikeClick={onSoundsLikeClick}
              onPlay={playTrack}
              onTogglePause={togglePlayPause}
              isCurrentTrack={isCurrentTrack(track)}
              isPlaying={isPlaying}
              compact={compact}
              condensedViewActions={condensedViewActions}
              simplifiedViewActions={simplifiedViewActions}
              showRemoveFromProject={showRemoveFromProject}
              mobileTrackLayout={mobileTrackLayout}
              enableTrackDetailsOverlay={enableTrackDetailsOverlay}
              titleBadge={trackTitleBadges?.[track.num]}
              enterHighlight={
                enterHighlightTrackNum != null &&
                Number(track.num) === Number(enterHighlightTrackNum)
              }
              showVersionsStems={showVersionsStems}
              hideTrackComments={hideTrackComments}
              hideCloseAction={hideCloseAction}
              disableWaveformHighlights={disableWaveformHighlights}
              isSelected={selectedIds.has(track.id)}
              onSelectChange={handleSelectChange}
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
        {showAlbumRows &&
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
