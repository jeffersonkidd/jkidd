import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@jkidd/ui/fonts";
import "@jkidd/tokens/tokens.css";
import "./styles/app.css";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
