import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check,
  ChevronDown, CircleDot, Layers3, Menu, MessageSquareText, Orbit,
  Search, ShieldCheck, X
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const universeItems = [
  { id: "anime", label: "Anime & manga", count: "Character worlds", detail: "Follow canon, forms and feats across long-running stories.", symbol: "界", tone: "blue" },
  { id: "comics", label: "Comics", count: "Many continuities", detail: "Separate runs, timelines, imprints and alternate versions.", symbol: "∞", tone: "silver" },
  { id: "screen", label: "Film & television", count: "Screen universes", detail: "Track appearances, adaptations and on-screen evidence.", symbol: "◉", tone: "amber" },
  { id: "games", label: "Games", count: "Playable universes", detail: "Characters, lore, equipment and game-specific versions.", symbol: "⌘", tone: "teal" },
  { id: "myth", label: "Mythology", count: "Shared traditions", detail: "Explore source traditions without flattening their differences.", symbol: "✳", tone: "gold" },
  { id: "creatures", label: "Creatures & more", count: "Beyond fiction", detail: "A growing home for extraordinary entities and open categories.", symbol: "◇", tone: "ice" }
];

const searchEntries = [
  { name: "Goku", universe: "Dragon Ball", category: "Anime & manga" },
  { name: "Superman", universe: "DC Comics", category: "Comics" },
  { name: "Godzilla", universe: "Toho", category: "Film & television" },
  { name: "Wonder Woman", universe: "DC Comics", category: "Comics" },
  { name: "Kratos", universe: "God of War", category: "Games" },
  { name: "Thor", universe: "Norse mythology / Marvel", category: "Mythology · Comics" },
  { name: "Anansi", universe: "Akan traditions", category: "Mythology" },
  { name: "Cthulhu", universe: "Cthulhu Mythos", category: "Literature" }
];

const debates = [
  { tag: "CONTINUITY", title: "When does a composite version stop being useful?", note: "A question about rules, not raw power", tone: "blue" },
  { tag: "EVIDENCE", title: "Should a one-off outlier ever define a character?", note: "Bring context. Bring counter-feats.", tone: "amber" },
  { tag: "METHODOLOGY", title: "What makes a source strong enough to verify a feat?", note: "Compare the evidence standards", tone: "teal" }
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="OMNIVEX home">
      <span className="brand-mark" aria-hidden="true"><span className="brand-orbit brand-orbit--a" /><span className="brand-orbit brand-orbit--b" /><span className="brand-core" /></span>
      <span className="brand-word">OMNIVEX<span className="brand-period">.</span><small>BEYOND EVERY UNIVERSE</small></span>
    </a>
  );
}

function Eyebrow({ children }) {
  return <div className="eyebrow"><span className="eyebrow-dot" />{children}</div>;
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.14 }} transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Header({ onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["Discover", "#discover"], ["Matchups", "#matchup-studio"], ["The index", "#universes"], ["Method", "#method"], ["Community", "#community"]];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={"desktop-nav " + (menuOpen ? "desktop-nav--open" : "")} aria-label="Main navigation">
          {links.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" onClick={onSearch} aria-label="Search OMNIVEX"><Search size={17} /><span>Search</span><kbd>⌘ K</kbd></button>
          <a className="header-cta" href="#matchup-studio">Open the studio <ArrowUpRight size={15} /></a>
          <button className="mobile-menu-button" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}

function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? searchEntries.filter(item => (item.name + " " + item.universe + " " + item.category).toLowerCase().includes(q)) : searchEntries.slice(0, 5);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = event => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className="search-modal" role="dialog" aria-modal="true" aria-label="Search the OMNIVEX index" initial={{ opacity: 0, y: -14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.2 }} onMouseDown={event => event.stopPropagation()}>
            <div className="search-modal-input"><Search size={20} /><input autoFocus placeholder="Search a character, universe or matchup..." value={query} onChange={event => setQuery(event.target.value)} /><button onClick={onClose} aria-label="Close search"><X size={18} /></button></div>
            <div className="search-modal-meta"><span>{query ? "MATCHING ENTRIES" : "START EXPLORING"}</span><span>ESC TO CLOSE</span></div>
            <div className="search-results">
              {results.length ? results.map(item => (
                <button className="search-result" key={item.name} onClick={() => { onClose(); setQuery(""); }}>
                  <span className="result-symbol"><CircleDot size={16} /></span><span className="result-copy"><strong>{item.name}</strong><small>{item.universe}</small></span><span className="result-category">{item.category}</span><ArrowUpRight size={15} />
                </button>
              )) : <div className="search-empty">No matching preview entries. Try a different name.</div>}
            </div>
            <div className="search-modal-foot"><span>THE OMNIVEX INDEX</span><span>Search previews are illustrative until the entity library is connected.</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OrbitalScene() {
  return (
    <div className="orbital-scene" aria-label="Abstract orbital illustration">
      <div className="scene-coordinate scene-coordinate--top">FIELD 07° 42′ N <span>·</span> SECTOR 001</div>
      <div className="scene-stars" /><div className="scene-halo scene-halo--one" /><div className="scene-halo scene-halo--two" />
      <div className="orbit-line orbit-line--one" /><div className="orbit-line orbit-line--two" /><div className="orbit-line orbit-line--three" />
      <div className="planet planet--main"><div className="planet-shade" /><div className="planet-ridge" /></div>
      <div className="planet planet--moon" /><div className="planet planet--tiny" />
      <div className="scene-crosshair scene-crosshair--one" /><div className="scene-crosshair scene-crosshair--two" />
      <div className="scene-label scene-label--main"><span>01 / PRIMARY BODY</span><strong>THE KNOWN</strong><small>One point in an infinite field</small></div>
      <div className="scene-label scene-label--side"><span>02 / OUTER ORBIT</span><strong>THE UNKNOWN</strong></div>
      <div className="scene-coordinate scene-coordinate--bottom">OBSERVATORY / OMNIVEX <span>·</span> EST. 001</div>
    </div>
  );
}

function ComparisonStudio({ onPreview }) {
  const [first, setFirst] = useState("Goku");
  const [second, setSecond] = useState("Superman");
  const [mode, setMode] = useState("Deep research");
  const [version, setVersion] = useState("Choose versions later");
  return (
    <form className="studio-form" onSubmit={event => { event.preventDefault(); onPreview(first.trim(), second.trim(), mode, version); }}>
      <div className="studio-form-head"><span className="form-index">01 — MATCHUP STUDIO</span><span className="form-status"><i /> CONFIGURATION PREVIEW</span></div>
      <div className="studio-fields">
        <label className="entity-input"><span>ENTITY A</span><div><CircleDot size={17} /><input value={first} onChange={event => setFirst(event.target.value)} placeholder="Search the first entity" /></div></label>
        <span className="versus-mark">VS</span>
        <label className="entity-input"><span>ENTITY B</span><div><CircleDot size={17} /><input value={second} onChange={event => setSecond(event.target.value)} placeholder="Search the second entity" /></div></label>
        <button className="studio-submit" type="submit">Configure <ArrowUpRight size={17} /></button>
      </div>
      <div className="studio-options">
        <label className="option-select"><span>ANALYSIS DEPTH</span><select value={mode} onChange={event => setMode(event.target.value)}><option>Deep research</option><option>Standard comparison</option><option>Quick overview</option><option>Evidence audit</option></select><ChevronDown size={14} /></label>
        <label className="option-select option-select--wide"><span>VERSION RULE</span><select value={version} onChange={event => setVersion(event.target.value)}><option>Choose versions later</option><option>Specific continuity only</option><option>Composite — explicit opt-in</option><option>Canon-only evidence</option></select><ChevronDown size={14} /></label>
        <p>Version and continuity choices matter. They are never silently combined.</p>
      </div>
    </form>
  );
}

function UniverseCard({ item, index, selected, onSelect }) {
  return (
    <button className={"universe-card universe-card--" + item.tone + (selected ? " is-selected" : "")} onClick={() => onSelect(item.id)}>
      <span className="universe-card-index">0{index + 1}</span><span className="universe-symbol">{item.symbol}</span>
      <span className="universe-card-copy"><strong>{item.label}</strong><small>{item.count}</small></span><ArrowUpRight className="universe-arrow" size={18} /><span className="universe-card-line" />
    </button>
  );
}

function EvidenceDiagram() {
  return (
    <div className="evidence-diagram">
      <div className="diagram-top"><span>HOW A VERDICT IS BUILT</span><span>MODEL / 01—04</span></div>
      <div className="diagram-orbit">
        <div className="diagram-ring diagram-ring--outer" /><div className="diagram-ring diagram-ring--inner" />
        <div className="diagram-node diagram-node--a"><BookOpen size={17} /><span>SOURCE</span></div>
        <div className="diagram-node diagram-node--b"><Layers3 size={17} /><span>CONTEXT</span></div>
        <div className="diagram-node diagram-node--c"><ShieldCheck size={17} /><span>REVIEW</span></div>
        <div className="diagram-center"><span>O</span><small>EVIDENCE</small></div>
        <span className="diagram-point diagram-point--one" /><span className="diagram-point diagram-point--two" />
      </div>
      <div className="diagram-foot"><span>NO SOURCE, NO CLAIM.</span><span>01 / 03</span></div>
    </div>
  );
}

function Toast({ message, onClose }) {
  return (
    <AnimatePresence>
      {message && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span className="toast-icon"><Check size={16} /></span><span>{message}</span><button onClick={onClose} aria-label="Dismiss notification"><X size={15} /></button></motion.div>}
    </AnimatePresence>
  );
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeUniverse, setActiveUniverse] = useState("anime");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onKey = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notify = message => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4200);
  };

  const previewMatchup = (first, second, mode, version) => {
    if (!first || !second) return notify("Add an entity on both sides to configure a matchup.");
    if (first.toLowerCase() === second.toLowerCase()) return notify("Choose two different entities to continue.");
    notify("Preview configured: " + first + " vs " + second + " · " + mode + " · " + version + ".");
  };

  const activeUniverseItem = universeItems.find(item => item.id === activeUniverse) || universeItems[0];

  return (
    <div className="app-shell" id="top">
      <div className="topline"><span>AN INDEX WITHOUT BORDERS</span><span className="topline-center"><i /> THE OBSERVATORY IS TAKING SHAPE</span><span>VOL. 001 <span className="topline-divider">/</span> EARLY EDITION</span></div>
      <Header onSearch={() => setSearchOpen(true)} />
      <main>
        <section className="hero-section" id="discover">
          <div className="hero-backdrop" />
          <div className="hero-grid">
            <div className="hero-copy">
              <Eyebrow>THE UNIVERSE IS BIGGER THAN THE DEBATE</Eyebrow>
              <h1>Every universe<br />has <em>another</em><br /><span>side.</span></h1>
              <p className="hero-description">A living index for the extraordinary. Compare entities, trace the evidence, and explore the worlds behind every story.</p>
              <div className="hero-actions"><a className="button button--light" href="#matchup-studio">Build a comparison <ArrowUpRight size={16} /></a><a className="text-link" href="#universes">Explore the index <ArrowDown size={15} /></a></div>
              <button className="hero-search" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search characters, universes, matchups...</span><kbd>⌘ K</kbd></button>
              <div className="hero-footnote"><span>01 / 04</span><span>COMPARE <i /> INVESTIGATE <i /> DISCOVER</span></div>
            </div>
            <div className="hero-art"><OrbitalScene /></div>
          </div>
          <div className="hero-bottom-rule"><span>AN OPEN FIELD OF POSSIBILITY</span><span>SCROLL TO EXPLORE <ArrowDown size={13} /></span></div>
        </section>

        <section className="studio-section section-shell" id="matchup-studio">
          <Reveal className="section-heading section-heading--compact">
            <div><Eyebrow>THE FIRST QUESTION</Eyebrow><h2>Start with <em>two.</em></h2></div>
            <p>Set the boundaries before you compare. A meaningful matchup begins with the right versions, conditions and sources.</p>
          </Reveal>
          <Reveal delay={0.08}><ComparisonStudio onPreview={previewMatchup} /></Reveal>
          <div className="studio-note"><span><ShieldCheck size={14} /> CONTINUITY-AWARE BY DESIGN</span><span>This is a front-end preview. Research and saved matchups will connect when the engine is implemented.</span></div>
        </section>

        <section className="manifesto-section">
          <div className="manifesto-inner">
            <Reveal className="manifesto-label"><Eyebrow>NOT JUST ANOTHER TIER LIST</Eyebrow><span className="manifesto-number">01—03</span></Reveal>
            <Reveal className="manifesto-copy" delay={0.08}><h2>Big questions deserve<br />better <em>receipts.</em></h2><p>OMNIVEX is built around a simple idea: the conclusion should never outrun the evidence. A place where curiosity can go deep—and disagreements can stay honest.</p><a href="#method" className="inline-arrow">How we think <ArrowUpRight size={16} /></a></Reveal>
            <Reveal className="manifesto-orbit" delay={0.14}><div className="manifesto-planet" /><div className="manifesto-ring manifesto-ring--a" /><div className="manifesto-ring manifesto-ring--b" /><span>BEYOND<br />THE KNOWN</span></Reveal>
          </div>
        </section>

        <section className="universes-section section-shell" id="universes">
          <Reveal className="section-heading"><div><Eyebrow>THE INDEX / A GROWING ATLAS</Eyebrow><h2>Find your <em>universe.</em></h2></div><p>Different worlds have different rules. Explore each on its own terms, with room for versions, timelines and source traditions.</p></Reveal>
          <div className="universe-layout">
            <div className="universe-list">{universeItems.map((item, index) => <UniverseCard key={item.id} item={item} index={index} selected={activeUniverse === item.id} onSelect={setActiveUniverse} />)}</div>
            <Reveal className={"universe-detail universe-detail--" + activeUniverseItem.tone}>
              <div className="universe-detail-top"><span>SELECTED DOMAIN / 0{universeItems.findIndex(item => item.id === activeUniverse) + 1}</span><span><Orbit size={15} /> EXPLORATION MODE</span></div>
              <div className="universe-detail-visual"><div className="domain-globe"><span>{activeUniverseItem.symbol}</span></div><div className="domain-orbit domain-orbit--one" /><div className="domain-orbit domain-orbit--two" /><span className="domain-coordinate">INDEX / {activeUniverseItem.id.toUpperCase()}</span></div>
              <div className="universe-detail-copy"><span>{activeUniverseItem.count}</span><h3>{activeUniverseItem.label}</h3><p>{activeUniverseItem.detail}</p><a href="#method" className="inline-arrow">Explore the framework <ArrowUpRight size={16} /></a></div>
            </Reveal>
          </div>
          <div className="section-tail"><span>MORE WORLDS WILL FIND THEIR PLACE HERE.</span><span>THE INDEX IS DESIGNED TO GROW <ArrowUpRight size={14} /></span></div>
        </section>

        <section className="method-section" id="method">
          <div className="method-inner section-shell">
            <Reveal className="method-intro"><Eyebrow>THE METHOD / BUILT TO BE QUESTIONED</Eyebrow><h2>Evidence first.<br /><em>Certainty second.</em></h2><p>A verdict is not a fact just because it sounds confident. OMNIVEX separates what a source shows, what someone interprets, and what remains unknown.</p><a href="#community" className="inline-arrow">See how debate works <ArrowUpRight size={16} /></a></Reveal>
            <Reveal className="method-visual" delay={0.1}><EvidenceDiagram /></Reveal>
            <div className="method-steps">
              <Reveal className="method-step"><span>01</span><div><strong>Trace the source</strong><p>Every claim should lead back to a specific issue, chapter, scene, text or reliable reference.</p></div><BookOpen size={19} /></Reveal>
              <Reveal className="method-step" delay={0.06}><span>02</span><div><strong>Keep the context</strong><p>Version, continuity, conditions, limitations and counter-evidence stay attached to the claim.</p></div><Layers3 size={19} /></Reveal>
              <Reveal className="method-step" delay={0.12}><span>03</span><div><strong>Show the uncertainty</strong><p>Canon outcomes, evidence-based predictions and inconclusive cases are never blended together.</p></div><ShieldCheck size={19} /></Reveal>
            </div>
          </div>
        </section>

        <section className="community-section section-shell" id="community">
          <Reveal className="section-heading"><div><Eyebrow>THE HUMAN SIDE OF THE INDEX</Eyebrow><h2>Bring your <em>argument.</em></h2></div><p>Strong communities do more than vote. They bring sources, challenge assumptions and make the shared record better.</p></Reveal>
          <div className="community-layout">
            <Reveal className="community-feature">
              <div className="community-feature-top"><span><MessageSquareText size={16} /> THE DEBATE FLOOR</span><span>COMMUNITY / 001</span></div>
              <div className="community-feature-art"><div className="debate-orbit debate-orbit--one" /><div className="debate-orbit debate-orbit--two" /><div className="debate-core"><span>≠</span></div><span className="debate-caption debate-caption--a">CLAIM</span><span className="debate-caption debate-caption--b">COUNTERCLAIM</span></div>
              <div className="community-feature-copy"><h3>Disagreement is useful.<br /><em>Good faith makes it better.</em></h3><p>Structured arguments, linked evidence, clear corrections and a community verdict that stays separate from the research engine.</p><a href="#matchup-studio" className="inline-arrow">Enter the conversation <ArrowUpRight size={16} /></a></div>
            </Reveal>
            <div className="debate-list">
              {debates.map((debate, index) => <Reveal key={debate.title} className={"debate-row debate-row--" + debate.tone} delay={index * 0.06}><span className="debate-index">0{index + 1}</span><div><span className="debate-tag">{debate.tag}</span><h3>{debate.title}</h3><p>{debate.note}</p></div><ArrowUpRight size={18} /></Reveal>)}
              <div className="community-footnote"><span><Activity size={15} /> COMMUNITY FEATURES / IN DESIGN</span><span>Thoughtful contributions over noise.</span></div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-stars" />
          <Reveal className="closing-copy"><Eyebrow>THE FIELD IS OPEN</Eyebrow><h2>Look a little<br /><em>further.</em></h2><p>There is always another version. Another source. Another perspective worth exploring.</p><a href="#matchup-studio" className="button button--light">Enter OMNIVEX <ArrowUpRight size={16} /></a></Reveal>
          <div className="closing-orbit closing-orbit--one" /><div className="closing-orbit closing-orbit--two" /><div className="closing-world" />
          <div className="closing-coordinate">OMNIVEX / OBSERVATORY <span>·</span> 001</div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main"><Brand /><p>An open index for comparison,<br />evidence, discovery and debate.</p>
          <div className="footer-links"><div><span>EXPLORE</span><a href="#universes">The index</a><a href="#matchup-studio">Matchup studio</a><a href="#community">Community</a></div><div><span>PRINCIPLES</span><a href="#method">Evidence standards</a><a href="#method">Continuity matters</a><a href="#method">Open questions</a></div></div>
          <a className="back-top" href="#top">BACK TO THE TOP <ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-bottom"><span>© 2026 OMNIVEX. AN OPEN FIELD OF POSSIBILITY.</span><span>BUILT FOR THE CURIOUS <span className="footer-star">✳</span></span><span>INDEPENDENT PROJECT · NOT AFFILIATED WITH ANY FRANCHISE</span></div>
      </footer>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
