import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production build ships prerendered HTML for "/" only (see entry-server.tsx).
// Any other path (the signed-in app, login, etc.) has no matching prerendered markup,
// so hydrating there would mismatch - render fresh on the client instead.
const canHydrate = window.location.pathname === "/" && container.firstElementChild;
if (canHydrate) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
