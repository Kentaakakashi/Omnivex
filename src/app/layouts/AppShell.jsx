import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ArrowUpRight, Bookmark, Compass, House, LogIn, Menu, Microscope, Swords, Trophy, Users, X } from "lucide-react";
import { useAuth } from "../providers/AuthProvider.jsx";

const primaryNavigation = [
  { label: "Home", href: "/", icon: House },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Matchups", href: "/matchups", icon: Swords },
  { label: "Research", href: "/research", icon: Microscope },
  { label: "Community", href: "/community", icon: Users },
  { label: "Rankings", href: "/rankings", icon: Trophy }
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppShell() {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="omnivex-app">
      <header className="site-header">
        <div className="desktop-header platform-header">
          <Link className="brand-lockup" to="/" aria-label="OMNIVEX home" onClick={closeMenu}>
            <span className="brand-glyph" aria-hidden="true">O<span>×</span></span>
            <span className="brand-name">OMNIVEX<small>BEYOND EVERY UNIVERSE</small></span>
          </Link>
          <nav className="desktop-navigation platform-navigation" aria-label="Primary navigation">
            {primaryNavigation.map(item => {
              const Icon = item.icon;
              return <Link key={item.href} to={item.href} className={isActive(location.pathname, item.href) ? "is-active" : ""}><Icon size={15}/><span>{item.label}</span></Link>;
            })}
          </nav>
          <div className="header-utilities">
            <Link to="/library" className="header-utility-link" aria-label="Open library" title="Library"><Bookmark size={17}/></Link>
            <Link to={user ? "/profile/me" : "/auth/sign-in"} className="sign-in-link">{user ? "Profile" : <><LogIn size={15}/> Sign in</>} <ArrowUpRight size={14}/></Link>
          </div>
        </div>
        <div className="mobile-header platform-mobile-header">
          <Link className="brand-lockup" to="/" aria-label="OMNIVEX home" onClick={closeMenu}>
            <span className="brand-glyph" aria-hidden="true">O<span>×</span></span>
            <span className="brand-name">OMNIVEX<small>BEYOND EVERY UNIVERSE</small></span>
          </Link>
          <div className="mobile-header-actions">
            <Link className="header-utility-link" to="/library" aria-label="Open library"><Bookmark size={17}/></Link>
            <button type="button" className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-navigation-panel" aria-label="Mobile navigation">
            {primaryNavigation.map(item => {
              const Icon = item.icon;
              return <Link key={item.href} to={item.href} className={isActive(location.pathname, item.href) ? "is-active" : ""} onClick={closeMenu}><Icon size={18}/>{item.label}<ArrowUpRight size={15}/></Link>;
            })}
            <Link to={user ? "/profile/me" : "/auth/sign-in"} onClick={closeMenu}><LogIn size={18}/>{user ? "Your profile" : "Sign in"}<ArrowUpRight size={15}/></Link>
          </nav>
        )}
      </header>
      <main className="site-main"><Outlet/></main>
      <footer className="site-footer platform-footer">
        <Link className="footer-brand" to="/">OMNIVEX <span>×</span></Link>
        <p>Explore widely. Compare carefully. Follow the evidence.</p>
        <div className="footer-links"><Link to="/explore">Explore</Link><Link to="/research">Research</Link><Link to="/community">Community</Link><Link to="/library">Library</Link></div>
        <span className="footer-note">Independent research & community platform</span>
      </footer>
    </div>
  );
}
