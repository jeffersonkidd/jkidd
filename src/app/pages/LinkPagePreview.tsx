import { LINK_SAMPLE, LinkPage } from "../../ds";
import type { PageProps } from "../App";

/** The link-in-bio page from JKidd - Workbench, full bleed. */
export function LinkPagePreview(_: PageProps) {
  return <LinkPage spec={LINK_SAMPLE} />;
}
