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
  /** The site's own address on the myname.co.uk showcase. */
  url: string;
}

/** Approved, published sites shown in the homepage carousel. Add new entries after approval. */
export const showcaseSites: ShowcaseSite[] = [
  { name: 'Calcurly calculators', image: calcurly.url, url: 'https://calcurly.myname.co.uk' },
  { name: 'The Progenitors', image: progenitors.url, url: 'https://progenitors.myname.co.uk' },
  { name: 'Expat Help Online', image: expathelp.url, url: 'https://expathelp.myname.co.uk' },
  { name: 'BuddyChip Reimagined', image: buddychip.url, url: 'https://buddychip.myname.co.uk' },
  { name: 'English Ride With Jitty', image: jitty.url, url: 'https://jitty.myname.co.uk' },
  { name: 'MiniBRIC Connect', image: minibric.url, url: 'https://minibrics.myname.co.uk' },
  { name: 'AI classifieds', image: classifieds.url, url: 'https://classifieds.myname.co.uk' },
  { name: 'Pink Pony Club', image: pinkpony.url, url: 'https://pinkpony.myname.co.uk' },
  { name: 'Growth Report Pro', image: growthreport.url, url: 'https://growthreport.myname.co.uk' },
];
