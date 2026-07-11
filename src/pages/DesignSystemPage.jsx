import {
  DESIGN_SYSTEM_COLORS,
  DESIGN_SYSTEM_FONTS,
  DESIGN_SYSTEM_ICONS,
  DESIGN_SYSTEM_LAYOUT,
  DESIGN_SYSTEM_SECTIONS,
} from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

function scrollToDesignSystemSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ColorSwatch({ name, token, value }) {
  return (
    <div className="ds-color-swatch">
      <div className="ds-color-swatch__chip" style={{ backgroundColor: value }} aria-hidden="true" />
      <div className="ds-color-swatch__meta">
        <span className="ds-color-swatch__name">{name}</span>
        <span className="ds-color-swatch__value">{value}</span>
        {token && <code className="ds-color-swatch__token">{token}</code>}
      </div>
    </div>
  );
}

function DesignSystemSection({ id, title, children }) {
  return (
    <section id={id} className="ds-section">
      <h2 className="ds-section__title">{title}</h2>
      {children}
    </section>
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

function DesignSystemPage() {
  return (
    <div className="design-system-page">
      <header className="design-system-page__header">
        <div className="design-system-page__header-row">
          <h1 className="design-system-page__title">Design System</h1>
          <nav className="design-system-page__jump-nav" aria-label="Page sections">
            {DESIGN_SYSTEM_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="design-system-page__jump-link"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToDesignSystemSection(section.id);
                }}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="design-system-page__body">
        <DesignSystemSection id="typography" title="Typography">
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
        </DesignSystemSection>

        <DesignSystemSection id="colors" title="Colors">
          <div className="ds-color-groups">
            {DESIGN_SYSTEM_COLORS.map((group) => (
              <div key={group.group} className="ds-color-group">
                <h3 className="ds-color-group__title">{group.group}</h3>
                <div className="ds-color-grid">
                  {group.swatches.map((swatch) => (
                    <ColorSwatch key={`${group.group}-${swatch.name}`} {...swatch} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DesignSystemSection>

        <DesignSystemSection id="icons" title="Icons">
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
        </DesignSystemSection>

        <DesignSystemSection id="buttons" title="Buttons">
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
        </DesignSystemSection>

        <DesignSystemSection id="form-controls" title="Form controls">
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
        </DesignSystemSection>

        <DesignSystemSection id="layout" title="Layout & spacing">
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
        </DesignSystemSection>
      </div>
    </div>
  );
}

export default DesignSystemPage;
