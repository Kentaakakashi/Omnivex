import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Fingerprint, Orbit, Search, ShieldCheck, Swords } from "lucide-react";
import { supabase } from "../../lib/supabase.js";

function HomeRecord({ record, type }) {
  const title = record.name || record.title || "Untitled record";
  const canShowArtwork = Boolean(record.artwork_url && record.artwork_source_url && record.artwork_use_basis);
  return (
    <Link className="home-record" to={type === "entity" ? "/entity/" + record.slug : type === "universe" ? "/universe/" + record.slug : "/matchups/" + record.slug}>
      <div className="home-record__art">
        {canShowArtwork ? <img src={record.artwork_url} alt={title} loading="lazy" referrerPolicy="no-referrer"/> : <span>{title.slice(0,2).toUpperCase()}</span>}
      </div>
      <div className="home-record__copy">
        <small>{type.toUpperCase()} · {record.status || "INDEXED"}</small>
        <strong>{title}</strong>
        <span>{record.short_description || record.description || "Open the record to inspect its details."}</span>
      </div>
      <ArrowUpRight size={16}/>
    </Link>
  );
}

function useHomeRecords() {
  const [data, setData] = useState({ entities: [], universes: [], matchups: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    Promise.all([
      supabase.from("entities").select("*").order("created_at", { ascending: false }).limit(4),
      supabase.from("universes").select("*").order("created_at", { ascending: false }).limit(4),
      supabase.from("matchups").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(3)
    ]).then(([entities, universes, matchups]) => {
      if (!active) return;
      setData({ entities: entities.data || [], universes: universes.data || [], matchups: matchups.data || [] });
      setError(entities.error?.message || universes.error?.message || matchups.error?.message || "");
      setLoading(false);
    }).catch(queryError => {
      if (!active) return;
      setError(queryError?.message || "Unable to load the homepage index.");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  return { ...data, loading, error };
}

function Hero() {
  return (
    <section className="platform-home-hero">
      <div className="platform-home-hero__copy">
        <span className="eyebrow-tag"><i className="eyebrow-tag__dot"/> THE MULTIVERSE FIELD ATLAS</span>
        <h1>One index.<br/><em>Countless worlds.</em></h1>
        <p>Explore identities across universes. Compare exact versions. Follow important claims back to their sources.</p>
        <div className="platform-home-hero__actions">
          <Link className="atlas-button atlas-button--dark" to="/explore">Explore the atlas <ArrowUpRight size={16}/></Link>
          <Link className="atlas-text-link" to="/matchups/new">Create a matchup <ArrowRight size={16}/></Link>
        </div>
        <div className="platform-home-principles">
          <span><ShieldCheck size={15}/> Evidence-led</span>
          <span><Fingerprint size={15}/> Version-aware</span>
          <span><Orbit size={15}/> Universe-spanning</span>
        </div>
      </div>
      <div className="platform-home-hero__visual" aria-label="Abstract multiverse field atlas illustration">
        <div className="platform-orbit platform-orbit--one"/>
        <div className="platform-orbit platform-orbit--two"/>
        <div className="platform-orbit platform-orbit--three"/>
        <div className="platform-orbit-core"><span>O<span>×</span></span><small>OMNIVEX / INDEX</small></div>
        <span className="platform-orbit-note platform-orbit-note--top">IDENTITY / VERSION / SOURCE</span>
        <span className="platform-orbit-note platform-orbit-note--bottom">A CONNECTED FIELD OF RECORDS</span>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description, href, linkText }) {
  return (
    <div className="platform-section-heading platform-home-section-heading">
      <div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
      {href && <Link className="atlas-text-link" to={href}>{linkText || "View all"} <ArrowRight size={15}/></Link>}
    </div>
  );
}

export default function HomePage() {
  const { entities, universes, matchups, loading, error } = useHomeRecords();
  return (
    <div className="platform-home">
      <Hero/>
      <section className="platform-home-quicklinks">
        <Link to="/explore"><Compass size={19}/><span><strong>Explore</strong><small>Characters, entities & worlds</small></span><ArrowUpRight size={15}/></Link>
        <Link to="/matchups"><Swords size={19}/><span><strong>Matchups</strong><small>Configure exact comparisons</small></span><ArrowUpRight size={15}/></Link>
        <Link to="/research"><BookOpen size={19}/><span><strong>Research</strong><small>Claims, sources & evidence</small></span><ArrowUpRight size={15}/></Link>
        <Link to="/community"><ShieldCheck size={19}/><span><strong>Community</strong><small>Debate with context</small></span><ArrowUpRight size={15}/></Link>
      </section>
      <main className="platform-home-content">
        {error && <p className="platform-notice platform-notice--error">{error}</p>}
        <section className="platform-section">
          <SectionHeading eyebrow="01 / UNIVERSE INDEX" title="Worlds worth exploring." description="Universe records connect source works, alternate continuities and the entities within them." href="/explore?tab=universes" linkText="All universes"/>
          {loading ? <p className="platform-loading">Loading the universe index…</p> : universes.length ? <div className="platform-card-grid platform-card-grid--home">{universes.map(item => <HomeRecord key={item.id} record={item} type="universe"/>)}</div> : <div className="platform-home-empty"><span>NO UNIVERSES INDEXED</span><p>Universe hubs will appear when verified catalogue records are available.</p></div>}
        </section>
        <section className="platform-section">
          <SectionHeading eyebrow="02 / ENTITY DIRECTORY" title="Identities, kept distinct." description="An entity is not a composite of every version it has ever had. Choose an exact incarnation inside its dossier." href="/explore?tab=characters" linkText="Browse entities"/>
          {loading ? <p className="platform-loading">Loading entity records…</p> : entities.length ? <div className="platform-home-record-list">{entities.map(item => <HomeRecord key={item.id} record={item} type="entity"/>)}</div> : <div className="platform-home-empty"><span>NO ENTITY RECORDS YET</span><p>The directory will show source-linked records, not invented sample characters.</p></div>}
        </section>
        <section className="platform-section">
          <SectionHeading eyebrow="03 / MATCHUP INDEX" title="Questions with conditions." description="Browse published comparison setups. A configuration does not imply that an analysis or verdict exists." href="/matchups" linkText="All matchups"/>
          {loading ? <p className="platform-loading">Loading matchup records…</p> : matchups.length ? <div className="platform-home-record-list">{matchups.map(item => <HomeRecord key={item.id} record={item} type="matchup"/>)}</div> : <div className="platform-home-empty"><span>NO PUBLISHED MATCHUPS</span><p>Start a comparison by selecting two exact versions and documenting the conditions.</p><Link to="/matchups/new" className="atlas-text-link">Create the first matchup <ArrowUpRight size={15}/></Link></div>}
        </section>
      </main>
      <section className="platform-home-method">
        <div><span className="section-kicker">THE OMNIVEX METHOD</span><h2>Curiosity, with <em>receipts.</em></h2></div>
        <article><span>01</span><BookOpen size={18}/><strong>Follow the source</strong><p>Keep claims connected to original context and source locators.</p></article>
        <article><span>02</span><Fingerprint size={18}/><strong>Respect the version</strong><p>Continuity and incarnation are part of every comparison.</p></article>
        <article><span>03</span><ShieldCheck size={18}/><strong>Leave room for unknowns</strong><p>When evidence is incomplete, inconclusive is a valid result.</p></article>
      </section>
      <div className="platform-home-bottom">
        <div><span className="section-kicker">START WITH A QUESTION</span><h2>Open the atlas.</h2></div>
        <Link className="atlas-button atlas-button--dark" to="/explore"><Search size={15}/> Search OMNIVEX <ArrowUpRight size={15}/></Link>
      </div>
      <p className="platform-home-disclosure">Character artwork appears only when a version-matched image has a recorded source and approved usage basis. Otherwise the interface uses a neutral visual placeholder.</p>
    </div>
  );
}
