import calcurly from "@/assets/showcase/calcurly.jpg.asset.json";
import expathelp from "@/assets/showcase/expathelp.jpg.asset.json";
import buddychip from "@/assets/showcase/buddychip.jpg.asset.json";
import jitty from "@/assets/showcase/jitty.jpg.asset.json";
import minibric from "@/assets/showcase/minibric.jpg.asset.json";
import classifieds from "@/assets/showcase/classifieds.jpg.asset.json";
const telceImage = "/images/telce-indoor-arena.svg";
import growthreport from "@/assets/showcase/growthreport.jpg.asset.json";

export const SHOWCASE_HUB_URL = "https://myname.co.uk";

export interface ShowcaseSite {
  name: string;
  image: string;
  /** The site's live address. Switch to its myname.co.uk showcase page once that page exists. */
  url: string;
}

/** Approved, published sites shown in the homepage carousel. Add new entries after approval. */
export const showcaseSites: ShowcaseSite[] = [
  { name: "Calcurly calculators", image: calcurly.url, url: "https://convert-and-calculate.lovable.app" },
  { name: "Expat Help Online", image: expathelp.url, url: "https://expathelp.lovable.app" },
  { name: "BuddyChip Reimagined", image: buddychip.url, url: "https://find-my-buddy-magic.lovable.app" },
  { name: "English Ride With Jitty", image: jitty.url, url: "https://englishridewithjitty.lovable.app" },
  { name: "MiniBRIC Connect", image: minibric.url, url: "https://minibrick-connect-africa.lovable.app" },
  { name: "AI classifieds", image: classifieds.url, url: "https://aiclassifiedseu.lovable.app" },
  { name: "Sportovní stáj Telce — koncept", image: telceImage, url: "https://stable-heart-of-nature.lovable.app" },
  { name: "Growth Report Pro", image: growthreport.url, url: "https://emerald-edge-advisor.lovable.app" },
];
