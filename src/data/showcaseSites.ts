import calcurly from '@/assets/showcase/calcurly.jpg.asset.json';
import progenitors from '@/assets/showcase/progenitors.jpg.asset.json';
import expathelp from '@/assets/showcase/expathelp.jpg.asset.json';
import buddychip from '@/assets/showcase/buddychip.jpg.asset.json';
import jitty from '@/assets/showcase/jitty.jpg.asset.json';
import minibric from '@/assets/showcase/minibric.jpg.asset.json';
import classifieds from '@/assets/showcase/classifieds.jpg.asset.json';
import pinkpony from '@/assets/showcase/pinkpony.jpg.asset.json';
import growthreport from '@/assets/showcase/growthreport.jpg.asset.json';

export const SHOWCASE_HUB_URL = 'https://myname.co.uk';

export interface ShowcaseSite {
  name: string;
  image: string;
}

/** Approved, published sites shown in the homepage carousel. Add new entries after approval. */
export const showcaseSites: ShowcaseSite[] = [
  { name: 'Calcurly calculators', image: calcurly.url },
  { name: 'The Progenitors', image: progenitors.url },
  { name: 'Expat Help Online', image: expathelp.url },
  { name: 'BuddyChip Reimagined', image: buddychip.url },
  { name: 'English Ride With Jitty', image: jitty.url },
  { name: 'MiniBRIC Connect', image: minibric.url },
  { name: 'AI classifieds', image: classifieds.url },
  { name: 'Pink Pony Club', image: pinkpony.url },
  { name: 'Growth Report Pro', image: growthreport.url },
];
