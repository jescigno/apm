export default function ToolbarIconButton({ label, onClick, className = '', children }) {
  return (
    <button
      type="button"
      className={`btn-secondary tracks-toolbar-action-btn${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      {children}
      {label}
    </button>
  );
}

export function PlayAllIcon() {
  return (
    <svg
      className="tracks-toolbar-play-icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        className="tracks-toolbar-play-icon-circle"
        d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
      />
      <path
        className="tracks-toolbar-play-icon-triangle"
        d="M16.0274 10.1332L6.21875 4.48047V15.7859L16.0274 10.1332Z"
      />
    </svg>
  );
}
