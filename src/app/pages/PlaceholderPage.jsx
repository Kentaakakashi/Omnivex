import React from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, ArrowUpRight, Database, Layers3 } from "lucide-react";

const routeCopy = {
  "/discover": ["DISCOVERY ENGINE", "Find your next rabbit hole.", "The visual discovery surface is reserved for Drift Wall. The route is live; its discovery data and destination records are not connected yet."],
  "/characters": ["ENTITY INDEX", "A universe of identities.", "The character directory is being built around version-aware records, filters and the required Chroma Grid. No sample profile is presented as a verified public record."],
  "/universes": ["UNIVERSE ATLAS", "Every world has a structure.", "The full universe explorer will use Flowing Menu and source-linked universe hubs. The homepage gallery is a featured collection, not a replacement for this directory."],
  "/matchups/create": ["MATCHUP WORKFLOW", "Define the comparison first.", "The five-stage Stepper and Option Wheel workflow will be connected here. Publishing will require a signed-in user and a valid, version-specific matchup setup."],
  "/evidence": ["EVIDENCE EXPLORER", "Trace the claim to its source.", "The evidence relationship navigator will distinguish original sources, evidence records, claims, interpretations and review status."],
  "/rankings": ["RANKING SYSTEMS", "Different signals. Different rankings.", "Popularity, discussion activity, recorded outcomes and capability research will remain separate. Ranking movement will only appear when historical data exists."],
  "/community": ["COMMUNITY ENGINE", "Bring context. Bring sources.", "Discussions, evidence submissions and contribution reactions will be connected to stored community records. No simulated engagement counts are shown here."],
  "/me": ["PERSONAL SPACE", "Your research, your library.", "Account data, private notes, saved items and notification subscriptions will be separated and protected by authenticated ownership rules."],
  "/me/library": ["SAVED LIBRARY", "Keep the things worth returning to.", "Swipe Row will manage saved relationships only. Removing an item from your library will never delete the public entity or discussion."],
  "/me/research": ["RESEARCH NOTEBOOK", "Keep the questions that matter.", "Folder Float will be connected to private, owner-scoped research notes. Notes will not be visible to other members."]
};

const resolveCopy = pathname => {
  if (pathname.startsWith("/characters/")) return ["ENTITY DOSSIER", "A record, not just a name.", "This profile route is reserved for an entity and its exact version/continuity. The dossier, Line Sidebar, source vault and related-character explorer are not connected yet."];
  if (pathname.startsWith("/universes/")) return ["UNIVERSE HUB", "Explore the world in context.", "This universe route is reserved for its directory, continuities, related entities and source works. The hub data is not connected yet."];
  if (pathname.startsWith("/matchups/")) return ["BATTLE ENGINE", "The conditions are part of the answer.", "Published matchup reports will preserve exact participants, versions, assumptions, evidence, rules and report revisions. No verdict is being simulated here."];
  if (pathname.startsWith("/evidence/")) return ["EVIDENCE RECORD", "A claim needs an origin.", "This route is reserved for a source-linked evidence record, including context, interpretation, limitations, review history and counter-evidence."];
  if (pathname.startsWith("/discussions/")) return ["DISCUSSION", "A useful argument can change its mind.", "Threaded replies, evidence references, moderation and reactions will be backed by the community data layer."];
  if (pathname.startsWith("/events/")) return ["COMMUNITY EVENT", "A reason to explore together.", "Event schedules, registrations and results will appear when real event data is connected."];
  if (pathname.startsWith("/members/")) return ["MEMBER PROFILE", "Contributions over empty counters.", "Public profile information will distinguish verified contributions from activity and popularity signals."];
  if (pathname.startsWith("/auth/")) return ["AUTHENTICATION", "Your account belongs to you.", "Supabase authentication has not been connected to this repository yet. No sign-in or session is being faked."];
  return ["OMNIVEX", "This route is being prepared.", "This page will be implemented as part of the feature architecture."];
};

export function PlaceholderPage({ title, description, eyebrow }) {
  const location = useLocation();
  const params = useParams();
  const [defaultEyebrow, defaultTitle, defaultDescription] = routeCopy[location.pathname] || resolveCopy(location.pathname);
  const routeName = params.entitySlug || params.universeSlug || params.matchupSlug || params.evidenceSlug || params.discussionSlug || params.eventSlug || params.username;
  const heading = title || (routeName ? routeName.replace(/-/g, " ") : defaultTitle);

  return (
    <section className="route-placeholder">
      <div className="route-placeholder__ornament" aria-hidden="true"><span>O</span><i>×</i><b>V</b></div>
      <div className="route-placeholder__content">
        <span className="eyebrow-tag">{eyebrow || defaultEyebrow}</span>
        <h1>{heading}</h1>
        <p>{description || defaultDescription}</p>
        <div className="route-placeholder__status">
          <span className="status-dot" />
          <span>ROUTE ACTIVE · FEATURE DATA NOT CONNECTED</span>
        </div>
        <div className="route-placeholder__actions">
          <Link to="/" className="atlas-button atlas-button--dark"><ArrowLeft size={16} /> Return home</Link>
          <span><Database size={15} /> No live or verified records are being represented here.</span>
        </div>
      </div>
      <div className="route-placeholder__index">
        <span><Layers3 size={15} /> APPLICATION ARCHITECTURE</span>
        <small>FEATURE IMPLEMENTATION IN PROGRESS</small>
        <Link to="/discover">Explore homepage <ArrowUpRight size={15} /></Link>
      </div>
    </section>
  );
}
