import {
  ROUTE_ADMIN,
  ROUTE_ADMIN_ACCOUNT,
  ROUTE_ADMIN_NOTIFICATIONS,
  ROUTE_ADMIN_SETTINGS,
  ROUTE_ADMIN_TEAM,
} from './routes';

export const ADMIN_CURRENT_USER = {
  name: 'Matthew',
  initials: 'M',
};

export const ADMIN_TABS = [
  { id: 'activity', label: 'Overview', pageTitle: 'Analytics Dashboard', to: ROUTE_ADMIN },
  { id: 'team', label: 'Team', pageTitle: 'Team', to: ROUTE_ADMIN_TEAM },
  { id: 'account', label: 'My Account', pageTitle: 'My Account', to: ROUTE_ADMIN_ACCOUNT },
  { id: 'settings', label: 'Settings', pageTitle: 'Settings', to: ROUTE_ADMIN_SETTINGS },
  { id: 'notifications', label: 'Notifications', pageTitle: 'Notifications', to: ROUTE_ADMIN_NOTIFICATIONS },
];

export function adminTabIdFromPath(pathname) {
  const match = ADMIN_TABS.find(({ to }) => to === pathname);
  return match?.id ?? 'activity';
}

export function adminPageTitleFromPath(pathname) {
  const match = ADMIN_TABS.find(({ to }) => to === pathname);
  return match?.pageTitle ?? ADMIN_TABS[0].pageTitle;
}
