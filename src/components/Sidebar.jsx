import { NavLink } from 'react-router-dom';
import { ROUTE_DESIGN_SYSTEM, ROUTE_PROJECT_DETAILS, ROUTE_SEARCH } from '../constants/routes';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

const LEFT_NAV_SEARCH_ICONS = {
  active: '/icons/LeftNav-Search-Active.svg?v=5',
  inactive: '/icons/LeftNav-Search-Inactive.svg?v=5',
};

const NAV_ITEMS = [
  {
    icon: '/nav-icons/Home.svg',
    activeIconLight: '/nav-icons/Home-active-lightmode.svg',
    title: 'Home',
    to: ROUTE_PROJECT_DETAILS,
  },
  { title: 'Search', to: ROUTE_SEARCH, isSearch: true },
  { icon: '/nav-icons/Calendar.svg', title: 'Calendar' },
  { icon: '/nav-icons/Playlists.svg', title: 'Playlists' },
  { icon: '/nav-icons/SoundEffects.svg', title: 'Sound Effects' },
];

function navItemIconSrc(item, theme, isActive) {
  if (isActive && theme === 'light' && item.activeIconLight) {
    return item.activeIconLight;
  }
  return resolveThemedAsset(item.icon, theme);
}

function NavSearchIcon({ theme }) {
  return (
    <>
      <img
        src={resolveThemedAsset(LEFT_NAV_SEARCH_ICONS.inactive, theme)}
        alt=""
        className="nav-item-search-icon nav-item-search-icon--inactive"
      />
      <img
        src={LEFT_NAV_SEARCH_ICONS.active}
        alt=""
        className="nav-item-search-icon nav-item-search-icon--active"
      />
    </>
  );
}

function Sidebar() {
  const theme = useThemeName();

  return (
    <aside className="sidebar">
      <nav className="nav-icons" aria-label="Primary">
        {NAV_ITEMS.map((item) =>
          item.to ? (
            <NavLink
              key={item.title}
              to={item.to}
              end={item.to === ROUTE_PROJECT_DETAILS}
              className={({ isActive }) =>
                `nav-item${item.isSearch ? ' nav-item--search' : ''}${isActive ? ' nav-item--active' : ''}`
              }
              title={item.title}
            >
              {({ isActive }) =>
                item.isSearch ? (
                  <NavSearchIcon theme={theme} />
                ) : (
                  <img src={navItemIconSrc(item, theme, isActive)} alt="" />
                )
              }
            </NavLink>
          ) : (
            <a
              key={item.title}
              href="#"
              className="nav-item"
              title={item.title}
              onClick={(e) => e.preventDefault()}
            >
              <img src={resolveThemedAsset(item.icon, theme)} alt="" />
            </a>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <NavLink
          to={ROUTE_DESIGN_SYSTEM}
          className={({ isActive }) => `nav-item nav-item--design-system${isActive ? ' nav-item--active' : ''}`}
          title="Design System"
        >
          <img src="/icons/design-system.svg" alt="" />
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
