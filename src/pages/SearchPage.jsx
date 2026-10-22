import { useEffect, useState } from 'react';
import SearchHomeContent from '../components/SearchHomeContent';
import SearchResultsContent from '../components/SearchResultsContent';
import { SEARCH_RESULTS_TRACKS } from '../components/TrackList';
import { LAYOUT_COMPACT_MAX_WIDTH } from '../constants/layout';

export default function SearchPage({
  searchQuery,
  showResultsPage = false,
  onRecentSearchSelect,
  soundsLikePanelOpen,
  onSoundsLikeClick,
  onSoundsLikeWithSelection,
  tracks = SEARCH_RESULTS_TRACKS,
  enterHighlightTrackNum,
  scrollToBottomSignal,
}) {
  const [mobileLayout, setMobileLayout] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LAYOUT_COMPACT_MAX_WIDTH}px)`);
    const sync = () => setMobileLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const showResults = showResultsPage || Boolean(searchQuery?.trim()) || mobileLayout;

  if (showResults) {
    return (
      <div className="search-results">
        <SearchResultsContent
          soundsLikePanelOpen={soundsLikePanelOpen}
          onSoundsLikeClick={onSoundsLikeClick}
          onSoundsLikeWithSelection={onSoundsLikeWithSelection}
          tracks={tracks}
          enterHighlightTrackNum={enterHighlightTrackNum}
          scrollToBottomSignal={scrollToBottomSignal}
        />
      </div>
    );
  }

  return (
    <div className="search-home">
      <SearchHomeContent onRecentSearchSelect={onRecentSearchSelect} />
    </div>
  );
}
