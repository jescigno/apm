import { ROUTE_SEARCH } from '../constants/routes';

export const SEARCH_URL_TERM_PARAM = 'term';

export function buildSearchResultsPath(terms) {
  const cleaned = terms.map((term) => term.trim()).filter(Boolean);
  if (cleaned.length === 0) return ROUTE_SEARCH;
  const params = new URLSearchParams();
  cleaned.forEach((term) => params.append(SEARCH_URL_TERM_PARAM, term));
  return `${ROUTE_SEARCH}?${params.toString()}`;
}

export function parseSearchTermsFromSearch(search) {
  if (!search) return [];
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) return [];
  const params = new URLSearchParams(query);
  return params
    .getAll(SEARCH_URL_TERM_PARAM)
    .map((term) => term.trim())
    .filter(Boolean);
}

export function openSearchResultsInNewTab(terms) {
  const path = buildSearchResultsPath(terms);
  window.open(`${window.location.origin}${path}`, '_blank', 'noopener,noreferrer');
}
