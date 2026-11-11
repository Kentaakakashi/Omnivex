import React, { Suspense } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { ArrowUpRight, LogIn } from "lucide-react";
import PillNav from "../../components/react-bits/navigation/PillNav.jsx";
import { StaggeredMenu } from "../../components/react-bits/navigation/StaggeredMenu.jsx";

const navigation = [
  { label: "Discover", href: "/discover" },
  { label: "Characters", href: "/characters" },
  { label: "Matchups", href: "/matchups/create" },
  { label: "Rankings", href: "/rankings" },
  { label: "Community", href: "/community" },
  { label: "Universes", href: "/universes" }
];

function RouterAnchor({ href, ...props }) {
  return <Link to={href || "/"} {...props} />;
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeHref = navigation.find(item =>
    location.pathname === item.href ||
    (item.href !== "/matchups/create" && location.pathname.startsWith(item.href + "/"))
  )?.href;

  const mobileItems = navigation.map(item => ({
    label: item.label,
    link: item.href,
    ariaLabel: `Open ${item.label}`
  }));

  return (
    <div className="omnivex-app">
      <header className="site-header">
        <div className="desktop-header">
          <Link className="brand-lockup" to="/" aria-label="OMNIVEX home">
            <span className="brand-glyph" aria-hidden="true">O<span>×</span></span>
            <span className="brand-name">OMNIVEX<small>BEYOND EVERY UNIVERSE</small></span>
          </Link>
          <nav className="desktop-navigation" aria-label="Primary navigation">
            <PillNav
              items={navigation}
              activeHref={activeHref}
              linkComponent={RouterAnchor}
              theme="light"
              layout="joined"
              size="md"
              surface="glass"
              itemStyle="pill"
              hoverEffect="fill"
              indicator="dot"
              highlightColor="#173B46"
              highlightTextColor="#F7F9F8"
              textColor="#173B46"
              collapse="never"
              intro
              ariaLabel="OMNIVEX primary"
            />
          </nav>
          <Link className="sign-in-link" to="/auth/sign-in"><LogIn size={15} /> Sign in <ArrowUpRight size={14} /></Link>
        </div>

        <div className="mobile-header">
          <StaggeredMenu
            position="right"
            colors={["#173B46", "#13242D", "#E76F51"]}
            items={mobileItems}
            displaySocials={false}
            displayItemNumbering
            logoUrl="/favicon.svg"
            menuButtonColor="#13242D"
            openMenuButtonColor="#F7F9F8"
            accentColor="#42BFC0"
            changeMenuColorOnOpen={false}
            isFixed
            closeOnClickAway
            onItemClick={item => navigate(item.link)}
            className="omnivex-mobile-menu"
          />
          <Link className="mobile-sign-in" to="/auth/sign-in" aria-label="Sign in"><LogIn size={18} /></Link>
        </div>
      </header>

      <main className="site-main"><Suspense fallback={<div className="atlas-loading" role="status">Loading Field Atlas modules…</div>}><Outlet /></Suspense></main>
      <footer className="site-footer">
        <Link className="footer-brand" to="/">OMNIVEX <span>×</span></Link>
        <p>Explore widely. Compare carefully. Follow the evidence.</p>
        <span className="footer-note">Independent fan and research project · Preview data is labelled</span>
      </footer>
    </div>
  );
}
