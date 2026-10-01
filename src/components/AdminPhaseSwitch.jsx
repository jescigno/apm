import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ADMIN_PHASE_1, ADMIN_PHASE_2, parseAdminPhase } from '../constants/adminPhases';
import { ROUTE_ADMIN_TEAM } from '../constants/routes';

const PHASES = [
  { id: ADMIN_PHASE_1, label: '1' },
  { id: ADMIN_PHASE_2, label: '2' },
];

export default function AdminPhaseSwitch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phase = parseAdminPhase(searchParams);

  const setPhase = useCallback((nextPhase) => {
    const params = new URLSearchParams(searchParams);
    if (nextPhase === ADMIN_PHASE_2) {
      params.set('phase', '2');
      navigate(
        { pathname: location.pathname, search: `?${params.toString()}` },
        { replace: true }
      );
      return;
    }
    params.delete('phase');
    const search = params.toString();
    navigate(
      { pathname: ROUTE_ADMIN_TEAM, search: search ? `?${search}` : '' },
      { replace: true }
    );
  }, [location.pathname, navigate, searchParams]);

  return (
    <div className="sidebar-phase sidebar-phase--horizontal">
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
