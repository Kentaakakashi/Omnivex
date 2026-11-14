import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router";
import AppShell from "./layouts/AppShell.jsx";
import HomePage from "../features/home/HomePage.jsx";
import CharacterDetailPage from "../features/characters/CharacterDetailPage.jsx";
import CatalogImportPage from "../features/catalog/CatalogImportPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { ToastProvider } from "./providers/ToastProvider.jsx";
import {
  CommunityPage,
  DiscussionDetailPage,
  EntityDossierPage,
  EventDetailPage,
  EvidenceDetailPage,
  ExplorePage,
  LibraryNotePage,
  LibraryPage,
  MatchupCreatePage,
  MatchupDetailPage,
  MatchupsPage,
  ProfilePage,
  RankingsPage,
  ResearchPage,
  SourceDetailPage,
  UniverseHubPage
} from "../features/platform/PlatformPages.jsx";

function LegacyEntityRedirect() {
  const { entitySlug, versionSlug } = useParams();
  const destination = versionSlug
    ? "/entity/" + entitySlug + "/versions/" + versionSlug
    : "/entity/" + entitySlug;
  return <Navigate to={destination} replace />;
}
function LegacyUniverseRedirect() {
  const { universeSlug } = useParams();
  return <Navigate to={"/universe/" + universeSlug} replace />;
}
function LegacyEvidenceRedirect() {
  const { evidenceSlug } = useParams();
  return <Navigate to={"/research/evidence/" + evidenceSlug} replace />;
}
function LegacyMemberRedirect() {
  const { username } = useParams();
  return <Navigate to={"/profile/" + username} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppShell/>}>
              <Route index element={<HomePage/>}/>

              <Route path="explore" element={<ExplorePage/>}/>
              <Route path="catalog-import" element={<CatalogImportPage/>}/>
              <Route path="character/:entitySlug" element={<CharacterDetailPage/>}/>
              <Route path="character/:entitySlug/versions/:versionSlug" element={<CharacterDetailPage/>}/>
              <Route path="entity/:entitySlug" element={<EntityDossierPage/>}/>
              <Route path="entity/:entitySlug/versions/:versionSlug" element={<EntityDossierPage/>}/>
              <Route path="universe/:universeSlug" element={<UniverseHubPage/>}/>

              <Route path="matchups" element={<MatchupsPage/>}/>
              <Route path="matchups/new" element={<MatchupCreatePage/>}/>
              <Route path="matchups/:matchupSlug" element={<MatchupDetailPage/>}/>

              <Route path="research" element={<ResearchPage/>}/>
              <Route path="research/source/:sourceId" element={<SourceDetailPage/>}/>
              <Route path="research/evidence/:evidenceSlug" element={<EvidenceDetailPage/>}/>

              <Route path="community" element={<CommunityPage/>}/>
              <Route path="discussions/:discussionId" element={<DiscussionDetailPage/>}/>
              <Route path="events/:eventSlug" element={<EventDetailPage/>}/>

              <Route path="rankings" element={<RankingsPage/>}/>
              <Route path="library" element={<LibraryPage/>}/>
              <Route path="library/notes/new" element={<LibraryNotePage/>}/>
              <Route path="library/notes/:noteId" element={<LibraryNotePage/>}/>
              <Route path="profile/me" element={<ProfilePage/>}/>
              <Route path="profile/:username" element={<ProfilePage/>}/>
              <Route path="auth/sign-in" element={<AuthPage/>}/>
              <Route path="auth/callback" element={<AuthPage/>}/>

              {/* Legacy URLs stay useful while old links and bookmarks transition. */}
              <Route path="discover" element={<Navigate to="/explore" replace/>}/>
              <Route path="characters" element={<Navigate to="/explore?tab=characters" replace/>}/>
              <Route path="characters/:entitySlug" element={<CharacterDetailPage/>}/>
              <Route path="characters/:entitySlug/versions/:versionSlug" element={<CharacterDetailPage/>}/>
              <Route path="entities/:entitySlug" element={<LegacyEntityRedirect/>}/>
              <Route path="universes" element={<Navigate to="/explore?tab=universes" replace/>}/>
              <Route path="universes/:universeSlug" element={<LegacyUniverseRedirect/>}/>
              <Route path="matchups/create" element={<Navigate to="/matchups/new" replace/>}/>
              <Route path="evidence" element={<Navigate to="/research" replace/>}/>
              <Route path="evidence/:evidenceSlug" element={<LegacyEvidenceRedirect/>}/>
              <Route path="members/:username" element={<LegacyMemberRedirect/>}/>
              <Route path="me" element={<Navigate to="/profile/me" replace/>}/>
              <Route path="me/library" element={<Navigate to="/library" replace/>}/>
              <Route path="me/research" element={<Navigate to="/library?tab=notes" replace/>}/>

              <Route path="*" element={<section className="atlas-feature-page platform-page"><span className="section-kicker">404 / NOT FOUND</span><h1>This path isn't in the atlas.</h1><p>Return to the universal index and continue exploring.</p><a className="atlas-button atlas-button--dark" href="/explore">Open Explore</a></section>}/>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
