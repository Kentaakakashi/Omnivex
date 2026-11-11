import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AppShell from "./layouts/AppShell.jsx";
import HomePage from "../features/home/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.jsx";
import { ToastProvider } from "./providers/ToastProvider.jsx";
import {
  DiscoverPage, CharactersPage, UniversesPage, UniverseHubPage,
  EntityDossierPage, MatchupCreatePage, MatchupDetailPage,
  EvidenceExplorerPage, EvidenceDetailPage, RankingsPage,
  CommunityPage, PersonalOverviewPage, LibraryPage, ResearchNotebookPage
} from "../features/FeaturePages.jsx";

function Page({ title, eyebrow, description }) {
  return <PlaceholderPage title={title} eyebrow={eyebrow} description={description} />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="characters" element={<CharactersPage />} />
              <Route path="characters/:entitySlug" element={<EntityDossierPage />} />
              <Route path="characters/:entitySlug/versions/:versionSlug" element={<EntityDossierPage />} />
              <Route path="entities/:entitySlug" element={<EntityDossierPage />} />
              <Route path="universes" element={<UniversesPage />} />
              <Route path="universes/:universeSlug" element={<UniverseHubPage />} />
              <Route path="matchups/create" element={<MatchupCreatePage />} />
              <Route path="matchups/:matchupSlug" element={<MatchupDetailPage />} />
              <Route path="evidence" element={<EvidenceExplorerPage />} />
              <Route path="evidence/:evidenceSlug" element={<EvidenceDetailPage />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="discussions/:discussionSlug" element={<Page />} />
              <Route path="events/:eventSlug" element={<Page />} />
              <Route path="members/:username" element={<Page />} />
              <Route path="me" element={<PersonalOverviewPage />} />
              <Route path="me/library" element={<LibraryPage />} />
              <Route path="me/research" element={<ResearchNotebookPage />} />
              <Route path="auth/sign-in" element={<AuthPage />} />
              <Route path="auth/callback" element={<Page title="Sign-in callback" eyebrow="AUTHENTICATION" description="Your Supabase authentication redirect is being resolved." />} />
              <Route path="*" element={<Page title="This page isn't in the atlas." eyebrow="404 / NOT FOUND" description="The address does not match a published OMNIVEX route. Use the navigation to return to an active destination." />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
