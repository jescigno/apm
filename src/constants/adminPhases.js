/** Admin release phases. Phase 1 is the team table in My Account → Admin. Phase 2 is the current standalone console. */

export const ADMIN_PHASE_1 = 1;
export const ADMIN_PHASE_2 = 2;

export function parseAdminPhase(searchParams) {
  const params =
    typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;
  return params.get('phase') === '2' ? ADMIN_PHASE_2 : ADMIN_PHASE_1;
}

/**
 * Phase 1 is the team table under My Account: no team switcher,
 * no bulk import, and no member activity.
 * Phase 2 is the current console, with the full admin navigation.
 */
export function getAdminPhaseCapabilities(phase) {
  const isPhase2 = phase !== ADMIN_PHASE_1;
  return {
    fullNav: isPhase2,
    teamDropdown: isPhase2,
    bulkImport: isPhase2,
    memberActivity: isPhase2,
  };
}
