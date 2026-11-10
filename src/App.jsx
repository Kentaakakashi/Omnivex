import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowLeftRight, ArrowRight, ArrowUpRight, Bookmark,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Compass, Flame, Globe2,
  Menu, Search, ShieldCheck, Swords, Trophy, X, Zap
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const media = {
  spider: "https://commons.wikimedia.org/wiki/Special:FilePath/Spider-Man.jpg",
  iron: "https://commons.wikimedia.org/wiki/Special:FilePath/Iron%20Man%20transparent%20background.png",
  thanos: "https://commons.wikimedia.org/wiki/Special:FilePath/THANOS-Cosplay.jpg",
  batman: "https://commons.wikimedia.org/wiki/Special:FilePath/PA%20comic%20convention%20Cosplay%20of%20Batman.jpg",
  superman: "https://commons.wikimedia.org/wiki/Special:FilePath/Cosplayers%20as%20Superman%20and%20K%27Zuri%20the%20Unbound%20at%20L.A.%20Comic%20Con%202026.jpg"
};

const characters = [
  { id: "spider", name: "SPIDER-MAN", universe: "MARVEL · EARTH-616", type: "Human / Mutate", location: "New York, Earth", height: "5′10″", weight: "76 kg", image: media.spider, accent: "red", description: "The friendly neighbourhood hero. A brilliant mind with extraordinary reflexes and a danger sense.", tags: ["Spider-sense", "Agility", "Web technology"] },
  { id: "iron", name: "IRON MAN", universe: "MARVEL · EARTH-616", type: "Human · Armoured", location: "Malibu, Earth", height: "6′1″", weight: "102 kg", image: media.iron, accent: "gold", description: "Genius inventor whose armour systems turn preparation and engineering into extraordinary capability.", tags: ["Powered armour", "Engineering", "Repulsors"] },
  { id: "batman", name: "BATMAN", universe: "DC · PRIME EARTH", type: "Human", location: "Gotham City, Earth", height: "6′2″", weight: "95 kg", image: media.batman, accent: "silver", description: "The Dark Knight. A strategist and detective whose preparation is as important as his physical skill.", tags: ["Strategy", "Detective", "Gadgets"] },
  { id: "superman", name: "SUPERMAN", universe: "DC · PRIME EARTH", type: "Kryptonian", location: "Metropolis, Earth", height: "6′3″", weight: "107 kg", image: media.superman, accent: "blue", description: "A Kryptonian raised on Earth, with abilities shaped by Earth's yellow sun.", tags: ["Solar-powered", "Flight", "Super senses"] },
  { id: "thanos", name: "THANOS", universe: "MARVEL · EARTH-616", type: "Eternal / Deviant", location: "Titan", height: "6′7″", weight: "447 kg", image: media.thanos, accent: "violet", description: "The Mad Titan: a formidable strategist with immense physical power and advanced technology.", tags: ["Titan physiology", "Strategy", "Technology"] }
];

const matchups = [
  { a: "DARKSEID", b: "THANOS", sub: "Apokolips vs Titan", status: "DEEP RESEARCH", votes: "12.8K", color: "orange", imageA: media.batman, imageB: media.thanos, note: "A study in cosmic power and continuity." },
  { a: "BATMAN", b: "IRON MAN", sub: "Prep time · Standard equipment", status: "COMMUNITY DEBATE", votes: "8.4K", color: "blue", imageA: media.batman, imageB: media.iron, note: "Two minds. Two very different toolkits." },
  { a: "SUPERMAN", b: "THOR", sub: "Prime Earth vs Earth-616", status: "EVIDENCE REVIEW", votes: "6.2K", color: "violet", imageA: media.superman, imageB: media.thanos, note: "Comparing source-backed capabilities." }
];

const ranking = [
  { n: "01", name: "Superman", universe: "DC · PRIME EARTH", type: "Kryptonian", delta: "+4", img: media.superman },
  { n: "02", name: "Thor", universe: "MARVEL · EARTH-616", type: "Asgardian", delta: "+2", img: media.iron },
  { n: "03", name: "Doctor Strange", universe: "MARVEL · EARTH-616", type: "Sorcerer", delta: "−1", img: media.spider },
  { n: "04", name: "Wonder Woman", universe: "DC · PRIME EARTH", type: "Amazon", delta: "+3", img: media.batman },
];

function Image({ src, alt, className = "" }) {
  return <img className={className} src={src} alt={alt} loading="lazy" onError={e => { e.currentTarget.style.opacity = "0"; }} />;
}

function Brand() {
  return <a className="brand" href="#home"><span className="brand-symbol"><i /><i /><b /></span><span>OMNIVEX<small>BEYOND EVERY UNIVERSE</small></span></a>;
}

function Header({ onSearch }) {
  const [open, setOpen] = useState(false);
  const links = [["Discover", "#discover"], ["Characters", "#characters"], ["Matchups", "#matchups"], ["Rankings", "#rankings"], ["Community", "#community"]];
  return <header className="header">
    <div className="header-main">
      <button className="mobile-menu" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      <Brand />
      <nav className={open ? "nav nav-open" : "nav"}>{links.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}</nav>
      <div className="header-right"><button className="search-button" onClick={onSearch}><Search size={16} /><span>Search index</span><kbd>⌘ K</kbd></button><button className="avatar-button" aria-label="Profile">N</button></div>
    </div>
  </header>;
}

function SearchModal({ open, close }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters.filter(c => !q || (c.name + c.universe + c.type).toLowerCase().includes(q));
  }, [query]);
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);
  return <AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={close}>
    <motion.div className="search-modal" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} onMouseDown={e => e.stopPropagation()}>
      <div className="modal-input"><Search /><input autoFocus placeholder="Search characters, universes, matchups..." value={query} onChange={e => setQuery(e.target.value)} /><button onClick={close}><X /></button></div>
      <div className="modal-caption">CHARACTER INDEX <span>{results.length} RESULTS</span></div>
      {results.map(c => <button className="modal-result" key={c.id} onClick={() => { close(); document.getElementById("characters")?.scrollIntoView({ behavior: "smooth" }); }}><span>{c.name}</span><small>{c.universe}</small><ArrowUpRight size={16} /></button>)}
      {!results.length && <p className="empty">No matching entries in this preview.</p>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function Hero({ character, onBuild }) {
  return <section className="hero" id="home">
    <div className="hero-glow hero-glow-red" /><div className="hero-glow hero-glow-blue" />
    <div className="hero-grid-lines" />
    <div className="hero-topline"><span><i className="live-dot" /> THE OMNIVEX CHARACTER INDEX</span><span>ISSUE 001 <b>/</b> EARLY ACCESS</span></div>
    <div className="hero-content">
      <div className="hero-info">
        <div className="universe-label"><span className="marvel-mark">M</span> {character.universe}</div>
        <motion.div key={character.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .25 }}>
          <h1 className={"character-name accent-" + character.accent}>{character.name}</h1>
          <p className="character-kicker">CHARACTER PROFILE <span>·</span> INDEX 000{characters.findIndex(c => c.id === character.id) + 1}</p>
          <div className="character-facts">
            <div><span className="fact-icon">✳</span><span>{character.type}</span></div>
            <div><Globe2 /><span>{character.location}</span></div>
            <div><Activity /><span>{character.height}</span></div>
            <div><ShieldCheck /><span>{character.weight}</span></div>
          </div>
          <p className="character-description">{character.description}</p>
          <div className="character-tags">{character.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <div className="hero-buttons"><a className="primary-button" href="#characters">Explore profile <ArrowUpRight size={16} /></a><button className="round-info" onClick={onBuild}><CircleHelp size={20} /><span>BUILD A MATCHUP</span></button></div>
        </motion.div>
      </div>
      <div className="hero-character" key={character.id + "-art"}>
        <div className="character-backdrop" />
        <div className="character-frame" />
        <Image src={character.image} alt={character.name + " visual reference"} className="hero-character-image" />
        <div className="character-light character-light-red" /><div className="character-light character-light-blue" />
        <div className="hero-art-caption"><span>FIG. 001</span><span>{character.name} / {character.universe.split(" · ")[0]}</span></div>
      </div>
    </div>
    <div className="hero-bottom"><span>SELECT A CHARACTER</span><span>SCROLL TO EXPLORE <ArrowDown size={13} /></span></div>
  </section>;
}

function CharacterRail({ active, setActive }) {
  return <section className="character-rail-section" id="characters">
    <div className="rail-heading"><div><span className="section-overline">THE DATABASE</span><h2>Character <em>roster</em></h2></div><a href="#characters" className="subtle-link">VIEW ALL CHARACTERS <ArrowUpRight size={14} /></a></div>
    <div className="character-rail">{characters.map((c, i) => <button key={c.id} className={"roster-card " + (active.id === c.id ? "roster-active" : "")} onClick={() => { setActive(c); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      <div className="roster-art"><Image src={c.image} alt="" /><span className="roster-index">0{i + 1}</span></div><div className="roster-copy"><strong>{c.name}</strong><small>{c.universe}</small></div><ArrowUpRight size={15} />
    </button>)}</div>
  </section>;
}

function MatchupCard({ item, index, onOpen }) {
  return <button className={"matchup-card matchup-" + item.color} onClick={() => onOpen(item)}>
    <div className="matchup-card-top"><span className="matchup-status"><i />{item.status}</span><span>0{index + 1}</span></div>
    <div className="matchup-versus-art">
      <div className="matchup-person person-a"><Image src={item.imageA} alt={item.a} /></div><span className="versus-badge">VS</span><div className="matchup-person person-b"><Image src={item.imageB} alt={item.b} /></div>
    </div>
    <div className="matchup-card-info"><div><h3>{item.a} <span>VS</span> {item.b}</h3><p>{item.sub}</p></div><ArrowUpRight size={18} /></div>
    <div className="matchup-card-foot"><span><Activity size={13} /> {item.votes} ACTIVE VOTES</span><span>OPEN MATCHUP <ArrowRight size={13} /></span></div>
  </button>;
}

function Matchups({ onOpen }) {
  return <section className="matchups-section" id="matchups"><div className="section-head"><div><span className="section-overline">THE ARENA</span><h2>Choose your <em>side.</em></h2><p>Explore the matchups everyone is talking about. Evidence first, opinions welcome.</p></div><a className="outline-button" href="#studio">Create matchup <Swords size={16} /></a></div>
    <div className="matchup-grid">{matchups.map((m, i) => <MatchupCard key={m.a} item={m} index={i} onOpen={onOpen} />)}</div>
  </section>;
}

function Studio({ onToast }) {
  const [a, setA] = useState("Spider-Man"); const [b, setB] = useState("Batman");
  const [version, setVersion] = useState("Specific versions");
  return <section className="studio-section" id="studio"><div className="studio-heading"><span className="section-overline">YOUR BATTLE. YOUR RULES.</span><h2>Set the <em>matchup.</em></h2><p>Choose the contenders and define the conditions before the analysis begins.</p></div>
    <div className="studio-panel"><div className="studio-panel-top"><span><Swords size={16} /> MATCHUP CONFIGURATION</span><span>PREVIEW MODE <i /></span></div>
      <div className="studio-selectors"><label><small>CONTENDER A</small><select value={a} onChange={e => setA(e.target.value)}>{["Spider-Man","Superman","Batman","Iron Man","Thanos"].map(x => <option key={x}>{x}</option>)}</select></label><div className="studio-vs">VS</div><label><small>CONTENDER B</small><select value={b} onChange={e => setB(e.target.value)}>{["Batman","Thanos","Iron Man","Superman","Spider-Man"].map(x => <option key={x}>{x}</option>)}</select></label></div>
      <div className="studio-controls"><label><small>CONTINUITY RULE</small><select value={version} onChange={e => setVersion(e.target.value)}><option>Specific versions</option><option>Canon only</option><option>Composite (opt-in)</option></select><ChevronDown /></label><label><small>ANALYSIS DEPTH</small><select><option>Deep research</option><option>Standard comparison</option><option>Quick overview</option><option>Evidence audit</option></select><ChevronDown /></label><button className="primary-button" onClick={() => onToast(a === b ? "Choose two different contenders." : a + " vs " + b + " · " + version + " configured in preview.")}>Configure matchup <ArrowUpRight size={16} /></button></div>
      <div className="studio-foot"><span><ShieldCheck size={14} /> CONTINUITY-AWARE BY DESIGN</span><span>Research and saved matchups will connect when the Battle Engine is implemented.</span></div>
    </div>
  </section>;
}

function Rankings() {
  return <section className="rankings-section" id="rankings"><div className="section-head"><div><span className="section-overline">THE POWER INDEX</span><h2>Trending <em>entities.</em></h2><p>Popularity is not the same as power. We keep those signals separate.</p></div><a className="subtle-link" href="#rankings">EXPLORE RANKINGS <ArrowUpRight size={14} /></a></div>
    <div className="ranking-layout"><div className="ranking-feature"><div className="ranking-feature-bg" /><span className="feature-tag"><Flame size={13} /> FASTEST RISING</span><div className="ranking-feature-copy"><small>01 / DC · PRIME EARTH</small><h3>SUPERMAN</h3><p>One of the most searched entities this week.</p><span className="trend-up">↗ 18.6% SEARCH INTEREST</span></div><Image src={media.superman} alt="Superman cosplay reference" /></div>
      <div className="ranking-list">{ranking.map((r, i) => <div className="ranking-row" key={r.n}><span className="rank-number">{r.n}</span><div className="rank-thumb"><Image src={r.img} alt="" /></div><div className="rank-copy"><strong>{r.name}</strong><small>{r.universe}</small></div><span className="rank-type">{r.type}</span><span className={r.delta.startsWith("+") ? "rank-delta positive" : "rank-delta"}>{r.delta}</span></div>)}</div>
    </div>
  </section>;
}

function Community() {
  const topics = [
    ["CONTINUITY", "Can composite versions ever produce a fair comparison?", "38 replies · updated 4 min ago"],
    ["EVIDENCE", "How should outlier feats be weighted against consistent showings?", "24 replies · updated 18 min ago"],
    ["METHODOLOGY", "What makes a source strong enough to verify a feat?", "16 replies · updated 42 min ago"]
  ];
  return <section className="community-section" id="community"><div className="section-head"><div><span className="section-overline">THE COMMUNITY</span><h2>Debate the <em>details.</em></h2><p>Bring your argument. Bring the source. Leave room to be convinced.</p></div><a className="outline-button" href="#community">Enter debate arena <ArrowUpRight size={15} /></a></div>
    <div className="community-grid"><div className="community-feature"><div className="community-feature-visual"><div className="community-glow" /><div className="community-monogram">OX</div><span>OPEN DISCUSSION / 001</span></div><div className="community-feature-copy"><span className="section-overline">FEATURED DISCUSSION</span><h3>What does a <em>good argument</em> look like?</h3><p>Explore how evidence, context and counterarguments make a debate worth having.</p><a href="#community">Join the conversation <ArrowUpRight size={15} /></a></div></div>
      <div className="topic-list">{topics.map((t, i) => <a className="topic-row" href="#community" key={t[1]}><span className="topic-index">0{i + 1}</span><div><small>{t[0]}</small><h3>{t[1]}</h3><p>{t[2]}</p></div><ArrowUpRight size={17} /></a>)}</div></div>
  </section>;
}

function Footer() {
  return <footer className="footer"><div className="footer-main"><Brand /><p>A universe-spanning character index, built for curious minds and better debates.</p><div className="footer-links"><a href="#characters">Characters</a><a href="#matchups">Matchups</a><a href="#rankings">Rankings</a><a href="#community">Community</a></div><a href="#home" className="back-top">BACK TO TOP ↑</a></div><div className="footer-bottom"><span>© 2026 OMNIVEX. INDEPENDENT FAN PROJECT.</span><span>CHARACTER IMAGERY IS ILLUSTRATIVE. RIGHTS REMAIN WITH THEIR OWNERS.</span></div></footer>;
}

export default function App() {
  const [active, setActive] = useState(characters[0]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const notify = message => { setToast(message); window.setTimeout(() => setToast(""), 3600); };
  useEffect(() => {
    const key = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, []);
  const openMatch = item => { setSelectedMatch(item); notify(item.a + " vs " + item.b + " selected · report preview is not connected yet."); };
  return <div className="app" id="discover">
    <Header onSearch={() => setSearchOpen(true)} />
    <main><Hero character={active} onBuild={() => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" })} />
      <CharacterRail active={active} setActive={setActive} />
      <Matchups onOpen={openMatch} />
      <Studio onToast={notify} />
      <Rankings />
      <Community />
      <section className="final-cta"><div><span className="section-overline">THE INDEX IS OPEN</span><h2>Every story has<br />another <em>side.</em></h2><p>Find the character. Set the rules. Follow the evidence wherever it leads.</p><a href="#studio" className="primary-button">Start a matchup <ArrowUpRight size={16} /></a></div><div className="final-cta-mark">O<span>X</span></div></section>
    </main><Footer />
    <SearchModal open={searchOpen} close={() => setSearchOpen(false)} />
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span className="toast-pulse" />{toast}<button onClick={() => setToast("")}><X size={15} /></button></motion.div>}</AnimatePresence>
    <AnimatePresence>{selectedMatch && <motion.div className="match-drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMatch(null)}><motion.div className="match-drawer" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} onClick={e => e.stopPropagation()}><button className="drawer-close" onClick={() => setSelectedMatch(null)}><X /></button><span className="section-overline">MATCHUP PREVIEW</span><h2>{selectedMatch.a} <em>VS</em> {selectedMatch.b}</h2><p>{selectedMatch.note}</p><div className="drawer-status"><ShieldCheck size={16} /> This is a visual preview. No verdict has been generated.</div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}