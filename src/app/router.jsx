import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AppShell from "./layouts/AppShell.jsx";
import HomePage from "../features/home/HomePage.jsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.jsx";
import { ToastProvider } from "./providers/ToastProvider.jsx";

function Page({ title, eyebrow, description }) {
  return <PlaceholderPage title={title} eyebrow={eyebrow} description={description} />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="discover" element={<Page />} />
            <Route path="characters" element={<Page />} />
            <Route path="characters/:entitySlug" element={<Page />} />
            <Route path="characters/:entitySlug/versions/:versionSlug" element={<Page />} />
            <Route path="entities/:entitySlug" element={<Page />} />
            <Route path="universes" element={<Page />} />
            <Route path="universes/:universeSlug" element={<Page />} />
            <Route path="matchups/create" element={<Page />} />
            <Route path="matchups/:matchupSlug" element={<Page />} />
            <Route path="evidence" element={<Page />} />
            <Route path="evidence/:evidenceSlug" element={<Page />} />
            <Route path="rankings" element={<Page />} />
            <Route path="community" element={<Page />} />
            <Route path="discussions/:discussionSlug" element={<Page />} />
            <Route path="events/:eventSlug" element={<Page />} />
            <Route path="members/:username" element={<Page />} />
            <Route path="me" element={<Page />} />
            <Route path="me/library" element={<Page />} />
            <Route path="me/research" element={<Page />} />
            <Route path="auth/sign-in" element={<Page />} />
            <Route path="auth/callback" element={<Page />} />
            <Route path="*" element={<Page title="This page isn't in the atlas." eyebrow="404 / NOT FOUND" description="The address does not match a published OMNIVEX route. Use the navigation to return to an active destination." />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
