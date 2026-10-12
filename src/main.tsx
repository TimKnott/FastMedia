import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";

// Tell the blank-page watchdog in index.html that the app's code loaded.
(window as unknown as { __fmBooted?: boolean }).__fmBooted = true;

// Tidy the address bar after an automatic clean reload.
if (new URLSearchParams(window.location.search).has("_r")) {
  const url = new URL(window.location.href);
  url.searchParams.delete("_r");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

// After a new release, an open tab (or cached copy) may request page files
// that no longer exist. Clear old copies and reload once.
const reloadForStaleChunk = () => {
  const w = window as unknown as { __fmRecover?: () => void };
  if (w.__fmRecover) w.__fmRecover();
  else window.location.reload();
};
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForStaleChunk();
});
window.addEventListener("unhandledrejection", (event) => {
  const msg = String(event.reason?.message || event.reason || "");
  if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg)) {
    event.preventDefault();
    reloadForStaleChunk();
  }
});

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </AppErrorBoundary>
);
