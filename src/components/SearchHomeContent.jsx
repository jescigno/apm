import { useMemo, useState } from 'react';
import ContentCarousel from './ContentCarousel';
import { SEARCH_HOME_CAROUSELS } from '../constants/searchHomeCarousels';

export default function SearchHomeContent({ onRecentSearchSelect }) {
  const recentSearchesSeed = useMemo(
    () => SEARCH_HOME_CAROUSELS.find((carousel) => carousel.id === 'recent-searches')?.items ?? [],
    []
  );
  const recentlyPlayedSeed = useMemo(
    () => SEARCH_HOME_CAROUSELS.find((carousel) => carousel.id === 'recently-played')?.items ?? [],
    []
  );
  const [recentSearchItems, setRecentSearchItems] = useState(recentSearchesSeed);
  const [recentlyPlayedItems, setRecentlyPlayedItems] = useState(recentlyPlayedSeed);

  const handleRemoveFromRecentSearches = (itemId) => {
    setRecentSearchItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleRemoveFromHistory = (itemId) => {
    setRecentlyPlayedItems((items) => items.filter((item) => item.id !== itemId));
  };

  return (
    <div className="search-home-content">
      {SEARCH_HOME_CAROUSELS.map((carousel) => (
        <ContentCarousel
          key={carousel.id}
          id={carousel.id}
          title={carousel.title}
          variant={carousel.variant}
          items={
            carousel.id === 'recent-searches'
              ? recentSearchItems
              : carousel.id === 'recently-played'
                ? recentlyPlayedItems
                : carousel.items
          }
          onRemoveFromHistory={
            carousel.id === 'recent-searches'
              ? handleRemoveFromRecentSearches
              : carousel.id === 'recently-played'
                ? handleRemoveFromHistory
                : undefined
          }
          onItemSelect={carousel.id === 'recent-searches' ? onRecentSearchSelect : undefined}
        />
      ))}
    </div>
  );
}
