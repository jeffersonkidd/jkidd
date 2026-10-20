import { LINK_SAMPLE, LinkPage } from "@jkidd/blocks/web";
import type { PageProps } from "../App";

/** A demo of the web lane: the link-in-bio page, full bleed. The one Studio page that isn't cards. */
export function LinkPagePreview(_: PageProps) {
  return <LinkPage spec={LINK_SAMPLE} />;
}
