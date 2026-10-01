/** Project detail release phases. Phase 3 is the current page; Phase 2 is the reduced cut. */

export const PROJECT_PHASE_2 = 2;
export const PROJECT_PHASE_3 = 3;

export function parseProjectPhase(searchParams) {
  const params =
    typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;
  return params.get('phase') === '3' ? PROJECT_PHASE_3 : PROJECT_PHASE_2;
}

/**
 * Capabilities present on the project detail page.
 * Phase 2 omits Sounds Like entry points, track layout controls, and the mobile shuffle action.
 */
export function getProjectPhaseCapabilities(phase) {
  const isPhase3 = phase !== PROJECT_PHASE_2;
  return {
    soundsLikeCollab: isPhase3,
    soundsLikePromo: isPhase3,
    trackLayoutControls: isPhase3,
    mobileShuffle: isPhase3,
  };
}
