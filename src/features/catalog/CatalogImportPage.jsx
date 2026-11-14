import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, Download, LoaderCircle, Pause, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../app/providers/AuthProvider.jsx";

const TARGET_ENTITY_COUNT = 1000;

export default function CatalogImportPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ entities: 0, profiles: 0, facts: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [running, setRunning] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [activeBatch, setActiveBatch] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const stopRef = useRef(false);

  const refreshCounts = async () => {
    if (!supabase) return null;
    const [entities, profiles, facts] = await Promise.all([
      supabase.from("entities").select("id", { count: "exact", head: true }).eq("entity_type", "character"),
      supabase.from("entity_profiles").select("id", { count: "exact", head: true }),
      supabase.from("entity_profile_facts").select("id", { count: "exact", head: true })
    ]);
    const failure = entities.error || profiles.error || facts.error;
    if (failure) throw failure;
    const next = {
      entities: entities.count || 0,
      profiles: profiles.count || 0,
      facts: facts.count || 0
    };
    setCounts(next);
    return next;
  };

  useEffect(() => {
    let active = true;
    refreshCounts().catch(loadError => {
      if (active) setError(loadError?.message || "Could not read catalog totals.");
    }).finally(() => {
      if (active) setLoadingCounts(false);
    });
    return () => { active = false; };
  }, []);

  const addLog = item => {
    setLogs(old => [...old.slice(-11), { id: Date.now() + Math.random(), ...item }]);
  };

  const runPage = async (source, page) => {
    const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
      body: { action: "official_catalog_page", source, page }
    });
    if (invokeError) {\n      let detail = invokeError.message || "Official catalog import request failed.";\n      try { const payload = await invokeError.context?.json?.(); if (payload?.error) detail = payload.error; } catch {}\n      throw new Error(detail);\n    }
    if (!data || data.error) throw new Error(data?.error || "The catalog importer returned no data.");
    addLog({
      source: source === "dc" ? "DC" : "ONE PIECE",
      page,
      imported: data.imported || 0,
      skipped: data.skipped || 0,
      failed: data.failed || 0,
      candidates: data.candidates || 0
    });
    return data;
  };

  const startImport = async () => {
    if (!supabase || !user || running) return;
    setRunning(true);
    setStopRequested(false);
    stopRef.current = false;
    setError("");
    setLogs([]);
    let totals;
    try {
      totals = await refreshCounts();
      if ((totals?.entities || 0) >= TARGET_ENTITY_COUNT) {
        addLog({ source: "Catalog", page: "complete", imported: 0, skipped: 0, failed: 0, candidates: 0, message: "The database already contains at least 1,000 character records." });
        return;
      }

      const sources = [
        { key: "dc", label: "DC", pages: Array.from({ length: 13 }, (_, index) => index + 1) },
        { key: "one_piece", label: "ONE PIECE", pages: Array.from({ length: 42 }, (_, index) => index + 1) }
      ];

      for (const source of sources) {
        for (const page of source.pages) {
          if (stopRef.current) break;
          totals = await refreshCounts();
          if ((totals?.entities || 0) >= TARGET_ENTITY_COUNT) break;
          setActiveBatch(source.label + " · page " + page);
          const result = await runPage(source.key, page);
          totals = await refreshCounts();
          if (result.failed > 0 && result.imported === 0 && result.skipped === 0) {
            throw new Error(source.label + " page " + page + " could not be imported. Check the page log and try again later.");
          }
        }
        totals = await refreshCounts();
        if ((totals?.entities || 0) >= TARGET_ENTITY_COUNT || stopRef.current) break;
      }

      totals = await refreshCounts();
      if ((totals?.entities || 0) >= TARGET_ENTITY_COUNT) {
        addLog({ source: "Catalog", page: "complete", imported: 0, skipped: 0, failed: 0, candidates: 0, message: "Target reached: " + totals.entities.toLocaleString() + " indexed characters." });
      } else if (stopRef.current) {
        addLog({ source: "Catalog", page: "paused", imported: 0, skipped: 0, failed: 0, candidates: 0, message: "Paused by you. Run again to continue; existing profiles are deduplicated." });
      } else {
        addLog({ source: "Catalog", page: "sources-exhausted", imported: 0, skipped: 0, failed: 0, candidates: 0, message: "Available official directory pages were exhausted before the target was reached." });
      }
    } catch (runError) {
      setError(runError?.message || "The official character import stopped.");
    } finally {
      setActiveBatch("");
      setRunning(false);
      setStopRequested(false);
      await refreshCounts().catch(() => {});
    }
  };

  const requestStop = () => {
    stopRef.current = true;
    setStopRequested(true);
  };

  const percent = Math.min(100, Math.round((counts.entities / TARGET_ENTITY_COUNT) * 100));

  return (
    <main className="atlas-feature-page catalog-import-page">
      <header className="catalog-import-hero">
        <div>
          <span className="section-kicker">OMNIVEX / DATA OPERATIONS</span>
          <h1>Official character catalog</h1>
          <p>Build the first 1,000 indexed identities from publisher-owned character directories, with source-linked profile facts and review states.</p>
          <div className="catalog-import-actions">
            {user ? (
              <button type="button" className="atlas-button atlas-button--dark" onClick={startImport} disabled={running || loadingCounts}>
                {running ? <LoaderCircle className="catalog-spin" size={16}/> : <Download size={16}/>}
                {running ? "Import running…" : "Populate database to 1,000"}
              </button>
            ) : (
              <Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in to import</Link>
            )}
            {running && <button type="button" className="atlas-button atlas-button--outline" onClick={requestStop}><Pause size={15}/> Stop after this batch</button>}
            <button type="button" className="catalog-refresh-button" disabled={running || loadingCounts} onClick={() => refreshCounts().catch(loadError => setError(loadError.message))}><RefreshCw size={15}/> Refresh totals</button>
          </div>
        </div>
        <div className="catalog-import-mark"><Database size={34}/><strong>1K</strong><span>IDENTITY TARGET</span></div>
      </header>

      {!user && <p className="platform-notice">Sign in to run imports. Every imported record is attributed to your OMNIVEX account.</p>}
      {error && <p className="platform-notice platform-notice--error"><AlertTriangle size={15}/> {error}</p>}

      <section className="catalog-import-stats">
        <article><span>CHARACTER RECORDS</span><strong>{loadingCounts ? "—" : counts.entities.toLocaleString()}</strong><small>Target: 1,000 character records</small></article>
        <article><span>OFFICIAL PROFILE RECORDS</span><strong>{loadingCounts ? "—" : counts.profiles.toLocaleString()}</strong><small>Separate source-specific profiles</small></article>
        <article><span>FIELD-LEVEL FACTS</span><strong>{loadingCounts ? "—" : counts.facts.toLocaleString()}</strong><small>Each fact links to a source record</small></article>
      </section>

      <section className="catalog-progress-section">
        <div className="catalog-progress-heading"><div><span className="section-kicker">CATALOG PROGRESS</span><h2>{percent}% populated</h2></div><strong>{counts.entities.toLocaleString()} / {TARGET_ENTITY_COUNT.toLocaleString()}</strong></div>
        <div className="catalog-progress-track"><span style={{ width: percent + "%" }}/></div>
        {running && <p className="catalog-current-batch"><LoaderCircle className="catalog-spin" size={14}/> Fetching {activeBatch}. Keep this page open while batches run.</p>}
      </section>

      <section className="catalog-source-grid">
        <article>
          <span className="section-kicker">SOURCE 01</span>
          <h2>DC official character directory</h2>
          <p>Uses DC's official directory filtered to individual characters. Each imported record links to its first-party profile page.</p>
          <a href="https://www.dc.com/characters" target="_blank" rel="noreferrer">Open DC directory ↗</a>
        </article>
        <article>
          <span className="section-kicker">SOURCE 02</span>
          <h2>ONE PIECE official character index</h2>
          <p>Uses ONE PIECE.com's official character index and individual profile pages. Japanese source fields remain labelled as Japanese rather than silently mistranslated.</p>
          <a href="https://one-piece.com/character/syllabary/index.html" target="_blank" rel="noreferrer">Open official character index ↗</a>
        </article>
      </section>

      <section className="catalog-integrity-note">
        <ShieldCheck size={18}/>
        <div><strong>Provenance and review are enforced</strong><p>Imported identities remain provisional. Profile facts and source records remain submitted until reviewed. A publisher profile is not automatically a verified feat, ability claim, or continuity ruling. Unsupported fields remain empty; the importer does not create powers, relationships, or biography details from guesses.</p></div>
      </section>

      <section className="catalog-log-section">
        <div className="catalog-log-heading"><div><span className="section-kicker">IMPORT LOG</span><h2>Recent batches</h2></div><span>{logs.length} entries shown</span></div>
        {logs.length ? <div className="catalog-log-list">{logs.map(item => (
          <article key={item.id}>
            <div><strong>{item.source}</strong><span>Page {item.page}</span></div>
            {item.message ? <p>{item.message}</p> : <p>{item.imported} imported · {item.skipped} already indexed · {item.failed} failed · {item.candidates} candidates</p>}
            {item.failed > 0 && <small>{item.failed} source profile(s) could not be fetched or parsed.</small>}
          </article>
        ))}</div> : <div className="catalog-empty"><CheckCircle2 size={19}/><p>No import batches have run in this session yet. The importer skips existing identities and can be restarted safely.</p></div>}
      </section>
    </main>
  );
}
