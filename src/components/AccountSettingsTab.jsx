import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme } from '../utils/theme';
import {
  DOWNLOAD_DEFAULT_FILE_TYPES,
  DOWNLOAD_FILE_TYPE_OPTIONS,
  DOWNLOAD_FOLDER_OPTIONS,
  DOWNLOAD_NAMING_OPTIONS,
  PLAYLIST_PREFERENCE_OPTIONS,
  SEARCH_DISPLAY_DEFAULT,
  SEARCH_DISPLAY_OPTIONS,
  SEARCH_RESTRICTION_OPTIONS,
  SORT_CRITERIA_OPTIONS,
  SORT_ORDER_OPTIONS,
} from '../constants/accountSettings';

function AccountSettingsCard({ title, children, className = '' }) {
  return (
    <section className={`account-card account-settings-card ${className}`.trim()}>
      <h2 className="account-settings-card__title">{title}</h2>
      <div className="account-settings-card__body">{children}</div>
    </section>
  );
}

function AccountSettingsField({ label, children }) {
  return (
    <div className="account-settings-field">
      {label && <span className="account-settings-field__label">{label}</span>}
      {children}
    </div>
  );
}

function AccountSettingsSelect({ label, value, onChange, options }) {
  return (
    <AccountSettingsField label={label}>
      <div className="account-settings-select-wrap">
        <select className="account-settings-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </AccountSettingsField>
  );
}

function AccountSettingsCheckbox({ label, checked, onChange }) {
  return (
    <label className="account-settings-check">
      <input
        type="checkbox"
        className="track-checkbox account-settings-check__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function AccountSettingsRadio({ name, value, checked, label, onChange }) {
  return (
    <label className="account-settings-radio">
      <input
        type="radio"
        className="account-settings-radio__input"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span
        className={`account-settings-radio-indicator${checked ? ' account-settings-radio-indicator--selected' : ''}`}
        aria-hidden="true"
      >
        <span className="account-settings-radio-indicator-dot" />
      </span>
      <span>{label}</span>
    </label>
  );
}

function readStoredTheme() {
  return getStoredTheme();
}

export default function AccountSettingsTab() {
  const [displayMode, setDisplayMode] = useState(readStoredTheme);
  const [playlistPreference, setPlaylistPreference] = useState(PLAYLIST_PREFERENCE_OPTIONS[0]);
  const [playlistSortOrder, setPlaylistSortOrder] = useState(SORT_ORDER_OPTIONS[0]);
  const [downloadFileTypes, setDownloadFileTypes] = useState(() => new Set(DOWNLOAD_DEFAULT_FILE_TYPES));
  const [downloadFolderStructure, setDownloadFolderStructure] = useState(DOWNLOAD_FOLDER_OPTIONS[0]);
  const [downloadFileNaming, setDownloadFileNaming] = useState(DOWNLOAD_NAMING_OPTIONS[0]);
  const [searchDisplayFields, setSearchDisplayFields] = useState(() => new Set(SEARCH_DISPLAY_DEFAULT));
  const [sortCriteria, setSortCriteria] = useState('relevance');
  const [sortOrder, setSortOrder] = useState(SORT_ORDER_OPTIONS[0]);
  const [searchRestriction, setSearchRestriction] = useState('apm-music');

  useEffect(() => {
    applyTheme(displayMode);
  }, [displayMode]);

  const toggleDownloadFileType = (id, checked) => {
    setDownloadFileTypes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSearchDisplayField = (id, checked) => {
    setSearchDisplayFields((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="account-settings-grid">
      <div className="account-settings-grid__column">
        <AccountSettingsCard title="Display Preferences">
          <div className="account-settings-display-modes" role="radiogroup" aria-label="Display mode">
            <label className="account-settings-mode">
              <input
                type="radio"
                className="account-settings-radio__input"
                name="display-mode"
                value="light"
                checked={displayMode === 'light'}
                onChange={() => setDisplayMode('light')}
              />
              <span
                className={`account-settings-radio-indicator${displayMode === 'light' ? ' account-settings-radio-indicator--selected' : ''}`}
                aria-hidden="true"
              >
                <span className="account-settings-radio-indicator-dot" />
              </span>
              <span className="account-settings-mode__swatch account-settings-mode__swatch--light" aria-hidden="true" />
              <span className="account-settings-mode__label">Light Mode</span>
            </label>
            <label className="account-settings-mode">
              <input
                type="radio"
                className="account-settings-radio__input"
                name="display-mode"
                value="dark"
                checked={displayMode === 'dark'}
                onChange={() => setDisplayMode('dark')}
              />
              <span
                className={`account-settings-radio-indicator${displayMode === 'dark' ? ' account-settings-radio-indicator--selected' : ''}`}
                aria-hidden="true"
              >
                <span className="account-settings-radio-indicator-dot" />
              </span>
              <span className="account-settings-mode__swatch account-settings-mode__swatch--dark" aria-hidden="true" />
              <span className="account-settings-mode__label">Dark Mode</span>
            </label>
          </div>
        </AccountSettingsCard>

        <AccountSettingsCard title="Playlist Preferences">
          <AccountSettingsSelect
            label="Choose the default method for sorting playlists"
            value={playlistPreference}
            onChange={setPlaylistPreference}
            options={PLAYLIST_PREFERENCE_OPTIONS}
          />
        </AccountSettingsCard>

        <AccountSettingsCard title="Playlist Sort Order">
          <AccountSettingsSelect
            value={playlistSortOrder}
            onChange={setPlaylistSortOrder}
            options={SORT_ORDER_OPTIONS}
          />
        </AccountSettingsCard>

        <AccountSettingsCard title="Download Preferences" className="account-settings-card--download">
          <div className="account-settings-download">
            <div className="account-settings-download__column">
              <span className="account-settings-section-label">File Type</span>
              <div className="account-settings-check-list">
                {DOWNLOAD_FILE_TYPE_OPTIONS.map(({ id, label }) => (
                  <AccountSettingsCheckbox
                    key={id}
                    label={label}
                    checked={downloadFileTypes.has(id)}
                    onChange={(checked) => toggleDownloadFileType(id, checked)}
                  />
                ))}
              </div>
            </div>
            <div className="account-settings-download__column">
              <AccountSettingsSelect
                label="Download Folder Structure"
                value={downloadFolderStructure}
                onChange={setDownloadFolderStructure}
                options={DOWNLOAD_FOLDER_OPTIONS}
              />
              <AccountSettingsSelect
                label="Download File Naming Convention"
                value={downloadFileNaming}
                onChange={setDownloadFileNaming}
                options={DOWNLOAD_NAMING_OPTIONS}
              />
            </div>
          </div>
          <p className="account-settings-footnote">*The max download limit is 10GB.</p>
        </AccountSettingsCard>
      </div>

      <div className="account-settings-grid__column">
        <AccountSettingsCard title="Search Results Display Preferences">
          <div className="account-settings-option-grid account-settings-option-grid--checks">
            {SEARCH_DISPLAY_OPTIONS.map(({ id, label }) => (
              <AccountSettingsCheckbox
                key={id}
                label={label}
                checked={searchDisplayFields.has(id)}
                onChange={(checked) => toggleSearchDisplayField(id, checked)}
              />
            ))}
          </div>
        </AccountSettingsCard>

        <AccountSettingsCard title="Sort Preferences">
          <div className="account-settings-option-grid account-settings-option-grid--radios" role="radiogroup" aria-label="Sort criteria">
            {SORT_CRITERIA_OPTIONS.map(({ id, label }) => (
              <AccountSettingsRadio
                key={id}
                name="sort-criteria"
                value={id}
                label={label}
                checked={sortCriteria === id}
                onChange={setSortCriteria}
              />
            ))}
          </div>
          <AccountSettingsSelect label="Sort Order" value={sortOrder} onChange={setSortOrder} options={SORT_ORDER_OPTIONS} />
        </AccountSettingsCard>

        <AccountSettingsCard title="Search Restrictions">
          <div className="account-settings-option-grid account-settings-option-grid--radios" role="radiogroup" aria-label="Search restrictions">
            {SEARCH_RESTRICTION_OPTIONS.map(({ id, label }) => (
              <AccountSettingsRadio
                key={id}
                name="search-restriction"
                value={id}
                label={label}
                checked={searchRestriction === id}
                onChange={setSearchRestriction}
              />
            ))}
          </div>
        </AccountSettingsCard>
      </div>
    </div>
  );
}
