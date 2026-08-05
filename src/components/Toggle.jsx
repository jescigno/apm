export default function Toggle({
  checked = false,
  onChange,
  label,
  accent = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`account-notification-settings-toggle${checked ? ' account-notification-settings-toggle--on' : ''}${accent ? ' account-notification-settings-toggle--accent' : ''}${className ? ` ${className}` : ''}`.trim()}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onChange?.(!checked);
      }}
      {...props}
    >
      <span className="account-notification-settings-toggle__slider" aria-hidden="true" />
    </button>
  );
}
