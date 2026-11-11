import React, { lazy, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookmarkPlus, BookOpen, Check,
  Compass, Copy, Database, ExternalLink, FileSearch, Filter, FolderOpen,
  Globe2, Layers3, LogIn, NotebookPen, Plus, Search, Share2, ShieldCheck,
  Sparkles, Swords, Users, X
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../app/providers/AuthProvider.jsx";
import { useToast } from "../app/providers/ToastProvider.jsx";

const DriftWall = lazy(() => import("../components/react-bits/galleries/DriftWall.jsx"));
const ChromaGrid = lazy(() => import("../components/react-bits/galleries/ChromaGrid.jsx"));
const FlowingMenu = lazy(() => import("../components/react-bits/navigation/FlowingMenu.jsx"));
const InfiniteMenu = lazy(() => import("../components/react-bits/galleries/InfiniteMenu.jsx"));
const LineSidebar = lazy(() => import("../components/react-bits/navigation/LineSidebar.jsx"));
const Dock = lazy(() => import("../components/react-bits/navigation/Dock.jsx"));
const Stepper = lazy(() => import("../components/react-bits/workflows/Stepper.jsx"));
const Step = lazy(() => import("../components/react-bits/workflows/Stepper.jsx").then(module => ({ default: module.Step })));
const OptionWheel = lazy(() => import("../components/react-bits/workflows/OptionWheel.jsx"));
const ScrollStack = lazy(() => import("../components/react-bits/surfaces/ScrollStack.jsx"));
const ScrollStackItem = lazy(() => import("../components/react-bits/surfaces/ScrollStack.jsx").then(module => ({ default: module.ScrollStackItem })));
const CardSwap = lazy(() => import("../components/react-bits/surfaces/CardSwap.jsx"));
const Folder = lazy(() => import("../components/react-bits/surfaces/Folder.jsx"));
const FolderFloat = lazy(() => import("../components/react-bits/micro/FolderFloat.jsx"));
const BranchedMenu = lazy(() => import("../components/react-bits/micro/BranchedMenu.jsx"));
const BorderGlow = lazy(() => import("../components/react-bits/surfaces/BorderGlow.jsx"));
const AnimatedList = lazy(() => import("../components/react-bits/lists/AnimatedList.jsx"));
const SwipeRow = lazy(() => import("../components/react-bits/micro/SwipeRow.jsx"));
const BellToggle = lazy(() => import("../components/react-bits/micro/BellToggle.jsx"));
const PulseHeart = lazy(() => import("../components/react-bits/micro/PulseHeart.jsx"));
const textures = [
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=900&q=80&auto=format&fit=crop"
];
const textureAt = index => textures[Math.abs(index) % textures.length];
const slugify = value => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function useTableRows(table, orderColumn = "created_at", limit = 60) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setRows([]);
      setLoading(false);
      setError("");
      return () => { active = false; };
    }
    setLoading(true);
    setError("");
    let query = supabase.from(table).select("*");
    if (orderColumn) query = query.order(orderColumn, { ascending: false });
    if (limit) query = query.limit(limit);
    query.then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setRows(data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [table, orderColumn, limit, revision]);

  return { rows, loading, error, refresh: () => setRevision(value => value + 1) };
}

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <header className="atlas-page-intro">
      <div>
        <span className="section-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="atlas-empty-state">
      <span className="atlas-empty-mark"><Database size={19} /></span>
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

function DataNotice({ error }) {
  if (!supabase) {
    return <p className="atlas-data-notice">Connect the Supabase publishable key in your deployment environment to load the live catalogue.</p>;
  }
  if (error) return <p className="atlas-data-notice atlas-data-notice--error">Could not load this data: {error}</p>;
  return null;
}

function RecordLink({ to, children, meta }) {
  return (
    <Link className="atlas-record-link" to={to}>
      <span>{children}</span>
      {meta && <small>{meta}</small>}
      <ArrowUpRight size={15} />
    </Link>
  );
}

export function DiscoverPage() {
  const entities = useTableRows("entities");
  const matchups = useTableRows("matchups");
  const wallItems = useMemo(() => Array.from({ length: 15 }, (_, index) => ({
    image: textureAt(index),
    title: "Atlas archive texture"
  })), []);

  return (
    <div className="atlas-feature-page">
      <PageIntro
        eyebrow="DISCOVERY ENGINE / 01"
        title={<>Find your next <em>rabbit hole.</em></>}
        description="Move between universes, identities, published comparisons and evidence trails. The discovery surface only reflects records that actually exist."
        action={<Link className="atlas-button atlas-button--dark" to="/characters">Browse identities <ArrowUpRight size={15} /></Link>}
      />
      <section className="discover-wall-section">
        <div className="feature-section-heading">
          <div><span className="section-kicker">THE MOVING ARCHIVE</span><h2>Let curiosity <em>drift.</em></h2></div>
          <span className="atlas-mono-note">ATMOSPHERIC TEXTURES · NOT CHARACTER ART</span>
        </div>
        <div className="discover-wall">
          <DriftWall items={wallItems} columns={5} tileWidth={210} tileHeight={145} gap={17} speed={24} direction="up" variance={0.35} parallax={0.35} pauseOnHover lift={44} tilt={12} turn={-11} fade={0.68} dim={0.4} overlayColor="#13242D" />
        </div>
        <p className="atlas-caption">The Drift Wall is a visual entry surface. Tiles are abstract archive textures until licensed, version-matched artwork is attached to a record.</p>
      </section>
      <section className="atlas-two-column-section">
        <div>
          <div className="feature-section-heading"><div><span className="section-kicker">RECENTLY INDEXED</span><h2>New identities.</h2></div><Link className="atlas-text-link" to="/characters">Open directory <ArrowRight size={15} /></Link></div>
          <DataNotice error={entities.error} />
          {entities.rows.length ? entities.rows.slice(0, 8).map(row => <RecordLink key={row.id} to={`/characters/${row.slug}`} meta={row.status}>{row.name}</RecordLink>) : <EmptyState title="No public entity records yet" body="When records are added to the Supabase catalogue, recent identities will appear here. No fictional entries are being invented for the preview." />}
        </div>
        <div>
          <div className="feature-section-heading"><div><span className="section-kicker">RECENT COMPARISONS</span><h2>Open questions.</h2></div><Link className="atlas-text-link" to="/matchups/create">Create one <ArrowRight size={15} /></Link></div>
          <DataNotice error={matchups.error} />
          {matchups.rows.length ? matchups.rows.slice(0, 8).map(row => <RecordLink key={row.id} to={`/matchups/${row.slug}`} meta={row.status}>{row.title}</RecordLink>) : <EmptyState title="No published matchups yet" body="Published matchups will be listed here. A matchup setup is not an analysis or a verdict." />}
        </div>
      </section>
    </div>
  );
}

export function CharactersPage() {
  const { rows, loading, error } = useTableRows("entities");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const visible = useMemo(() => rows.filter(row => {
    const text = `${row.name} ${row.short_description || ""} ${row.entity_type || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (type === "all" || row.entity_type === type);
  }), [rows, search, type]);
  const types = [...new Set(rows.map(row => row.entity_type).filter(Boolean))];

  const cards = visible.map((row, index) => ({
    image: textureAt(index),
    title: row.name,
    subtitle: [row.entity_type, row.status].filter(Boolean).join(" · "),
    accent: index % 2 ? "#42BFC0" : "#E76F51",
    url: `/characters/${row.slug}`,
    alt: "Abstract archive texture. Official character artwork has not been attached."
  }));

  return (
    <div className="atlas-feature-page">
      <PageIntro eyebrow="ENTITY INDEX / 02" title={<>A universe of <em>identities.</em></>} description="Search the records without collapsing alternate versions, continuities or incarnations into one profile." action={<Link className="atlas-button atlas-button--dark" to="/matchups/create">Build a matchup <Swords size={15} /></Link>} />
      <div className="atlas-filter-bar">
        <label className="atlas-search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search names, types or descriptions" /></label>
        <label className="atlas-select"><Filter size={15} /><select value={type} onChange={event => setType(event.target.value)}><option value="all">All entity types</option>{types.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <span className="atlas-count">{visible.length} RECORDS</span>
      </div>
      <DataNotice error={error} />
      {loading ? <p className="atlas-loading">Loading the entity index…</p> : visible.length ? (
        <div className="entity-grid-wrap">
          <ChromaGrid items={cards} columns={3} minCardWidth={220} gap={16} radius={280} softness={0.65} damping={0.45} fadeOut={0.55} grayscale={0.8} dim={0.16} glow={0.42} borderGlow={0.7} aspectRatio="4 / 3" cardRadius={8} showInfo theme="light" frame />
        </div>
      ) : (
        <EmptyState title={rows.length ? "No matches for these filters" : "The entity index is waiting for records"} body={rows.length ? "Try another name or remove the entity-type filter." : "Add entity records to Supabase to populate this directory. Demo cards are intentionally not shown as real entries."} />
      )}
      <p className="atlas-caption">Card imagery is abstract placeholder texture, not canon character artwork. Entity names and destinations are drawn from the live catalogue.</p>
    </div>
  );
}

export function UniversesPage() {
  const { rows, loading, error } = useTableRows("universes");
  const items = rows.map((row, index) => ({
    text: row.name,
    meta: row.category || "Universe",
    link: `/universes/${row.slug}`,
    image: textureAt(index),
    marquee: `${row.name} · ${row.category || "UNIVERSE"}`
  }));

  return (
    <div className="atlas-feature-page">
      <PageIntro eyebrow="UNIVERSE ATLAS / 03" title={<>Every world has a <em>structure.</em></>} description="Explore a universe through its works, alternate continuities, entity records and linked source material." action={<Link className="atlas-button atlas-button--dark" to="/characters">Explore entities <ArrowUpRight size={15} /></Link>} />
      <DataNotice error={error} />
      {loading ? <p className="atlas-loading">Opening the universe index…</p> : rows.length ? (
        <div className="flowing-menu-frame">
          <FlowingMenu items={items} speed={55} direction="alternate" followCursor={0.32} duration={0.48} stretch={0.5} magnet={0.2} textColor="#F7F9F8" bgColor="#173B46" marqueeBgColor="#42BFC0" marqueeTextColor="#13242D" borderColor="rgba(247,249,248,.16)" dimInactive showIndex showArrow imageShape="rounded" intro ariaLabel="OMNIVEX universe explorer" />
        </div>
      ) : <EmptyState title="No universes indexed yet" body="Universe hubs will appear when a source-linked universe record is added to the database. There are no hard-coded sample franchises here." />}
      <p className="atlas-caption">The flowing bands use abstract archive textures as a temporary visual layer. They are not official universe artwork.</p>
    </div>
  );
}

export function UniverseHubPage() {
  const { universeSlug } = useParams();
  const [universe, setUniverse] = useState(null);
  const [entities, setEntities] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    (async () => {
      const { data, error: universeError } = await supabase.from("universes").select("*").eq("slug", universeSlug).maybeSingle();
      if (!active) return;
      if (universeError) { setError(universeError.message); return; }
      setUniverse(data);
      if (data) {
        const { data: members, error: entityError } = await supabase.from("entities").select("*").eq("primary_universe_id", data.id).order("name").limit(80);
        if (!active) return;
        if (entityError) setError(entityError.message);
        else setEntities(members || []);
      }
    })();
    return () => { active = false; };
  }, [universeSlug]);

  return (
    <div className="atlas-feature-page">
      <PageIntro eyebrow="UNIVERSE HUB / RECORD" title={universe?.name || universeSlug?.replace(/-/g, " ")} description={universe?.description || "This hub is assembled from the universe record and entities linked to it. Continuities remain separate at the version level."} action={<Link className="atlas-text-link" to="/universes"><ArrowLeft size={15} /> All universes</Link>} />
      <DataNotice error={error} />
      {universe ? <><div className="atlas-meta-strip"><span>{universe.category}</span><span>STATUS · {universe.status}</span><span>{entities.length} LINKED ENTITIES</span></div><div className="atlas-list-panel">{entities.length ? entities.map(item => <RecordLink key={item.id} to={`/characters/${item.slug}`} meta={item.status}>{item.name}</RecordLink>) : <EmptyState title="No linked entity records" body="Entities appear here after their primary universe is linked in the catalogue." />}</div></> : !error && <EmptyState title="Universe record not found" body="The URL does not resolve to a universe row in the current database." />}
    </div>
  );
}

export function EntityDossierPage() {
  const { entitySlug, versionSlug } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [related, setRelated] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [sources, setSources] = useState([]);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    setLoading(true); setError("");
    (async () => {
      const { data: record, error: recordError } = await supabase.from("entities").select("*").eq("slug", entitySlug).maybeSingle();
      if (!active) return;
      if (recordError) { setError(recordError.message); setLoading(false); return; }
      if (!record) { setEntity(null); setLoading(false); return; }
      setEntity(record);
      const [versionResult, relatedResult] = await Promise.all([
        supabase.from("entity_versions").select("*").eq("entity_id", record.id).order("created_at", { ascending: true }),
        record.primary_universe_id
          ? supabase.from("entities").select("*").eq("primary_universe_id", record.primary_universe_id).neq("id", record.id).limit(12)
          : Promise.resolve({ data: [], error: null })
      ]);
      if (!active) return;
      if (versionResult.error) setError(versionResult.error.message);
      const foundVersions = versionResult.data || [];
      setVersions(foundVersions);
      setActiveVersion(foundVersions.find(item => item.slug === versionSlug) || foundVersions[0] || null);
      setRelated(relatedResult.data || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [entitySlug, versionSlug]);

  useEffect(() => {
    let active = true;
    if (!supabase || !activeVersion) {
      setCapabilities([]); setEvidence([]); setSources([]);
      return () => { active = false; };
    }
    (async () => {
      const [capResult, evidenceResult] = await Promise.all([
        supabase.from("capabilities").select("*").eq("entity_version_id", activeVersion.id).order("capability_name"),
        supabase.from("evidence_records").select("*").eq("entity_version_id", activeVersion.id).order("created_at", { ascending: false }).limit(30)
      ]);
      if (!active) return;
      setCapabilities(capResult.data || []);
      setEvidence(evidenceResult.data || []);
      const sourceIds = [...new Set((evidenceResult.data || []).map(item => item.source_record_id).filter(Boolean))];
      if (sourceIds.length) {
        const { data } = await supabase.from("source_records").select("*").in("id", sourceIds);
        if (active) setSources(data || []);
      } else setSources([]);
      if (capResult.error || evidenceResult.error) setError(capResult.error?.message || evidenceResult.error?.message || "");
    })();
    return () => { active = false; };
  }, [activeVersion]);

  useEffect(() => {
    let active = true;
    if (!supabase || !user || !entity) { setFollowing(false); return () => { active = false; }; }
    supabase.from("follows").select("id,notifications_enabled").eq("user_id", user.id).eq("target_type", "entity").eq("target_id", entity.id).maybeSingle()
      .then(({ data }) => { if (active) setFollowing(Boolean(data?.notifications_enabled)); });
    return () => { active = false; };
  }, [user?.id, entity?.id]);

  const saveRecord = async () => {
    if (!user) { showToast("Sign in to save this record."); navigate("/auth/sign-in"); return; }
    const { error: saveError } = await supabase.from("saved_items").insert({ user_id: user.id, target_type: "entity", target_id: entity.id });
    if (saveError?.code === "23505") showToast("Already in your library.");
    else if (saveError) showToast({ title: "Could not save record", description: saveError.message });
    else showToast("Entity saved to your library.");
  };

  const toggleFollow = async next => {
    if (!user) { showToast("Sign in to follow entity updates."); navigate("/auth/sign-in"); return; }
    if (next) {
      const { error: followError } = await supabase.from("follows").insert({ user_id: user.id, target_type: "entity", target_id: entity.id, notifications_enabled: true });
      if (followError && followError.code !== "23505") { showToast({ title: "Follow failed", description: followError.message }); return; }
    } else {
      const { error: followError } = await supabase.from("follows").delete().eq("user_id", user.id).eq("target_type", "entity").eq("target_id", entity.id);
      if (followError) { showToast({ title: "Could not unfollow", description: followError.message }); return; }
    }
    setFollowing(next);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); showToast("Profile link copied."); }
    catch { showToast("Clipboard access is not available in this browser."); }
  };

  const sections = ["Overview", "Versions", "Capabilities", "Evidence", "Sources", "Related"];
  const dockItems = [
    { label: "Save record", icon: <BookmarkPlus size={19} />, onClick: saveRecord },
    { label: "Copy link", icon: <Copy size={19} />, onClick: copyLink },
    { label: "Research notes", icon: <NotebookPen size={19} />, onClick: () => navigate("/me/research") },
    { label: "All entities", icon: <ArrowLeft size={19} />, onClick: () => navigate("/characters") }
  ];

  if (loading) return <div className="atlas-feature-page"><p className="atlas-loading">Opening the dossier…</p></div>;
  if (!entity) return <div className="atlas-feature-page"><EmptyState title="Entity record not found" body={supabase ? "This slug does not match a public entity record." : "Add the Supabase publishable key to load the catalogue."} action={<Link className="atlas-button atlas-button--dark" to="/characters">Back to directory</Link>} /></div>;

  return (
    <div className="atlas-feature-page dossier-page">
      <div className="dossier-heading">
        <div><span className="section-kicker">ENTITY DOSSIER / {entity.entity_type?.toUpperCase() || "RECORD"}</span><h1>{entity.name}</h1><p>{entity.short_description || "No short description has been submitted for this record."}</p></div>
        <div className="dossier-status"><span>{entity.status}</span><BellToggle pressed={following} onChange={toggleFollow} color="#173B46" background="#E1E9E9" onColor="#13242D" onBackground="#42BFC0" size="md" count={0} badge={false} waves /></div>
      </div>
      <DataNotice error={error} />
      <div className="dossier-top-meta"><span>PERMANENT ID · {entity.id.slice(0, 8).toUpperCase()}</span><span>VERSION RECORDS · {versions.length}</span><span>CONTINUITY-AWARE INDEX</span></div>
      <div className="dossier-layout">
        <aside className="dossier-side"><LineSidebar items={sections} accentColor="#42BFC0" textColor="#173B46" markerColor="#E76F51" defaultActive={0} showIndex showMarker proximityRadius={115} maxShift={19} fontSize={0.78} itemGap={15} smoothing={130} onItemClick={(label, index) => document.getElementById(`dossier-${slugify(label)}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} /></aside>
        <div className="dossier-main">
          <section id="dossier-overview" className="dossier-section"><span className="section-kicker">01 / IDENTITY</span><h2>Identity, not assumption.</h2><p>This entity is a permanent identity record. Power, feats and capabilities belong to a specific version below; no composite profile is assumed.</p><div className="atlas-meta-strip"><span>TYPE · {entity.entity_type}</span><span>STATUS · {entity.status}</span><span>ALIAS RECORDS · NOT MERGED INTO THIS VIEW</span></div></section>
          <section id="dossier-versions" className="dossier-section"><span className="section-kicker">02 / INCARNATIONS & CONTINUITY</span><h2>Choose the exact version.</h2>{versions.length ? <div className="version-selector">{versions.map(version => <button key={version.id} type="button" className={activeVersion?.id === version.id ? "is-selected" : ""} onClick={() => { setActiveVersion(version); navigate(`/characters/${entity.slug}/versions/${version.slug}`, { replace: true }); }}><strong>{version.label}</strong><small>{version.continuity || version.canon_status} · {version.status}</small></button>)}</div> : <EmptyState title="No version records" body="This entity has no version-specific records yet. No abilities or feats are inferred from the entity name." />}</section>
          <section id="dossier-capabilities" className="dossier-section"><span className="section-kicker">03 / CAPABILITIES</span><h2>{activeVersion?.label || "Selected version"}</h2>{capabilities.length ? <div className="capability-grid">{capabilities.map(item => <article key={item.id}><span>{item.dimension || "CAPABILITY"}</span><strong>{item.capability_name}</strong><p>{item.mechanism || "Mechanism not documented."}</p>{item.limitations && <small>LIMITS · {item.limitations}</small>}</article>)}</div> : <p className="atlas-muted">No capability records are linked to this version. Capability values are not guessed or generated from popularity.</p>}</section>
          <section id="dossier-evidence" className="dossier-section"><span className="section-kicker">04 / FEATS & EVIDENCE</span><h2>Claims need traceable origins.</h2>{evidence.length ? evidence.map(item => <article key={item.id} className="dossier-evidence-row"><strong>{item.summary}</strong><span>{item.evidence_type} · {item.review_status} · {item.reliability_grade || "GRADE PENDING"}</span><p>{item.context || "Context not provided."}</p><Link to={`/evidence/${item.id}`}>Open evidence record <ArrowUpRight size={13} /></Link></article>) : <p className="atlas-muted">No evidence records are linked to this version yet.</p>}</section>
          <section id="dossier-sources" className="dossier-section"><span className="section-kicker">05 / SOURCE VAULT</span><h2>Original references.</h2>{sources.length ? <Folder items={sources.slice(0, 6).map(item => item.title)} label="SOURCE RECORDS" mode="flap" variant="glass" color="#173B46" paperColor="#F7F9F8" defaultOpen={false} size={1.05} onItemClick={(item, index) => { const source = sources[index]; if (source?.url) window.open(source.url, "_blank", "noopener,noreferrer"); }} /> : <p className="atlas-muted">No source records are linked through this version’s evidence.</p>}</section>
          <section id="dossier-related" className="dossier-section"><span className="section-kicker">06 / SAME-UNIVERSE INDEX</span><h2>Continue exploring.</h2>{related.length ? <div className="related-menu"><InfiniteMenu items={related.slice(0, 10).map((item,index)=>({ title:item.name, description:item.short_description || item.entity_type, image:textureAt(index), link:`/characters/${item.slug}` }))} count={110} tileSize={0.56} zoom={1.5} autoplay={0} grayscale theme="dark" backgroundColor="#173B46" accentColor="#42BFC0" /></div> : <p className="atlas-muted">No other entities are currently linked to this primary universe.</p>}</section>
        </div>
      </div>
      <div className="dossier-dock"><Dock items={dockItems} position="bottom" theme="light" baseItemSize={46} magnification={62} distance={170} panelHeight={62} gap={9} roundness={0.28} accentColor="#42BFC0" showLabels showIndicators tiles={false} autoHide={false} /></div>
      <p className="atlas-caption">The dossier displays stored records only. Community submissions, verified sources and AI interpretations remain distinct states.</p>
    </div>
  );
}

const rulesetOptions = ["Standard matchup", "Canon-only analysis", "Composite (opt in)", "Custom conditions"];

export function MatchupCreatePage() {
  const { rows: entities } = useTableRows("entities");
  const { rows: versions, error } = useTableRows("entity_versions");
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [rulesetIndex, setRulesetIndex] = useState(0);
  const [environment, setEnvironment] = useState("Neutral environment");
  const [distance, setDistance] = useState("Standard starting distance");
  const [victory, setVictory] = useState("Incapacitation");
  const [prep, setPrep] = useState("No preparation");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const entityMap = useMemo(() => new Map(entities.map(item => [item.id, item])), [entities]);
  const versionOptions = versions.map(version => ({ ...version, entity: entityMap.get(version.entity_id) })).filter(item => item.entity);
  const chosenA = versionOptions.find(item => item.id === a);
  const chosenB = versionOptions.find(item => item.id === b);

  const publish = async () => {
    if (!a || !b || a === b) { showToast("Choose two different version records first."); return; }
    if (!user) { showToast("Sign in to create and publish a matchup."); navigate("/auth/sign-in", { state: { from: { pathname: "/matchups/create" } } }); return; }
    setSaving(true);
    const title = `${chosenA?.entity.name} vs ${chosenB?.entity.name}`;
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const configuration = {
      ruleset: rulesetOptions[rulesetIndex],
      participants: [{ entity_version_id: a, side: "A" }, { entity_version_id: b, side: "B" }],
      environment, starting_distance: distance, victory_condition: victory, preparation: prep,
      notes: description.trim(), verdict: null
    };
    const { data: matchup, error: matchupError } = await supabase.from("matchups").insert({
      slug, title, description: description.trim(), configuration, status: "draft", created_by: user.id
    }).select("*").single();
    if (matchupError) { showToast({ title: "Matchup could not be saved", description: matchupError.message }); setSaving(false); return; }
    const { error: participantsError } = await supabase.from("matchup_participants").insert([
      { matchup_id: matchup.id, entity_version_id: a, side: "A", participant_order: 1 },
      { matchup_id: matchup.id, entity_version_id: b, side: "B", participant_order: 1 }
    ]);
    if (participantsError) {
      showToast({ title: "Participants could not be attached", description: participantsError.message });
      setSaving(false);
      return;
    }
    showToast("Matchup configuration saved. No verdict has been generated.");
    navigate(`/matchups/${matchup.slug}`);
    setSaving(false);
  };

  return (
    <div className="atlas-feature-page">
      <PageIntro eyebrow="BATTLE ENGINE / CONFIGURATION" title={<>Define the <em>comparison.</em></>} description="Exact versions and explicit conditions come before any analysis. Creating this record does not generate a winner or a battle report." />
      <DataNotice error={error} />
      {!versions.length ? <EmptyState title="Version records are required" body="Create two entity version records before configuring a matchup. Entity names alone are not enough to define a reproducible comparison." action={<Link to="/characters" className="atlas-button atlas-button--dark">Open entity index</Link>} /> : (
        <div className="matchup-builder">
          <Stepper initialStep={1} onFinalStepCompleted={publish} onStepChange={() => {}} indicator="numbers" orientation="horizontal" transition="slide" linear={false} theme="light" accentColor="#42BFC0" width="100%" radius={8} nextButtonText="Continue" completeButtonText={saving ? "Saving…" : "Save configuration"} completedContent={<div className="stepper-complete"><Check size={22} /><strong>Configuration saved</strong><p>Opening the matchup record…</p></div>}>
            <Step title="Participants"><div className="workflow-step"><span className="section-kicker">STEP 01 / VERSION RESOLUTION</span><h2>Which exact incarnations?</h2><label>Side A<select value={a} onChange={event => setA(event.target.value)}><option value="">Choose a version</option>{versionOptions.map(item => <option key={item.id} value={item.id}>{item.entity.name} — {item.label}</option>)}</select></label><label>Side B<select value={b} onChange={event => setB(event.target.value)}><option value="">Choose a different version</option>{versionOptions.filter(item => item.id !== a).map(item => <option key={item.id} value={item.id}>{item.entity.name} — {item.label}</option>)}</select></label>{chosenA && chosenB && <p className="workflow-preview">{chosenA.entity.name} ({chosenA.label}) <b>VS</b> {chosenB.entity.name} ({chosenB.label})</p>}</div></Step>
            <Step title="Rules & scope"><div className="workflow-step"><span className="section-kicker">STEP 02 / COMPARISON RULESET</span><h2>Choose the rules.</h2><p>The ruleset controls which versions and evidence are eligible. Composite material is opt-in only.</p><div className="option-wheel-wrap"><OptionWheel items={rulesetOptions} defaultSelected={0} onChange={index => setRulesetIndex(index)} textColor="#71838A" activeColor="#173B46" side="left" fontSize={1.05} spacing={1.55} curve={0.9} tilt={5} blur={1.1} fade={0.18} minOpacity={0.12} smoothing={180} inset={34} loop={false} draggable /></div><div className="workflow-field-grid"><label>Environment<input value={environment} onChange={event => setEnvironment(event.target.value)} /></label><label>Starting distance<input value={distance} onChange={event => setDistance(event.target.value)} /></label></div></div></Step>
            <Step title="Conditions"><div className="workflow-step"><span className="section-kicker">STEP 03 / CONDITIONS</span><h2>Make assumptions visible.</h2><div className="workflow-field-grid"><label>Victory condition<select value={victory} onChange={event => setVictory(event.target.value)}><option>Incapacitation</option><option>Death</option><option>Submission</option><option>Objective completion</option></select></label><label>Preparation<select value={prep} onChange={event => setPrep(event.target.value)}><option>No preparation</option><option>One day</option><option>One week</option><option>Standard equipment only</option></select></label></div><label>Additional conditions<textarea value={description} onChange={event => setDescription(event.target.value)} rows={4} placeholder="List restrictions, allowed resources, prior knowledge or other assumptions." /></label><p className="atlas-caption">Only the configuration is saved. Analysis and verdict generation are separate engine stages and are not represented as complete here.</p></div></Step>
          </Stepper>
        </div>
      )}
    </div>
  );
}

export function MatchupDetailPage() {
  const { matchupSlug } = useParams();
  const [matchup, setMatchup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [report, setReport] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    (async () => {
      const { data: row, error: matchupError } = await supabase.from("matchups").select("*").eq("slug", matchupSlug).maybeSingle();
      if (!active) return;
      if (matchupError) { setError(matchupError.message); return; }
      setMatchup(row);
      if (!row) return;
      const [pResult, rResult] = await Promise.all([
        supabase.from("matchup_participants").select("*").eq("matchup_id", row.id).order("participant_order"),
        supabase.from("matchup_reports").select("*").eq("matchup_id", row.id).order("report_version", { ascending: false }).limit(1).maybeSingle()
      ]);
      if (!active) return;
      const pRows = pResult.data || [];
      const versionIds = pRows.map(item => item.entity_version_id);
      if (versionIds.length) {
        const { data: versions } = await supabase.from("entity_versions").select("*").in("id", versionIds);
        const vRows = versions || [];
        const entityIds = [...new Set(vRows.map(item => item.entity_id))];
        const { data: entities } = entityIds.length ? await supabase.from("entities").select("*").in("id", entityIds) : { data: [] };
        const byEntity = new Map((entities || []).map(item => [item.id, item]));
        const byVersion = new Map(vRows.map(item => [item.id, { ...item, entity: byEntity.get(item.entity_id) }]));
        setParticipants(pRows.map(item => ({ ...item, version: byVersion.get(item.entity_version_id) })));
      } else setParticipants([]);
      setReport(rResult.data || null);
      if (rResult.data) {
        const { data: links } = await supabase.from("matchup_report_evidence").select("*").eq("report_id", rResult.data.id);
        const evidenceIds = (links || []).map(item => item.evidence_record_id);
        if (evidenceIds.length) {
          const { data: records } = await supabase.from("evidence_records").select("*").in("id", evidenceIds);
          if (active) setEvidence(records || []);
        }
      }
      if (pResult.error || rResult.error) setError(pResult.error?.message || rResult.error?.message || "");
    })();
    return () => { active = false; };
  }, [matchupSlug]);

  const sideA = participants.filter(item => item.side === "A");
  const sideB = participants.filter(item => item.side === "B");
  if (!supabase) return <div className="atlas-feature-page"><EmptyState title="Supabase connection required" body="The matchup report is loaded from stored participants and report snapshots. Add the publishable key to load it." /></div>;
  if (!matchup && !error) return <div className="atlas-feature-page"><p className="atlas-loading">Loading matchup report…</p></div>;

  return (
    <div className="atlas-feature-page matchup-report-page">
      <PageIntro eyebrow="BATTLE ENGINE / MATCHUP RECORD" title={matchup?.title || "Matchup not found"} description={matchup?.description || "The configuration and any published report are displayed separately. A saved setup is not a verdict."} action={<Link className="atlas-text-link" to="/matchups/create"><Plus size={15} /> Configure another</Link>} />
      <DataNotice error={error} />
      {matchup ? <>
        <div className="atlas-meta-strip"><span>STATUS · {matchup.status}</span><span>CREATED · {new Date(matchup.created_at).toLocaleDateString()}</span><span>REPORT · {report ? `V${report.report_version}` : "NOT GENERATED"}</span></div>
        <div className="matchup-versus-strip"><div><span>SIDE A</span><strong>{sideA.map(item => `${item.version?.entity?.name || "Unknown"} · ${item.version?.label || "Version pending"}`).join(", ") || "Participant records missing"}</strong></div><b>VS</b><div><span>SIDE B</span><strong>{sideB.map(item => `${item.version?.entity?.name || "Unknown"} · ${item.version?.label || "Version pending"}`).join(", ") || "Participant records missing"}</strong></div></div>
        {report ? <section className="report-summary"><span className="section-kicker">STORED REPORT SNAPSHOT · {report.verification_status}</span><h2>{report.verdict_type === "inconclusive" ? "Inconclusive" : report.verdict_type === "canon_confirmed" ? "Canon-confirmed outcome" : "Evidence-based prediction"}</h2><p>{report.verdict_summary || "No summary supplied."}</p>{report.uncertainty_notes && <small>UNCERTAINTY · {report.uncertainty_notes}</small>}</section> : <EmptyState title="No analysis report attached" body="The matchup configuration exists, but no Battle Engine report is stored. OMNIVEX will not invent feats, sources, a winner or a confidence score." />}
        <section className="report-stack-section"><div className="feature-section-heading"><div><span className="section-kicker">REPORT STRUCTURE</span><h2>Inspect each layer.</h2></div><span className="atlas-mono-note">CONFIGURATION ≠ VERDICT</span></div><div className="matchup-scroll-stack"><ScrollStack itemDistance={130} itemStackDistance={26} stackPosition="16%" itemScale={0.045} baseScale={0.88} dimAmount={0.14} blurAmount={0} tiltAmount={0} rotationAmount={0} holdDistance={180} smoothScroll snap={false}><ScrollStackItem itemClassName="report-stack-card"><span>01 / CONFIGURATION</span><h3>Rules and assumptions</h3><pre>{JSON.stringify(matchup.configuration || {}, null, 2)}</pre></ScrollStackItem><ScrollStackItem itemClassName="report-stack-card"><span>02 / PARTICIPANTS</span><h3>Exact version records</h3><p>{participants.map(item => `${item.side}: ${item.version?.entity?.name || "Entity unavailable"} — ${item.version?.label || "Version unavailable"}`).join("\n") || "No participant rows are attached."}</p></ScrollStackItem><ScrollStackItem itemClassName="report-stack-card"><span>03 / EVIDENCE QUALITY</span><h3>Traceable material</h3><p>{report ? JSON.stringify(report.evidence_quality || {}, null, 2) : "No stored report means there is no evidence-quality assessment to show."}</p></ScrollStackItem><ScrollStackItem itemClassName="report-stack-card"><span>04 / UNCERTAINTY</span><h3>What remains unresolved</h3><p>{report?.uncertainty_notes || "Uncertainty has not been assessed because no report exists."}</p></ScrollStackItem></ScrollStack></div></section>
        <section className="evidence-highlight-section"><div className="feature-section-heading"><div><span className="section-kicker">EVIDENCE HIGHLIGHTS</span><h2>Sources behind the analysis.</h2></div></div>{evidence.length ? <div className="evidence-card-swap"><CardSwap items={evidence.map(item=>({title:item.summary,description:item.context}))} width={400} height={260} cardDistance={36} verticalDistance={26} depth={70} skewAmount={3} visibleCards={Math.min(4,evidence.length)} delay={4200} autoplay={false} draggable pauseOnHover theme="light" />{evidence.slice(0,4).map(item=><article key={item.id} className="evidence-swap-caption"><strong>{item.summary}</strong><span>{item.review_status} · {item.reliability_grade || "GRADE PENDING"}</span></article>)}</div> : <p className="atlas-muted">No evidence links are attached to this report snapshot.</p>}</section>
      </> : <EmptyState title="Matchup record not found" body="The supplied slug does not resolve to a matchup row." />}
    </div>
  );
}

export function EvidenceExplorerPage() {
  const { rows: evidence, error } = useTableRows("evidence_records");
  const { rows: relations } = useTableRows("evidence_relations");
  const [selectedId, setSelectedId] = useState("");
  const selected = evidence.find(item => item.id === selectedId) || evidence[0] || null;
  useEffect(() => { if (!selectedId && evidence[0]) setSelectedId(evidence[0].id); }, [evidence, selectedId]);
  const treeItems = [{ label: "Evidence records", value: "root", children: evidence.slice(0, 18).map(item => ({ label: item.summary?.slice(0, 38) || "Evidence record", value: item.id })) }];
  const selectedRelations = relations.filter(item => item.from_evidence_id === selected?.id || item.to_evidence_id === selected?.id);

  return (
    <div className="atlas-feature-page">
      <PageIntro eyebrow="INTELLIGENCE ENGINE / EVIDENCE" title={<>Trace the claim to its <em>origin.</em></>} description="Source existence, interpretation quality, reliability and review status are separate signals. A disputed claim remains visible as disputed." />
      <DataNotice error={error} />
      {evidence.length ? <div className="evidence-explorer-layout"><aside className="evidence-tree-panel"><span className="section-kicker">EVIDENCE RELATIONSHIPS</span><BranchedMenu items={treeItems} defaultOpen={0} defaultActive={selected?.id} onSelect={value => setSelectedId(value)} color="#173B46" accentColor="#E76F51" lineColor="#A6B8B9" width={290} rowHeight={38} indent={42} trunk={16} radius={10} fontSize={12} /></aside><section className="evidence-selected-panel">{selected && <BorderGlow glowColor="174 55 63" backgroundColor="#F7F9F8" borderRadius={10} glowRadius={42} glowIntensity={0.7} coneSpread={24} animated={false} colors={["#42BFC0","#E76F51","#426DAB"]} fillOpacity={0.2}><article className="evidence-selected-card"><span className="section-kicker">SELECTED EVIDENCE · {selected.review_status}</span><h2>{selected.summary}</h2><p>{selected.context || "No context supplied."}</p><div className="atlas-meta-strip"><span>TYPE · {selected.evidence_type}</span><span>CANON · {selected.canon_status}</span><span>RELIABILITY · {selected.reliability_grade || "PENDING"}</span></div>{selected.limitations && <p><b>LIMITATIONS</b> · {selected.limitations}</p>}{selected.counter_evidence_notes && <p><b>COUNTER-EVIDENCE</b> · {selected.counter_evidence_notes}</p>}<Link to={`/evidence/${selected.id}`} className="atlas-text-link">Open full record <ArrowUpRight size={14} /></Link></article></BorderGlow>}<div className="evidence-relation-list"><strong>Linked relationships</strong>{selectedRelations.length ? selectedRelations.map(item=><p key={item.id}>{item.relation_type} · {item.note || "No relationship note"}</p>) : <p>No evidence relation rows connect this record yet.</p>}</div></section></div> : <EmptyState title="No evidence records yet" body="Submitted evidence will appear when records exist in the database. Empty data is not replaced with made-up citations." />}
    </div>
  );
}

export function EvidenceDetailPage() {
  const { evidenceSlug } = useParams();
  const [record, setRecord] = useState(null);
  const [source, setSource] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    (async () => {
      const { data, error: queryError } = await supabase.from("evidence_records").select("*").eq("id", evidenceSlug).maybeSingle();
      if (!active) return;
      if (queryError) { setError(queryError.message); return; }
      setRecord(data);
      if (data?.source_record_id) {
        const { data: sourceData } = await supabase.from("source_records").select("*").eq("id", data.source_record_id).maybeSingle();
        if (active) setSource(sourceData);
      }
    })();
    return () => { active = false; };
  }, [evidenceSlug]);

  return <div className="atlas-feature-page"><PageIntro eyebrow="EVIDENCE RECORD / DETAIL" title={record?.summary || "Evidence record"} description="The record preserves claim context, limitations, source location and review state." action={<Link to="/evidence" className="atlas-text-link"><ArrowLeft size={14} /> Evidence explorer</Link>} /><DataNotice error={error} />{record ? <BorderGlow glowColor="174 55 63" backgroundColor="#F7F9F8" borderRadius={10} glowIntensity={0.65} colors={["#42BFC0","#E76F51","#426DAB"]}><div className="evidence-detail-card"><div className="atlas-meta-strip"><span>{record.review_status}</span><span>{record.evidence_type}</span><span>{record.reliability_grade || "RELIABILITY NOT GRADED"}</span></div><h2>Context</h2><p>{record.context || "No context was entered."}</p><h2>Source</h2>{source ? <><strong>{source.title}</strong><p>{source.locator || "Locator not supplied."}</p>{source.url && <a href={source.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={13} /></a>}</> : <p>No source record is linked.</p>}<h2>Limitations</h2><p>{record.limitations || "No limitations recorded."}</p><h2>Counter-evidence</h2><p>{record.counter_evidence_notes || "No counter-evidence notes recorded."}</p></div></BorderGlow> : <EmptyState title="Evidence record not found" body="This identifier does not resolve to an evidence row." />}</div>;
}

export function RankingsPage() {
  const { rows: snapshots, error } = useTableRows("ranking_snapshots", "captured_at", 100);
  const [rankingType, setRankingType] = useState("all");
  const [subjectNames, setSubjectNames] = useState({});
  const filtered = snapshots.filter(item => rankingType === "all" || item.ranking_type === rankingType);
  const types = [...new Set(snapshots.map(item => item.ranking_type).filter(Boolean))];
  useEffect(() => {
    let active = true;
    if (!supabase || !filtered.length) return () => { active = false; };
    const entityIds = filtered.filter(item=>item.subject_type==="entity").map(item=>item.subject_id);
    const matchupIds = filtered.filter(item=>item.subject_type==="matchup").map(item=>item.subject_id);
    Promise.all([
      entityIds.length ? supabase.from("entities").select("id,name,slug").in("id",entityIds) : Promise.resolve({data:[]}),
      matchupIds.length ? supabase.from("matchups").select("id,title,slug").in("id",matchupIds) : Promise.resolve({data:[]})
    ]).then(([entities,matchups])=>{
      if(!active) return;
      const map={};
      (entities.data||[]).forEach(item=>map[item.id]={name:item.name,href:`/characters/${item.slug}`});
      (matchups.data||[]).forEach(item=>map[item.id]={name:item.title,href:`/matchups/${item.slug}`});
      setSubjectNames(map);
    });
    return ()=>{active=false;};
  }, [rankingType, snapshots.length]);

  const activity = filtered.slice(0,40).sort((a,b)=>a.position-b.position).map(item=>({
    title: subjectNames[item.subject_id]?.name || "Subject record",
    description: `${item.ranking_type} · ${item.period} · score ${Number(item.score).toFixed(2)}`,
    id: item.id,
    subject_id: item.subject_id,
    position: item.position
  }));

  return <div className="atlas-feature-page"><PageIntro eyebrow="DISCOVERY ENGINE / RANKINGS" title={<>Different signals. <em>Different rankings.</em></>} description="Popularity, recorded outcomes, activity and research-derived capability measures must not be blended into one universal power ranking." /><div className="atlas-filter-bar"><label className="atlas-select"><Filter size={15} /><select value={rankingType} onChange={event=>setRankingType(event.target.value)}><option value="all">All ranking types</option>{types.map(item=><option key={item} value={item}>{item}</option>)}</select></label><span className="atlas-count">{activity.length} SNAPSHOTS</span></div><DataNotice error={error} />{activity.length ? <div className="ranking-list-wrap"><AnimatedList items={activity} renderItem={(item,index)=><div className="ranking-item-content"><span className="ranking-position">{String(item.position).padStart(2,"0")}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></div>} width="100%" maxHeight={620} theme="light" accentColor="#42BFC0" frame radius={8} gap={7} animation="pop" loop={false} onItemSelect={item=>{const target=subjectNames[item.subject_id];if(target?.href)window.location.href=target.href;}} /></div> : <EmptyState title="No ranking snapshots available" body="Rankings are materialized snapshots. No leaderboard is fabricated when no snapshot data exists." />}</div>;
}

export function CommunityPage() {
  const { rows: discussions, error, refresh } = useTableRows("discussions");
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [reactionStats, setReactionStats] = useState({});
  const [liked, setLiked] = useState({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!supabase || !discussions.length) return () => { active=false; };
    (async()=>{
      const ids=discussions.map(item=>item.id);
      const {data}=await supabase.from("reactions").select("target_id,user_id,reaction").eq("target_type","discussion").in("target_id",ids).eq("reaction","support");
      if(!active)return;
      const counts={}; const mine={};
      (data||[]).forEach(item=>{counts[item.target_id]=(counts[item.target_id]||0)+1;if(user?.id===item.user_id)mine[item.target_id]=true;});
      setReactionStats(counts); setLiked(mine);
    })();
    return ()=>{active=false;};
  },[discussions,user?.id]);

  const toggleReaction = async (discussion, next) => {
    if (!user) { showToast("Sign in to react to a discussion."); navigate("/auth/sign-in"); return; }
    if (next) {
      const {error: insertError}=await supabase.from("reactions").insert({target_type:"discussion",target_id:discussion.id,user_id:user.id,reaction:"support"});
      if(insertError && insertError.code!=="23505") {showToast({title:"Reaction failed",description:insertError.message});return;}
    } else {
      const {error: deleteError}=await supabase.from("reactions").delete().eq("target_type","discussion").eq("target_id",discussion.id).eq("user_id",user.id).eq("reaction","support");
      if(deleteError) {showToast({title:"Could not remove reaction",description:deleteError.message});return;}
    }
    setLiked(old=>({...old,[discussion.id]:next}));
    setReactionStats(old=>({...old,[discussion.id]:Math.max(0,(old[discussion.id]||0)+(next?1:-1))}));
  };

  const createDiscussion = async event => {
    event.preventDefault();
    if(!user) {showToast("Sign in to start a discussion.");navigate("/auth/sign-in");return;}
    setPosting(true);
    const {error: postError}=await supabase.from("discussions").insert({title:title.trim(),body:body.trim(),created_by:user.id});
    if(postError) showToast({title:"Discussion could not be published",description:postError.message});
    else {setTitle("");setBody("");showToast("Discussion published.");refresh();}
    setPosting(false);
  };

  return <div className="atlas-feature-page"><PageIntro eyebrow="COMMUNITY ENGINE / DISCUSSION ARENA" title={<>Bring context. <em>Bring sources.</em></>} description="Community arguments, evidence submissions and reactions are separate from factual verification. A popular position is not automatically the correct one." /><DataNotice error={error} /><form className="discussion-composer" onSubmit={createDiscussion}><span className="section-kicker">START A DISCUSSION</span><input required maxLength={140} value={title} onChange={event=>setTitle(event.target.value)} placeholder="A clear question or topic" /><textarea required rows={3} value={body} onChange={event=>setBody(event.target.value)} placeholder="Add context, scope and source links where relevant." /><button className="atlas-button atlas-button--dark" disabled={posting}>{posting?"Publishing…":"Publish discussion"} <ArrowUpRight size={14}/></button></form><div className="discussion-list">{discussions.length ? discussions.map(item=><article className="discussion-card" key={item.id}><div className="discussion-card__head"><span className="section-kicker">{item.status || "DISCUSSION"}</span><time>{new Date(item.created_at).toLocaleDateString()}</time></div><h2>{item.title}</h2><p>{item.body}</p><div className="discussion-card__actions"><Link to={`/discussions/${item.id}`} className="atlas-text-link">Open thread <ArrowUpRight size={14}/></Link><PulseHeart liked={Boolean(liked[item.id])} count={reactionStats[item.id]||0} onChange={next=>toggleReaction(item,next)} icon="heart" showCount size={38} corner={28} likedColor="#E76F51" idleColor="#71838A" pillColor="#E5ECEC" textColor="#173B46" label="Support" /></div></article>) : <EmptyState title="No discussions yet" body="New threads appear here after a member publishes one. Counts are never pre-filled." />}</div></div>;
}

export function PersonalOverviewPage() {
  const { user } = useAuth();
  return <div className="atlas-feature-page"><PageIntro eyebrow="PERSONAL SPACE" title={<>Your research. <em>Your library.</em></>} description={user ? `Signed in as ${user.email}. Your saved items and private notes are scoped to your account.` : "Sign in to manage private notes, saved items and notification preferences."} action={!user && <Link className="atlas-button atlas-button--dark" to="/auth/sign-in"><LogIn size={15}/> Sign in</Link>} /><div className="personal-link-grid"><RecordLink to="/me/library" meta="SAVED RELATIONSHIPS">Saved library</RecordLink><RecordLink to="/me/research" meta="PRIVATE NOTES">Research notebook</RecordLink><RecordLink to="/community" meta="PUBLIC CONTRIBUTIONS">Your community activity</RecordLink></div></div>;
}

export function LibraryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saved,setSaved] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const load = async () => {
    if(!supabase || !user) {setSaved([]);setLoading(false);return;}
    setLoading(true);
    const {data,error:loadError}=await supabase.from("saved_items").select("*").eq("user_id",user.id).order("created_at",{ascending:false});
    if(loadError) setError(loadError.message);
    else {
      const rows=data||[];
      const grouped={};
      rows.forEach(item=>(grouped[item.target_type] ||= []).push(item.target_id));
      const [entities,universes,matchups,evidence,discussions]=await Promise.all([
        grouped.entity?.length ? supabase.from("entities").select("id,name,slug").in("id",grouped.entity):Promise.resolve({data:[]}),
        grouped.universe?.length ? supabase.from("universes").select("id,name,slug").in("id",grouped.universe):Promise.resolve({data:[]}),
        grouped.matchup?.length ? supabase.from("matchups").select("id,title,slug").in("id",grouped.matchup):Promise.resolve({data:[]}),
        grouped.evidence?.length ? supabase.from("evidence_records").select("id,summary").in("id",grouped.evidence):Promise.resolve({data:[]}),
        grouped.discussion?.length ? supabase.from("discussions").select("id,title").in("id",grouped.discussion):Promise.resolve({data:[]})
      ]);
      const map={}; for(const [type,result] of [["entity",entities],["universe",universes],["matchup",matchups],["evidence",evidence],["discussion",discussions]]) (result.data||[]).forEach(item=>map[`${type}:${item.id}`]=item);
      setSaved(rows.map(item=>({...item,record:map[`${item.target_type}:${item.target_id}`]})));
    }
    setLoading(false);
  };
  useEffect(()=>{load();},[user?.id]);

  const remove = async item => {
    const {error:removeError}=await supabase.from("saved_items").delete().eq("id",item.id).eq("user_id",user.id);
    if(removeError) {showToast({title:"Could not remove saved item",description:removeError.message});return;}
    setSaved(old=>old.filter(row=>row.id!==item.id)); showToast("Removed from your library.");
  };
  const targetLink = item => {
    if(item.target_type==="entity") return `/characters/${item.record?.slug || ""}`;
    if(item.target_type==="universe") return `/universes/${item.record?.slug || ""}`;
    if(item.target_type==="matchup") return `/matchups/${item.record?.slug || ""}`;
    if(item.target_type==="evidence") return `/evidence/${item.target_id}`;
    if(item.target_type==="discussion") return `/discussions/${item.target_id}`;
    return "/me/library";
  };

  return <div className="atlas-feature-page"><PageIntro eyebrow="PERSONAL SPACE / LIBRARY" title={<>Keep the things worth <em>returning to.</em></>} description="Saved relationships belong to your account. Removing an item here never deletes the public entity, discussion or evidence record." /><DataNotice error={error} />{!user ? <EmptyState title="Sign in to open your library" body="Saved records are private to the signed-in account." action={<Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in</Link>} /> : loading ? <p className="atlas-loading">Loading saved items…</p> : saved.length ? <div className="saved-list">{saved.map(item=><SwipeRow key={item.id} actions={[{id:"remove",label:"Remove",dismiss:true}]} actionColor="#E76F51" drawerColor="#173B46" rowColor="#F7F9F8" textColor="#13242D" height={78} radius={6} direction="left" haptic={false} onCommit={()=>remove(item)} label={item.record?.name || item.record?.title || item.record?.summary || "Saved record"}><Link className="saved-list-row" to={targetLink(item)}><span><small>{item.target_type.toUpperCase()}</small><strong>{item.record?.name || item.record?.title || item.record?.summary || "Record unavailable"}</strong></span><ArrowUpRight size={16}/></Link></SwipeRow>)}</div> : <EmptyState title="Your library is empty" body="Use the save action on an entity, matchup, universe, discussion or evidence record to keep it here." />}</div>;
}

export function ResearchNotebookPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notes,setNotes] = useState([]);
  const [selectedId,setSelectedId] = useState("");
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const selected = notes.find(item=>item.id===selectedId)||null;

  const load = async () => {
    if(!supabase || !user) {setNotes([]);setLoading(false);return;}
    setLoading(true);
    const {data,error:loadError}=await supabase.from("research_notes").select("*").eq("user_id",user.id).order("updated_at",{ascending:false});
    if(loadError) setError(loadError.message);
    else {setNotes(data||[]);if(!selectedId && data?.[0]){setSelectedId(data[0].id);setTitle(data[0].title);setBody(data[0].body||"");}}
    setLoading(false);
  };
  useEffect(()=>{load();},[user?.id]);

  const chooseNote = item => {
    const note=notes.find(row=>row.id===item.value);
    if(note){setSelectedId(note.id);setTitle(note.title);setBody(note.body||"");}
  };
  const createNote = async () => {
    if(!user) return;
    const {data,error:createError}=await supabase.from("research_notes").insert({user_id:user.id,title:"Untitled research note",body:""}).select("*").single();
    if(createError){showToast({title:"Could not create note",description:createError.message});return;}
    setNotes(old=>[data,...old]);setSelectedId(data.id);setTitle(data.title);setBody("");showToast("Private note created.");
  };
  const saveNote = async event => {
    event.preventDefault();
    if(!selected || !user) return;
    const {data,error:saveError}=await supabase.from("research_notes").update({title:title.trim()||"Untitled research note",body,updated_at:new Date().toISOString()}).eq("id",selected.id).eq("user_id",user.id).select("*").single();
    if(saveError) showToast({title:"Could not save note",description:saveError.message});
    else {setNotes(old=>old.map(item=>item.id===data.id?data:item));showToast("Private note saved.");}
  };

  return <div className="atlas-feature-page"><PageIntro eyebrow="PERSONAL SPACE / RESEARCH NOTEBOOK" title={<>Keep the question <em>alive.</em></>} description="The notebook is private account data. It is not a public contribution and is never used as evidence unless you explicitly submit a separate source record." action={<button className="atlas-button atlas-button--dark" type="button" onClick={createNote} disabled={!user}><Plus size={15}/> New note</button>} /><DataNotice error={error} />{!user ? <EmptyState title="Sign in to use your notebook" body="Private research notes are only available to the owner of the account." action={<Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in</Link>} /> : loading ? <p className="atlas-loading">Loading private notes…</p> : <div className="research-notebook-layout"><aside className="research-folder-float"><span className="section-kicker">YOUR NOTES</span><FolderFloat items={notes.map(item=>({label:item.title,value:item.id}))} label="RESEARCH NOTES" sublabel={`${notes.length} private notes`} trigger="click" defaultOpen={false} physics spread={210} lift={22} drift={0.32} folderColor="#173B46" frontColor="#28515B" paperColor="#F7F9F8" itemColor="#E9EFF0" itemTextColor="#13242D" labelColor="#F7F9F8" onSelect={chooseNote} onOpenChange={()=>{}} /></aside><section className="research-note-editor">{selected ? <form onSubmit={saveNote}><span className="section-kicker">PRIVATE NOTE · {selected.id.slice(0,8).toUpperCase()}</span><label>Title<input value={title} onChange={event=>setTitle(event.target.value)} maxLength={120}/></label><label>Notes<textarea value={body} onChange={event=>setBody(event.target.value)} rows={12} placeholder="Write questions, observations and research directions. Keep source URLs beside claims." /></label><div className="research-note-actions"><small>LAST UPDATED · {new Date(selected.updated_at).toLocaleString()}</small><button className="atlas-button atlas-button--dark" type="submit">Save note <Check size={14}/></button></div></form> : <EmptyState title="No note selected" body="Create a note or select one from the floating folder." />}</section></div>}</div>;
}
