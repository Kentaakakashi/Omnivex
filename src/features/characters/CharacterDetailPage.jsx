import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ArrowUpRight, Bookmark, BookOpen, Fingerprint, Globe2,
  ShieldCheck, Swords, ExternalLink
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../app/providers/AuthProvider.jsx";
import { useToast } from "../../app/providers/ToastProvider.jsx";

const allowedMediaBases = ["public_domain", "cc0", "cc_by", "cc_by_sa", "licensed", "publisher_authorized", "user_owned"];

function Pill({ children }) {
  return <span className="character-pill">{children}</span>;
}

function Section({ eyebrow, title, count, children }) {
  return (
    <section className="character-section">
      <div className="character-section__heading">
        <div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2></div>
        {count !== undefined && <span>{count}</span>}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <div className="character-empty">{children}</div>;
}

export default function CharacterDetailPage() {
  const { entitySlug, versionSlug } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [universe, setUniverse] = useState(null);
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [aliases, setAliases] = useState([]);
  const [profileRows, setProfileRows] = useState([]);
  const [profileFacts, setProfileFacts] = useState([]);
  const [sources, setSources] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [matchups, setMatchups] = useState([]);
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    setLoading(true);
    setError("");
    (async () => {
      const { data: entityRow, error: entityError } = await supabase.from("entities")
        .select("*").eq("slug", entitySlug).maybeSingle();
      if (!active) return;
      if (entityError) throw entityError;
      if (!entityRow) { setEntity(null); setLoading(false); return; }
      if (!(entityRow.entity_type || "").toLowerCase().includes("character")) {
        navigate("/entity/" + entitySlug, { replace: true });
        return;
      }
      setEntity(entityRow);
      const [versionResult, aliasResult, universeResult, sourceLinkResult, profileResult, profileFactResult] = await Promise.all([
        supabase.from("entity_versions").select("*").eq("entity_id", entityRow.id).order("created_at", { ascending: true }),
        supabase.from("entity_aliases").select("id,alias,alias_type,locale").eq("entity_id", entityRow.id).order("alias"),
        entityRow.primary_universe_id
          ? supabase.from("universes").select("id,name,slug,category,status").eq("id", entityRow.primary_universe_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("entity_source_links").select("source_record_id,relationship_type,note").eq("entity_id", entityRow.id),
        supabase.from("entity_profiles").select("*").eq("entity_id", entityRow.id).order("created_at", { ascending: false }),
        supabase.from("entity_profile_facts").select("*").eq("entity_id", entityRow.id).order("fact_key")
      ]);
      if (!active) return;
      if (versionResult.error || profileResult.error || profileFactResult.error) throw versionResult.error || profileResult.error || profileFactResult.error;
      setVersions(versionResult.data || []);
      setAliases(aliasResult.data || []);
      setProfileRows(profileResult.data || []);
      setProfileFacts(profileFactResult.data || []);
      setUniverse(universeResult.data || null);
      const sourceIds = (sourceLinkResult.data || []).map(item => item.source_record_id).filter(Boolean);
      let linkedSources = [];
      if (sourceIds.length) {
        const { data, error: sourceError } = await supabase.from("source_records")
          .select("id,title,url,publisher_or_host,source_type,review_status,source_notes")
          .in("id", sourceIds).order("created_at", { ascending: false });
        if (sourceError) throw sourceError;
        linkedSources = data || [];
      }
      setSources(linkedSources);
      const rows = versionResult.data || [];
      const selected = rows.find(item => item.slug === versionSlug) ||
        rows.find(item => item.is_primary_version) || rows[0] || null;
      setActiveVersion(selected);
      setLoading(false);
    })().catch(loadError => {
      if (!active) return;
      setError(loadError?.message || "Unable to load this character dossier.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [entitySlug, versionSlug, navigate]);

  useEffect(() => {
    let active = true;
    if (!supabase || !activeVersion) {
      setCapabilities([]); setEvidence([]); setArtwork(null); setMatchups([]);
      return () => { active = false; };
    }
    (async () => {
      const [capResult, evidenceResult, mediaResult, participantResult] = await Promise.all([
        supabase.from("capabilities").select("*").eq("entity_version_id", activeVersion.id).order("capability_name"),
        supabase.from("evidence_records").select("*").eq("entity_version_id", activeVersion.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("entity_media").select("asset_url,source_url,usage_basis,approval_status,alt_text,source_title,attribution_text,submitted_by,license_name")
          .eq("entity_version_id", activeVersion.id)
          .or(user?.id
            ? "approval_status.eq.approved,and(approval_status.eq.submitted,submitted_by.eq." + user.id + ")"
            : "approval_status.eq.approved")
          .eq("is_primary", true).maybeSingle(),
        supabase.from("matchup_participants").select("matchup_id").eq("entity_version_id", activeVersion.id)
      ]);
      if (!active) return;
      if (capResult.error || evidenceResult.error) throw capResult.error || evidenceResult.error;
      setCapabilities(capResult.data || []);
      setEvidence(evidenceResult.data || []);
      setArtwork(mediaResult.data || null);
      const sourceIds = [...new Set((evidenceResult.data || []).map(item => item.source_record_id).filter(Boolean))];
      if (sourceIds.length) {
        const { data, error: linkedError } = await supabase.from("source_records")
          .select("id,title,url,publisher_or_host,source_type,review_status,source_notes").in("id", sourceIds);
        if (linkedError) throw linkedError;
        setSources(old => {
          const merged = new Map(old.map(item => [item.id, item]));
          (data || []).forEach(item => merged.set(item.id, item));
          return Array.from(merged.values());
        });
      }
      const matchupIds = [...new Set((participantResult.data || []).map(item => item.matchup_id))];
      if (matchupIds.length) {
        const { data, error: matchupError } = await supabase.from("matchups")
          .select("id,slug,title,status,created_at").in("id", matchupIds).order("created_at", { ascending: false }).limit(8);
        if (matchupError) throw matchupError;
        if (active) setMatchups(data || []);
      } else setMatchups([]);
    })().catch(loadError => {
      if (active) setError(loadError?.message || "Some dossier sections could not be loaded.");
    });
    return () => { active = false; };
  }, [activeVersion, user?.id]);

  const save = async () => {
    if (!user) { navigate("/auth/sign-in"); return; }
    const { error: saveError } = await supabase.from("saved_items").insert({
      user_id: user.id, target_type: "entity", target_id: entity.id
    });
    if (saveError?.code === "23505") showToast("Already in your library.");
    else if (saveError) showToast({ title: "Could not save character", description: saveError.message });
    else showToast("Character saved to your library.");
  };

  const artAllowed = Boolean(artwork?.asset_url && artwork?.source_url &&
    (artwork?.approval_status === "approved" || (artwork?.approval_status === "submitted" && artwork?.submitted_by === user?.id)) &&
    allowedMediaBases.includes(artwork?.usage_basis));

  if (loading) return <main className="atlas-feature-page character-page"><p className="platform-loading">Building character dossier…</p></main>;
  if (!entity) return (
    <main className="atlas-feature-page character-page">
      <div className="character-missing"><span className="section-kicker">CHARACTER / NOT INDEXED</span><h1>This character isn't in the index yet.</h1><p>Search the wider index or discover a source, then add the identity to OMNIVEX.</p><Link className="atlas-button atlas-button--dark" to="/explore">Back to Explore <ArrowUpRight size={15}/></Link></div>
    </main>
  );

  return (
    <main className="atlas-feature-page character-page">
      <div className="character-breadcrumb"><Link to="/explore?tab=characters"><ArrowLeft size={14}/> Character index</Link><span>/</span><span>{universe?.name || "Character dossier"}</span></div>
      <header className="character-hero">
        <div className="character-hero__copy">
          <span className="section-kicker">OMNIVEX CHARACTER DOSSIER · {entity.status || "PROVISIONAL"}</span>
          <h1>{entity.name}</h1>
          <p>{entity.short_description || "An indexed character identity. Continuity, capabilities and evidence are added as source-backed records are reviewed."}</p>
          <div className="character-pill-row">
            <Pill>{entity.entity_type || "Character"}</Pill>
            <Pill>{universe?.name || "Universe pending"}</Pill>
            {activeVersion && <Pill>{activeVersion.canon_status === "unknown" ? "Continuity unresolved" : activeVersion.canon_status}</Pill>}
          </div>
          <div className="character-actions">
            <button className="atlas-button atlas-button--dark" onClick={save} type="button"><Bookmark size={15}/> Save dossier</button>
            <Link className="atlas-button atlas-button--outline" to="/matchups/new"><Swords size={15}/> Use in matchup</Link>
            {universe && <Link className="atlas-text-link" to={"/universe/" + universe.slug}>Explore universe <ArrowUpRight size={14}/></Link>}
          </div>
        </div>
        <div className="character-hero__art">
          {artAllowed
            ? <><img src={artwork.asset_url} alt={artwork.alt_text || entity.name} />
              {artwork.approval_status === "submitted" && <small className="character-art-review-note">YOUR LICENSED IMAGE SUBMISSION · REVIEW PENDING</small>}</>
            : <div className="character-art-placeholder"><span>{entity.name.split(/\s+/).map(part => part[0]).join("").slice(0, 3).toUpperCase()}</span><small>LICENSED, VERSION-MATCHED ARTWORK PENDING</small></div>}
        </div>
        <div className="character-hero__index"><span>INDEX ID</span><strong>{entity.id.slice(0, 8).toUpperCase()}</strong><span>IDENTITY RECORD</span><strong>{entity.status.toUpperCase()}</strong></div>
      </header>

      {error && <p className="platform-notice platform-notice--error">{error}</p>}

      <div className="character-layout">
        <div className="character-main-column">
          <Section eyebrow="01 / IDENTITY" title="Known identity" count={aliases.length + " ALIASES"}>
            <div className="character-identity-grid">
              <article><span>UNIVERSE</span><strong>{universe?.name || "Not linked yet"}</strong>{universe && <Link to={"/universe/" + universe.slug}>Open universe hub <ArrowUpRight size={13}/></Link>}</article>
              <article><span>INDEX STATUS</span><strong>{entity.status}</strong><small>Identity is provisional until reviewed.</small></article>
              <article><span>PRIMARY CONTINUITY</span><strong>{activeVersion?.continuity || "Not documented"}</strong><small>{activeVersion?.canon_status === "unknown" ? "Continuity has not been resolved." : "See the selected version record."}</small></article>
            </div>
            {aliases.length ? <div className="character-aliases">{aliases.map(alias => <Pill key={alias.id}>{alias.alias}{alias.locale ? " · " + alias.locale : ""}</Pill>)}</div> : <Empty>No aliases have been attached yet.</Empty>}
          </Section>

          <Section eyebrow="OFFICIAL PROFILE / SOURCE-LINKED DETAILS" title="Publisher-sourced character details" count={profileFacts.length + " FACTS"}>
            {profileRows.length ? (
              <div className="character-profile-source-list">
                {profileRows.map(profile => (
                  <article key={profile.id}>
                    <div><strong>{profile.catalog_source_key === "one_piece" ? "ONE PIECE.com" : profile.catalog_source_key === "dc" ? "DC official profile" : profile.catalog_source_key}</strong><span>{profile.status} · {profile.profile_language?.toUpperCase() || "LANGUAGE UNKNOWN"}</span></div>
                    {profile.profile_data?.official_summary_excerpt && <p>{profile.profile_data.official_summary_excerpt}</p>}
                    <small>{profile.sourced_field_count} sourced fields · checked {new Date(profile.source_checked_at).toLocaleDateString()}</small>
                    <a href={profile.official_profile_url} target="_blank" rel="noreferrer">Open original official profile <ArrowUpRight size={13}/></a>
                  </article>
                ))}
              </div>
            ) : <Empty>No publisher-sourced profile has been imported for this character yet.</Empty>}
            {profileFacts.length ? (
              <div className="character-facts-grid">
                {profileFacts.map(fact => {
                  const raw = fact.fact_value?.value ?? fact.fact_value;
                  const value = typeof raw === "string" ? raw : JSON.stringify(raw);
                  return <article key={fact.id}>
                    <span>{String(fact.fact_key || "detail").replace(/_/g, " ")}</span>
                    <strong>{value || "Not stated"}</strong>
                    <small>{fact.source_language?.toUpperCase() || "SOURCE"} · {fact.review_status}</small>
                  </article>;
                })}
              </div>
            ) : profileRows.length ? <Empty>The official profile is linked, but no structured fields were available from that page.</Empty> : null}
          </Section>

          <Section eyebrow="02 / VERSIONS & CONTINUITIES" title="Choose a version" count={versions.length + " VERSION RECORDS"}>
            {versions.length ? (
              <div className="character-version-list">
                {versions.map(version => (
                  <button type="button" key={version.id} className={activeVersion?.id === version.id ? "is-active" : ""} onClick={() => navigate("/character/" + entity.slug + "/versions/" + version.slug)}>
                    <span>{version.canon_status === "unknown" ? "CONTINUITY REVIEW PENDING" : String(version.canon_status).toUpperCase()}</span>
                    <strong>{version.label}</strong>
                    <small>{version.continuity || "Continuity not recorded"} · {version.status}</small>
                  </button>
                ))}
              </div>
            ) : <Empty>No version records exist yet. OMNIVEX will not combine unrelated incarnations into a composite profile.</Empty>}
          </Section>

          <Section eyebrow="03 / CAPABILITIES" title="Ability records" count={capabilities.length + " RECORDS"}>
            {capabilities.length ? (
              <div className="character-data-grid">
                {capabilities.map(item => <article key={item.id}><span>{item.dimension}</span><h3>{item.capability_name}</h3><p>{item.mechanism || "Mechanism not documented."}</p><small>{item.status} · LIMITS: {item.limitations || "Not recorded"}</small></article>)}
              </div>
            ) : <Empty>No capability claims are attached to this version yet. OMNIVEX does not fill this section with unsourced power rankings.</Empty>}
          </Section>

          <Section eyebrow="04 / FEATS & EVIDENCE" title="Source-backed claims" count={evidence.length + " RECORDS"}>
            {evidence.length ? (
              <div className="character-source-list">
                {evidence.map(item => <Link key={item.id} to={"/research/evidence/" + item.id}><span><small>{item.evidence_type} · {item.review_status} · {item.reliability_grade || "UNRATED"}</small><strong>{item.summary}</strong><p>{item.context || "No additional context recorded."}</p></span><ArrowUpRight size={16}/></Link>)}
              </div>
            ) : <Empty>No feats or evidence have been submitted for this version yet. The profile itself is live; evidence will populate as research is reviewed.</Empty>}
          </Section>

          <Section eyebrow="05 / MATCHUP HISTORY" title="Comparisons" count={matchups.length + " MATCHUPS"}>
            {matchups.length ? <div className="character-source-list">{matchups.map(item => <Link key={item.id} to={"/matchups/" + item.slug}><span><small>{item.status}</small><strong>{item.title}</strong></span><ArrowUpRight size={16}/></Link>)}</div> : <Empty>This character has no saved matchup history yet.</Empty>}
          </Section>
        </div>

        <aside className="character-side-column">
          <div className="character-side-card">
            <span className="section-kicker">SOURCE DESK</span><h2>References behind this profile</h2>
            {sources.length ? sources.map(source => <article key={source.id}><small>{source.publisher_or_host || source.source_type} · {source.review_status}</small><strong>{source.title}</strong><Link to={"/research/source/" + source.id}>Open source record in OMNIVEX <ArrowUpRight size={12}/></Link>{source.url && <a href={source.url} target="_blank" rel="noreferrer">Original publisher page <ExternalLink size={11}/></a>}</article>) : <Empty>Source references will appear here as they are linked to this identity.</Empty>}
            <p>Source pages are references; the dossier, version context and research workspace stay inside OMNIVEX.</p>
          </div>
          <div className="character-side-card character-side-card--accent">
            <Fingerprint size={18}/><span className="section-kicker">RECORD INTEGRITY</span><h2>Identity ≠ evidence</h2><p>A character name alone is not a feat, capability or canon decision. Every version and claim needs its own source context.</p>
          </div>
          <div className="character-side-card">
            <BookOpen size={18}/><span className="section-kicker">RESEARCH WORKSPACE</span><h2>Continue the investigation</h2><p>Open the evidence index to inspect related sources and review states.</p><Link to="/research">Open Research <ArrowUpRight size={14}/></Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
