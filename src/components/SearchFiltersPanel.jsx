import { useState } from 'react';
import { SEARCH_QUICK_FILTERS, SEARCH_TAG_CATEGORIES } from '../constants/searchFilters';

const FILTER_SECTION_ICONS = {
  quickFilters: '/icons/filters_quickfilters.svg',
  libraries: '/icons/filters_library.svg',
  tags: '/icons/filters_tags.svg',
};

function FilterSectionIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      className="search-filters-section-icon"
      width={22}
      height={23}
      draggable={false}
      aria-hidden
    />
  );
}

function ChevronUpIcon() {
  return (
    <svg className="search-filters-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="search-filters-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="search-filters-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SearchFiltersPanel() {
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [activeQuickFilters, setActiveQuickFilters] = useState(() => new Set());

  const toggleQuickFilter = (label) => {
    setActiveQuickFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside className="search-filters-panel" aria-label="Search filters">
      <div className="search-filters-panel-body">
        <section className="search-filters-group">
          <button
            type="button"
            className="search-filters-group-header"
            aria-expanded={quickFiltersOpen}
            onClick={() => setQuickFiltersOpen((open) => !open)}
          >
            <span className="search-filters-group-header-main">
              <FilterSectionIcon src={FILTER_SECTION_ICONS.quickFilters} />
              <span className="search-filters-group-title">Quick Filters</span>
            </span>
            {quickFiltersOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {quickFiltersOpen && (
            <ul className="search-filters-list">
              {SEARCH_QUICK_FILTERS.map((label) => {
                const active = activeQuickFilters.has(label);
                return (
                  <li key={label}>
                    <button
                      type="button"
                      className={`search-filters-list-item${active ? ' search-filters-list-item--active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleQuickFilter(label)}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="search-filters-group search-filters-group--nav">
          <button type="button" className="search-filters-group-header search-filters-group-header--nav">
            <span className="search-filters-group-header-main">
              <FilterSectionIcon src={FILTER_SECTION_ICONS.libraries} />
              <span className="search-filters-group-title">Libraries</span>
            </span>
            <ChevronRightIcon />
          </button>
        </section>

        <section className="search-filters-group">
          <button
            type="button"
            className="search-filters-group-header"
            aria-expanded={tagsOpen}
            onClick={() => setTagsOpen((open) => !open)}
          >
            <span className="search-filters-group-header-main">
              <FilterSectionIcon src={FILTER_SECTION_ICONS.tags} />
              <span className="search-filters-group-title">Tags</span>
            </span>
            {tagsOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
          {tagsOpen && (
            <ul className="search-filters-list">
              {SEARCH_TAG_CATEGORIES.map((label) => (
                <li key={label}>
                  <button type="button" className="search-filters-list-item">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
