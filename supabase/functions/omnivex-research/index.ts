import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function cleanText(value: unknown, max = 500) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function fetchJson(url: string, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "OMNIVEX/0.4 (public source discovery)", ...headers },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error("Provider returned HTTP " + response.status);
  return await response.json();
}

function yearFrom(value: unknown) {
  if (!value) return null;
  const match = String(value).match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/);
  return match ? Number(match[1]) : null;
}

async function searchWikidata(query: string) {
  const params = new URLSearchParams({
    action: "wbsearchentities", search: query, language: "en", limit: "6", format: "json", origin: "*"
  });
  const data = await fetchJson("https://www.wikidata.org/w/api.php?" + params.toString());
  return (data.search || []).map((item: any) => ({
    key: "wikidata:" + item.id,
    provider: "Wikidata",
    providerId: item.id,
    name: cleanText(item.label, 160),
    description: cleanText(item.description, 360),
    url: item.concepturi || ("https://www.wikidata.org/wiki/" + item.id),
    entityType: "subject"
  })).filter((item: any) => item.name && item.providerId);
}

async function searchWikipedia(query: string) {
  const params = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: query, gsrnamespace: "0", gsrlimit: "6",
    prop: "extracts|info", inprop: "url", exintro: "1", explaintext: "1", exchars: "420",
    format: "json", origin: "*"
  });
  const data = await fetchJson("https://en.wikipedia.org/w/api.php?" + params.toString());
  const pages = Object.values(data.query?.pages || {}) as any[];
  return pages.map((page: any) => ({
    key: "wikipedia:" + page.pageid,
    provider: "Wikipedia",
    title: cleanText(page.title, 200),
    url: page.fullurl || ("https://en.wikipedia.org/wiki/" + encodeURIComponent(String(page.title || "").replace(/ /g, "_"))),
    sourceType: "reference_article",
    publisher: "Wikipedia",
    snippet: cleanText(page.extract, 420),
    externalId: String(page.pageid)
  })).filter((item: any) => item.title && item.url);
}

async function searchCrossref(query: string) {
  const params = new URLSearchParams({
    "query.bibliographic": query, rows: "4",
    select: "DOI,title,author,publisher,published-print,published-online,type,URL"
  });
  const data = await fetchJson("https://api.crossref.org/works?" + params.toString(), {
    "User-Agent": "OMNIVEX/0.4 (mailto:research@omnivex.app)"
  });
  return (data.message?.items || []).map((item: any) => {
    const title = cleanText(item.title?.[0], 200);
    const author = (item.author || []).slice(0, 3).map((person: any) =>
      [person.given, person.family].filter(Boolean).join(" ")
    ).filter(Boolean).join(", ");
    const dateParts = item["published-print"]?.["date-parts"]?.[0] || item["published-online"]?.["date-parts"]?.[0];
    const publishedYear = Number(dateParts?.[0]) || null;
    return {
      key: "crossref:" + cleanText(item.DOI, 180),
      provider: "Crossref",
      title,
      url: item.URL || (item.DOI ? "https://doi.org/" + item.DOI : ""),
      sourceType: "scholarly_article",
      publisher: cleanText(item.publisher, 160) || "Crossref record",
      author,
      publishedYear,
      snippet: cleanText(item.type, 120) + (publishedYear ? " · Published " + publishedYear : ""),
      externalId: cleanText(item.DOI, 180)
    };
  }).filter((item: any) => item.title && item.url);
}

async function searchOpenLibrary(query: string) {
  const params = new URLSearchParams({
    q: query, limit: "4", fields: "key,title,author_name,first_publish_year,edition_count"
  });
  const data = await fetchJson("https://openlibrary.org/search.json?" + params.toString());
  return (data.docs || []).map((item: any) => ({
    key: "openlibrary:" + cleanText(item.key, 180),
    provider: "Open Library",
    title: cleanText(item.title, 200),
    url: item.key ? "https://openlibrary.org" + item.key : "",
    sourceType: "catalog_record",
    publisher: "Open Library",
    author: cleanText((item.author_name || []).slice(0, 3).join(", "), 180),
    publishedYear: Number(item.first_publish_year) || null,
    snippet: (Number(item.edition_count) || 0) + " catalogued edition(s)",
    externalId: cleanText(item.key, 180)
  })).filter((item: any) => item.title && item.url);
}

async function searchJikan(query: string) {
  const params = new URLSearchParams({ q: query, limit: "5" });
  const data = await fetchJson("https://api.jikan.moe/v4/characters?" + params.toString());
  return (data.data || []).map((item: any) => ({
    key: "jikan:" + String(item.mal_id),
    provider: "MyAnimeList / Jikan",
    providerId: String(item.mal_id),
    name: cleanText(item.name, 160),
    description: cleanText(item.about, 360),
    url: item.url || ("https://myanimelist.net/character/" + item.mal_id),
    entityType: "character",
    favorites: Number(item.favorites) || 0
  })).filter((item: any) => item.name && item.providerId);
}

async function settleProvider(name: string, task: () => Promise<any[]>) {
  try {
    const results = await task();
    return { name, ok: true, count: results.length, results };
  } catch (_error) {
    return { name, ok: false, count: 0, results: [] as any[] };
  }
}

async function discover(query: string) {
  const providerResults = await Promise.all([
    settleProvider("Wikidata", () => searchWikidata(query)),
    settleProvider("Wikipedia", () => searchWikipedia(query)),
    settleProvider("Crossref", () => searchCrossref(query)),
    settleProvider("Open Library", () => searchOpenLibrary(query)),
    settleProvider("MyAnimeList / Jikan", () => searchJikan(query))
  ]);

  const candidates = [
    ...providerResults.find((item) => item.name === "Wikidata")!.results,
    ...providerResults.find((item) => item.name === "MyAnimeList / Jikan")!.results
  ];

  const uniqueSources = new Map<string, any>();
  for (const provider of providerResults) {
    for (const item of provider.results) {
      if (!item.url) continue;
      try {
        const parsed = new URL(item.url);
        if (parsed.protocol !== "https:") continue;
        const key = parsed.origin + parsed.pathname.replace(/\/+$/, "");
        if (!uniqueSources.has(key)) uniqueSources.set(key, item);
      } catch (_error) {
        continue;
      }
    }
  }

  const sources = Array.from(uniqueSources.values()).slice(0, 18).map((item: any) => ({
    key: item.key,
    provider: item.provider,
    title: item.title || item.name,
    url: item.url,
    sourceType: item.sourceType || "reference_database",
    publisher: item.publisher || item.provider,
    author: item.author || null,
    publishedYear: item.publishedYear || null,
    snippet: item.snippet || item.description || "",
    externalId: item.externalId || item.providerId || null
  }));

  return {
    query,
    candidates: candidates.slice(0, 10),
    sources,
    providers: providerResults.map(({ name, ok, count }) => ({
      name, status: ok ? (count ? "available" : "no_matches") : "temporarily_unavailable", resultCount: count
    })),
    notice: "Discovery metadata is not factual verification. Entity imports remain provisional; source records remain submitted until reviewed."
  };
}

function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const keyJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  let publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (keyJson) {
    try {
      const keys = JSON.parse(keyJson);
      publishableKey = keys.default || Object.values(keys)[0] as string || publishableKey;
    } catch (_error) {
      // Fall back to the legacy anon key when the key dictionary is unavailable.
    }
  }
  if (!supabaseUrl || !publishableKey) throw new Error("Supabase function environment is missing its URL or publishable key.");
  const authorization = req.headers.get("Authorization");
  const client = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: authorization ? { headers: { Authorization: authorization } } : undefined
  });
  return { client, authorization };
}

async function requireUser(client: any, authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  if (!token || token.length < 40) return null;
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}

function sourceHostAllowed(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    return [
      "wikipedia.org", "wikidata.org", "crossref.org", "doi.org",
      "openlibrary.org", "myanimelist.net"
    ].some((domain) => host === domain || host.endsWith("." + domain));
  } catch (_error) {
    return false;
  }
}

async function saveSource(client: any, userId: string, source: any) {
  const url = cleanText(source?.url, 1000);
  if (!sourceHostAllowed(url)) throw new Error("This source URL is not from a supported discovery provider.");
  const title = cleanText(source?.title, 200);
  if (!title) throw new Error("A source title is required.");

  const { data: existing, error: lookupError } = await client.from("source_records")
    .select("id,title,url,review_status").eq("url", url).limit(1).maybeSingle();
  if (lookupError) throw new Error("Could not check the source library: " + lookupError.message);
  if (existing) return { source: existing, alreadySaved: true };

  const { data, error } = await client.from("source_records").insert({
    title,
    source_type: cleanText(source.sourceType, 60) || "reference",
    publisher_or_host: cleanText(source.publisher, 160) || new URL(url).hostname,
    author_or_creator: cleanText(source.author, 180) || null,
    url,
    source_notes: "Discovered online by OMNIVEX. Search metadata only; no feat or interpretation has been verified.",
    submitted_by: userId,
    review_status: "submitted"
  }).select("id,title,url,source_type,publisher_or_host,review_status").single();
  if (error) throw new Error("Could not save source: " + error.message);
  return { source: data, alreadySaved: false };
}

async function importWikidata(client: any, userId: string, itemId: string) {
  if (!/^Q[1-9]\d{0,11}$/.test(itemId)) throw new Error("Invalid Wikidata identifier.");
  const params = new URLSearchParams({
    action: "wbgetentities", ids: itemId, props: "labels|descriptions|aliases|claims|sitelinks",
    languages: "en", format: "json", origin: "*"
  });
  const data = await fetchJson("https://www.wikidata.org/w/api.php?" + params.toString());
  const item = data.entities?.[itemId];
  if (!item || item.missing !== undefined) throw new Error("Wikidata could not resolve that entity.");
  const name = cleanText(item.labels?.en?.value, 160);
  if (!name) throw new Error("The selected reference has no English label.");
  const description = cleanText(item.descriptions?.en?.value, 360);
  const instanceIds = (item.claims?.P31 || []).map((claim: any) => claim.mainsnak?.datavalue?.value?.id).filter(Boolean);
  let entityType = "subject";
  if (instanceIds.includes("Q95074")) entityType = "character";
  else if (instanceIds.includes("Q5")) entityType = "person";
  else if (instanceIds.includes("Q16521") || instanceIds.includes("Q729")) entityType = "animal";
  const slug = (slugify(name) || "subject") + "-" + itemId.toLowerCase();
  const { data: existing, error: existingError } = await client.from("entities")
    .select("id,slug,name,entity_type,status").eq("slug", slug).maybeSingle();
  if (existingError) throw new Error("Could not check the entity index: " + existingError.message);

  let entity = existing;
  if (!entity) {
    const { data: created, error } = await client.from("entities").insert({
      slug, name, entity_type: entityType, short_description: description || null,
      status: "provisional", created_by: userId
    }).select("id,slug,name,entity_type,status").single();
    if (error) throw new Error("Could not create provisional entity: " + error.message);
    entity = created;
  }

  const { data: versionRows, error: versionLookupError } = await client.from("entity_versions")
    .select("id,slug,label,continuity,canon_status,status,is_primary_version")
    .eq("entity_id", entity.id).order("created_at", { ascending: true }).limit(20);
  if (versionLookupError) throw new Error("Could not check entity versions: " + versionLookupError.message);
  let version = (versionRows || []).find((row: any) => row.is_primary_version) || versionRows?.[0] || null;
  if (!version) {
    const { data: createdVersion, error } = await client.from("entity_versions").insert({
      entity_id: entity.id,
      slug: "unspecified-continuity",
      label: "Unspecified continuity",
      continuity: "Unspecified",
      canon_status: "unknown",
      is_composite: false,
      is_primary_version: true,
      status: "provisional",
      created_by: userId
    }).select("id,slug,label,continuity,canon_status,status,is_primary_version").single();
    if (error) throw new Error("Could not create the provisional version: " + error.message);
    version = createdVersion;
  }

  const wikiUrl = item.sitelinks?.enwiki?.url || ("https://www.wikidata.org/wiki/" + itemId);
  const saved = await saveSource(client, userId, {
    title: "Wikidata: " + name,
    url: wikiUrl,
    sourceType: "reference_database",
    publisher: item.sitelinks?.enwiki ? "Wikipedia" : "Wikidata",
    author: null
  });
  return {
    entity,
    version,
    source: saved.source,
    alreadyIndexed: Boolean(existing),
    description,
    note: "Imported as provisional identity metadata. No capabilities, feats, canon interpretation or artwork were generated."
  };
}

async function importJikan(client: any, userId: string, malId: string) {
  if (!/^[1-9]\d{0,8}$/.test(malId)) throw new Error("Invalid MyAnimeList character identifier.");
  const data = await fetchJson("https://api.jikan.moe/v4/characters/" + malId + "/full");
  const item = data.data;
  if (!item?.name) throw new Error("The character could not be resolved from MyAnimeList.");
  const name = cleanText(item.name, 160);
  const description = cleanText(item.about, 360);
  const slug = (slugify(name) || "character") + "-mal-" + malId;
  const { data: existing, error: existingError } = await client.from("entities")
    .select("id,slug,name,entity_type,status").eq("slug", slug).maybeSingle();
  if (existingError) throw new Error("Could not check the entity index: " + existingError.message);

  let entity = existing;
  if (!entity) {
    const { data: created, error } = await client.from("entities").insert({
      slug, name, entity_type: "character", short_description: description || null,
      status: "provisional", created_by: userId
    }).select("id,slug,name,entity_type,status").single();
    if (error) throw new Error("Could not create provisional entity: " + error.message);
    entity = created;
  }

  const { data: versionRows, error: versionLookupError } = await client.from("entity_versions")
    .select("id,slug,label,continuity,canon_status,status,is_primary_version")
    .eq("entity_id", entity.id).order("created_at", { ascending: true }).limit(20);
  if (versionLookupError) throw new Error("Could not check entity versions: " + versionLookupError.message);
  let version = (versionRows || []).find((row: any) => row.is_primary_version) || versionRows?.[0] || null;
  if (!version) {
    const { data: createdVersion, error } = await client.from("entity_versions").insert({
      entity_id: entity.id, slug: "unspecified-continuity",
      label: "Unspecified continuity", continuity: "Unspecified",
      canon_status: "unknown", is_composite: false, is_primary_version: true,
      status: "provisional", created_by: userId
    }).select("id,slug,label,continuity,canon_status,status,is_primary_version").single();
    if (error) throw new Error("Could not create the provisional version: " + error.message);
    version = createdVersion;
  }

  const saved = await saveSource(client, userId, {
    title: "MyAnimeList: " + name,
    url: item.url || ("https://myanimelist.net/character/" + malId),
    sourceType: "database_record",
    publisher: "MyAnimeList via Jikan API"
  });
  return {
    entity, version, source: saved.source, alreadyIndexed: Boolean(existing),
    description,
    note: "Imported as provisional identity metadata. MyAnimeList is a community-maintained reference and is not primary canon evidence."
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    const action = cleanText(body?.action, 40);
    const { client, authorization } = getSupabaseClient(req);
    const user = await requireUser(client, authorization);

    if (action === "search") {
      const query = cleanText(body?.query, 120);
      if (query.length < 2) return reply({ error: "Enter at least two characters to search." }, 400);
      const result = await discover(query);
      return reply(result);
    }

    if (!user) return reply({ error: "Sign in to save sources or import records into the OMNIVEX index." }, 401);

    if (action === "save_source") {
      const saved = await saveSource(client, user.id, body?.source);
      return reply(saved);
    }

    if (action === "import_entity") {
      const provider = cleanText(body?.provider, 40).toLowerCase();
      const externalId = cleanText(body?.externalId, 40);
      if (provider === "wikidata") return reply(await importWikidata(client, user.id, externalId));
      if (provider === "myanimelist / jikan" || provider === "jikan") return reply(await importJikan(client, user.id, externalId));
      return reply({ error: "That entity provider is not supported for imports." }, 400);
    }

    return reply({ error: "Unknown research action." }, 400);
  } catch (error) {
    return reply({ error: cleanText(error instanceof Error ? error.message : "Research request failed.", 420) }, 500);
  }
});
