import { Fragment, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { getOverflowDropdownStyle, getSegmentOverflowMenuHeight } from '../utils/overflowDropdownPosition';
import { useOverflowDropdownMenu } from '../hooks/useOverflowDropdownMenu';

const SECTIONS = [
  { id: 'info', label: 'Track Info' },
  { id: 'versions', label: 'Versions' },
  { id: 'stems', label: 'Stems' },
];

const INFO_GROUPS = [
  [
    ['Album Title', 'Harpworks'],
    ['Track ID', 'SON_ROCK_0247_05501'],
    ['ISRC', 'USAT20901756'],
    ['Track Type', 'Main'],
    ['Master Genre', 'Rock'],
    ['Duration', '3.12'],
    ['APM Release Date', '7/21/2022'],
    ['Recording Date', '9/14/2021'],
  ],
  [
    ['Sub-Genre', 'Rock, Hard Rock, Heavy Metal, Stadium Rock'],
    ['Instrumental / Vocal Grouping', 'Rock Band'],
    ['Mood', 'Strong, Powerful'],
    ['Character', 'Glitchy, Gritty, Percussive, Glitchy, Gritty'],
    ['Region', 'Spain'],
    ['BPM', '131'],
    ['Movements', 'Chase, Driving, Frenzy, Ponderous, Running'],
    ['Era', '1980s, 1990s'],
  ],
  [
    ['Composers', 'Johanna Beth Harris (ASCAP) 33%, Robert Anthony Navarro (ASCAP) 33%, Devin Lamar Forney (ASCAP) 33%'],
    ['Publishers', 'Sonoton Music (GEMA) 25%, Bruton APM Music (ASCAP) 25%, Figurata Music GMBH KG (GEMA) 25%, Bruton APM (ASCAP) 25%'],
  ],
];

const TRACK_FLAGS = [
  [
    ['Y', 'Has Lyrics'],
    ['N', 'Vintage'],
    ['Y', 'Has Stems'],
    ['N', 'Instrumental Only'],
    ['Y', 'Artist Driven'],
    ['N', 'Amature/Poorly played'],
    ['N', 'Stems Unavailable'],
  ],
  [
    ['Y', 'Well Known Tune'],
    ['N', 'Solo'],
    ['Y', 'Trailer Track'],
    ['N', 'National Anthem'],
    ['N', 'Explicit Lyrics'],
    ['N', 'Archival'],
  ],
];

const INSTRUMENTS_PREVIEW = 'Drum Kit, Western Percussion, Bass, Electric, Guitar, Acoustic/Nylon String...';
const INSTRUMENTS_FULL = 'Drum Kit, Western Percussion, Bass, Electric, Guitar, Acoustic/Nylon String, Piano, Synth';

const VERSION_DESCRIPTION =
  'Urban Pop song. Introspective & heady. Captivating synths and imposing sub on a determined Zouk beat with seductive female voices.';

const STEM_ROWS = ['Accordian', 'Cello', 'Cello Bass'];

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5L8 5.5z" fill="currentColor" />
    </svg>
  );
}

function TrackInfoPanel() {
  const [instrumentsOpen, setInstrumentsOpen] = useState(false);

  return (
    <div className="track-mobile-details__info">
      {INFO_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="track-mobile-details__group">
          {group.map(([label, value], fieldIndex) => (
            <Fragment key={label}>
              <p className="track-mobile-details__field">
                <span className="track-mobile-details__label">{label}</span>{' '}
                <span className="track-mobile-details__value">{value}</span>
              </p>
              {groupIndex === 1 && fieldIndex === 0 && (
                <p className="track-mobile-details__field">
                  <span className="track-mobile-details__label">Instruments</span>{' '}
                  <span className="track-mobile-details__value">
                    {instrumentsOpen ? INSTRUMENTS_FULL : INSTRUMENTS_PREVIEW}{' '}
                    <button
                      type="button"
                      className="track-mobile-details__more"
                      onClick={() => setInstrumentsOpen((open) => !open)}
                    >
                      {instrumentsOpen ? 'See less' : 'See more'}
                    </button>
                  </span>
                </p>
              )}
            </Fragment>
          ))}
        </div>
      ))}
      <div className="track-mobile-details__group">
        <div className="track-mobile-details__flags">
          {TRACK_FLAGS.map((column) => (
            <ul key={column[0][1]} className="track-mobile-details__flag-col">
              {column.map(([mark, label]) => (
                <li key={label} className="track-mobile-details__flag">
                  <span className="track-mobile-details__label">{mark}</span>{' '}
                  <span className="track-mobile-details__value">{label}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

function VersionRow({ version, onPlay }) {
  const getMenuStyle = useCallback((triggerEl) => {
    if (!triggerEl) return null;
    return {
      ...getOverflowDropdownStyle(triggerEl.getBoundingClientRect(), {
        menuHeight: getSegmentOverflowMenuHeight(3),
      }),
      zIndex: 1100,
    };
  }, []);
  const {
    open,
    style,
    triggerRef,
    toggle,
    close,
  } = useOverflowDropdownMenu({ getStyle: getMenuStyle });

  return (
    <div className="track-mobile-details__version">
      <button type="button" className="track-mobile-details__play" aria-label={`Play ${version.title}`} onClick={() => onPlay?.(version)}>
        <PlayGlyph />
      </button>
      <div className="track-mobile-details__version-text">
        <p className="track-mobile-details__version-title">{version.title}</p>
        <p className="track-mobile-details__version-desc">{version.desc}</p>
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="track-mobile-details__more-btn"
        aria-label="More actions"
        aria-expanded={open}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
        </svg>
      </button>
      {open && createPortal(
        <div
          data-track-dropdown-portal
          className="track-actions-overflow-dropdown track-actions-overflow-dropdown--segment-style track-actions-overflow-dropdown--portal"
          style={style ?? { position: 'fixed', zIndex: 1100, visibility: 'hidden' }}
        >
          <button type="button" className="track-actions-overflow-dropdown-item" onClick={close}>
            <img src="/icons/Upload.svg" alt="" />
            Share
          </button>
          <button type="button" className="track-actions-overflow-dropdown-item" onClick={close}>
            <img src="/icons/add.svg" alt="" />
            Add to a Project
          </button>
          <button type="button" className="track-actions-overflow-dropdown-item" onClick={close}>
            <img src="/icons/download.svg" alt="" />
            Download
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

function StemRow({ name, onPlay }) {
  return (
    <div className="track-mobile-details__stem">
      <button type="button" className="track-mobile-details__play" aria-label={`Play ${name}`} onClick={onPlay}>
        <PlayGlyph />
      </button>
      <span className="track-mobile-details__stem-name">{name}</span>
      <div className="track-mobile-details__stem-actions">
        <button type="button" className="track-mobile-details__icon" aria-label="Share">
          <img src="/icons/Upload.svg" alt="" />
        </button>
        <button type="button" className="track-mobile-details__icon" aria-label="Add to a project">
          <img src="/icons/add.svg" alt="" />
        </button>
        <button type="button" className="track-mobile-details__icon" aria-label="Download">
          <img src="/icons/download.svg" alt="" />
        </button>
      </div>
    </div>
  );
}

export default function TrackMobileDetails({
  track,
  section,
  onSectionChange,
  onPlay,
}) {
  const versions = [1, 2, 3].map((index) => ({
    id: `${track.id}-version-${index}`,
    title: track.title,
    desc: track.desc || VERSION_DESCRIPTION,
    audioUrl: track.audioUrl,
    num: track.num,
  }));

  return (
    <div className="track-mobile-details">
      <div className="track-mobile-details__tabs" role="tablist" aria-label="Track details">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            className={`track-mobile-details__tab${section === id ? ' track-mobile-details__tab--active' : ''}`}
            onClick={() => onSectionChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {section === 'info' && <TrackInfoPanel />}
      {section === 'versions' && (
        <div className="track-mobile-details__versions">
          {versions.map((version) => (
            <VersionRow
              key={version.id}
              version={version}
              onPlay={onPlay}
            />
          ))}
        </div>
      )}
      {section === 'stems' && (
        <div className="track-mobile-details__stems">
          {STEM_ROWS.map((name) => (
            <StemRow key={name} name={name} onPlay={() => onPlay?.(track)} />
          ))}
        </div>
      )}
    </div>
  );
}
