function Sidebar() {
  const navItems = [
    { icon: '/nav-icons/Home.svg', title: 'Home' },
    { icon: '/nav-icons/Search.svg', title: 'Search' },
    { icon: '/nav-icons/Calendar.svg', title: 'Calendar' },
    { icon: '/nav-icons/Playlists.svg', title: 'Playlists' },
    { icon: '/nav-icons/SoundEffects.svg', title: 'Sound Effects' },
  ];

  return (
    <aside className="sidebar">
      <nav className="nav-icons">
        {navItems.map((item) => (
          <a key={item.title} href="#" className="nav-item" title={item.title}>
            <img src={item.icon} alt="" />
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
