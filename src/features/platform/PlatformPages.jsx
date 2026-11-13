import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, CalendarDays, Check,
  Compass, FileSearch, Filter, Globe2, LogIn, MessageSquare, Plus,
  Search, ShieldCheck, Swords, Users, X
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../app/providers/AuthProvider.jsx";
import { useToast } from "../../app/providers/ToastProvider.jsx";

const slugify = value => String(value || "").toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function useRows(table, orderColumn = "created_at", limit = 100) {
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
    }).catch(queryError => {
      if (!active) return;
      setError(queryError?.message || "Unable to load records.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [table, orderColumn, limit, revision]);
  return { rows, loading, error, refresh: () => setRevision(value => value + 1) };
}

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <header className="atlas-page-intro platform-page-intro">
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
    <div className="platform-empty">
      <span className="platform-empty__symbol"><Compass size={19} /></span>
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

function DataNotice({ error }) {
  if (!supabase) return <p className="platform-notice">Connect the Supabase publishable key to load live OMNIVEX records.</p>;
  if (error) return <p className="platform-notice platform-notice--error">Could not load this data: {error}</p>;
  return null;
}

function LoadingLine({ children = "Loading records…" }) {
  return <p className="platform-loading" role="status">{children}</p>;
}

function RecordCard({ record, type = "entity", to }) {
  const title = record.name || record.title || record.summary || "Untitled record";
  const description = record.short_description || record.description || record.body || "";
  const imageAllowed = Boolean(
    record.artwork_url &&
    record.artwork_source_url &&
    record.artwork_approval_status === "approved" &&
    ["public_domain", "cc0", "cc_by", "cc_by_sa", "licensed", "publisher_authorized", "user_owned"]
      .includes(record.artwork_use_basis)
  );
  return (
    <Link className="platform-record-card" to={to}>
      <div className="platform-record-card__art">
        {imageAllowed ? (
          <img src={record.artwork_url} alt={title} loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div className="platform-art-placeholder" aria-label={"Artwork not attached for " + title}>
            <span>{title.slice(0, 2).toUpperCase()}</span>
            <small>VERSION-MATCHED ARTWORK PENDING</small>
          </div>
        )}
        <span className="platform-record-card__type">{type}</span>
      </div>
      <div className="platform-record-card__body">
        <div>
          <strong>{title}</strong>
          {description && <p>{description}</p>}
        </div>
        <span className="platform-record-card__meta">{record.entity_type || record.category || record.status || "INDEXED"} <ArrowUpRight size={15} /></span>
      </div>
    </Link>
  );
}

function TabBar({ tabs, active, pathname }) {
  const location = useLocation();
  const current = new URLSearchParams(location.search);
  return (
    <nav className="platform-tabs" aria-label="Page sections">
      {tabs.map(tab => {
        const params = new URLSearchParams(current);
        params.set("tab", tab.value);
        return (
          <Link
            key={tab.value}
            to={{ pathname: pathname || location.pathname, search: "?" + params.toString() }}
            className={active === tab.value ? "is-active" : ""}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function useActiveTab(fallback) {
  const location = useLocation();
  return new URLSearchParams(location.search).get("tab") || fallback;
}

function MetaPill({ children }) {
  return <span className="platform-meta-pill">{children}</span>;
}

export function ExplorePage() {
  const { rows: entities, loading: entitiesLoading, error: entityError } = useRows("entities", "created_at", 200);
  const { rows: universes, loading: universesLoading, error: universeError } = useRows("universes", "created_at", 120);
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = useActiveTab("all");
  const [search, setSearch] = useState(new URLSearchParams(location.search).get("q") || "");
  const [sort, setSort] = useState("recent");
  const [mediaByEntity, setMediaByEntity] = useState({});
  const [aliasesByEntity, setAliasesByEntity] = useState({});
  useEffect(() => {
    let active = true;
    if (!supabase || !entities.length) {
      setMediaByEntity({});
      setAliasesByEntity({});
      return () => { active = false; };
    }
    (async () => {
      const entityIds = entities.map(item => item.id);
      const { data: aliasRows } = await supabase.from("entity_aliases")
        .select("entity_id,alias").in("entity_id", entityIds);
      if (!active) return;
      const aliasMap = {};
      (aliasRows || []).forEach(item => { (aliasMap[item.entity_id] ||= []).push(item.alias); });
      setAliasesByEntity(aliasMap);
      const { data: versionRows } = await supabase.from("entity_versions")
        .select("id,entity_id").in("entity_id", entityIds).eq("is_primary_version", true);
      const versions = versionRows || [];
      if (!versions.length) { if (active) setMediaByEntity({}); return; }
      const versionToEntity = new Map(versions.map(item => [item.id, item.entity_id]));
      const { data: mediaRows } = await supabase.from("entity_media")
        .select("entity_version_id,asset_url,source_url,usage_basis,approval_status,is_primary,alt_text")
        .in("entity_version_id", versions.map(item => item.id))
        .eq("approval_status", "approved").eq("is_primary", true);
      if (!active) return;
      const mediaMap = {};
      (mediaRows || []).forEach(item => {
        const entityId = versionToEntity.get(item.entity_version_id);
        if (entityId && !mediaMap[entityId]) {
          mediaMap[entityId] = {
            artwork_url: item.asset_url,
            artwork_source_url: item.source_url,
            artwork_use_basis: item.usage_basis,
            artwork_approval_status: item.approval_status,
            artwork_alt_text: item.alt_text
          };
        }
      });
      setMediaByEntity(mediaMap);
    })();
    return () => { active = false; };
  }, [entities]);
  const tabs = [
    { value: "all", label: "Everything" },
    { value: "characters", label: "Characters" },
    { value: "universes", label: "All universes" },
    { value: "comics", label: "Comics" },
    { value: "anime", label: "Anime & manga" },
    { value: "mythology", label: "Mythology" },
    { value: "history", label: "History" },
    { value: "creatures", label: "Creatures" },
    { value: "teams", label: "Teams & groups" }
  ];
  const filteredEntities = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = entities.filter(item => {
      const haystack = [item.name, item.short_description, item.entity_type, ...(aliasesByEntity[item.id] || [])].join(" ").toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (activeTab === "characters") return (item.entity_type || "").toLowerCase().includes("character");
      if (activeTab === "mythology") return (item.entity_type || "").toLowerCase().includes("myth");
      if (activeTab === "history") return (item.entity_type || "").toLowerCase().includes("histor");
      if (activeTab === "creatures") return ["creature", "animal", "monster", "being"].some(term => (item.entity_type || "").toLowerCase().includes(term));
      if (activeTab === "teams") return ["team", "group", "organization", "organisation"].some(term => (item.entity_type || "").toLowerCase().includes(term));
      if (activeTab === "universes") return false;
      return true;
    });
    if (sort === "alphabetical") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else result = [...result].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return result;
  }, [entities, aliasesByEntity, search, activeTab, sort]);
  const filteredUniverses = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = universes.filter(item => {
      const category = String(item.category || "").toLowerCase();
      const matchesCategory = activeTab === "comics" ? category === "comics"
        : activeTab === "anime" ? ["anime_manga", "games_anime"].includes(category)
        : true;
      return matchesCategory && (!q || [item.name, item.description, item.category].join(" ").toLowerCase().includes(q));
    });
    if (sort === "alphabetical") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else result = [...result].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return result;
  }, [universes, search, sort, activeTab]);
  const universeOnlyTabs = ["universes", "comics", "anime"];
  const showEntities = !universeOnlyTabs.includes(activeTab);
  const showUniverses = ["all", ...universeOnlyTabs].includes(activeTab);
  const loading = (showEntities && entitiesLoading) || (showUniverses && universesLoading);
  const submitSearch = event => {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    if (search.trim()) params.set("q", search.trim());
    else params.delete("q");
    navigate({ pathname: "/explore", search: params.toString() ? "?" + params.toString() : "" });
  };

  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro
        eyebrow="EXPLORE / THE UNIVERSAL INDEX"
        title={<>Follow the <em>thread.</em></>}
        description="Search identities, worlds, creatures, teams and historical records in one place. Alternate versions and continuities stay distinct inside each dossier."
        action={<Link className="atlas-button atlas-button--dark" to="/matchups/new"><Swords size={15} /> Create matchup</Link>}
      />
      <form className="platform-search-row" onSubmit={submitSearch}>
        <label className="platform-search-field">
          <Search size={18} />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a character, universe, creature or alias…" />
          {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={16} /></button>}
        </label>
        <label className="platform-sort">
          <Filter size={15} />
          <select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="recent">Recently added</option>
            <option value="alphabetical">A–Z</option>
          </select>
        </label>
        <button className="atlas-button atlas-button--dark" type="submit">Search <ArrowRight size={15} /></button>
      </form>
      <TabBar tabs={tabs} active={activeTab} pathname="/explore" />
      <DataNotice error={entityError || universeError} />
      {loading ? <LoadingLine>Opening the universal index…</LoadingLine> : (
        <>
          {showUniverses && (
            <section className="platform-section">
              <div className="platform-section-heading">
                <div><span className="section-kicker">WORLDS & CONTINUITIES</span><h2>Universes</h2></div>
                <span>{filteredUniverses.length} INDEXED</span>
              </div>
              {filteredUniverses.length ? (
                <div className="platform-card-grid platform-card-grid--universes">
                  {filteredUniverses.map(item => <RecordCard key={item.id} record={item} type="UNIVERSE" to={"/universe/" + item.slug} />)}
                </div>
              ) : <EmptyState title="No universe records match" body="Universes appear here after a source-linked universe record is added." />}
            </section>
          )}
          {showEntities && (
            <section className="platform-section">
              <div className="platform-section-heading">
                <div><span className="section-kicker">IDENTITIES & ENTITIES</span><h2>{activeTab === "all" ? "Entity index" : tabs.find(item => item.value === activeTab)?.label || "Entities"}</h2></div>
                <span>{filteredEntities.length} RECORDS</span>
              </div>
              {filteredEntities.length ? (
                <div className="platform-card-grid">
                  {filteredEntities.map(item => <RecordCard key={item.id} record={{ ...item, ...(mediaByEntity[item.id] || {}) }} type={(item.entity_type || "ENTITY").toUpperCase()} to={String(item.entity_type || "").toLowerCase().includes("character") ? "/character/" + item.slug : "/entity/" + item.slug} />)}
                </div>
              ) : <EmptyState title={entities.length ? "No records match those filters" : "The index is waiting for its first records"} body={entities.length ? "Try another search term or select Everything." : "The catalogue will populate when real entity and version records are added. The preview does not invent character profiles."} />}
            </section>
          )}
        </>
      )}
      <p className="atlas-caption">Artwork is shown only when a record carries a source URL and an approved usage basis. A missing image never gets replaced with a cosplay photograph.</p>
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
  const [capabilities, setCapabilities] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [sources, setSources] = useState([]);
  const [versionMedia, setVersionMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    setLoading(true);
    (async () => {
      const { data, error: queryError } = await supabase.from("entities").select("*").eq("slug", entitySlug).maybeSingle();
      if (!active) return;
      if (queryError) { setError(queryError.message); setLoading(false); return; }
      setEntity(data);
      if (!data) { setLoading(false); return; }
      const { data: versionRows, error: versionError } = await supabase.from("entity_versions").select("*").eq("entity_id", data.id).order("created_at", { ascending: true });
      if (!active) return;
      if (versionError) setError(versionError.message);
      const selected = (versionRows || []).find(item => item.slug === versionSlug) || (versionRows || []).find(item => item.is_primary_version) || (versionRows || [])[0] || null;
      setVersions(versionRows || []);
      setActiveVersion(selected);
      setLoading(false);
    })().catch(queryError => { if (active) { setError(queryError.message || "Unable to load dossier."); setLoading(false); } });
    return () => { active = false; };
  }, [entitySlug, versionSlug]);
  useEffect(() => {
    let active = true;
    if (!supabase || !activeVersion) { setCapabilities([]); setEvidence([]); setSources([]); setVersionMedia(null); return () => { active = false; }; }
    (async () => {
      const [capResult, evidenceResult, mediaResult] = await Promise.all([
        supabase.from("capabilities").select("*").eq("entity_version_id", activeVersion.id).order("capability_name"),
        supabase.from("evidence_records").select("*").eq("entity_version_id", activeVersion.id).order("created_at", { ascending: false }).limit(40),
        supabase.from("entity_media").select("asset_url,source_url,usage_basis,approval_status,alt_text,source_title,attribution_text")
          .eq("entity_version_id", activeVersion.id).eq("approval_status", "approved").eq("is_primary", true).maybeSingle()
      ]);
      if (!active) return;
      setCapabilities(capResult.data || []);
      setEvidence(evidenceResult.data || []);
      setVersionMedia(mediaResult.data || null);
      if (capResult.error || evidenceResult.error) setError(capResult.error?.message || evidenceResult.error?.message || "");
      const ids = [...new Set((evidenceResult.data || []).map(item => item.source_record_id).filter(Boolean))];
      if (ids.length) {
        const { data } = await supabase.from("source_records").select("*").in("id", ids);
        if (active) setSources(data || []);
      } else setSources([]);
    })();
    return () => { active = false; };
  }, [activeVersion]);
  const save = async () => {
    if (!user) { navigate("/auth/sign-in"); return; }
    const { error: saveError } = await supabase.from("saved_items").insert({ user_id: user.id, target_type: "entity", target_id: entity.id });
    if (saveError?.code === "23505") showToast("Already in your library.");
    else if (saveError) showToast({ title: "Could not save entity", description: saveError.message });
    else showToast("Saved to your library.");
  };
  const allowedMediaBases = ["public_domain", "cc0", "cc_by", "cc_by_sa", "licensed", "publisher_authorized", "user_owned"];
  const artworkAllowed = Boolean(
    versionMedia?.asset_url &&
    versionMedia?.source_url &&
    versionMedia?.approval_status === "approved" &&
    allowedMediaBases.includes(versionMedia?.usage_basis)
  );
  if (loading) return <div className="atlas-feature-page"><LoadingLine>Opening entity dossier…</LoadingLine></div>;
  if (!entity) return <div className="atlas-feature-page"><EmptyState title="Entity record not found" body={supabase ? "This slug does not resolve to a public entity record." : "Add the Supabase publishable key to load the catalogue."} action={<Link className="atlas-button atlas-button--dark" to="/explore">Back to Explore</Link>} /></div>;

  return (
    <div className="atlas-feature-page platform-page">
      <div className="platform-detail-heading">
        <div>
          <span className="section-kicker">ENTITY DOSSIER / {String(entity.entity_type || "RECORD").toUpperCase()}</span>
          <h1>{entity.name}</h1>
          <p>{entity.short_description || "No description has been submitted for this identity yet."}</p>
          <div className="platform-meta-row"><MetaPill>{entity.status}</MetaPill><MetaPill>{versions.length} VERSION RECORDS</MetaPill><MetaPill>ID {entity.id.slice(0, 8).toUpperCase()}</MetaPill></div>
        </div>
        <div className="platform-detail-art">
          {artworkAllowed ? <img src={versionMedia.asset_url} alt={versionMedia.alt_text || (entity.name + " version artwork")} /> : <div className="platform-art-placeholder platform-art-placeholder--large"><span>{entity.name.slice(0, 2).toUpperCase()}</span><small>VERSION-MATCHED ARTWORK PENDING</small></div>}
        </div>
      </div>
      <DataNotice error={error} />
      <div className="platform-detail-actions">
        <button className="atlas-button atlas-button--dark" type="button" onClick={save}><Bookmark size={15} /> Save to library</button>
        <button className="atlas-button atlas-button--outline" type="button" onClick={() => { navigator.clipboard?.writeText(window.location.href).then(() => showToast("Dossier link copied.")).catch(() => showToast("Clipboard unavailable.")); }}><ArrowUpRight size={15} /> Copy link</button>
        <Link className="atlas-text-link" to="/matchups/new"><Swords size={15} /> Use in matchup</Link>
      </div>
      <section className="platform-section">
        <div className="platform-section-heading"><div><span className="section-kicker">INCARNATIONS & CONTINUITY</span><h2>Select a version</h2></div><span>EXACT VERSION REQUIRED FOR ANALYSIS</span></div>
        {versions.length ? (
          <div className="platform-version-grid">
            {versions.map(version => (
              <button key={version.id} type="button" className={"platform-version-choice " + (activeVersion?.id === version.id ? "is-selected" : "")} onClick={() => { setActiveVersion(version); navigate("/entity/" + entity.slug + "/versions/" + version.slug, { replace: true }); }}>
                <span>{version.canon_status || "CANON STATUS UNKNOWN"}</span><strong>{version.label}</strong><small>{version.continuity || "Continuity not specified"} · {version.status}</small>
              </button>
            ))}
          </div>
        ) : <EmptyState title="No version records yet" body="Create a version record before submitting capabilities, feats or matchup configurations. Entity identity does not imply a composite version." />}
      </section>
      {activeVersion && (
        <>
          <section className="platform-section">
            <div className="platform-section-heading"><div><span className="section-kicker">CAPABILITY RECORDS</span><h2>{activeVersion.label}</h2></div><span>{capabilities.length} CLAIMS</span></div>
            {capabilities.length ? <div className="platform-info-grid">{capabilities.map(item => <article key={item.id} className="platform-info-card"><span>{item.dimension || "CAPABILITY"}</span><h3>{item.capability_name}</h3><p>{item.mechanism || "Mechanism not documented."}</p><small>LIMITATIONS · {item.limitations || "Not recorded"} · STATUS {item.status}</small></article>)}</div> : <EmptyState title="No capability claims" body="Capabilities will appear when claims are submitted and linked to this exact version." />}
          </section>
          <section className="platform-section">
            <div className="platform-section-heading"><div><span className="section-kicker">FEATS & EVIDENCE</span><h2>Trace every claim</h2></div><span>{evidence.length} RECORDS</span></div>
            {evidence.length ? <div className="platform-list">{evidence.map(item => <Link className="platform-list-row" key={item.id} to={"/research/evidence/" + item.id}><span><strong>{item.summary}</strong><small>{item.evidence_type} · {item.canon_status} · {item.review_status} · {item.reliability_grade || "UNRATED"}</small><p>{item.context || "No context submitted."}</p></span><ArrowUpRight size={16} /></Link>)}</div> : <EmptyState title="No evidence linked to this version" body="Unverified or absent claims are not filled with generated feats or unsupported statistics." />}
          </section>
          <section className="platform-section">
            <div className="platform-section-heading"><div><span className="section-kicker">SOURCE REFERENCES</span><h2>Original material</h2></div><span>{sources.length} SOURCES</span></div>
            {sources.length ? <div className="platform-list">{sources.map(item => <a className="platform-list-row" key={item.id} href={item.url || "#"} target="_blank" rel="noreferrer"><span><strong>{item.title}</strong><small>{item.publisher_or_host || item.source_type} · {item.reliability_grade || "NOT GRADED"} · {item.review_status}</small><p>{item.locator || "No issue, chapter, episode or page locator recorded."}</p></span><ArrowUpRight size={16} /></a>)}</div> : <EmptyState title="No source references yet" body="Sources will appear when they are linked to evidence for the selected version." />}
          </section>
        </>
      )}
      <p className="atlas-caption">An identity record is not a feat record. Evidence, source reliability, interpretation quality and continuity are kept separate.</p>
    </div>
  );
}

export function UniverseHubPage() {
  const { universeSlug } = useParams();
  const [universe, setUniverse] = useState(null);
  const [entities, setEntities] = useState([]);
  const [sourceWorks, setSourceWorks] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    (async () => {
      const { data, error: queryError } = await supabase.from("universes").select("*").eq("slug", universeSlug).maybeSingle();
      if (!active) return;
      if (queryError) { setError(queryError.message); return; }
      setUniverse(data);
      if (data) {
        const [entityResult, workResult] = await Promise.all([
          supabase.from("entities").select("*").eq("primary_universe_id", data.id).order("name").limit(120),
          supabase.from("source_works").select("*").eq("universe_id", data.id).order("title")
        ]);
        if (!active) return;
        if (entityResult.error || workResult.error) setError(entityResult.error?.message || workResult.error?.message || "");
        setEntities(entityResult.data || []);
        setSourceWorks(workResult.data || []);
      }
    })();
    return () => { active = false; };
  }, [universeSlug]);
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="UNIVERSE HUB / CONTINUITY INDEX" title={universe?.name || universeSlug.replace(/-/g, " ")} description={universe?.description || "Explore source works, continuities, entities and relationships connected to this universe."} action={<Link className="atlas-text-link" to="/explore?tab=universes"><ArrowLeft size={15} /> All universes</Link>} />
      <DataNotice error={error} />
      {universe ? (
        <>
          <div className="platform-meta-row"><MetaPill>{universe.category}</MetaPill><MetaPill>{universe.status}</MetaPill><MetaPill>{entities.length} LINKED ENTITIES</MetaPill></div>
          <section className="platform-section"><div className="platform-section-heading"><div><span className="section-kicker">INDEXED IDENTITIES</span><h2>People, teams & beings</h2></div></div>{entities.length ? <div className="platform-card-grid">{entities.map(item => <RecordCard key={item.id} record={item} type={(item.entity_type || "ENTITY").toUpperCase()} to={String(item.entity_type || "").toLowerCase().includes("character") ? "/character/" + item.slug : "/entity/" + item.slug} />)}</div> : <EmptyState title="No entities linked yet" body="Entity records appear here after their primary universe relationship is recorded." />}</section>
          <section className="platform-section">
            <div className="platform-section-heading"><div><span className="section-kicker">SOURCE WORKS & CATALOGUES</span><h2>Start with the originals.</h2></div><span>{sourceWorks.length} REFERENCES</span></div>
            {sourceWorks.length ? <div className="platform-list">{sourceWorks.map(work => <article className="platform-list-row platform-list-row--static" key={work.id}><span><strong>{work.title}</strong><small>{work.publisher || work.medium || "SOURCE REFERENCE"} · {work.canon_label || "UNCLASSIFIED"}</small><p>{work.notes || "A starting point for source discovery. This is not a verified feat record."}</p></span>{work.source_url && <a href={work.source_url} target="_blank" rel="noreferrer" aria-label={"Open " + work.title}><ArrowUpRight size={16}/></a>}</article>)}</div> : <EmptyState title="No source works linked" body="Original publications and official reference catalogues will appear here as they are connected to this universe."/>}
          </section>
        </>
      ) : !error ? <EmptyState title="Universe not found" body="This route does not resolve to a published universe record." /> : null}
    </div>
  );
}

export function MatchupsPage() {
  const { rows, loading, error } = useRows("matchups", "created_at", 160);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = rows.filter(item => {
    const matchesText = [item.title, item.description, item.status].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesText && (status === "all" || item.status === status);
  });
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="MATCHUPS / COMPARISON INDEX" title={<>A question, with <em>conditions.</em></>} description="Browse configurations and published reports. A matchup setup is not a verdict; an analysis appears only when a report has been stored and reviewed." action={<Link className="atlas-button atlas-button--dark" to="/matchups/new"><Plus size={15} /> Create matchup</Link>} />
      <div className="platform-filter-row"><label className="platform-search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search matchup titles…" /></label><label className="platform-sort"><Filter size={15} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="under_review">Under review</option><option value="archived">Archived</option></select></label><span className="platform-result-count">{filtered.length} MATCHUPS</span></div>
      <DataNotice error={error} />
      {loading ? <LoadingLine>Loading matchup index…</LoadingLine> : filtered.length ? <div className="platform-list">{filtered.map(item => <Link className="platform-list-row" key={item.id} to={"/matchups/" + item.slug}><span><strong>{item.title}</strong><small>{item.status} · CREATED {new Date(item.created_at).toLocaleDateString()}</small><p>{item.description || "No additional conditions supplied."}</p></span><ArrowUpRight size={17} /></Link>)}</div> : <EmptyState title="No matchups found" body={rows.length ? "Adjust your search or status filter." : "The matchup index will fill as users create version-specific comparisons."} />}
    </div>
  );
}

export function MatchupCreatePage() {
  const { rows: entities, loading: entitiesLoading } = useRows("entities", "name", 300);
  const { rows: versions, loading: versionsLoading, error } = useRows("entity_versions", "created_at", 500);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [ruleset, setRuleset] = useState("standard");
  const [environment, setEnvironment] = useState("Neutral environment");
  const [distance, setDistance] = useState("Standard starting distance");
  const [victory, setVictory] = useState("Incapacitation");
  const [preparation, setPreparation] = useState("No preparation");
  const [knowledge, setKnowledge] = useState("No prior knowledge");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const entityMap = useMemo(() => new Map(entities.map(item => [item.id, item])), [entities]);
  const options = versions.map(version => ({ ...version, entity: entityMap.get(version.entity_id) })).filter(item => item.entity);
  const first = options.find(item => item.id === sideA);
  const second = options.find(item => item.id === sideB);
  const save = async event => {
    event.preventDefault();
    if (!supabase) { showToast("Connect Supabase before creating a matchup."); return; }
    if (!user) { navigate("/auth/sign-in", { state: { from: { pathname: "/matchups/new" } } }); return; }
    if (!first || !second || sideA === sideB) { showToast("Choose two different version records."); return; }
    setSaving(true);
    const title = first.entity.name + " vs " + second.entity.name;
    const configuration = {
      ruleset, participants: [{ entity_version_id: sideA, side: "side_a" }, { entity_version_id: sideB, side: "side_b" }],
      environment, starting_distance: distance, victory_condition: victory, preparation, prior_knowledge: knowledge,
      notes: notes.trim(), verdict: null
    };
    const { data: matchupId, error: matchupError } = await supabase.rpc("create_matchup", {
      matchup_title: title,
      matchup_configuration: configuration,
      participant_version_ids: [sideA, sideB]
    });
    if (matchupError) { showToast({ title: "Matchup could not be saved", description: matchupError.message }); setSaving(false); return; }
    const { data: matchup, error: lookupError } = await supabase.from("matchups").select("id,slug").eq("id", matchupId).single();
    if (lookupError || !matchup) { showToast({ title: "Matchup was created but could not be opened", description: lookupError?.message || "The saved record could not be found." }); setSaving(false); return; }
    showToast("Matchup configuration published. No verdict has been generated.");
    navigate("/matchups/" + matchup.slug);
    setSaving(false);
  };
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="MATCHUPS / CREATE" title={<>Set the <em>ground rules.</em></>} description="Choose exact incarnations and make every assumption visible before a matchup is analysed." action={<Link className="atlas-text-link" to="/matchups"><ArrowLeft size={15} /> All matchups</Link>} />
      <DataNotice error={error} />
      {entitiesLoading || versionsLoading ? <LoadingLine>Loading version catalogue…</LoadingLine> : !options.length ? <EmptyState title="Version records are needed first" body="There are no version-specific records available yet. Add entities and their exact incarnations before creating a comparison." action={<Link className="atlas-button atlas-button--dark" to="/explore">Open Explore</Link>} /> : (
        <form className="platform-form" onSubmit={save}>
          <section className="platform-form-section"><span className="section-kicker">01 / PARTICIPANTS</span><h2>Who is being compared?</h2><div className="platform-form-grid"><label>Side A<select required value={sideA} onChange={event => setSideA(event.target.value)}><option value="">Choose an exact version</option>{options.map(item => <option key={item.id} value={item.id}>{item.entity.name} — {item.label}</option>)}</select></label><label>Side B<select required value={sideB} onChange={event => setSideB(event.target.value)}><option value="">Choose a different version</option>{options.filter(item => item.id !== sideA).map(item => <option key={item.id} value={item.id}>{item.entity.name} — {item.label}</option>)}</select></label></div>{first && second && <div className="platform-versus-preview"><span>{first.entity.name}<small>{first.label}</small></span><b>VS</b><span>{second.entity.name}<small>{second.label}</small></span></div>}</section>
          <section className="platform-form-section"><span className="section-kicker">02 / RULESET</span><h2>Define the scope</h2><div className="platform-form-grid"><label>Analysis ruleset<select value={ruleset} onChange={event => setRuleset(event.target.value)}><option value="standard">Standard matchup</option><option value="canon_only">Canon-only evidence</option><option value="composite_opt_in">Composite (explicit opt-in)</option><option value="custom">Custom conditions</option></select></label><label>Starting environment<input value={environment} onChange={event => setEnvironment(event.target.value)} /></label><label>Starting distance<input value={distance} onChange={event => setDistance(event.target.value)} /></label><label>Victory condition<select value={victory} onChange={event => setVictory(event.target.value)}><option>Incapacitation</option><option>Submission</option><option>Objective completion</option><option>Other / custom</option></select></label><label>Preparation<select value={preparation} onChange={event => setPreparation(event.target.value)}><option>No preparation</option><option>One day</option><option>One week</option><option>Standard equipment only</option></select></label><label>Prior knowledge<select value={knowledge} onChange={event => setKnowledge(event.target.value)}><option>No prior knowledge</option><option>Basic awareness</option><option>Full information</option><option>Custom</option></select></label></div><label>Additional conditions<textarea value={notes} onChange={event => setNotes(event.target.value)} rows={4} maxLength={3000} placeholder="Equipment limits, resources, restrictions, win conditions, source continuity or other assumptions." /></label><p className="platform-form-note">Publishing creates a matchup configuration only. It does not create a battle analysis or assign a winner.</p><div className="platform-form-actions"><button className="atlas-button atlas-button--dark" type="submit" disabled={saving}>{saving ? "Publishing…" : "Publish matchup setup"} <ArrowUpRight size={15} /></button><span>Sign-in required · Version-specific participants</span></div></section>
        </form>
      )}
    </div>
  );
}

export function MatchupDetailPage() {
  const { matchupSlug } = useParams();
  const activeTab = useActiveTab("overview");
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisActionError, setAnalysisActionError] = useState("");
  const [matchup, setMatchup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [report, setReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    (async () => {
      const { data, error: matchupError } = await supabase.from("matchups").select("*").eq("slug", matchupSlug).maybeSingle();
      if (!active) return;
      if (matchupError) { setError(matchupError.message); setLoading(false); return; }
      setMatchup(data);
      if (!data) { setLoading(false); return; }
      const [participantResult, reportResult, discussionResult] = await Promise.all([
        supabase.from("matchup_participants").select("*").eq("matchup_id", data.id).order("participant_order"),
        supabase.from("matchup_reports").select("*").eq("matchup_id", data.id).order("report_version", { ascending: false }).limit(30),
        supabase.from("discussions").select("*").eq("matchup_id", data.id).order("created_at", { ascending: false })
      ]);
      if (!active) return;
      const versions = participantResult.data || [];
      const versionIds = versions.map(item => item.entity_version_id);
      const { data: versionRows } = versionIds.length ? await supabase.from("entity_versions").select("*").in("id", versionIds) : { data: [] };
      const entityIds = [...new Set((versionRows || []).map(item => item.entity_id))];
      const { data: entityRows } = entityIds.length ? await supabase.from("entities").select("*").in("id", entityIds) : { data: [] };
      const byEntity = new Map((entityRows || []).map(item => [item.id, item]));
      const byVersion = new Map((versionRows || []).map(item => [item.id, { ...item, entity: byEntity.get(item.entity_id) }]));
      setParticipants(versions.map(item => ({ ...item, version: byVersion.get(item.entity_version_id) })));
      const history = reportResult.data || [];
      setReportHistory(history);
      setReport(history[0] || null);
      setDiscussions(discussionResult.data || []);
      if (history[0]) {
        const { data: links } = await supabase.from("matchup_report_evidence")
          .select("evidence_record_id,relevance_note").eq("report_id", history[0].id);
        const ids = (links || []).map(item => item.evidence_record_id);
        if (ids.length) {
          const { data: evidenceRows } = await supabase.from("evidence_records").select("*").in("id", ids);
          const byId = new Map((evidenceRows || []).map(item => [item.id, item]));
          setEvidence((links || []).map(item => ({ ...byId.get(item.evidence_record_id), relevance_note: item.relevance_note })).filter(item => item.id));
        } else setEvidence([]);
      } else setEvidence([]);
      if (participantResult.error || reportResult.error || discussionResult.error) {
        setError(participantResult.error?.message || reportResult.error?.message || discussionResult.error?.message || "");
      }
      setLoading(false);
    })().catch(queryError => { if (active) { setError(queryError.message || "Unable to load matchup."); setLoading(false); } });
    return () => { active = false; };
  }, [matchupSlug]);
  const runBattleEngine = async () => {
    if (!user) { navigate("/auth/sign-in"); return; }
    setRunningAnalysis(true);
    setAnalysisActionError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
        body: { action: "analyze_matchup", matchupId: matchup.id }
      });
      if (invokeError) throw new Error(invokeError.message || "The Battle Engine request failed.");
      if (data?.error) throw new Error(data.error);
      const { data: latestReports, error: reportError } = await supabase.from("matchup_reports")
        .select("*").eq("matchup_id", matchup.id).order("report_version", { ascending: false }).limit(30);
      if (reportError) throw new Error(reportError.message || "The report was created but could not be reloaded.");
      const history = latestReports || [];
      setReportHistory(history);
      setReport(history[0] || data.report || null);
      const latest = history[0] || data.report;
      if (latest?.id) {
        const { data: links, error: linksError } = await supabase.from("matchup_report_evidence")
          .select("evidence_record_id,relevance_note").eq("report_id", latest.id);
        if (linksError) throw new Error(linksError.message || "Could not load report citations.");
        const evidenceIds = (links || []).map(item => item.evidence_record_id);
        if (evidenceIds.length) {
          const { data: evidenceRows, error: evidenceLoadError } = await supabase.from("evidence_records").select("*").in("id", evidenceIds);
          if (evidenceLoadError) throw new Error(evidenceLoadError.message || "Could not load report evidence.");
          const byId = new Map((evidenceRows || []).map(item => [item.id, item]));
          setEvidence((links || []).map(item => ({ ...byId.get(item.evidence_record_id), relevance_note: item.relevance_note })).filter(item => item.id));
        } else setEvidence([]);
      }
      showToast(data.status === "stored_unverified_report" ? "Battle Engine report saved for review." : "Battle Engine finished.");
    } catch (runError) {
      setAnalysisActionError(runError?.message || "The Battle Engine could not complete this analysis.");
    } finally {
      setRunningAnalysis(false);
    }
  };

  if (loading) return <div className="atlas-feature-page"><LoadingLine>Loading matchup record…</LoadingLine></div>;
  if (!matchup) return <div className="atlas-feature-page"><EmptyState title="Matchup not found" body={error || "This route does not resolve to a matchup record."} action={<Link className="atlas-button atlas-button--dark" to="/matchups">Matchup index</Link>} /></div>;
  const sideA = participants.filter(item => item.side === "side_a" || item.side === "A");
  const sideB = participants.filter(item => item.side === "side_b" || item.side === "B");
  const config = matchup.configuration || {};
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "analysis", label: "Analysis" },
    { value: "evidence", label: "Evidence" },
    { value: "debate", label: "Debate" },
    { value: "history", label: "History" }
  ];
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="MATCHUP / REPRODUCIBLE CONFIGURATION" title={matchup.title} description={matchup.description || "This matchup record preserves the participants, rules and assumptions used for the comparison."} action={<Link className="atlas-text-link" to="/matchups"><ArrowLeft size={15} /> All matchups</Link>} />
      <DataNotice error={error} />
      <div className="platform-versus-panel"><div><span>SIDE A</span><h2>{sideA.map(item => item.version?.entity?.name || "Unknown entity").join(" + ") || "Participant missing"}</h2><small>{sideA.map(item => item.version?.label).filter(Boolean).join(" · ")}</small></div><b>VS</b><div><span>SIDE B</span><h2>{sideB.map(item => item.version?.entity?.name || "Unknown entity").join(" + ") || "Participant missing"}</h2><small>{sideB.map(item => item.version?.label).filter(Boolean).join(" · ")}</small></div></div>
      <div className="platform-matchup-meta"><MetaPill>{matchup.status}</MetaPill><MetaPill>{config.ruleset || "RULESET NOT SPECIFIED"}</MetaPill><MetaPill>{report ? "REPORT AVAILABLE" : "CONFIGURATION ONLY"}</MetaPill></div>
      <TabBar tabs={tabs} active={activeTab} pathname={"/matchups/" + matchup.slug} />
      {activeTab === "overview" && (
        <section className="platform-section platform-matchup-tab">
          <div className="platform-section-heading"><div><span className="section-kicker">COMPARISON CONFIGURATION</span><h2>What was assumed?</h2></div></div>
          <div className="platform-config-grid">{[["Ruleset", config.ruleset], ["Environment", config.environment], ["Starting distance", config.starting_distance], ["Victory condition", config.victory_condition], ["Preparation", config.preparation], ["Prior knowledge", config.prior_knowledge]].map(([label,value]) => <div key={label}><small>{label}</small><strong>{value || "Not specified"}</strong></div>)}</div>
          {config.notes && <p className="platform-config-notes">{config.notes}</p>}
          <p className="platform-form-note">A matchup configuration records the assumptions. It is not itself a canon result or prediction.</p>
        </section>
      )}
      {activeTab === "analysis" && (
        <section className="platform-section platform-matchup-tab">
          <div className="platform-section-heading">
            <div><span className="section-kicker">BATTLE ENGINE / REPORT</span><h2>Analysis & verdict</h2></div>
            <button className="atlas-button atlas-button--dark" type="button" onClick={runBattleEngine} disabled={runningAnalysis}>
              {runningAnalysis ? "Analyzing…" : report ? "Run new analysis" : "Run Battle Engine"} <ArrowRight size={14}/>
            </button>
          </div>
          <p className="platform-form-note">The engine uses only moderator-verified, version-matched evidence. If either side lacks verified source-backed evidence, the correct result is inconclusive. Every generated report remains unverified until a moderator reviews it.</p>
          {analysisActionError && <p className="platform-notice platform-notice--error">{analysisActionError}</p>}
          {report ? (
            <>
              <div className="platform-report-card">
                <MetaPill>{String(report.verdict_type || "inconclusive").replace(/_/g, " ")}</MetaPill>
                <h3>{report.verdict_summary || "Report created without a summary."}</h3>
                <p>{report.uncertainty_notes || "No uncertainty notes recorded."}</p>
                <small>REPORT VERSION {report.report_version} · VERIFICATION {report.verification_status} · {report.created_at ? new Date(report.created_at).toLocaleString() : "DATE NOT RECORDED"}</small>
              </div>
              {report.report_body?.evidence_quality && (
                <div className="platform-config-grid">
                  {[
                    ["Verified evidence", report.report_body.evidence_quality.verified_evidence_total],
                    ["Side A evidence", report.report_body.evidence_quality.verified_evidence_side_a],
                    ["Side B evidence", report.report_body.evidence_quality.verified_evidence_side_b],
                    ["Verified capabilities", report.report_body.evidence_quality.verified_capability_records],
                    ["Sources inspected", report.report_body.evidence_quality.sources_available]
                  ].map(([label,value]) => <div key={label}><small>{label}</small><strong>{value ?? 0}</strong></div>)}
                </div>
              )}
              {report.report_body?.analysis?.side_a_assessment && <section className="platform-section"><span className="section-kicker">SIDE A</span><p>{report.report_body.analysis.side_a_assessment}</p></section>}
              {report.report_body?.analysis?.side_b_assessment && <section className="platform-section"><span className="section-kicker">SIDE B</span><p>{report.report_body.analysis.side_b_assessment}</p></section>}
              {Array.isArray(report.report_body?.analysis?.capability_comparison) && report.report_body.analysis.capability_comparison.length > 0 && (
                <section className="platform-section">
                  <div className="platform-section-heading"><div><span className="section-kicker">CAPABILITY COMPARISON</span><h2>What the evidence supports</h2></div></div>
                  <div className="platform-info-grid">{report.report_body.analysis.capability_comparison.map((item,index)=><article className="platform-info-card" key={index}><span>{item.dimension || "DIMENSION"}</span><h3>Side A</h3><p>{item.side_a || "Not established."}</p><h3>Side B</h3><p>{item.side_b || "Not established."}</p><small>{item.limits || "No additional limitation recorded."}</small></article>)}</div>
                </section>
              )}
              {Array.isArray(report.report_body?.analysis?.ability_interactions) && report.report_body.analysis.ability_interactions.length > 0 && (
                <section className="platform-section">
                  <div className="platform-section-heading"><div><span className="section-kicker">INTERACTIONS</span><h2>Evidence-aware interactions</h2></div></div>
                  <div className="platform-list">{report.report_body.analysis.ability_interactions.map((item,index)=><article className="platform-list-row platform-list-row--static" key={index}><span><strong>{item.interaction || "Interaction"}</strong><p>{item.reasoning || "No supported explanation recorded."}</p><small>CONFIDENCE · {item.confidence || "UNSPECIFIED"}</small></span></article>)}</div>
                </section>
              )}
              {["decisive_factors","conditions_that_change_outcome","unresolved_conflicts"].map((key)=>Array.isArray(report.report_body?.analysis?.[key]) && report.report_body.analysis[key].length > 0 ? (
                <section className="platform-section" key={key}>
                  <div className="platform-section-heading"><div><span className="section-kicker">{key.replace(/_/g," ").toUpperCase()}</span><h2>{key === "decisive_factors" ? "Relevant factors" : key === "conditions_that_change_outcome" ? "What could change the outcome" : "Unresolved conflicts"}</h2></div></div>
                  <ul className="platform-report-points">{report.report_body.analysis[key].map((item,index)=><li key={index}>{item}</li>)}</ul>
                </section>
              ) : null)}
              <p className="platform-form-note">Report integrity: {report.report_body?.analysis_completeness?.status || "pending"}. Unsupported claims used: {report.report_body?.analysis_completeness?.unsupported_claims_used ?? "not reported"}. This report is a reproducible research snapshot, not a canon-confirmed outcome.</p>
            </>
          ) : <EmptyState title="No analysis report exists yet" body="Run the Battle Engine to generate a report. Without verified evidence on both sides, it will store an explicit inconclusive result instead of inventing a winner." />}
        </section>
      )}
      {activeTab === "evidence" && (
        <section className="platform-section platform-matchup-tab">
          <div className="platform-section-heading"><div><span className="section-kicker">REPORT EVIDENCE</span><h2>Sources behind this analysis</h2></div><span>{evidence.length} LINKED RECORDS</span></div>
          {evidence.length ? <div className="platform-list">{evidence.map(item => <Link className="platform-list-row" key={item.id} to={"/research/evidence/" + item.id}><span><strong>{item.summary}</strong><small>{item.evidence_type} · {item.review_status} · {item.reliability_grade || "UNRATED"}</small><p>{item.relevance_note || item.context || "No relevance note recorded."}</p></span><ArrowUpRight size={16}/></Link>)}</div> : <EmptyState title="No report evidence is linked" body="Evidence appears here only when a stored report explicitly links its supporting records. Browse the full research index separately." action={<Link className="atlas-text-link" to="/research">Open Research <ArrowUpRight size={14}/></Link>} />}
        </section>
      )}
      {activeTab === "debate" && (
        <section className="platform-section platform-matchup-tab">
          <div className="platform-section-heading"><div><span className="section-kicker">COMMUNITY / MATCHUP DEBATE</span><h2>Arguments around this question</h2></div><span>{discussions.length} THREADS</span></div>
          {discussions.length ? <div className="platform-discussion-list">{discussions.map(item => <article className="platform-discussion-card" key={item.id}><MetaPill>{item.status}</MetaPill><h2>{item.title}</h2><p>{item.body}</p><Link className="atlas-text-link" to={"/discussions/" + item.id}>Open thread <ArrowUpRight size={14}/></Link></article>)}</div> : <EmptyState title="No matchup debate yet" body="Threads linked to this matchup will appear here. General community discussions remain in the Community feed." action={<Link className="atlas-text-link" to="/community">Open Community <ArrowUpRight size={14}/></Link>} />}
        </section>
      )}
      {activeTab === "history" && (
        <section className="platform-section platform-matchup-tab">
          <div className="platform-section-heading"><div><span className="section-kicker">VERDICT HISTORY</span><h2>Every stored report revision</h2></div><span>{reportHistory.length} REPORT VERSIONS</span></div>
          {reportHistory.length ? <div className="platform-list">{reportHistory.map(item => <article className="platform-list-row platform-list-row--static" key={item.id}><span><strong>Report v{item.report_version} · {item.verdict_type.replace(/_/g, " ")}</strong><small>{new Date(item.created_at).toLocaleString()} · {item.verification_status}</small><p>{item.verdict_summary || "No report summary stored."} {item.uncertainty_notes || ""}</p></span></article>)}</div> : <EmptyState title="No verdict history" body="There are no stored analysis snapshots for this matchup yet." />}
        </section>
      )}
      <div className="platform-inline-actions"><Link className="atlas-button atlas-button--dark" to={"/community?tab=debates&matchup=" + matchup.id}><MessageSquare size={15} /> Open Community</Link><Link className="atlas-text-link" to="/research">Open Research <ArrowUpRight size={15} /></Link></div>
    </div>
  );
}

export function ResearchPage() {
  const { rows: evidence, loading: evidenceLoading, error: evidenceError, refresh: refreshEvidence } = useRows("evidence_records", "created_at", 240);
  const { rows: sources, loading: sourcesLoading, error: sourcesError, refresh: refreshSources } = useRows("source_records", "created_at", 200);
  const { rows: relations, loading: relationsLoading, error: relationsError, refresh: refreshRelations } = useRows("evidence_relations", "created_at", 240);
  const { rows: capabilities, loading: capabilitiesLoading, error: capabilitiesError, refresh: refreshCapabilities } = useRows("capabilities", "created_at", 240);
  const [relationEvidence, setRelationEvidence] = useState({});
  const [moderatingKey, setModeratingKey] = useState("");
  const activeTab = useActiveTab("discover");
  const { user } = useAuth();
  const { showToast } = useToast();
  const isModerator = ["moderator", "admin"].includes(user?.app_metadata?.omnivex_role);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [review, setReview] = useState("all");
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [discovery, setDiscovery] = useState(null);
  const [researchError, setResearchError] = useState("");
  const [savingKey, setSavingKey] = useState("");
  const [importingKey, setImportingKey] = useState("");
  const [savedKeys, setSavedKeys] = useState({});
  const [importedKeys, setImportedKeys] = useState({});
  const filteredEvidence = evidence.filter(item => [item.summary, item.context, item.evidence_type, item.review_status].join(" ").toLowerCase().includes(query.toLowerCase()) && (review === "all" || item.review_status === review));
  const filteredSources = sources.filter(item => [item.title, item.publisher_or_host, item.locator, item.source_type].join(" ").toLowerCase().includes(query.toLowerCase()));
  const filteredRelations = relations.filter(item => [item.relation_type, item.review_status, item.note].join(" ").toLowerCase().includes(query.toLowerCase()) && (review === "all" || item.review_status === review));
  const queueItems = [
    ...evidence.filter(item => ["submitted", "needs_review", "disputed"].includes(item.review_status)).map(item => ({ id:item.id, kind:"evidence", status:item.review_status, title:item.summary, detail:item.context, date:item.created_at })),
    ...capabilities.filter(item => ["submitted", "needs_review", "disputed"].includes(item.status)).map(item => ({ id:item.id, kind:"capability", status:item.status, title:item.capability_name, detail:item.mechanism || item.dimension, date:item.created_at })),
    ...relations.filter(item => ["submitted", "needs_review", "disputed"].includes(item.review_status)).map(item => ({ id:item.id, kind:"relation", status:item.review_status, title:(relationEvidence[item.from_evidence_id] || "Evidence") + " ↔ " + (relationEvidence[item.to_evidence_id] || "Related evidence"), detail:item.relation_type + " · " + (item.note || ""), date:item.created_at })),
    ...sources.filter(item => ["submitted", "needs_review", "disputed"].includes(item.review_status)).map(item => ({ id:item.id, kind:"source", status:item.review_status, title:item.title, detail:item.publisher_or_host || item.url, date:item.created_at }))
  ].filter(item => [item.title,item.detail,item.status,item.kind].join(" ").toLowerCase().includes(query.toLowerCase()) && (review === "all" || item.status === review)).sort((x,y)=>new Date(y.date || 0)-new Date(x.date || 0));

  const reviewRecord = async (item, nextStatus) => {
    if (!isModerator || !user) return;
    setModeratingKey(item.kind + ":" + item.id);
    const table = { evidence:"evidence_records", capability:"capabilities", relation:"evidence_relations", source:"source_records" }[item.kind];
    const statusColumn = item.kind === "capability" ? "status" : "review_status";
    const patch = { [statusColumn]: nextStatus };
    if (item.kind === "evidence" || item.kind === "relation") {
      patch.reviewed_by = user.id;
      patch.reviewed_at = new Date().toISOString();
    }
    const { error: updateError } = await supabase.from(table).update(patch).eq("id", item.id);
    if (updateError) showToast({ title:"Review action failed", description:updateError.message });
    else {
      showToast(item.kind + " marked " + nextStatus.replace(/_/g," ") + ".");
      if (item.kind === "evidence") { refreshEvidence(); }
      if (item.kind === "capability") refreshCapabilities();
      if (item.kind === "relation") refreshRelations();
      if (item.kind === "source") refreshSources();
    }
    setModeratingKey("");
  };

  const tabs = [{ value: "discover", label: "Discover online" }, { value: "evidence", label: "Evidence" }, { value: "sources", label: "Source library" }, { value: "relations", label: "Relationships" }, { value: "queue", label: "Review queue" }];

  useEffect(() => {
    let active = true;
    const ids = [...new Set(relations.flatMap(item => [item.from_evidence_id, item.to_evidence_id]).filter(Boolean))];
    if (!supabase || !ids.length) { setRelationEvidence({}); return () => { active = false; }; }
    supabase.from("evidence_records").select("id,summary").in("id", ids).then(({ data, error }) => {
      if (!active || error) return;
      const mapped = {};
      (data || []).forEach(item => { mapped[item.id] = item.summary; });
      setRelationEvidence(mapped);
    });
    return () => { active = false; };
  }, [relations]);

  const searchOnline = async event => {
    event?.preventDefault();
    const cleanQuery = discoveryQuery.trim();
    if (cleanQuery.length < 2) return;
    if (!supabase) { setResearchError("Connect the Supabase project before using online discovery."); return; }
    setSearching(true);
    setResearchError("");
    setDiscovery(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
        body: { action: "search", query: cleanQuery }
      });
      if (invokeError) throw new Error(invokeError.message || "The research service could not be reached.");
      if (data?.error) throw new Error(data.error);
      setDiscovery(data);
    } catch (error) {
      setResearchError(error?.message || "Online discovery failed.");
    } finally {
      setSearching(false);
    }
  };

  const saveDiscoveredSource = async source => {
    if (!user) { navigate("/auth/sign-in"); return; }
    setSavingKey(source.key);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
        body: { action: "save_source", source }
      });
      if (invokeError) throw new Error(invokeError.message || "Could not save source.");
      if (data?.error) throw new Error(data.error);
      setSavedKeys(old => ({ ...old, [source.key]: { id: data.source?.id || null } }));
      refreshSources();
      showToast(data.alreadySaved ? "Source is already in the library." : "Source saved as submitted.");
    } catch (error) {
      showToast({ title: "Source could not be saved", description: error?.message || "Try again." });
    } finally {
      setSavingKey("");
    }
  };

  const importCandidate = async candidate => {
    if (!user) { navigate("/auth/sign-in"); return; }
    setImportingKey(candidate.key);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
        body: { action: "import_entity", provider: candidate.provider, externalId: candidate.providerId }
      });
      if (invokeError) throw new Error(invokeError.message || "Could not import entity.");
      if (data?.error) throw new Error(data.error);
      setImportedKeys(old => ({ ...old, [candidate.key]: { slug: data.entity?.slug, type: data.entity?.entity_type } }));
      refreshSources();
      showToast(data.alreadyIndexed ? "Entity already exists in the index." : "Provisional entity added to OMNIVEX.");
    } catch (error) {
      showToast({ title: "Entity import failed", description: error?.message || "Try again." });
    } finally {
      setImportingKey("");
    }
  };

  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="RESEARCH / UNIVERSAL DISCOVERY" title={<>Find the source. <em>Build the record.</em></>} description="Search public reference databases, scholarly metadata and specialist catalogues. Discovery is automatic; identity, evidence and interpretation stay explicitly unverified until reviewed." />
      <TabBar tabs={tabs} active={activeTab} pathname="/research" />
      {activeTab === "discover" ? (
        <>
          <form className="platform-filter-row" onSubmit={searchOnline}>
            <label className="platform-search-field">
              <Search size={17} />
              <input value={discoveryQuery} onChange={event => setDiscoveryQuery(event.target.value)} placeholder="Search a character, animal, historical subject, work or topic…" maxLength={120} />
              {discoveryQuery && <button type="button" aria-label="Clear search" onClick={() => { setDiscoveryQuery(""); setDiscovery(null); }}><X size={15} /></button>}
            </label>
            <button className="atlas-button atlas-button--dark" type="submit" disabled={searching || discoveryQuery.trim().length < 2}>
              {searching ? "Searching…" : "Search online"} <ArrowRight size={15} />
            </button>
          </form>
          {researchError && <p className="platform-notice platform-notice--error">{researchError}</p>}
          {searching && <LoadingLine>Searching Wikidata, Wikipedia, Crossref, Open Library and anime character records…</LoadingLine>}
          {discovery && (
            <>
              <div className="platform-queue-note"><Globe2 size={17} /><span>Search results are discovery leads, not verified facts. Imports create provisional identities; saved links enter the submitted source library.</span></div>
              <section className="platform-section">
                <div className="platform-section-heading"><div><span className="section-kicker">PROVIDER COVERAGE</span><h2>Where OMNIVEX searched</h2></div><span>{discovery.sources?.length || 0} SOURCES</span></div>
                <div className="platform-meta-row">
                  {(discovery.providers || []).map(provider => <MetaPill key={provider.name}>{provider.name} · {provider.status === "available" ? provider.resultCount + " found" : provider.status.replaceAll("_", " ")}</MetaPill>)}
                </div>
              </section>
              <section className="platform-section">
                <div className="platform-section-heading"><div><span className="section-kicker">ENTITY RESOLUTION</span><h2>Possible identities</h2></div><span>{discovery.candidates?.length || 0} CANDIDATES</span></div>
                {discovery.candidates?.length ? (
                  <div className="platform-list">
                    {discovery.candidates.map(candidate => (
                      <article className="platform-list-row platform-list-row--static" key={candidate.key}>
                        <span>
                          <small>{candidate.provider} · {candidate.providerId}</small>
                          <strong>{candidate.name}</strong>
                          <p>{candidate.description || "No description supplied by the reference provider."}</p>
                          <small className="research-source-hint">Reference details are attached to the OMNIVEX dossier after import.</small>
                        </span>
                        {importedKeys[candidate.key]?.slug ? (
                          <Link className="atlas-button atlas-button--dark" to={(importedKeys[candidate.key].type || "").toLowerCase().includes("character") ? "/character/" + importedKeys[candidate.key].slug : "/entity/" + importedKeys[candidate.key].slug}>
                            Open OMNIVEX profile <ArrowUpRight size={14}/>
                          </Link>
                        ) : (
                          <button className="atlas-button atlas-button--outline" type="button" disabled={importingKey === candidate.key} onClick={() => importCandidate(candidate)}>
                            {importingKey === candidate.key ? "Adding…" : "Add to OMNIVEX"}
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                ) : <EmptyState title="No identity candidates found" body="Try a more specific name or a different spelling. Search still checks the source catalogues below." />}
              </section>
              <section className="platform-section">
                <div className="platform-section-heading"><div><span className="section-kicker">SOURCE DISCOVERY</span><h2>References to inspect</h2></div><span>{discovery.sources?.length || 0} RESULTS</span></div>
                {discovery.sources?.length ? (
                  <div className="platform-list">
                    {discovery.sources.map(source => (
                      <article className="platform-list-row platform-list-row--static" key={source.key}>
                        <span>
                          <small>{source.provider} · {source.sourceType.replaceAll("_", " ")}{source.publishedYear ? " · " + source.publishedYear : ""}</small>
                          <strong>{source.title}</strong>
                          <p>{source.snippet || "The provider returned a bibliographic reference without an abstract."}</p>
                          {savedKeys[source.key]?.id
                            ? <Link to={"/research/source/" + savedKeys[source.key].id}>Open source in OMNIVEX <ArrowUpRight size={13}/></Link>
                            : <small className="research-source-hint">Save this reference to open its OMNIVEX source record.</small>}
                        </span>
                        <button className="atlas-button atlas-button--outline" type="button" disabled={Boolean(savedKeys[source.key]) || savingKey === source.key} onClick={() => saveDiscoveredSource(source)}>
                          {savedKeys[source.key] ? "Saved" : savingKey === source.key ? "Saving…" : "Save source"}
                        </button>
                      </article>
                    ))}
                  </div>
                ) : <EmptyState title="No source records returned" body="The online providers may be temporarily unavailable or the query may be too narrow." />}
              </section>
              <p className="atlas-caption">{discovery.notice}</p>
            </>
          )}
          {!discovery && !searching && !researchError && <EmptyState title="Start with any subject" body="Search across reference databases, Wikipedia, scholarly metadata, book catalogues and anime character records. Nothing is added to the index until you choose to import it." />}
        </>
      ) : (
        <>
          <div className="platform-filter-row">
            <label className="platform-search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={activeTab === "sources" ? "Search source title, publisher or locator…" : activeTab === "relations" ? "Search relationship type, review state or note…" : "Search evidence claims and context…"} /></label>
            {activeTab !== "sources" && <label className="platform-sort"><Filter size={15} /><select value={review} onChange={event => setReview(event.target.value)}><option value="all">All review states</option><option value="submitted">Submitted</option><option value="needs_review">Needs review</option><option value="verified">Verified</option><option value="disputed">Disputed</option><option value="rejected">Rejected</option><option value="outdated">Outdated</option></select></label>}
          </div>
          <DataNotice error={evidenceError || sourcesError || relationsError || capabilitiesError} />
          {activeTab === "sources" ? (
            sourcesLoading ? <LoadingLine>Loading source library…</LoadingLine> : filteredSources.length ? <div className="platform-list">{filteredSources.map(item => <Link className="platform-list-row" key={item.id} to={"/research/source/" + item.id}><span><strong>{item.title}</strong><small>{item.publisher_or_host || item.source_type} · {item.reliability_grade || "NOT GRADED"} · {item.review_status}</small><p>{item.locator || item.source_notes || "Open the OMNIVEX source record and its linked entities."}</p></span><ArrowUpRight size={17} /></Link>)}</div> : <EmptyState title="No source records match" body="Sources are added as independent records and linked to evidence, not treated as evidence by themselves." />
          ) : activeTab === "relations" ? (
            relationsLoading ? <LoadingLine>Loading evidence relationships…</LoadingLine> : filteredRelations.length ? (
              <>
                <div className="platform-queue-note"><ShieldCheck size={17}/><span>AI-suggested links remain submitted review leads. A relationship marked “contradicts” is not a verified contradiction until a moderator reviews it.</span></div>
                <div className="platform-list">{filteredRelations.map(item => (
                  <article className="platform-list-row platform-list-row--static" key={item.id}>
                    <span>
                      <small>{String(item.relation_type || "relation").replace(/_/g," ")} · {item.review_status || "submitted"}</small>
                      <strong>{relationEvidence[item.from_evidence_id] || "Evidence record"} ↔ {relationEvidence[item.to_evidence_id] || "Related evidence"}</strong>
                      <p>{item.note || "No relationship note was provided."}</p>
                    </span>
                    <Link to={"/research/evidence/" + item.from_evidence_id} aria-label="Open linked evidence"><ArrowUpRight size={17}/></Link>
                  </article>
                ))}</div>
              </>
            ) : <EmptyState title="No relationship suggestions yet" body="Run the consistency scan from a source record after collecting at least two evidence records for the same exact version." />
          ) : activeTab === "queue" ? (
            (evidenceLoading || capabilitiesLoading || relationsLoading || sourcesLoading) ? <LoadingLine>Loading the moderation queue…</LoadingLine> : !isModerator ? (
              <EmptyState title="Moderator access required" body="Submissions and AI-generated review leads are visible here. Only accounts with an authorized OMNIVEX moderator/admin role can approve, dispute or reject records."/>
            ) : queueItems.length ? (
              <>
                <div className="platform-queue-note"><ShieldCheck size={17}/><span>Review decisions affect what the Battle Engine can use. Source approval, evidence verification, capability verification and contradiction adjudication are separate decisions.</span></div>
                <div className="platform-list">{queueItems.map(item => (
                  <article className="platform-list-row platform-list-row--static" key={item.kind + ":" + item.id}>
                    <span>
                      <small>{item.kind.toUpperCase()} · {String(item.status).replace(/_/g," ")} · {item.date ? new Date(item.date).toLocaleDateString() : "DATE NOT RECORDED"}</small>
                      <strong>{item.title}</strong>
                      <p>{item.detail || "No additional context supplied."}</p>
                    </span>
                    <div className="research-review-actions">
                      <button type="button" className="atlas-button atlas-button--dark" disabled={moderatingKey === item.kind + ":" + item.id} onClick={() => reviewRecord(item,"verified")}>Verify</button>
                      <button type="button" className="atlas-button atlas-button--outline" disabled={moderatingKey === item.kind + ":" + item.id} onClick={() => reviewRecord(item,"disputed")}>Dispute</button>
                      <button type="button" className="atlas-button atlas-button--outline" disabled={moderatingKey === item.kind + ":" + item.id} onClick={() => reviewRecord(item,"rejected")}>Reject</button>
                    </div>
                  </article>
                ))}</div>
              </>
            ) : <EmptyState title="Review queue is clear" body="There are no pending source, evidence, capability or relationship records matching this filter."/>
          ) : evidenceLoading ? <LoadingLine>Loading evidence records…</LoadingLine> : (
            <>

              {filteredEvidence.filter(item => activeTab !== "queue" || ["submitted", "needs_review", "disputed"].includes(item.review_status)).length ? (
                <div className="platform-list">{filteredEvidence.filter(item => activeTab !== "queue" || ["submitted", "needs_review", "disputed"].includes(item.review_status)).map(item => <Link className="platform-list-row" key={item.id} to={"/research/evidence/" + item.id}><span><strong>{item.summary}</strong><small>{item.evidence_type} · {item.canon_status} · {item.review_status} · {item.reliability_grade || "UNRATED"}</small><p>{item.context || "Context not submitted."}</p></span><ArrowUpRight size={17} /></Link>)}</div>
              ) : <EmptyState title="No evidence records found" body="Evidence appears when a contribution includes an exact version and source context. Nothing is fabricated to fill an empty research workspace." />}
            </>
          )}
        </>
      )}
    </div>
  );
}

export function EvidenceDetailPage() {
  const { evidenceSlug } = useParams();
  const [record, setRecord] = useState(null);
  const [source, setSource] = useState(null);
  const [entity, setEntity] = useState(null);
  const [version, setVersion] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    (async () => {
      const { data, error: queryError } = await supabase.from("evidence_records").select("*").eq("id", evidenceSlug).maybeSingle();
      if (!active) return;
      if (queryError) { setError(queryError.message); return; }
      setRecord(data);
      if (!data) return;
      if (data.source_record_id) {
        const { data: sourceRow } = await supabase.from("source_records").select("*").eq("id", data.source_record_id).maybeSingle();
        if (active) setSource(sourceRow);
      }
      const { data: versionRow } = await supabase.from("entity_versions").select("*").eq("id", data.entity_version_id).maybeSingle();
      if (!active || !versionRow) return;
      setVersion(versionRow);
      const { data: entityRow } = await supabase.from("entities").select("*").eq("id", versionRow.entity_id).maybeSingle();
      if (active) setEntity(entityRow);
    })();
    return () => { active = false; };
  }, [evidenceSlug]);
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="RESEARCH / EVIDENCE RECORD" title={record?.summary || "Evidence record"} description="This record keeps the claim, source locator, context, limitations and review history connected." action={<Link className="atlas-text-link" to="/research"><ArrowLeft size={15} /> Research workspace</Link>} />
      <DataNotice error={error} />
      {record ? (
        <div className="platform-evidence-detail">
          <div className="platform-meta-row"><MetaPill>{record.review_status}</MetaPill><MetaPill>{record.evidence_type}</MetaPill><MetaPill>{record.canon_status}</MetaPill><MetaPill>{record.reliability_grade || "UNRATED"}</MetaPill></div>
          <section><span className="section-kicker">VERSION CONTEXT</span><h2>{entity?.name || "Entity"} · {version?.label || "Version unavailable"}</h2><p>{version?.continuity || "Continuity not specified."}</p></section>
          <section><span className="section-kicker">CLAIM CONTEXT</span><h2>What is being claimed?</h2><p>{record.context || "No contextual description was supplied."}</p><small>LOCATOR · {record.locator || "Not specified"}</small></section>
          <section><span className="section-kicker">ORIGINAL SOURCE</span><h2>{source?.title || "No linked source"}</h2><p>{source?.locator || "No source locator available."}</p>{source?.url && <a href={source.url} target="_blank" rel="noreferrer">Open original source <ArrowUpRight size={14} /></a>}</section>
          <section><span className="section-kicker">LIMITS & COUNTER-EVIDENCE</span><h2>What could change the interpretation?</h2><p><strong>Limitations</strong> · {record.limitations || "Not recorded."}</p><p><strong>Counter-evidence</strong> · {record.counter_evidence_notes || "Not recorded."}</p></section>
        </div>
      ) : <EmptyState title="Evidence record not found" body="This identifier does not resolve to a public evidence record." />}
    </div>
  );
}

export function SourceDetailPage() {
  const { sourceId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [source, setSource] = useState(null);
  const [entities, setEntities] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    (async () => {
      const { data, error: sourceError } = await supabase.from("source_records").select("*").eq("id", sourceId).maybeSingle();
      if (!active) return;
      if (sourceError) throw sourceError;
      if (!data) { setSource(null); setLoading(false); return; }
      setSource(data);

      const [linkResult, evidenceResult] = await Promise.all([
        supabase.from("entity_source_links").select("entity_id,relationship_type,note").eq("source_record_id", data.id),
        supabase.from("evidence_records").select("id,entity_version_id,summary,evidence_type,review_status,canon_status,locator").eq("source_record_id", data.id).order("created_at", { ascending: false }).limit(80)
      ]);
      if (!active) return;
      if (linkResult.error || evidenceResult.error) throw linkResult.error || evidenceResult.error;
      const entityIds = [...new Set((linkResult.data || []).map(item => item.entity_id))];
      if (entityIds.length) {
        const [entitiesResult, versionsResult] = await Promise.all([
          supabase.from("entities").select("id,name,slug,entity_type").in("id", entityIds).order("name"),
          supabase.from("entity_versions").select("id,entity_id,label,continuity,canon_status,is_primary_version,status").in("entity_id", entityIds).order("created_at")
        ]);
        if (entitiesResult.error || versionsResult.error) throw entitiesResult.error || versionsResult.error;
        if (!active) return;
        const entityRows = entitiesResult.data || [];
        setEntities(entityRows);
        const entityMap = new Map(entityRows.map(item => [item.id, item]));
        const versionChoices = (versionsResult.data || []).map(item => ({ ...item, entity: entityMap.get(item.entity_id) }));
        setVersions(versionChoices);
        const preferred = versionChoices.find(item => item.is_primary_version) || versionChoices[0];
        if (preferred) setSelectedVersionId(preferred.id);
      }
      setEvidence(evidenceResult.data || []);
      setLoading(false);
    })().catch(queryError => {
      if (active) { setError(queryError?.message || "Unable to load the source record."); setLoading(false); }
    });
    return () => { active = false; };
  }, [sourceId]);

  useEffect(() => {
    let active = true;
    if (!user || !supabase) { setAiConfigured(null); return () => { active = false; }; }
    supabase.functions.invoke("omnivex-research", { body: { action: "ai_status" } })
      .then(({ data, error }) => {
        if (active) setAiConfigured(!error && data?.configured === true);
      })
      .catch(() => { if (active) setAiConfigured(false); });
    return () => { active = false; };
  }, [user?.id]);

  const runSourceAnalysis = async () => {
    if (!user) { navigate("/auth/sign-in"); return; }
    if (!selectedVersionId) { setAnalysisError("Link this source to an entity and choose an exact version first."); return; }
    setAnalyzing(true); setAnalysisError(""); setAnalysisResult(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
        body: { action: "analyze_source", sourceId, entityVersionId: selectedVersionId }
      });
      if (invokeError) throw new Error(invokeError.message || "The source analysis request failed.");
      if (data?.error) throw new Error(data.error);
      setAnalysisResult(data);
      const { data: refreshed, error: refreshError } = await supabase.from("evidence_records")
        .select("id,entity_version_id,summary,evidence_type,review_status,canon_status,locator")
        .eq("source_record_id", sourceId).order("created_at", { ascending: false }).limit(80);
      if (!refreshError) setEvidence(refreshed || []);
      showToast((data.evidence_created || 0) + " evidence claims submitted; " + (data.capabilities_created || 0) + " capability records submitted.");
    } catch (runError) {
      setAnalysisError(runError?.message || "Source analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const scanContradictions = async () => {
    if (!user) { navigate("/auth/sign-in"); return; }
    if (!selectedVersionId) { setAnalysisError("Choose an exact version before scanning."); return; }
    setScanning(true); setAnalysisError(""); setScanResult(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
        body: { action: "scan_contradictions", entityVersionId: selectedVersionId }
      });
      if (invokeError) throw new Error(invokeError.message || "The consistency scan failed.");
      if (data?.error) throw new Error(data.error);
      setScanResult(data);
      showToast((data.relations_created || 0) + " relationship suggestions sent to review.");
    } catch (runError) {
      setAnalysisError(runError?.message || "Consistency scan failed.");
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="atlas-feature-page platform-page"><LoadingLine>Opening source record…</LoadingLine></div>;
  if (!source) return <div className="atlas-feature-page platform-page"><EmptyState title="Source record not found" body="This reference has not been saved into the OMNIVEX source library." action={<Link className="atlas-button atlas-button--dark" to="/research?tab=discover">Discover sources</Link>} /></div>;

  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="RESEARCH / SOURCE RECORD" title={source.title} description="This is the OMNIVEX record for a reference. Its metadata, linked identities and evidence claims stay here; the publisher's original page is an optional citation destination." action={<Link className="atlas-text-link" to="/research?tab=sources"><ArrowLeft size={15}/> Source library</Link>} />
      <DataNotice error={error}/>
      <div className="platform-meta-row">
        <MetaPill>{source.source_type || "SOURCE"}</MetaPill>
        <MetaPill>{source.publisher_or_host || "Publisher not recorded"}</MetaPill>
        <MetaPill>{source.review_status || "submitted"}</MetaPill>
        <MetaPill>{source.reliability_grade || "NOT GRADED"}</MetaPill>
      </div>
      <section className="platform-section">
        <div className="platform-section-heading"><div><span className="section-kicker">REFERENCE METADATA</span><h2>What this source is</h2></div></div>
        <div className="platform-info-grid">
          <article className="platform-info-card"><span>PUBLISHER / HOST</span><h3>{source.publisher_or_host || "Not recorded"}</h3><p>{source.author_or_creator || "Creator or author not recorded."}</p></article>
          <article className="platform-info-card"><span>PUBLICATION DATE</span><h3>{source.published_at || "Not recorded"}</h3><p>Accessed {source.accessed_at ? new Date(source.accessed_at).toLocaleDateString() : "date not recorded"}</p></article>
          <article className="platform-info-card"><span>REVIEW STATE</span><h3>{source.review_status || "submitted"}</h3><p>Source reliability is kept separate from the quality of any interpretation made from it.</p></article>
        </div>
        <p className="platform-caption">{source.locator || source.source_notes || "No chapter, issue, episode or page locator has been attached yet."}</p>
        {source.url && <a className="atlas-button atlas-button--outline" href={source.url} target="_blank" rel="noreferrer">Open original publisher reference <ArrowUpRight size={14}/></a>}
      </section>
      <section className="platform-section">
        <div className="platform-section-heading"><div><span className="section-kicker">AI RESEARCH / HUMAN REVIEW</span><h2>Extract evidence from this source.</h2></div></div>
        <p className="platform-form-note">OMNIVEX inspects the selected public source URL, extracts only source-supported claims, and saves them as submitted evidence and capabilities. Nothing is automatically verified.</p>
        {versions.length ? (
          <div className="research-ai-controls">
            <label className="platform-form-label">Exact entity version
              <select value={selectedVersionId} onChange={event => setSelectedVersionId(event.target.value)}>
                {versions.map(item => <option key={item.id} value={item.id}>{item.entity?.name || "Entity"} · {item.label} · {item.continuity || "Continuity unspecified"}</option>)}
              </select>
            </label>
            <div className="research-ai-actions">
              <button className="atlas-button atlas-button--dark" type="button" onClick={runSourceAnalysis} disabled={analyzing || scanning || aiConfigured === false}>{analyzing ? "Inspecting source…" : "Extract evidence & capabilities"} <ArrowRight size={14}/></button>
              <button className="atlas-button atlas-button--outline" type="button" onClick={scanContradictions} disabled={analyzing || scanning || aiConfigured === false}>{scanning ? "Checking consistency…" : "Scan for contradictions"} <ShieldCheck size={14}/></button>
            </div>
          </div>
        ) : <EmptyState title="No linked entity version" body="Connect this source to a character/entity dossier before extracting evidence from it."/>}
        {!user && <p className="platform-form-note">Sign in to submit research generated from a source.</p>}
        {user && aiConfigured === false && <p className="platform-notice">AI extraction is not configured yet. Add <code>GEMINI_API_KEY</code> in Supabase → Edge Functions → Secrets. The key stays on the server and is never included in the website bundle.</p>}
        {analysisError && <p className="platform-notice platform-notice--error">{analysisError}</p>}
        {analysisResult && <div className="research-ai-result">
          <MetaPill>{analysisResult.status?.replace(/_/g, " ")}</MetaPill>
          <strong>{analysisResult.evidence_created || 0} evidence claims · {analysisResult.capabilities_created || 0} capability records · {analysisResult.possible_relations_created || 0} possible relationships</strong>
          <p>{analysisResult.source_summary || analysisResult.insufficient_reason || "Source review completed. New records remain in the review queue."}</p>
          {analysisResult.limitations?.length > 0 && <ul>{analysisResult.limitations.map((item,index)=><li key={index}>{item}</li>)}</ul>}
        </div>}
        {scanResult && <div className="research-ai-result">
          <MetaPill>{scanResult.status?.replace(/_/g, " ")}</MetaPill>
          <strong>{scanResult.relations_created || 0} relationship suggestions · {scanResult.records_checked || 0} records checked</strong>
          <p>{scanResult.summary || "Review suggestions were saved for moderator inspection."}</p>
          <Link to="/research?tab=relations" className="atlas-text-link">Open relationship review <ArrowUpRight size={14}/></Link>
        </div>}
      </section>
      <section className="platform-section">
        <div className="platform-section-heading"><div><span className="section-kicker">CONNECTED IDENTITIES</span><h2>Characters and entities</h2></div><span>{entities.length} LINKED</span></div>
        {entities.length ? <div className="platform-card-grid">{entities.map(item => <RecordCard key={item.id} record={item} type={(item.entity_type || "ENTITY").toUpperCase()} to={String(item.entity_type || "").toLowerCase().includes("character") ? "/character/" + item.slug : "/entity/" + item.slug}/>)}</div> : <EmptyState title="No identity links yet" body="This reference has not been attached to a character or entity dossier."/>}
      </section>
      <section className="platform-section">
        <div className="platform-section-heading"><div><span className="section-kicker">EVIDENCE USING THIS SOURCE</span><h2>Claims linked to this reference</h2></div><span>{evidence.length} CLAIMS</span></div>
        {evidence.length ? <div className="platform-list">{evidence.map(item => <Link className="platform-list-row" key={item.id} to={"/research/evidence/" + item.id}><span><strong>{item.summary}</strong><small>{item.evidence_type} · {item.canon_status} · {item.review_status}</small><p>{item.locator || "No source locator recorded."}</p></span><ArrowUpRight size={16}/></Link>)}</div> : <EmptyState title="No evidence claims linked" body="A source record by itself is not a feat. Evidence claims appear only when a specific version, context and locator are recorded."/>}
      </section>
    </div>
  );
}

export function CommunityPage() {
  const activeTab = useActiveTab("feed");
  const location = useLocation();
  const matchupId = new URLSearchParams(location.search).get("matchup");
  const { rows: discussions, loading: discussionLoading, error: discussionError, refresh } = useRows("discussions", "created_at", 120);
  const { rows: events, loading: eventLoading, error: eventError } = useRows("events", "starts_at", 100);
  const { rows: members, loading: memberLoading, error: memberError } = useRows("profiles", "created_at", 120);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const tabs = [{ value: "feed", label: "Community feed" }, { value: "debates", label: "Debates" }, { value: "events", label: "Events" }, { value: "members", label: "Members" }];
  const createDiscussion = async event => {
    event.preventDefault();
    if (!user) { navigate("/auth/sign-in"); return; }
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    const { error: postError } = await supabase.from("discussions").insert({ title: title.trim(), body: body.trim(), matchup_id: matchupId || null, created_by: user.id });
    if (postError) showToast({ title: "Discussion could not be published", description: postError.message });
    else { setTitle(""); setBody(""); showToast("Discussion published."); refresh(); }
    setPosting(false);
  };
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="COMMUNITY / SHARED INVESTIGATION" title={<>Bring a view. Bring <em>evidence.</em></>} description="Discuss interpretations, challenge claims and discover people building useful research. Community activity does not independently verify a factual claim." />
      <TabBar tabs={tabs} active={activeTab} pathname="/community" />
      {activeTab === "members" ? (
        <><DataNotice error={memberError} />{memberLoading ? <LoadingLine>Loading community members…</LoadingLine> : members.length ? <div className="platform-member-grid">{members.map(member => <Link className="platform-member-card" key={member.id} to={"/profile/" + (member.username || member.id)}><span className="platform-avatar">{(member.display_name || member.username || "O").slice(0, 1).toUpperCase()}</span><strong>{member.display_name || member.username || "OMNIVEX member"}</strong><small>@{member.username || "username-pending"}</small><p>{member.bio || "No public bio yet."}</p></Link>)}</div> : <EmptyState title="No public members yet" body="Member profiles appear after an account is created and its public profile is available." />}</>
      ) : activeTab === "events" ? (
        <><DataNotice error={eventError} />{eventLoading ? <LoadingLine>Loading community events…</LoadingLine> : events.length ? <div className="platform-event-grid">{events.map(item => <Link className="platform-event-card" key={item.id} to={"/events/" + item.slug}><span><CalendarDays size={17} /> {item.event_type || "COMMUNITY EVENT"}</span><h2>{item.title}</h2><p>{item.description || "Details will be available on the event page."}</p><small>{item.starts_at ? new Date(item.starts_at).toLocaleString() : "Schedule to be announced"} · {item.status}</small></Link>)}</div> : <EmptyState title="No events published" body="Tournaments, weekly challenges and community events will appear once they are published by the team." />}</>
      ) : (
        <>
          <DataNotice error={discussionError} />
          {(activeTab === "feed" || (activeTab === "debates" && matchupId)) && <form className="platform-composer" onSubmit={createDiscussion}><span className="section-kicker">{matchupId ? "START A MATCHUP DEBATE" : "START A THREAD"}</span><input value={title} onChange={event => setTitle(event.target.value)} placeholder="Give the discussion a clear title" maxLength={140} required /><textarea value={body} onChange={event => setBody(event.target.value)} rows={3} placeholder="Add context, define the scope and include source links where relevant." required /><div><small>{matchupId ? "This thread will be linked to the selected matchup." : "Respectful debate · Evidence over popularity"}</small><button className="atlas-button atlas-button--dark" type="submit" disabled={posting}>{posting ? "Publishing…" : "Publish discussion"} <ArrowUpRight size={14} /></button></div></form>}
          {discussionLoading ? <LoadingLine>Loading discussions…</LoadingLine> : discussions.filter(item => activeTab !== "debates" || Boolean(item.matchup_id)).filter(item => !matchupId || item.matchup_id === matchupId).length ? <div className="platform-discussion-list">{discussions.filter(item => activeTab !== "debates" || Boolean(item.matchup_id)).filter(item => !matchupId || item.matchup_id === matchupId).map(item => <article className="platform-discussion-card" key={item.id}><div className="platform-discussion-meta"><MetaPill>{item.status}</MetaPill><time>{new Date(item.created_at).toLocaleDateString()}</time></div><h2>{item.title}</h2><p>{item.body}</p><Link className="atlas-text-link" to={"/discussions/" + item.id}>Open discussion <ArrowUpRight size={14} /></Link></article>)}</div> : <EmptyState title={matchupId ? "No debate threads for this matchup yet" : "No discussions yet"} body="Start a thread to open a new question for the community." />}
        </>
      )}
    </div>
  );
}

export function DiscussionDetailPage() {
  const { discussionId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [argumentsList, setArgumentsList] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data, error: queryError } = await supabase.from("discussions").select("*").eq("id", discussionId).maybeSingle();
    if (queryError) setError(queryError.message);
    setDiscussion(data);
    if (data) {
      const { data: rows } = await supabase.from("arguments").select("*").eq("discussion_id", data.id).eq("status", "visible").order("created_at");
      setArgumentsList(rows || []);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [discussionId]);
  const submit = async event => {
    event.preventDefault();
    if (!user) { navigate("/auth/sign-in"); return; }
    const { error: insertError } = await supabase.from("arguments").insert({ discussion_id: discussionId, body: body.trim(), side: "neutral", created_by: user.id });
    if (insertError) showToast({ title: "Reply could not be posted", description: insertError.message });
    else { setBody(""); showToast("Reply posted."); load(); }
  };
  if (loading) return <div className="atlas-feature-page"><LoadingLine>Opening discussion…</LoadingLine></div>;
  return <div className="atlas-feature-page platform-page"><PageIntro eyebrow="COMMUNITY / THREAD" title={discussion?.title || "Discussion"} description={discussion?.body || "This discussion record could not be loaded."} action={<Link className="atlas-text-link" to="/community"><ArrowLeft size={15} /> Community</Link>} /><DataNotice error={error} />{discussion && <><form className="platform-composer" onSubmit={submit}><span className="section-kicker">ADD A REPLY</span><textarea rows={4} value={body} onChange={event => setBody(event.target.value)} required placeholder="Make a specific point. Add evidence links where possible."/><button className="atlas-button atlas-button--dark" type="submit">Post reply <ArrowUpRight size={14}/></button></form><div className="platform-discussion-list">{argumentsList.length ? argumentsList.map(item=><article className="platform-discussion-card" key={item.id}><MetaPill>{item.side}</MetaPill><p>{item.body}</p><small>{new Date(item.created_at).toLocaleString()}</small></article>) : <EmptyState title="No replies yet" body="Start with a specific, evidence-aware argument."/>}</div></>}</div>;
}

export function EventDetailPage() {
  const { eventSlug } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    (async () => {
      const { data, error: queryError } = await supabase.from("events").select("*").eq("slug", eventSlug).maybeSingle();
      if (!active) return;
      if (queryError) setError(queryError.message);
      setEvent(data);
      if (data && user) {
        const { data: row } = await supabase.from("event_registrations").select("id").eq("event_id", data.id).eq("user_id", user.id).maybeSingle();
        if (active) setRegistered(Boolean(row));
      }
    })();
    return () => { active = false; };
  }, [eventSlug, user?.id]);
  const register = async () => {
    if (!user) { showToast("Sign in to register for this event."); return; }
    if (registered) {
      const { error: deleteError } = await supabase.from("event_registrations").delete().eq("event_id", event.id).eq("user_id", user.id);
      if (deleteError) showToast({ title: "Could not cancel registration", description: deleteError.message });
      else setRegistered(false);
    } else {
      const { error: insertError } = await supabase.from("event_registrations").insert({ event_id: event.id, user_id: user.id });
      if (insertError && insertError.code !== "23505") showToast({ title: "Registration failed", description: insertError.message });
      else setRegistered(true);
    }
  };
  return <div className="atlas-feature-page platform-page"><PageIntro eyebrow="COMMUNITY / EVENT" title={event?.title || eventSlug.replace(/-/g, " ")} description={event?.description || "Event details are not available."} action={<Link className="atlas-text-link" to="/community?tab=events"><ArrowLeft size={15} /> All events</Link>} /><DataNotice error={error} />{event && <div className="platform-event-detail"><MetaPill>{event.status}</MetaPill><MetaPill>{event.event_type}</MetaPill><p>{event.starts_at ? "Starts " + new Date(event.starts_at).toLocaleString() : "Schedule to be announced"}</p><button type="button" className="atlas-button atlas-button--dark" onClick={register}>{registered ? "Cancel registration" : "Register for event"}</button></div>}</div>;
}

export function RankingsPage() {
  const { rows, loading, error } = useRows("ranking_snapshots", "captured_at", 250);
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("all");
  const [subjects, setSubjects] = useState({});
  const filtered = rows.filter(item => (type === "all" || item.ranking_type === type) && (period === "all" || item.period === period)).sort((a, b) => a.position - b.position);
  const types = [...new Set(rows.map(item => item.ranking_type).filter(Boolean))];
  const periods = [...new Set(rows.map(item => item.period).filter(Boolean))];
  useEffect(() => {
    let active = true;
    if (!supabase || !rows.length) { setSubjects({}); return () => { active = false; }; }
    const selected = rows.filter(item => (type === "all" || item.ranking_type === type) && (period === "all" || item.period === period));
    const idsFor = kind => [...new Set(selected.filter(item => item.subject_type === kind).map(item => item.subject_id))];
    const entityIds = idsFor("entity");
    const matchupIds = idsFor("matchup");
    const universeIds = idsFor("universe");
    Promise.all([
      entityIds.length ? supabase.from("entities").select("id,name,slug").in("id", entityIds) : Promise.resolve({ data: [] }),
      matchupIds.length ? supabase.from("matchups").select("id,title,slug").in("id", matchupIds) : Promise.resolve({ data: [] }),
      universeIds.length ? supabase.from("universes").select("id,name,slug").in("id", universeIds) : Promise.resolve({ data: [] })
    ]).then(([entityRows, matchupRows, universeRows]) => {
      if (!active) return;
      const map = {};
      (entityRows.data || []).forEach(item => { map["entity:" + item.id] = { name: item.name, href: "/entity/" + item.slug }; });
      (matchupRows.data || []).forEach(item => { map["matchup:" + item.id] = { name: item.title, href: "/matchups/" + item.slug }; });
      (universeRows.data || []).forEach(item => { map["universe:" + item.id] = { name: item.name, href: "/universe/" + item.slug }; });
      setSubjects(map);
    });
    return () => { active = false; };
  }, [rows, type, period]);
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="RANKINGS / DISTINCT SIGNALS" title={<>No single list can <em>measure everything.</em></>} description="Popularity, community activity, recorded outcomes and evidence-based capability are different signals. Each ranking must show its own methodology and time period." />
      <div className="platform-filter-row"><label className="platform-sort"><Filter size={15}/><select value={type} onChange={event=>setType(event.target.value)}><option value="all">All ranking types</option>{types.map(item=><option key={item} value={item}>{item}</option>)}</select></label><label className="platform-sort"><CalendarDays size={15}/><select value={period} onChange={event=>setPeriod(event.target.value)}><option value="all">All periods</option>{periods.map(item=><option key={item} value={item}>{item}</option>)}</select></label><span className="platform-result-count">{filtered.length} SNAPSHOTS</span></div>
      <DataNotice error={error}/>
      {loading ? <LoadingLine>Loading ranking snapshots…</LoadingLine> : filtered.length ? <div className="platform-ranking-list">{filtered.map(item => {
        const subject = subjects[item.subject_type + ":" + item.subject_id];
        return <article key={item.id} className="platform-ranking-row"><span className="platform-ranking-position">{String(item.position).padStart(2,"0")}</span><div><strong>{subject ? <Link to={subject.href}>{subject.name}</Link> : "Unresolved " + item.subject_type + " record"}</strong><small>{item.ranking_type} · {item.period}</small></div><span className="platform-ranking-score">{item.score == null ? "—" : Number(item.score).toFixed(2)}</span></article>;
      })}</div> : <EmptyState title="No ranking snapshots available" body="Rankings are published from stored snapshots. OMNIVEX does not invent a leaderboard or present popularity as capability."/>}
    </div>
  );
}

export function LibraryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const activeTab = useActiveTab("saved");
  const [saved, setSaved] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    if (!supabase || !user) { setSaved([]); setNotes([]); setLoading(false); return; }
    setLoading(true);
    const [savedResult, notesResult] = await Promise.all([
      supabase.from("saved_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("research_notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
    ]);
    if (savedResult.error || notesResult.error) setError(savedResult.error?.message || notesResult.error?.message || "");
    const rows = savedResult.data || [];
    const groups = {};
    rows.forEach(item => { (groups[item.target_type] ||= []).push(item.target_id); });
    const [entities, universes, matchups, evidence] = await Promise.all([
      groups.entity?.length ? supabase.from("entities").select("id,name,slug").in("id", groups.entity) : Promise.resolve({ data: [] }),
      groups.universe?.length ? supabase.from("universes").select("id,name,slug").in("id", groups.universe) : Promise.resolve({ data: [] }),
      groups.matchup?.length ? supabase.from("matchups").select("id,title,slug").in("id", groups.matchup) : Promise.resolve({ data: [] }),
      groups.evidence?.length ? supabase.from("evidence_records").select("id,summary").in("id", groups.evidence) : Promise.resolve({ data: [] })
    ]);
    const records = {};
    [["entity", entities], ["universe", universes], ["matchup", matchups], ["evidence", evidence]].forEach(([kind, result]) => (result.data || []).forEach(item => { records[kind + ":" + item.id] = item; }));
    setSaved(rows.map(item => ({ ...item, record: records[item.target_type + ":" + item.target_id] })));
    setNotes(notesResult.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);
  const remove = async item => {
    const { error: deleteError } = await supabase.from("saved_items").delete().eq("id", item.id).eq("user_id", user.id);
    if (deleteError) showToast({ title: "Could not remove item", description: deleteError.message });
    else { setSaved(old => old.filter(row => row.id !== item.id)); showToast("Removed from library."); }
  };
  const tabs = [{ value: "saved", label: "Saved items" }, { value: "notes", label: "Research notes" }];
  const savedLink = item => {
    const record = item.record;
    if (item.target_type === "entity") return "/entity/" + (record?.slug || "");
    if (item.target_type === "universe") return "/universe/" + (record?.slug || "");
    if (item.target_type === "matchup") return "/matchups/" + (record?.slug || "");
    if (item.target_type === "evidence") return "/research/evidence/" + item.target_id;
    return "/library";
  };
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow="LIBRARY / PERSONAL INDEX" title={<>Keep what matters <em>close.</em></>} description={user ? "Your saved records and private research notes are scoped to your account." : "Sign in to save entities, matchups, evidence and research notes."} action={!user && <Link className="atlas-button atlas-button--dark" to="/auth/sign-in"><LogIn size={15}/> Sign in</Link>} />
      <TabBar tabs={tabs} active={activeTab} pathname="/library"/>
      {!user ? <EmptyState title="Your library is private" body="Sign in to access saved items and notes." action={<Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in</Link>}/> : loading ? <LoadingLine>Opening your library…</LoadingLine> : activeTab === "notes" ? <><div className="platform-library-actions"><span>{notes.length} PRIVATE NOTES</span><Link className="atlas-button atlas-button--dark" to="/library/notes/new">Create note <Plus size={14}/></Link></div>{notes.length ? <div className="platform-list">{notes.map(item=><Link className="platform-list-row" key={item.id} to={"/library/notes/" + item.id}><span><strong>{item.title}</strong><small>UPDATED {new Date(item.updated_at).toLocaleString()}</small><p>{(item.body || "").slice(0,180) || "Empty note"}</p></span><ArrowUpRight size={16}/></Link>)}</div> : <EmptyState title="No research notes yet" body="Private notes appear here when you create them."/>}</> : saved.length ? <div className="platform-list">{saved.map(item=><div className="platform-list-row" key={item.id}><Link to={savedLink(item)}><span><strong>{item.record?.name || item.record?.title || item.record?.summary || "Record unavailable"}</strong><small>{item.target_type.toUpperCase()} · SAVED {new Date(item.created_at).toLocaleDateString()}</small></span></Link><button type="button" className="platform-icon-button" onClick={()=>remove(item)} aria-label="Remove from library"><X size={16}/></button></div>)}</div> : <EmptyState title="Your saved library is empty" body="Use Save on an entity or matchup dossier to keep it here."/>}
      <DataNotice error={error}/>
    </div>
  );
}

export function LibraryNotePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { noteId } = useParams();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(Boolean(noteId));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    if (!noteId || !supabase || !user) { setLoading(false); return () => { active = false; }; }
    supabase.from("research_notes").select("*").eq("id", noteId).eq("user_id", user.id).maybeSingle()
      .then(({ data, error }) => { if (!active) return; if (error) showToast({ title: "Could not load note", description: error.message }); setTitle(data?.title || ""); setBody(data?.body || ""); setLoading(false); });
    return () => { active = false; };
  }, [noteId, user?.id]);
  const save = async event => {
    event.preventDefault();
    if (!user || !supabase) { navigate("/auth/sign-in"); return; }
    setSaving(true);
    const payload = { user_id: user.id, title: title.trim() || "Untitled note", body, updated_at: new Date().toISOString() };
    const result = noteId
      ? await supabase.from("research_notes").update({ title: payload.title, body, updated_at: payload.updated_at }).eq("id", noteId).eq("user_id", user.id).select("id").single()
      : await supabase.from("research_notes").insert(payload).select("id").single();
    if (result.error) showToast({ title: "Note could not be saved", description: result.error.message });
    else { showToast("Private note saved."); navigate("/library?tab=notes"); }
    setSaving(false);
  };
  if (!user) return <div className="atlas-feature-page"><EmptyState title="Sign in to create private notes" body="Your research notes are owner-only account data." action={<Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in</Link>}/></div>;
  if (loading) return <div className="atlas-feature-page"><LoadingLine>Loading private note…</LoadingLine></div>;
  return <div className="atlas-feature-page platform-page"><PageIntro eyebrow="LIBRARY / PRIVATE RESEARCH" title={<>A place to think <em>clearly.</em></>} description="Private working notes are not public claims or verified evidence." action={<Link className="atlas-text-link" to="/library?tab=notes"><ArrowLeft size={15}/> Back to Library</Link>}/><form className="platform-form platform-note-form" onSubmit={save}><label>Note title<input value={title} onChange={event=>setTitle(event.target.value)} maxLength={120} placeholder="Untitled research note"/></label><label>Notes<textarea value={body} onChange={event=>setBody(event.target.value)} rows={16} placeholder="Questions, ideas, source URLs and observations…"/></label><button className="atlas-button atlas-button--dark" type="submit" disabled={saving}>{saving?"Saving…":"Save private note"} <Check size={15}/></button></form></div>;
}

export function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ discussions: 0, matchups: 0, evidence: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [publicUsername, setPublicUsername] = useState("");
  const [bio, setBio] = useState("");
  const isSelf = username === "me" || (!username && Boolean(user));
  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    (async () => {
      let query = supabase.from("profiles").select("*");
      if (isSelf && user) query = query.eq("id", user.id);
      else query = query.eq("username", username);
      const { data, error } = await query.maybeSingle();
      if (!active) return;
      if (error) showToast({ title: "Profile could not be loaded", description: error.message });
      setProfile(data);
      setDisplayName(data?.display_name || "");
      setPublicUsername(data?.username || "");
      setBio(data?.bio || "");
      if (data) {
        const [d, m, e] = await Promise.all([
          supabase.from("discussions").select("id", { count: "exact", head: true }).eq("created_by", data.id),
          supabase.from("matchups").select("id", { count: "exact", head: true }).eq("created_by", data.id),
          supabase.from("evidence_records").select("id", { count: "exact", head: true }).eq("submitted_by", data.id)
        ]);
        if (active) setStats({ discussions: d.count || 0, matchups: m.count || 0, evidence: e.count || 0 });
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [username, user?.id]);
  const saveProfile = async event => {
    event.preventDefault();
    const cleanUsername = publicUsername.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername) || cleanUsername === "me") {
      showToast("Username must be 3–24 characters using letters, numbers or underscores. 'me' is reserved.");
      return;
    }
    const { data, error } = await supabase.from("profiles").update({
      username: cleanUsername,
      display_name: displayName.trim(),
      bio: bio.trim(),
      updated_at: new Date().toISOString()
    }).eq("id", user.id).select("*").single();
    if (error) showToast({ title: "Profile could not be saved", description: error.message });
    else { setProfile(data); setEditing(false); showToast("Profile updated."); }
  };
  if (loading) return <div className="atlas-feature-page"><LoadingLine>Loading profile…</LoadingLine></div>;
  if (!profile) return <div className="atlas-feature-page"><EmptyState title="Profile not found" body={isSelf ? "Sign in and complete your profile to create a public page." : "This username does not resolve to a public profile."} action={<Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in</Link>}/></div>;
  return (
    <div className="atlas-feature-page platform-page">
      <PageIntro eyebrow={isSelf ? "YOUR PROFILE" : "COMMUNITY MEMBER"} title={profile.display_name || profile.username || "OMNIVEX member"} description={profile.bio || "No public bio has been added yet."} action={isSelf && <button className="atlas-button atlas-button--dark" onClick={()=>setEditing(value=>!value)} type="button">{editing ? "Cancel edit" : "Edit profile"}</button>} />
      <div className="platform-profile-strip"><span className="platform-avatar platform-avatar--large">{(profile.display_name || profile.username || "O").slice(0,1).toUpperCase()}</span><div><strong>@{profile.username || "username-pending"}</strong><small>MEMBER SINCE {new Date(profile.created_at).toLocaleDateString()}</small></div></div>
      {editing && isSelf && <form className="platform-composer" onSubmit={saveProfile}><label>Username<input value={publicUsername} onChange={event=>setPublicUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0,24))} minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" placeholder="your_username" required/><small>3–24 letters, numbers or underscores. Your public profile link uses this handle.</small></label><label>Display name<input value={displayName} onChange={event=>setDisplayName(event.target.value)} maxLength={60}/></label><label>Public bio<textarea value={bio} onChange={event=>setBio(event.target.value)} rows={3} maxLength={240}/></label><button className="atlas-button atlas-button--dark" type="submit">Save profile <Check size={15}/></button></form>}
      <div className="platform-profile-stats"><div><strong>{stats.discussions}</strong><small>DISCUSSIONS</small></div><div><strong>{stats.matchups}</strong><small>MATCHUPS CREATED</small></div><div><strong>{stats.evidence}</strong><small>EVIDENCE SUBMISSIONS</small></div></div>
      {isSelf && <div className="platform-inline-actions"><Link className="atlas-button atlas-button--dark" to="/library"><Bookmark size={15}/> Open library</Link><button className="atlas-button atlas-button--outline" type="button" onClick={async()=>{await supabase.auth.signOut();showToast("Signed out.");}}>Sign out</button></div>}
    </div>
  );
}
