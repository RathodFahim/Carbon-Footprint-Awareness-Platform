/**
 * Standard Vite entry point for deploying outside Figma Make (e.g. Vercel).
 *
 * Inside Figma Make this file is unused — Figma auto-generates its own
 * entrypoint. It only takes effect when you build the project yourself via
 * `vite build`, where `index.html` references it.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
