function Header() {
  return (
    <header className="header">
      <a href="#" className="logo">
        <img src="/APMLogo.svg" alt="apm music" className="logo-img" />
      </a>
      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Add keywords, paste a link, or try a prompt like 'climactic mountain summit at dawn'" />
      </div>
      <div className="header-actions">
        <button className="icon-btn" title="Menu">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
      </div>
    </header>
  );
}

export default Header;
