import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PROJECT_PHASE_2, PROJECT_PHASE_3, parseProjectPhase } from '../constants/projectPhases';

const PHASES = [
  { id: PROJECT_PHASE_2, label: '2' },
  { id: PROJECT_PHASE_3, label: '3' },
];

export default function ProjectPhaseSwitch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const phase = parseProjectPhase(searchParams);

  const setPhase = useCallback((nextPhase) => {
    const params = new URLSearchParams(searchParams);
    if (nextPhase === PROJECT_PHASE_3) params.set('phase', '3');
    else params.delete('phase');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="sidebar-phase">
      <span className="sidebar-phase__label">Phase</span>
      <div className="sidebar-phase__toggle" role="group" aria-label="Release phase">
        {PHASES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-phase__btn${phase === id ? ' sidebar-phase__btn--selected' : ''}`}
            aria-pressed={phase === id}
            aria-label={`Phase ${label}`}
            onClick={() => setPhase(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
