import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@jkidd/ui/fonts";
import "@jkidd/tokens/tokens.css";
import "./links.css";
import { LinkPage } from "@jkidd/blocks/web";
import { LINKS } from "./links";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LinkPage spec={LINKS} />
  </StrictMode>,
);
