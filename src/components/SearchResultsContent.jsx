import { useEffect, useState } from 'react';
import TrackList, { SEARCH_RESULTS_TRACKS } from './TrackList';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';

export default function SearchResultsContent({
  soundsLikePanelOpen,
  onSoundsLikeClick,
  onSoundsLikeWithSelection,
  tracks = SEARCH_RESULTS_TRACKS,
  enterHighlightTrackNum,
  scrollToBottomSignal,
}) {
  const [hideTracksHeader, setHideTracksHeader] = useState(false);
  const [trackViewMode, setTrackViewMode] = useState('expanded');

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setHideTracksHeader(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="search-results-page">
      <TrackList
        sectionClassName="tracks-section--search-results"
        headerActionsVariant="search"
        hideTrackComments
        hideCloseAction
        soundsLikePanelOpen={soundsLikePanelOpen}
        onSoundsLikeClick={onSoundsLikeClick}
        onSoundsLikeWithSelection={onSoundsLikeWithSelection}
        tracks={tracks}
        enterHighlightTrackNum={enterHighlightTrackNum}
        scrollToBottomSignal={scrollToBottomSignal}
        hideTracksHeader={hideTracksHeader}
        disableWaveformHighlights
        compactTrackRows={trackViewMode === 'condensed'}
        trackViewMode={trackViewMode}
        onTrackViewModeChange={setTrackViewMode}
      />
    </div>
  );
}
