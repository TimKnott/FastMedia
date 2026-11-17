/**
 * Navigational links to the user's existing OpenSEO project workspaces.
 * They are not access tokens. OpenSEO requires its own authenticated session.
 * GSC connection notes are a point-in-time account audit, not a live status feed.
 */
export const websiteAdvantageSeoProjects = [
  { site: "FastMedia.Pro", projectUrl: "https://app.openseo.so/p/cb2975a7-09ae-4c28-9399-f2c5b77edc79", gscStatus: "property_missing" },
  { site: "SevenHourTeacher", projectUrl: "https://app.openseo.so/p/17f85790-09f4-41e0-bdb0-37571820a6bb", gscStatus: "selected" },
  { site: "Koně a Stáje", projectUrl: "https://app.openseo.so/p/2f266b0e-fc05-44f7-8532-0c2c50b394b9", gscStatus: "selected" },
  { site: "Zelený Kůň", projectUrl: "https://app.openseo.so/p/ee3c6899-91cf-4eb3-b713-25e43f7cc6c9", gscStatus: "selected" },
  { site: "StandaToys", projectUrl: "https://app.openseo.so/p/504f3335-ae4c-41a6-94cc-663c5f576a32", gscStatus: "property_missing" },
  { site: "The Progenitors", projectUrl: "https://app.openseo.so/p/d860373a-ebb1-4ca9-a092-8df338d3d5c3", gscStatus: "selected" },
  { site: "Calcurly", projectUrl: "https://app.openseo.so/p/d38dd515-6cd2-4fb7-8508-23cdcddf10cd", gscStatus: "selected" },
  { site: "JusticeLeague", projectUrl: "https://app.openseo.so/p/9106f3f2-9774-4705-8a68-280e631a78f0", gscStatus: "selected" },
] as const;
