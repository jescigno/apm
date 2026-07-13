import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DESIGN_SYSTEM_BREAKPOINTS,
  DESIGN_SYSTEM_COLORS,
  DESIGN_SYSTEM_FONTS,
  DESIGN_SYSTEM_ICONS,
  DESIGN_SYSTEM_LAYOUT,
  DESIGN_SYSTEM_TABS,
} from '../constants/designSystem';
import { THEME_PALETTES } from '../constants/theme';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

function getUsageSections(usage, themeValue) {
  if (Array.isArray(usage)) {
    if (themeValue === 'dark') return { dark: usage, light: [] };
    if (themeValue === 'light') return { dark: [], light: usage };
    return { dark: usage, light: usage };
  }
  return {
    dark: usage?.dark ?? [],
    light: usage?.light ?? [],
  };
}

function flattenUsage(sections) {
  return [...sections.dark, ...sections.light];
}

function ColorUsageTooltip({ usage, themeValue, tooltipRect }) {
  if (!tooltipRect) return null;

  const sections = getUsageSections(usage, themeValue);
  const blocks = [
    { key: 'dark', label: 'Dark mode', items: sections.dark },
    { key: 'light', label: 'Light mode', items: sections.light },
  ].filter((block) => block.items.length > 0);

  if (!blocks.length) return null;

  return createPortal(
    <div
      className="app-hover-tooltip app-hover-tooltip-portal app-hover-tooltip--multiline ds-color-swatch__tooltip"
      role="tooltip"
      style={{
        left: tooltipRect.left,
        bottom: window.innerHeight - tooltipRect.top + 8,
      }}
    >
      {blocks.map((block, index) => (
        <div
          key={block.key}
          className={`ds-color-swatch__tooltip-section${index > 0 ? ' ds-color-swatch__tooltip-section--spaced' : ''}`}
        >
          <span className="ds-color-swatch__tooltip-heading">{block.label.toUpperCase()}</span>
          <ul className="ds-color-swatch__tooltip-list">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>,
    document.body
  );
}

function normalizeHex(color) {
  return color?.trim().toLowerCase() ?? '';
}

function splitSwatchName(name) {
  const match = name.match(/^(.+?)\s(\((?:light \/ dark|dark|light)\))$/i);
  if (!match) return { primary: name, secondary: null };
  return { primary: match[1].trim(), secondary: match[2] };
}

function formatSwatchValue(value) {
  if (!value) return '';
  return value.startsWith('#') ? value.toUpperCase() : value;
}

function ColorSwatch({ name, token, value, usage = [], themeValue, chipBorderToken }) {
  const theme = useThemeName();
  const rootRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);

  const paletteTheme = themeValue ?? theme;
  const resolvedValue =
    value ??
    (token && THEME_PALETTES[paletteTheme]?.[token]) ??
    (token && THEME_PALETTES[theme]?.[token]) ??
    '';

  const cardBackground = THEME_PALETTES[theme]?.['--account-surface'] ?? '';
  const needsBorder =
    Boolean(resolvedValue && cardBackground) &&
    normalizeHex(resolvedValue) === normalizeHex(cardBackground);
  const showChipBorder = needsBorder || Boolean(chipBorderToken);

  const chipStyle = resolvedValue
    ? { backgroundColor: resolvedValue }
    : token
      ? { backgroundColor: `var(${token})` }
      : undefined;

  const borderedChipStyle =
    showChipBorder && chipStyle
      ? {
          ...chipStyle,
          ...(chipBorderToken ? { border: `1px solid var(${chipBorderToken})` } : null),
        }
      : chipStyle;

  const updateTooltipRect = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipRect({ left: rect.left + rect.width / 2, top: rect.top });
  }, []);

  useEffect(() => {
    if (!isHovered) return;
    updateTooltipRect();
    const onUpdate = () => updateTooltipRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isHovered, updateTooltipRect]);

  const usageSections = getUsageSections(usage, themeValue);
  const hasTooltip = usageSections.dark.length > 0 || usageSections.light.length > 0;
  const { primary: namePrimary, secondary: nameSecondary } = splitSwatchName(name);

  return (
    <div
      ref={rootRef}
      className="ds-color-swatch"
      onMouseEnter={() => {
        setIsHovered(true);
        updateTooltipRect();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => {
        setIsHovered(true);
        updateTooltipRect();
      }}
      onBlur={() => setIsHovered(false)}
      tabIndex={hasTooltip ? 0 : -1}
      aria-label={hasTooltip ? `${name}. ${flattenUsage(usageSections).join('. ')}` : name}
      style={hasTooltip ? { cursor: 'help' } : undefined}
    >
      <div
        className={`ds-color-swatch__chip${showChipBorder ? ' ds-color-swatch__chip--bordered' : ''}`}
        style={borderedChipStyle}
        aria-hidden="true"
      />
      <div className="ds-color-swatch__meta">
        <span className="ds-color-swatch__name">{namePrimary}</span>
        {nameSecondary && (
          <span className="ds-color-swatch__name-suffix">{nameSecondary}</span>
        )}
        {resolvedValue && (
          <span className="ds-color-swatch__value">{formatSwatchValue(resolvedValue)}</span>
        )}
        {token && <code className="ds-color-swatch__token">{token}</code>}
      </div>
      {isHovered && hasTooltip && (
        <ColorUsageTooltip usage={usage} themeValue={themeValue} tooltipRect={tooltipRect} />
      )}
    </div>
  );
}

function IconTile({ name, src, wide = false }) {
  const theme = useThemeName();
  const iconSrc = resolveThemedAsset(src, theme);

  return (
    <div className="ds-icon-tile">
      <div className={`ds-icon-tile__preview${wide ? ' ds-icon-tile__preview--wide' : ''}`}>
        <img src={iconSrc} alt="" />
      </div>
      <span className="ds-icon-tile__name">{name}</span>
      <code className="ds-icon-tile__path">{src}</code>
    </div>
  );
}

function TypographyPanel() {
  return (
    <div className="ds-font-stack">
      {DESIGN_SYSTEM_FONTS.map((font) => (
        <article key={font.name} className="ds-font-card">
          <div className="ds-font-card__header">
            <h3 className="ds-font-card__name">{font.name}</h3>
            <p className="ds-font-card__usage">{font.usage}</p>
            <code className="ds-font-card__family">{font.family}</code>
          </div>
          <div className="ds-font-card__samples">
            {font.weights.map((weight) => (
              <div key={weight.label} className="ds-font-sample">
                <span className="ds-font-sample__label">{weight.label}</span>
                <p
                  className="ds-font-sample__text"
                  style={{ fontFamily: font.family, fontWeight: weight.weight }}
                >
                  {weight.sample}
                </p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ColorSwatchGrid({ groupName, swatches }) {
  return (
    <div className="ds-color-grid">
      {swatches.map((swatch) => (
        <ColorSwatch key={`${groupName}-${swatch.name}`} {...swatch} />
      ))}
    </div>
  );
}

function ColorsPanel() {
  return (
    <div className="ds-color-groups">
      {DESIGN_SYSTEM_COLORS.map((group) => (
        <div key={group.group} className="ds-color-group">
          <h3 className="ds-color-group__title">{group.group}</h3>
          {group.sections ? (
            <div className="ds-color-subgroups">
              {group.sections.map((section) => (
                <div key={section.title} className="ds-color-subgroup">
                  <h4 className="ds-color-subgroup__title">{section.title}</h4>
                  <ColorSwatchGrid groupName={`${group.group}-${section.title}`} swatches={section.swatches} />
                </div>
              ))}
            </div>
          ) : (
            <ColorSwatchGrid groupName={group.group} swatches={group.swatches} />
          )}
        </div>
      ))}
    </div>
  );
}

function IconsPanel() {
  return (
    <div className="ds-icon-groups">
      {DESIGN_SYSTEM_ICONS.map((group) => (
        <div key={group.group} className="ds-icon-group">
          <h3 className="ds-icon-group__title">{group.group}</h3>
          <div className="ds-icon-grid">
            {group.icons.map((icon) => (
              <IconTile key={`${group.group}-${icon.src}`} {...icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ButtonsPanel() {
  return (
    <div className="ds-buttons">
      <div className="ds-button-demo">
        <span className="ds-button-demo__label">Primary CTA</span>
        <button type="button" className="btn-cta btn-cta--primary">
          Update
        </button>
        <code className="ds-button-demo__class">.btn-cta.btn-cta--primary</code>
      </div>
      <div className="ds-button-demo">
        <span className="ds-button-demo__label">Secondary CTA</span>
        <button type="button" className="btn-cta btn-cta--secondary">
          Cancel
        </button>
        <code className="ds-button-demo__class">.btn-cta.btn-cta--secondary</code>
      </div>
    </div>
  );
}

function ElementsPanel() {
  return (
    <div className="ds-form-controls">
      <label className="ds-form-control">
        <input type="checkbox" className="track-checkbox" defaultChecked />
        <span>Checkbox (checked)</span>
      </label>
      <label className="ds-form-control">
        <input type="checkbox" className="track-checkbox" />
        <span>Checkbox (unchecked)</span>
      </label>
      <label className="account-settings-radio">
        <input type="radio" name="ds-radio" className="account-settings-radio__input" defaultChecked />
        <span
          className="account-settings-radio-indicator account-settings-radio-indicator--selected"
          aria-hidden="true"
        >
          <span className="account-settings-radio-indicator-dot" />
        </span>
        <span>Radio (selected)</span>
      </label>
      <label className="account-settings-radio">
        <input type="radio" name="ds-radio" className="account-settings-radio__input" />
        <span className="account-settings-radio-indicator" aria-hidden="true">
          <span className="account-settings-radio-indicator-dot" />
        </span>
        <span>Radio (unselected)</span>
      </label>
    </div>
  );
}

function LayoutPanel() {
  return (
    <dl className="ds-layout-list">
      {DESIGN_SYSTEM_LAYOUT.map((item) => (
        <div key={item.name} className="ds-layout-item">
          <dt className="ds-layout-item__name">{item.name}</dt>
          <dd className="ds-layout-item__value">
            <span>{item.value}</span>
            {item.token && <code>{item.token}</code>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function BreakpointsPanel() {
  return (
    <div className="ds-breakpoint-groups">
      <p className="ds-breakpoint-intro">
        Viewport tiers are defined in <code>src/constants/layout.js</code> as mobile-first min-width
        breakpoints. Use <code>min-width</code> media queries and the matching JS constants in{' '}
        <code>matchMedia</code> so layout stays in sync across screen sizes, including large and
        ultra-wide displays.
      </p>
      {DESIGN_SYSTEM_BREAKPOINTS.map((group) => (
        <div key={group.group} className="ds-breakpoint-group">
          <h3 className="ds-breakpoint-group__title">{group.group}</h3>
          <div className="ds-breakpoint-table-wrap">
            <table className="ds-breakpoint-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Min width</th>
                  <th scope="col">Usage</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.name}>
                    <td className="ds-breakpoint-table__name">
                      <span className="ds-breakpoint-table__label">{item.name}</span>
                    </td>
                    <td className="ds-breakpoint-table__width">
                      <span className="ds-breakpoint-table__width-value">{item.minWidth}</span>
                    </td>
                    <td className="ds-breakpoint-table__usage">{item.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

const TAB_PANELS = {
  typography: TypographyPanel,
  colors: ColorsPanel,
  icons: IconsPanel,
  buttons: ButtonsPanel,
  elements: ElementsPanel,
  layout: LayoutPanel,
  breakpoints: BreakpointsPanel,
};

function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState('typography');
  const ActivePanel = TAB_PANELS[activeTab] ?? TypographyPanel;

  return (
    <div className="design-system-page">
      <header className="design-system-page__header">
        <h1 className="design-system-page__title">Design System</h1>
        <nav className="design-system-page__tabs tabs" aria-label="Design system sections" role="tablist">
          {DESIGN_SYSTEM_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`design-system-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`design-system-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`tab design-system-page__tab${isActive ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div
        className="design-system-page__body"
        role="tabpanel"
        id={`design-system-panel-${activeTab}`}
        aria-labelledby={`design-system-tab-${activeTab}`}
      >
        <ActivePanel />
      </div>
    </div>
  );
}

export default DesignSystemPage;
