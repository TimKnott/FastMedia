import calcurly from "@/assets/showcase/calcurly.jpg.asset.json";
import expathelp from "@/assets/showcase/expathelp.jpg.asset.json";
import buddychip from "@/assets/showcase/buddychip.jpg.asset.json";
import jitty from "@/assets/showcase/jitty.jpg.asset.json";
import minibric from "@/assets/showcase/minibric.jpg.asset.json";
import classifieds from "@/assets/showcase/classifieds.jpg.asset.json";
const telceImage = "/images/telce-indoor-arena.svg";

export const SHOWCASE_HUB_URL = "https://myname.co.uk";

export interface ShowcaseSite {
  name: string;
  image: string;
  /** Only a verified first-party domain that has been opened and checked. Omit to show a static, non-clickable card. */
  url?: string;
}

/** Approved, published sites shown in the homepage carousel. Add new entries after approval. */
export const showcaseSites: ShowcaseSite[] = [
  { name: "Calcurly calculators", image: calcurly.url, url: "https://calcurly.com/" },
  { name: "Expat Help Online", image: expathelp.url, url: "https://expathelp.online/" },
  { name: "BuddyChip Reimagined", image: buddychip.url },
  { name: "English Ride With Jitty", image: jitty.url, url: "https://www.englishridewithjitty.com/" },
  { name: "MiniBRIC Connect", image: minibric.url, url: "https://www.minibrics.com/" },
  { name: "AI classifieds", image: classifieds.url, url: "https://aiclassifieds.eu/" },
  { name: "Sportovní stáj Telce — koncept", image: telceImage },
];
