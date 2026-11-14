import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, Download, LoaderCircle, Pause, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../app/providers/AuthProvider.jsx";

const TARGET_ENTITY_COUNT = 1000;

export default function CatalogImportPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ entities: 0, profiles: 0, facts: 0, media: 0, evidence: 0, capabilities: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [running, setRunning] = useState(false);
  const [testing, setTesting] = useState(false);
  const [enrichmentRunning, setEnrichmentRunning] = useState(false);
  const [marvelRunning, setMarvelRunning] = useState(false);
  const [enrichmentOffset, setEnrichmentOffset] = useState(0);
  const [marvelOffset, setMarvelOffset] = useState(0);
  const [enrichmentHasMore, setEnrichmentHasMore] = useState(true);
  const [marvelHasMore, setMarvelHasMore] = useState(true);
  const [stopRequested, setStopRequested] = useState(false);
  const [activeBatch, setActiveBatch] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const stopRef = useRef(false);

  const refreshCounts = async () => {
    if (!supabase) return null;
    const [entities, profiles, facts, media, evidence, capabilities] = await Promise.all([
      supabase.from("entities").select("id", { count: "exact", head: true }).eq("entity_type", "character"),
      supabase.from("entity_profiles").select("id", { count: "exact", head: true }),
      supabase.from("entity_profile_facts").select("id", { count: "exact", head: true }),
      supabase.from("entity_media").select("id", { count: "exact", head: true }),
      supabase.from("evidence_records").select("id", { count: "exact", head: true }),
      supabase.from("capabilities").select("id", { count: "exact", head: true })
    ]);
    const failure = entities.error || profiles.error || facts.error || media.error || evidence.error || capabilities.error;
    if (failure) throw failure;
    const next = {
      entities: entities.count || 0,
      profiles: profiles.count || 0,
      facts: facts.count || 0,
      media: media.count || 0,
      evidence: evidence.count || 0,
      capabilities: capabilities.count || 0
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

  const runPage = async (source, page, dryRun = false) => {
    const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
      body: { action: "official_catalog_page", source, page, dryRun }
    });
    if (invokeError) {
      let detail = invokeError.message || "Official catalog import request failed.";
      const response = invokeError.context;
      if (response && typeof response.clone === "function") {
        try {
          const raw = await response.clone().text();
          if (raw) {
            try {
              const payload = JSON.parse(raw);
              if (payload?.error) detail = payload.error;
              else detail = raw.slice(0, 500);
            } catch {
              detail = raw.slice(0, 500);
            }
          }
        } catch {}
      }
      throw new Error(detail);
    }
    if (!data || data.error) throw new Error(data?.error || "The catalog importer returned no data.");
    if (dryRun) {
      const sampleText = (data.sample || []).map(item =>
        (item.directory_name || "Unknown") + " -> " + (item.profile_heading || item.profile_title || item.error || "No profile heading")
      ).join(" | ");
      addLog({
        source: source === "dc" ? "DC TEST" : "ONE PIECE TEST",
        page,
        imported: 0,
        skipped: 0,
        failed: (data.sample || []).filter(item => item.error).length,
        candidates: data.directory_candidates || 0,
        message: "Dry run only; 0 records written. Sample: " + (sampleText || "No profile samples returned.")
      });
      return data;
    }
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

  const testSource = async source => {
    if (!supabase || !user || running || testing) return;
    setTesting(true);
    setError("");
    try {
      await runPage(source, 1, true);
    } catch (testError) {
      setError(testError?.message || "Catalog dry run failed.");
    } finally {
      setTesting(false);
    }
  };

  const runResearchBatch = async (action, body) => {
    const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", { body: { action, ...body } });
    if (invokeError) {
      let detail = invokeError.message || "Catalogue enrichment request failed.";
      const response = invokeError.context;
      if (response && typeof response.clone === "function") {
        try {
          const raw = await response.clone().text();
          if (raw) {
            try {
              const payload = JSON.parse(raw);
              if (payload?.error) detail = payload.error;
              else detail = raw.slice(0, 500);
            } catch {
              detail = raw.slice(0, 500);
            }
          }
        } catch {}
      }
      throw new Error(detail);
    }
    if (!data || data.error) throw new Error(data?.error || "The enrichment service returned no data.");
    return data;
  };

  const enrichExistingBatch = async () => {
    if (!supabase || !user || running || testing || enrichmentRunning || marvelRunning || !enrichmentHasMore) return;
    setEnrichmentRunning(true);
    setError("");
    setActiveBatch("Existing characters · " + (enrichmentOffset + 1) + " onward");
    try {
      const data = await runResearchBatch("enrich_existing_catalog_batch", { offset: enrichmentOffset, limit: 3 });
      setEnrichmentOffset(data.next_offset || enrichmentOffset);
      setEnrichmentHasMore(Boolean(data.has_more));
      const summary = (data.results || []).map(item =>
        item.name + (item.skipped
          ? " — skipped: " + (item.reason || "No safe match")
          : " — " + (item.image?.imported ? "image added" : "no licensed image") +
            ", " + (item.evidence_created || 0) + " feat candidates")
      ).join(" · ");
      addLog({
        source: "EXISTING ENTITY ENRICHMENT",
        page: "offset " + enrichmentOffset,
        imported: (data.results || []).filter(item => !item.skipped).length,
        skipped: (data.results || []).filter(item => item.skipped).length,
        failed: 0,
        candidates: data.processed || 0,
        message: summary || "No existing characters returned in this batch."
      });
      await refreshCounts();
    } catch (batchError) {
      setError(batchError?.message || "Existing character enrichment failed.");
    } finally {
      setActiveBatch("");
      setEnrichmentRunning(false);
    }
  };

  const importMarvelBatch = async () => {
    if (!supabase || !user || running || testing || enrichmentRunning || marvelRunning || !marvelHasMore) return;
    setMarvelRunning(true);
    setError("");
    setActiveBatch("Marvel Universe · " + (marvelOffset + 1) + " onward");
    try {
      const data = await runResearchBatch("import_marvel_batch", { offset: marvelOffset, limit: 3 });
      setMarvelOffset(data.next_offset || marvelOffset);
      setMarvelHasMore(Boolean(data.has_more));
      const summary = (data.results || []).map(item =>
        item.name + (item.skipped
          ? " — skipped: " + (item.reason || "Import unavailable")
          : " — " + (item.image?.imported ? "licensed image queued" : "image unavailable") +
            ", " + (item.evidence_created || 0) + " feat candidates")
      ).join(" · ");
      addLog({
        source: "MARVEL UNIVERSE",
        page: "offset " + marvelOffset,
        imported: data.imported || 0,
        skipped: data.skipped || 0,
        failed: 0,
        candidates: data.candidates || 0,
        message: summary || "No Marvel character candidates were returned."
      });
      await refreshCounts();
    } catch (batchError) {
      setError(batchError?.message || "Marvel import failed.");
    } finally {
      setActiveBatch("");
      setMarvelRunning(false);
    }
  };

  const runBatch = async (source, pageStart, pageEnd) => {
    const { data, error: invokeError } = await supabase.functions.invoke("omnivex-research", {
      body: { action: "official_catalog_batch", source, pageStart, pageEnd }
    });
    if (invokeError) {
      let detail = invokeError.message || "Official catalog batch request failed.";
      const response = invokeError.context;
      if (response && typeof response.clone === "function") {
        try {
          const raw = await response.clone().text();
          if (raw) {
            try {
              const payload = JSON.parse(raw);
              if (payload?.error) detail = payload.error;
              else detail = raw.slice(0, 500);
            } catch {
              detail = raw.slice(0, 500);
            }
          }
        } catch {}
      }
      throw new Error(detail);
    }
    if (!data || data.error) throw new Error(data?.error || "The catalog batch returned no data.");
    addLog({
      source: source === "dc" ? "DC" : "ONE PIECE",
      page: pageStart === pageEnd ? pageStart : pageStart + "–" + pageEnd,
      imported: data.imported || 0,
      skipped: data.skipped || 0,
      failed: data.failed || 0,
      candidates: data.candidates || 0,
      message: (data.pages || []).map(item =>
        "Page " + item.page + ": " + (item.imported || 0) + " imported, " +
        (item.skipped || 0) + " already indexed, " + (item.failed || 0) + " failed"
      ).join(" · ")
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
    try {
      await refreshCounts();
      const sources = [
        { key: "dc", label: "DC", lastPage: 13 },
        { key: "one_piece", label: "ONE PIECE", lastPage: 42 }
      ];

      // Each request handles up to three directory pages; two pages are fetched concurrently server-side.
      for (const source of sources) {
        for (let pageStart = 1; pageStart <= source.lastPage; pageStart += 3) {
          if (stopRef.current) break;
          const pageEnd = Math.min(source.lastPage, pageStart + 2);
          setActiveBatch(source.label + " · pages " + pageStart + "–" + pageEnd);
          const result = await runBatch(source.key, pageStart, pageEnd);
          if (result.failed > 0 && result.imported === 0 && result.skipped === 0) {
            throw new Error(source.label + " pages " + pageStart + "–" + pageEnd + " could not be imported. Check the page log and retry.");
          }
          await refreshCounts();
        }
        if (stopRef.current) break;
      }

      const totals = await refreshCounts();
      if (stopRef.current) {
        addLog({ source: "Catalog", page: "paused", imported: 0, skipped: 0, failed: 0, candidates: 0, message: "Paused by you. Run again to continue; existing profile URLs are checked before insertion." });
      } else {
        addLog({
          source: "Catalog",
          page: "complete",
          imported: 0,
          skipped: 0,
          failed: 0,
          candidates: 0,
          message: "All available official directory pages were processed. Current character-record count: " + (totals?.entities || 0).toLocaleString() + ". The 1K bar is a milestone, not a reason to stop before source coverage is complete."
        });
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
          <p>Import complete publisher-owned character directories in bounded batches, with source-linked profile facts and review states.</p>
          <div className="catalog-import-actions">
            {user ? (
              <button type="button" className="atlas-button atlas-button--dark" onClick={startImport} disabled={running || testing || enrichmentRunning || marvelRunning || loadingCounts}>
                {running ? <LoaderCircle className="catalog-spin" size={16}/> : <Download size={16}/>}
                {running ? "Import running…" : "Import full official catalog"}
              </button>
            ) : (
              <Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in to import</Link>
            )}
            {user && <>
              <button type="button" className="atlas-button atlas-button--outline" onClick={() => testSource("dc")} disabled={running || testing || enrichmentRunning || marvelRunning}>{testing ? "Testing…" : "Test DC page 1"}</button>
              <button type="button" className="atlas-button atlas-button--outline" onClick={() => testSource("one_piece")} disabled={running || testing || enrichmentRunning || marvelRunning}>{testing ? "Testing…" : "Test ONE PIECE page 1"}</button>
            </>}
            {running && <button type="button" className="atlas-button atlas-button--outline" onClick={requestStop}><Pause size={15}/> Stop after this batch</button>}
            <button type="button" className="catalog-refresh-button" disabled={running || testing || loadingCounts} onClick={() => refreshCounts().catch(loadError => setError(loadError.message))}><RefreshCw size={15}/> Refresh totals</button>
          </div>
        </div>
        <div className="catalog-import-mark"><Database size={34}/><strong>1K</strong><span>IDENTITY TARGET</span></div>
      </header>

      {!user && <p className="platform-notice">Sign in to run imports. Every imported record is attributed to your OMNIVEX account.</p>}
      {error && <p className="platform-notice platform-notice--error"><AlertTriangle size={15}/> {error}</p>}

      <section className="catalog-import-stats">
        <article><span>CHARACTER RECORDS</span><strong>{loadingCounts ? "—" : counts.entities.toLocaleString()}</strong><small>Target: 1,000 character records</small></article>
        <article><span>PROFILE RECORDS</span><strong>{loadingCounts ? "—" : counts.profiles.toLocaleString()}</strong><small>Publisher and research profiles</small></article>
        <article><span>PROFILE FACTS</span><strong>{loadingCounts ? "—" : counts.facts.toLocaleString()}</strong><small>Source-linked lore and identity fields</small></article>
        <article><span>ARTWORK RECORDS</span><strong>{loadingCounts ? "—" : counts.media.toLocaleString()}</strong><small>Licensed image submissions / approved media</small></article>
        <article><span>FEAT CANDIDATES</span><strong>{loadingCounts ? "—" : counts.evidence.toLocaleString()}</strong><small>Evidence records, not auto-verified</small></article>
        <article><span>CAPABILITY CLAIMS</span><strong>{loadingCounts ? "—" : counts.capabilities.toLocaleString()}</strong><small>Source-supported abilities</small></article>
      </section>

      <section className="catalog-progress-section">
        <div className="catalog-progress-heading"><div><span className="section-kicker">CATALOG PROGRESS</span><h2>{percent}% populated</h2></div><strong>{counts.entities.toLocaleString()} / {TARGET_ENTITY_COUNT.toLocaleString()}</strong></div>
        <div className="catalog-progress-track"><span style={{ width: percent + "%" }}/></div>
        {(running || enrichmentRunning || marvelRunning) && <p className="catalog-current-batch"><LoaderCircle className="catalog-spin" size={14}/> Processing {activeBatch}. Keep this page open while batches run.</p>}
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

      <section className="catalog-source-grid catalog-enrichment-grid">
        <article>
          <span className="section-kicker">ENRICH EXISTING RECORDS</span>
          <h2>Lore, licensed artwork & feat candidates</h2>
          <p>Enrich existing character records from exact Wikidata matches, Commons files with recognizable reuse licenses, and linked Wikipedia research pages. Results remain source-linked and submitted for review.</p>
          {user ? (
            <button type="button" className="atlas-button atlas-button--dark" onClick={enrichExistingBatch}
              disabled={running || testing || enrichmentRunning || marvelRunning || !enrichmentHasMore}>
              {enrichmentRunning ? <LoaderCircle className="catalog-spin" size={16}/> : <RefreshCw size={16}/>}
              {enrichmentRunning ? "Enriching…" : enrichmentHasMore ? "Enrich next 3 existing characters" : "Existing scan complete"}
            </button>
          ) : <Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in to enrich</Link>}
          <small>Progress cursor: {enrichmentOffset.toLocaleString()} · no ambiguous identity matches are attached</small>
        </article>
        <article>
          <span className="section-kicker">NEW UNIVERSE / MARVEL</span>
          <h2>Marvel Comics character index</h2>
          <p>Import Marvel Universe character identities from Wikidata's community-curated Marvel Universe index, then attach licensed Commons artwork and research links when available. This is not an official Marvel API feed.</p>
          {user ? (
            <button type="button" className="atlas-button atlas-button--dark" onClick={importMarvelBatch}
              disabled={running || testing || enrichmentRunning || marvelRunning || !marvelHasMore}>
              {marvelRunning ? <LoaderCircle className="catalog-spin" size={16}/> : <Download size={16}/>}
              {marvelRunning ? "Importing Marvel…" : marvelHasMore ? "Import next 3 Marvel characters" : "Marvel index exhausted"}
            </button>
          ) : <Link className="atlas-button atlas-button--dark" to="/auth/sign-in">Sign in to import Marvel</Link>}
          <small>Progress cursor: {marvelOffset.toLocaleString()} · main Marvel Comics universe; exact continuity unresolved</small>
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
