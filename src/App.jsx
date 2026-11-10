import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown,
  ChevronRight, CircleHelp, Compass, Flame, Globe, Menu, Search,
  ShieldCheck, Trophy, Users, X
} from "lucide-react";

import { Marquee } from "./components/magicui/Marquee.jsx";
import { MagicCard } from "./components/magicui/MagicCard.jsx";
import { NumberTicker } from "./components/magicui/NumberTicker.jsx";
import { AnimatedList } from "./components/magicui/AnimatedList.jsx";
import { BorderBeam } from "./components/magicui/BorderBeam.jsx";
import { ShimmerButton } from "./components/magicui/ShimmerButton.jsx";

const image = {
  spider: "https://commons.wikimedia.org/wiki/Special:FilePath/Spider-Man%20cosplay.jpg",
  iron: "https://commons.wikimedia.org/wiki/Special:FilePath/Iron_Man_transparent_background.png",
  thanos: "https://commons.wikimedia.org/wiki/Special:FilePath/THANOS-Cosplay.jpg",
  batman: "https://commons.wikimedia.org/wiki/Special:FilePath/PA%20comic%20convention%20Cosplay%20of%20Batman.jpg",
  superman: "https://commons.wikimedia.org/wiki/Special:FilePath/Cosplayers%20as%20Superman%20and%20K%27Zuri%20the%20Unbound%20at%20L.A.%20Comic%20Con%202026%20(Vertical).jpg",
  thor: "https://commons.wikimedia.org/wiki/Special:FilePath/Thor_Cosplay.jpg",
  strange: "https://commons.wikimedia.org/wiki/Special:FilePath/2023_NYCC_Cosplay_of_Doctor_Strange.jpg"
};

const characters = [
  { id: "spider", name: "Spider-Man", display: "SPIDER-MAN", universe: "Marvel Comics", continuity: "Earth-616", role: "The friendly neighbourhood hero", species: "Human mutate", image: image.spider, accent: "red", abilities: ["Spider-sense", "Superhuman agility", "Web technology"], summary: "A brilliant inventor with heightened reflexes, a danger sense and a resourceful fighting style.", category: "Comics" },
  { id: "iron", name: "Iron Man", display: "IRON MAN", universe: "Marvel Comics", continuity: "Earth-616", role: "The armoured Avenger", species: "Human", image: image.iron, accent: "gold", abilities: ["Powered armour", "Engineering", "Repulsor technology"], summary: "A systems-minded inventor whose capabilities vary dramatically with armour generation and preparation.", category: "Comics" },
  { id: "batman", name: "Batman", display: "BATMAN", universe: "DC Comics", continuity: "Prime Earth", role: "The Dark Knight", species: "Human", image: image.batman, accent: "silver", abilities: ["Detective mastery", "Strategy", "Specialised gear"], summary: "A detective and tactician whose preparation, equipment and environment matter to any fair comparison.", category: "Comics" },
  { id: "superman", name: "Superman", display: "SUPERMAN", universe: "DC Comics", continuity: "Prime Earth", role: "The Man of Steel", species: "Kryptonian", image: image.superman, accent: "blue", abilities: ["Solar-powered physiology", "Flight", "Super senses"], summary: "A Kryptonian whose powers are shaped by solar energy, continuity and the conditions of a given story.", category: "Comics" },
  { id: "thanos", name: "Thanos", display: "THANOS", universe: "Marvel Comics", continuity: "Earth-616", role: "The Mad Titan", species: "Titanian Eternal", image: image.thanos, accent: "violet", abilities: ["Titan physiology", "Cosmic technology", "Tactical intellect"], summary: "A formidable strategist whose equipment and continuity must be specified before assessing a matchup.", category: "Comics" },
  { id: "thor", name: "Thor", display: "THOR", universe: "Marvel Comics", continuity: "Earth-616", role: "The God of Thunder", species: "Asgardian", image: image.thor, accent: "blue", abilities: ["Storm control", "Godly strength", "Thunder channeling"], summary: "An Asgardian warrior with a long history of changing powers, weapons and forms.", category: "Comics" },
  { id: "strange", name: "Doctor Strange", display: "DOCTOR STRANGE", universe: "Marvel Comics", continuity: "Earth-616", role: "Master of the Mystic Arts", species: "Human", image: image.strange, accent: "gold", abilities: ["Mystic arts", "Dimensional knowledge", "Protective spells"], summary: "A sorcerer whose abilities depend on knowledge, preparation, artefacts and the rules of the story.", category: "Comics" }
];

const matchups = [
  { id: "m1", a: "Spider-Man", b: "Batman", left: "spider", right: "batman", eyebrow: "COMMUNITY DEBATE", title: "Instinct vs preparation", note: "Specific comic continuities · Standard equipment", votes: "Preview matchup", tone: "red" },
  { id: "m2", a: "Superman", b: "Thor", left: "superman", right: "thor", eyebrow: "EVIDENCE REVIEW", title: "Two worlds collide", note: "Prime Earth vs Earth-616 · Version-locked", votes: "Research framework", tone: "blue" },
  { id: "m3", a: "Iron Man", b: "Thanos", left: "iron", right: "thanos", eyebrow: "NEW COMPARISON", title: "Technology vs titan power", note: "Earth-616 · Conditions to be defined", votes: "Open configuration", tone: "gold" }
];

const rankings = {
  rising: [
    { id: "superman", rank: "01", change: "+04", label: "Most explored this week" },
    { id: "thor", rank: "02", change: "+02", label: "New discussion activity" },
    { id: "strange", rank: "03", change: "+01", label: "Research interest" },
    { id: "batman", rank: "04", change: "—", label: "Steady interest" }
  ],
  debated: [
    { id: "batman", rank: "01", change: "HOT", label: "Active matchup discussions" },
    { id: "superman", rank: "02", change: "HOT", label: "Continuity questions" },
    { id: "thanos", rank: "03", change: "NEW", label: "Equipment debates" },
    { id: "spider", rank: "04", change: "NEW", label: "Ability interactions" }
  ],
  library: [
    { id: "spider", rank: "01", change: "A–Z", label: "Featured index entry" },
    { id: "iron", rank: "02", change: "A–Z", label: "Featured index entry" },
    { id: "thor", rank: "03", change: "A–Z", label: "Featured index entry" },
    { id: "strange", rank: "04", change: "A–Z", label: "Featured index entry" }
  ]
};

const debateItems = [
  { tag: "CONTINUITY", title: "When should alternate versions be treated as separate entities?", meta: "Versioning · 8 min read", replies: "Open thread" },
  { tag: "EVIDENCE", title: "How much context should a feat citation include?", meta: "Research standards · 5 min read", replies: "Open thread" },
  { tag: "MATCHUP RULES", title: "Does preparation time change the question being compared?", meta: "Battle conditions · 6 min read", replies: "Open thread" }
];

const universes = [
  { name: "MARVEL", detail: "Comics · Film · Games", count: "Explore universe", symbol: "M", accent: "marvel" },
  { name: "DC", detail: "Comics · Film · Animation", count: "Explore universe", symbol: "DC", accent: "dc" },
  { name: "DRAGON BALL", detail: "Anime · Manga · Games", count: "Explore universe", symbol: "DB", accent: "anime" },
  { name: "NARUTO", detail: "Anime · Manga", count: "Explore universe", symbol: "忍", accent: "naruto" },
  { name: "GOD OF WAR", detail: "Games · Mythology", count: "Explore universe", symbol: "Ω", accent: "gow" },
  { name: "MYTHOLOGY", detail: "Traditions · Legends", count: "Explore collection", symbol: "✳", accent: "myth" }
];

function Art({ character, className = "", contain = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [character?.id]);
  if (!character) return null;
  return <div className={"character-art " + (contain ? "character-art-contain " : "") + className}>
    {!failed
      ? <img src={character.image} alt={character.name + " cosplay reference"} loading="lazy" onError={() => setFailed(true)} />
      : <div className="art-fallback"><span>{character.display.split(" ").map(x => x[0]).join("").slice(0, 3)}</span><small>{character.name}</small></div>}
    <div className="art-bottom-fade" />
  </div>;
}

function Brand() {
  return <a className="brand" href="#top" aria-label="OMNIVEX home">
    <span className="brand-mark"><i /><i /><b /></span>
    <span className="brand-word">OMNIVEX<span>.</span><small>BEYOND EVERY UNIVERSE</small></span>
  </a>;
}

function Header({ onSearch, onNotify }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["Discover", "#discover"], ["Characters", "#characters"], ["Matchups", "#matchups"], ["Rankings", "#rankings"], ["Community", "#community"], ["Universes", "#universes"]];
  return <header className="site-header">
    <div className="header-inner">
      <button className="mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <Brand />
      <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
        {links.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <button className="search-trigger" onClick={onSearch}><Search size={16} /><span>Search index</span><kbd>⌘ K</kbd></button>
        <button className="profile-trigger" onClick={() => onNotify("Profiles and sign-in will be connected with Supabase in a later milestone.")}>N</button>
      </div>
    </div>
  </header>;
}

function SearchPalette({ open, setOpen, onSelect }) {
  const [query, setQuery] = useState("");
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Portal>
      <Dialog.Overlay className="command-overlay" />
      <Dialog.Content className="command-dialog">
        <Dialog.Title className="sr-only">Search the OMNIVEX index</Dialog.Title>
        <Command className="command-root" label="Search OMNIVEX" shouldFilter>
          <div className="command-input-wrap"><Search size={18} /><Command.Input value={query} onValueChange={setQuery} placeholder="Search characters, universes and matchups..." /><kbd>ESC</kbd></div>
          <Command.List>
            <Command.Empty>No matching entries in this preview.</Command.Empty>
            <Command.Group heading="CHARACTER INDEX">
              {characters.map(c => <Command.Item key={c.id} value={c.name + " " + c.universe + " " + c.continuity} onSelect={() => { setOpen(false); onSelect(c); }}>
                <span className="command-avatar">{c.display.slice(0, 1)}</span><span className="command-copy"><strong>{c.name}</strong><small>{c.universe} · {c.continuity}</small></span><ArrowUpRight size={15} />
              </Command.Item>)}
            </Command.Group>
            <Command.Group heading="QUICK LINKS">
              {["Matchup Studio", "Power Index", "Debate Arena", "Universe Explorer"].map((label, i) => <Command.Item key={label} value={label} onSelect={() => { setOpen(false); document.getElementById(["studio", "rankings", "community", "universes"][i])?.scrollIntoView({ behavior: "smooth" }); }}><Compass size={15} /><span>{label}</span></Command.Item>)}
            </Command.Group>
          </Command.List>
          <div className="command-foot"><span><kbd>↑</kbd><kbd>↓</kbd> NAVIGATE</span><span><kbd>↵</kbd> OPEN</span><span>OMNIVEX INDEX</span></div>
        </Command>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

function Hero({ onStart, onSelect }) {
  const left = characters.find(c => c.id === "spider");
  const right = characters.find(c => c.id === "batman");
  return <section className="hero-section" id="top">
    <div className="hero-background-grid" />
    <div className="hero-glow hero-glow-left" /><div className="hero-glow hero-glow-right" />
    <div className="hero-inner">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-pulse" /> THE UNIVERSAL CHARACTER INDEX</div>
        <h1>EVERY UNIVERSE.<br /><span>EVERY POSSIBILITY.</span></h1>
        <p className="hero-lead">Explore the characters you know. Compare the details that matter. Follow the evidence beyond the obvious answer.</p>
        <div className="hero-actions">
          <ShimmerButton onClick={onStart}>Build a matchup <ArrowUpRight size={16} /></ShimmerButton>
          <a className="text-link" href="#characters">Explore the index <ArrowRight size={15} /></a>
        </div>
        <div className="hero-principles">
          <span><ShieldCheck size={14} /> Evidence-led</span><span><Globe size={14} /> Continuity-aware</span><span><Users size={14} /> Community-driven</span>
        </div>
      </div>
      <div className="hero-feature">
        <div className="feature-topline"><span><Flame size={14} /> FEATURED MATCHUP</span><span>01 <i /> 07</span></div>
        <div className="versus-stage">
          <div className="stage-side stage-side-a"><div className="stage-light" /><Art character={left} contain /><span className="stage-character-name">SPIDER-MAN</span><small>MARVEL · EARTH-616</small></div>
          <div className="stage-divider"><span>VS</span></div>
          <div className="stage-side stage-side-b"><div className="stage-light" /><Art character={right} contain /><span className="stage-character-name">BATMAN</span><small>DC · PRIME EARTH</small></div>
          <div className="stage-grain" />
        </div>
        <div className="feature-bottom"><div><span className="feature-kicker">THE QUESTION</span><strong>Instinct vs preparation</strong></div><button onClick={onStart}>Configure battle <ArrowUpRight size={15} /></button></div>
        <BorderBeam />
      </div>
    </div>
    <div className="hero-meta"><span>COMPARE WITHOUT THE GUESSWORK</span><span>SCROLL TO EXPLORE <ChevronDown size={14} /></span></div>
  </section>;
}

function IndexTicker() {
  return <section className="ticker-section" aria-label="Platform principles">
    <div className="ticker-wrap">
      <div className="ticker-stat"><span className="ticker-value"><NumberTicker value={characters.length} /></span><span>FEATURED PROFILES</span></div>
      <div className="ticker-stat"><span className="ticker-value"><NumberTicker value={matchups.length} /></span><span>MATCHUP EXAMPLES</span></div>
      <div className="ticker-stat"><span className="ticker-value"><NumberTicker value={universes.length} /></span><span>UNIVERSE COLLECTIONS</span></div>
      <div className="ticker-note"><ShieldCheck size={17} /><span>Illustrative frontend preview · not live community statistics</span></div>
    </div>
  </section>;
}

function UniverseMarquee() {
  const items = ["MARVEL", "DC COMICS", "DRAGON BALL", "NARUTO", "GOD OF WAR", "MYTHOLOGY", "MONSTERVERSE", "ONE PIECE"];
  return <section className="universe-marquee">
    <div className="marquee-label">A FEW WORLDS IN THE INDEX</div>
    <Marquee duration={38} className="universe-track">
      {items.map((name, i) => <span className="marquee-universe" key={name}><i>{["✦", "◆", "界", "忍", "Ω", "✳", "◈", "◎"][i]}</i>{name}</span>)}
    </Marquee>
  </section>;
}

function CharacterCard({ character, index, active, onClick }) {
  return <MagicCard className={"roster-card" + (active ? " roster-card-active" : "")}>
    <button className="roster-button" onClick={onClick} aria-pressed={active}>
      <div className="roster-image-wrap"><Art character={character} contain /><span className="roster-index">0{index + 1}</span><span className="roster-plus"><ArrowUpRight size={15} /></span></div>
      <div className="roster-body"><span className="roster-universe">{character.universe} / {character.continuity}</span><strong>{character.display}</strong><span className="roster-role">{character.role}</span></div>
    </button>
  </MagicCard>;
}

function CharacterIndex({ active, setActive, onNotify }) {
  return <section className="section-block character-section" id="characters">
    <div className="section-header"><div><span className="section-kicker">01 / THE DATABASE</span><h2>Meet the <em>contenders.</em></h2><p>Profiles are organised by identity, universe and exact continuity. Select one to inspect its overview.</p></div><button className="section-link" onClick={() => onNotify("The searchable entity library will expand as verified profiles are added.")}>Browse full index <ArrowUpRight size={15} /></button></div>
    <div className="character-grid">{characters.map((c, i) => <CharacterCard key={c.id} character={c} index={i} active={active.id === c.id} onClick={() => setActive(c)} />)}</div>
    <div className="selected-profile">
      <div className="selected-art"><Art character={active} contain /></div>
      <div className="selected-copy"><span className="section-kicker">SELECTED PROFILE / {active.continuity.toUpperCase()}</span><h3>{active.name}</h3><p>{active.summary}</p><div className="ability-tags">{active.abilities.map(x => <span key={x}>{x}</span>)}</div><div className="selected-meta"><span><Globe size={14} /> {active.universe}</span><span><ShieldCheck size={14} /> {active.category}</span></div></div>
      <div className="selected-action"><span>PROFILE PREVIEW</span><button onClick={() => onNotify("Full entity dossiers, verified feats and version histories are planned for the research milestone.")}>View dossier <ArrowUpRight size={16} /></button></div>
    </div>
  </section>;
}

function MatchupCard({ item, onOpen }) {
  const a = characters.find(c => c.id === item.left);
  const b = characters.find(c => c.id === item.right);
  return <MagicCard className={"matchup-card matchup-" + item.tone}>
    <button className="matchup-card-button" onClick={() => onOpen(item)}>
      <div className="matchup-card-top"><span><i />{item.eyebrow}</span><Bookmark size={15} /></div>
      <div className="matchup-artwork">
        <div className="matchup-art-a"><Art character={a} contain /></div><div className="matchup-art-b"><Art character={b} contain /></div><span className="matchup-vs">VS</span>
      </div>
      <div className="matchup-info"><div><h3>{item.a} <i>VS</i> {item.b}</h3><p>{item.title}</p><small>{item.note}</small></div><ArrowUpRight size={18} /></div>
      <div className="matchup-card-footer"><span><Activity size={13} /> {item.votes}</span><span>OPEN MATCHUP <ArrowRight size={13} /></span></div>
    </button>
  </MagicCard>;
}

function Matchups({ onOpen }) {
  return <section className="section-block matchups-section" id="matchups">
    <div className="section-header"><div><span className="section-kicker">02 / THE ARENA</span><h2>Some things are <em>worth comparing.</em></h2><p>Explore example matchups with versions and conditions made visible from the start.</p></div><a className="section-link" href="#studio">Create your own <ArrowUpRight size={15} /></a></div>
    <div className="matchups-grid">{matchups.map(m => <MatchupCard key={m.id} item={m} onOpen={onOpen} />)}</div>
  </section>;
}

function Studio({ onNotify }) {
  const [a, setA] = useState("spider");
  const [b, setB] = useState("batman");
  const [continuity, setContinuity] = useState("specific");
  const [mode, setMode] = useState("deep");
  const [conditions, setConditions] = useState("standard");
  const first = characters.find(c => c.id === a);
  const second = characters.find(c => c.id === b);
  return <section className="studio-section" id="studio">
    <div className="studio-intro"><span className="section-kicker">03 / MATCHUP STUDIO</span><h2>Set the rules.<br /><em>Then compare.</em></h2><p>Every matchup starts with a better question. Choose the versions, define the conditions and keep the assumptions visible.</p><div className="studio-points"><span><Check size={14} /> Specific versions</span><span><Check size={14} /> Transparent conditions</span><span><Check size={14} /> Room for inconclusive</span></div></div>
    <div className="studio-panel">
      <div className="studio-panel-head"><div><Activity size={17} /><span>MATCHUP CONFIGURATION</span></div><span className="preview-status"><i /> FRONTEND PREVIEW</span></div>
      <div className="studio-contenders">
        <label className="contender-select"><span>CONTENDER A</span><div className="select-art"><Art character={first} contain /><select value={a} onChange={e => setA(e.target.value)}>{characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown size={15} /></div><small>{first.universe} · {first.continuity}</small></label>
        <div className="studio-versus">VS</div>
        <label className="contender-select"><span>CONTENDER B</span><div className="select-art"><Art character={second} contain /><select value={b} onChange={e => setB(e.target.value)}>{characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown size={15} /></div><small>{second.universe} · {second.continuity}</small></label>
      </div>
      <div className="studio-options">
        <label><span>VERSION RULE</span><select value={continuity} onChange={e => setContinuity(e.target.value)}><option value="specific">Specific continuity</option><option value="canon">Canon-only interpretation</option><option value="composite">Composite (opt-in)</option></select></label>
        <label><span>ANALYSIS DEPTH</span><select value={mode} onChange={e => setMode(e.target.value)}><option value="deep">Deep research</option><option value="standard">Standard comparison</option><option value="quick">Quick overview</option><option value="audit">Evidence audit</option></select></label>
        <label><span>CONDITIONS</span><select value={conditions} onChange={e => setConditions(e.target.value)}><option value="standard">Standard equipment</option><option value="prep">Preparation allowed</option><option value="neutral">Neutral environment</option><option value="custom">Custom rules</option></select></label>
      </div>
      <div className="studio-submit-row"><div><ShieldCheck size={15} /><span>NO VERDICT IS GENERATED IN THIS FRONTEND PREVIEW.</span></div><ShimmerButton onClick={() => onNotify(a === b ? "Choose two different contenders to configure a matchup." : first.name + " vs " + second.name + " · " + continuity + " · " + mode + " research · " + conditions + " conditions selected.")}>Review matchup setup <ArrowUpRight size={16} /></ShimmerButton></div>
    </div>
  </section>;
}

function RankingRow({ item }) {
  const c = characters.find(x => x.id === item.id);
  return <div className="ranking-row"><span className="ranking-number">{item.rank}</span><div className="ranking-thumb"><Art character={c} contain /></div><div className="ranking-copy"><strong>{c.name}</strong><small>{c.universe} · {c.continuity}</small><span>{item.label}</span></div><span className={"ranking-change " + (item.change.startsWith("+") ? "up" : "")}>{item.change}</span><ChevronRight size={16} /></div>;
}

function Rankings() {
  return <section className="section-block rankings-section" id="rankings">
    <div className="section-header"><div><span className="section-kicker">04 / THE POWER INDEX</span><h2>Follow the <em>conversation.</em></h2><p>Discovery signals are not power scores. These sample views demonstrate how the rankings will be organised.</p></div><span className="demo-pill">SAMPLE DATA</span></div>
    <div className="ranking-layout">
      <div className="ranking-feature">
        <div className="ranking-feature-top"><span><Flame size={14} /> FEATURED PROFILE</span><span>INDEX 001</span></div>
        <div className="ranking-feature-art"><Art character={characters[3]} contain /></div>
        <div className="ranking-feature-copy"><span>DC COMICS · PRIME EARTH</span><h3>SUPERMAN</h3><p>Popularity, evidence strength and capability analysis are kept as separate signals.</p><a href="#characters">Explore profile <ArrowUpRight size={15} /></a></div>
      </div>
      <div className="ranking-table">
        <Tabs.Root defaultValue="rising" className="ranking-tabs">
          <Tabs.List className="ranking-tab-list" aria-label="Ranking categories">
            <Tabs.Trigger value="rising">Rising</Tabs.Trigger><Tabs.Trigger value="debated">Most debated</Tabs.Trigger><Tabs.Trigger value="library">Index picks</Tabs.Trigger>
          </Tabs.List>
          {Object.entries(rankings).map(([key, rows]) => <Tabs.Content value={key} key={key} className="ranking-tab-panel">
            {rows.map(item => <RankingRow item={item} key={item.id} />)}
          </Tabs.Content>)}
        </Tabs.Root>
        <div className="ranking-foot"><span><ShieldCheck size={14} /> SAMPLE INTERFACE · NOT LIVE RANKINGS</span><button>Explore all rankings <ArrowUpRight size={14} /></button></div>
      </div>
    </div>
  </section>;
}

function UniverseExplorer({ onNotify }) {
  return <section className="section-block universe-section" id="universes">
    <div className="section-header"><div><span className="section-kicker">05 / UNIVERSE EXPLORER</span><h2>Worlds within <em>worlds.</em></h2><p>Move between franchises, timelines and traditions without mixing their continuities.</p></div><button className="section-link" onClick={() => onNotify("Universe hubs will include entity directories, timelines and linked matchups.")}>Explore all universes <ArrowUpRight size={15} /></button></div>
    <div className="universe-grid">{universes.map((u, i) => <MagicCard key={u.name} className={"universe-card universe-" + u.accent}><button onClick={() => onNotify(u.name + " universe hub selected · sample navigation only.")}><span className="universe-number">0{i + 1}</span><span className="universe-symbol">{u.symbol}</span><span className="universe-name">{u.name}</span><span className="universe-detail">{u.detail}</span><span className="universe-cta">{u.count} <ArrowUpRight size={14} /></span></button></MagicCard>)}</div>
  </section>;
}

function DebateArena({ onNotify }) {
  return <section className="section-block debate-section" id="community">
    <div className="section-header"><div><span className="section-kicker">06 / THE DEBATE ARENA</span><h2>Bring the <em>receipts.</em></h2><p>A good debate has a clear claim, a source, a counterargument and room to change your mind.</p></div><button className="section-link" onClick={() => onNotify("Community posts, replies and reputation will be powered by Supabase after the frontend milestone.")}>Enter the arena <ArrowUpRight size={15} /></button></div>
    <div className="debate-layout">
      <div className="debate-feature">
        <div className="debate-feature-image"><div className="debate-orbit orbit-one" /><div className="debate-orbit orbit-two" /><span>THE OPEN QUESTION</span><strong>WHAT COUNTS<br />AS <em>PROOF?</em></strong></div>
        <div className="debate-feature-copy"><span className="section-kicker">FEATURED DISCUSSION</span><h3>The difference between a feat and an interpretation.</h3><p>Separate what a story shows from what a reader concludes. This distinction sits at the heart of every evidence-led comparison.</p><button onClick={() => onNotify("Discussion preview opened. Thread interactions are not connected yet.")}>Read discussion <ArrowUpRight size={15} /></button></div>
      </div>
      <div className="debate-list-wrap"><div className="debate-list-head"><span>OPEN TOPICS</span><span>COMMUNITY NOTES</span></div><AnimatedList className="debate-list">
        {debateItems.map((item, i) => <button className="debate-row" key={item.title} onClick={() => onNotify("Preview thread: " + item.title)}><span className="debate-index">0{i + 1}</span><span className="debate-row-copy"><small>{item.tag}</small><strong>{item.title}</strong><span>{item.meta}</span></span><span className="debate-row-open">{item.replies} <ArrowUpRight size={14} /></span></button>)}
      </AnimatedList></div>
    </div>
  </section>;
}

function Events({ onNotify }) {
  const events = [
    { tag: "WEEKLY", name: "The Weekly Showdown", detail: "A community-selected matchup with a full evidence thread.", icon: <Activity size={20} /> },
    { tag: "RESEARCH", name: "Evidence Hunt", detail: "Find the missing source, context or counter-feat.", icon: <Search size={20} /> },
    { tag: "COMMUNITY", name: "Universe Cup", detail: "A bracket-style celebration of different fictional worlds.", icon: <Trophy size={20} /> }
  ];
  return <section className="section-block events-section" id="events">
    <div className="section-header"><div><span className="section-kicker">07 / COMMUNITY EVENTS</span><h2>Make the index <em>alive.</em></h2><p>Recurring formats give the community reasons to discover, contribute and return.</p></div></div>
    <div className="events-grid">{events.map((e, i) => <MagicCard className="event-card" key={e.name}><div className="event-card-inner"><span className="event-icon">{e.icon}</span><span className="event-tag">{e.tag} / FORMAT 0{i + 1}</span><h3>{e.name}</h3><p>{e.detail}</p><button onClick={() => onNotify(e.name + " · event preview only. Event registration is not connected yet.")}>View format <ArrowUpRight size={14} /></button></div></MagicCard>)}</div>
  </section>;
}

function IntegrityStrip() {
  return <section className="integrity-strip">
    <div className="integrity-intro"><span className="section-kicker">THE OMNIVEX STANDARD</span><h2>Strong claims.<br /><em>Stronger evidence.</em></h2><p>Canon outcomes, evidence-based predictions and inconclusive findings should never be confused.</p></div>
    <div className="integrity-points"><div><span>01</span><ShieldCheck size={19} /><div><strong>Sources stay visible</strong><small>Every important claim should be traceable.</small></div></div><div><span>02</span><Globe size={19} /><div><strong>Versions stay separate</strong><small>Continuity is part of the question.</small></div></div><div><span>03</span><CircleHelp size={19} /><div><strong>Uncertainty is allowed</strong><small>Inconclusive is better than invented certainty.</small></div></div></div>
  </section>;
}

function Footer({ onNotify }) {
  return <footer className="site-footer"><div className="footer-top"><Brand /><p>A universe-spanning character index built for curious minds, fair comparisons and better debates.</p><div className="footer-links"><a href="#characters">Characters</a><a href="#matchups">Matchups</a><a href="#rankings">Rankings</a><a href="#community">Community</a><a href="#universes">Universes</a></div><button onClick={() => onNotify("You're already at the start of the index.")}>Back to top ↑</button></div><div className="footer-bottom"><span>© 2026 OMNIVEX · INDEPENDENT FAN PROJECT</span><span>VISUAL REFERENCES ARE COSPLAY PHOTOGRAPHS. SEE IMAGE_CREDITS.md.</span><span>BUILT FOR THE MULTIVERSE.</span></div></footer>;
}

function MatchupDialog({ item, onClose, onNotify }) {
  if (!item) return null;
  const a = characters.find(c => c.id === item.left);
  const b = characters.find(c => c.id === item.right);
  return <Dialog.Root open={Boolean(item)} onOpenChange={v => { if (!v) onClose(); }}>
    <Dialog.Portal><Dialog.Overlay className="command-overlay" />
      <Dialog.Content className="matchup-dialog">
        <Dialog.Close className="dialog-close" aria-label="Close"><X size={18} /></Dialog.Close>
        <Dialog.Title className="dialog-kicker">MATCHUP PREVIEW / {item.id.toUpperCase()}</Dialog.Title>
        <div className="dialog-versus"><div><Art character={a} contain /><strong>{a.name}</strong><small>{a.universe} · {a.continuity}</small></div><span>VS</span><div><Art character={b} contain /><strong>{b.name}</strong><small>{b.universe} · {b.continuity}</small></div></div>
        <h3>{item.title}</h3><p>{item.note}</p>
        <div className="dialog-note"><ShieldCheck size={16} /> No verdict has been generated. This is a frontend matchup example.</div>
        <button className="dialog-primary" onClick={() => { onNotify("Matchup selected. The Battle Engine is not connected in this frontend build."); onClose(); }}>Continue to setup <ArrowUpRight size={15} /></button>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export default function App() {
  const [activeCharacter, setActiveCharacter] = useState(characters[0]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [matchupOpen, setMatchupOpen] = useState(null);
  const [toast, setToast] = useState("");
  const notify = message => {
    setToast(message);
    window.clearTimeout(window.__omnivexToast);
    window.__omnivexToast = window.setTimeout(() => setToast(""), 3600);
  };
  useEffect(() => {
    const onKey = event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const selectCharacter = character => {
    setActiveCharacter(character);
    document.getElementById("characters")?.scrollIntoView({ behavior: "smooth" });
  };
  return <div className="app-shell" id="discover">
    <Header onSearch={() => setSearchOpen(true)} onNotify={notify} />
    <main>
      <Hero onStart={() => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" })} />
      <IndexTicker />
      <UniverseMarquee />
      <CharacterIndex active={activeCharacter} setActive={setActiveCharacter} onNotify={notify} />
      <Matchups onOpen={setMatchupOpen} />
      <Studio onNotify={notify} />
      <Rankings />
      <UniverseExplorer onNotify={notify} />
      <DebateArena onNotify={notify} />
      <Events onNotify={notify} />
      <IntegrityStrip />
      <section className="final-cta"><div className="final-cta-copy"><span className="section-kicker">YOUR NEXT COMPARISON STARTS HERE</span><h2>Curiosity has<br /><em>no universe limit.</em></h2><p>Find the character. Set the rules. Follow the evidence wherever it leads.</p><ShimmerButton onClick={() => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" })}>Build your first matchup <ArrowUpRight size={16} /></ShimmerButton></div><div className="final-cta-art" aria-hidden="true"><span>O</span><i>×</i><b>X</b></div></section>
    </main>
    <Footer onNotify={notify} />
    <SearchPalette open={searchOpen} setOpen={setSearchOpen} onSelect={selectCharacter} />
    <MatchupDialog item={matchupOpen} onClose={() => setMatchupOpen(null)} onNotify={notify} />
    <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><span /><p>{toast}</p><button onClick={() => setToast("")}><X size={15} /></button></motion.div>}</AnimatePresence>
  </div>;
}
