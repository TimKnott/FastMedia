export type GrantRegion = {
  id: string;
  cs: string;
  en: string;
  hub: string;
  hubUrl: string;
  /** Approximate position on the schematic map (percentages of the 100x62 viewBox). */
  x: number;
  y: number;
  seatCs: string;
  seatEn: string;
};

/** All 14 Czech regions with their regional innovation / creative-voucher partner. */
export const grantRegions: GrantRegion[] = [
  { id: 'praha', cs: 'Praha', en: 'Prague', hub: 'Pražský inovační institut (Pii)', hubUrl: 'https://www.prazskyinovacniinstitut.cz/', x: 33, y: 33, seatCs: 'Praha', seatEn: 'Prague' },
  { id: 'stredocesky', cs: 'Středočeský kraj', en: 'Central Bohemia', hub: 'Středočeské inovační centrum (SIC)', hubUrl: 'https://s-ic.cz/', x: 38, y: 42, seatCs: 'Dolní Břežany', seatEn: 'Dolní Břežany' },
  { id: 'jihocesky', cs: 'Jihočeský kraj', en: 'South Bohemia', hub: 'Jihočeský vědeckotechnický park (JVTP)', hubUrl: 'https://www.jvtp.cz/', x: 29, y: 56, seatCs: 'České Budějovice', seatEn: 'České Budějovice' },
  { id: 'plzensky', cs: 'Plzeňský kraj', en: 'Plzeň Region', hub: 'BIC Plzeň', hubUrl: 'https://www.bic.cz/', x: 16, y: 46, seatCs: 'Plzeň', seatEn: 'Plzeň' },
  { id: 'karlovarsky', cs: 'Karlovarský kraj', en: 'Karlovy Vary Region', hub: 'Karlovarská agentura rozvoje podnikání (KARP)', hubUrl: 'https://www.karp-kv.cz/', x: 9, y: 31, seatCs: 'Karlovy Vary', seatEn: 'Karlovy Vary' },
  { id: 'ustecky', cs: 'Ústecký kraj', en: 'Ústí Region', hub: 'Inovační centrum Ústeckého kraje (ICUK)', hubUrl: 'https://www.icuk.cz/', x: 22, y: 21, seatCs: 'Ústí nad Labem', seatEn: 'Ústí nad Labem' },
  { id: 'liberecky', cs: 'Liberecký kraj', en: 'Liberec Region', hub: 'Agentura regionálního rozvoje (ARR)', hubUrl: 'https://www.arr-nisa.cz/', x: 36, y: 17, seatCs: 'Liberec', seatEn: 'Liberec' },
  { id: 'kralovehradecky', cs: 'Královéhradecký kraj', en: 'Hradec Králové Region', hub: 'Centrum investic, rozvoje a inovací (CIRI)', hubUrl: 'https://www.cirihk.cz/', x: 50, y: 24, seatCs: 'Hradec Králové', seatEn: 'Hradec Králové' },
  { id: 'pardubicky', cs: 'Pardubický kraj', en: 'Pardubice Region', hub: 'Regionální rozvojová agentura Pardubického kraje', hubUrl: 'https://www.rrapk.cz/', x: 55, y: 35, seatCs: 'Pardubice', seatEn: 'Pardubice' },
  { id: 'vysocina', cs: 'Kraj Vysočina', en: 'Vysočina Region', hub: 'Krajská hospodářská komora Kraje Vysočina', hubUrl: 'https://www.khkvysocina.cz/', x: 47, y: 48, seatCs: 'Jihlava', seatEn: 'Jihlava' },
  { id: 'jihomoravsky', cs: 'Jihomoravský kraj', en: 'South Moravia', hub: 'Jihomoravské inovační centrum (JIC)', hubUrl: 'https://www.jic.cz/', x: 61, y: 54, seatCs: 'Brno', seatEn: 'Brno' },
  { id: 'olomoucky', cs: 'Olomoucký kraj', en: 'Olomouc Region', hub: 'Inovační centrum Olomouckého kraje (OK4Inovace)', hubUrl: 'https://www.ok4inovace.cz/', x: 68, y: 38, seatCs: 'Olomouc', seatEn: 'Olomouc' },
  { id: 'zlinsky', cs: 'Zlínský kraj', en: 'Zlín Region', hub: 'Technologické inovační centrum Zlín (TIC)', hubUrl: 'https://www.ticzlin.cz/', x: 74, y: 50, seatCs: 'Zlín', seatEn: 'Zlín' },
  { id: 'moravskoslezsky', cs: 'Moravskoslezský kraj', en: 'Moravian-Silesian Region', hub: 'Moravskoslezské inovační centrum (MSIC)', hubUrl: 'https://www.ms-ic.cz/', x: 81, y: 30, seatCs: 'Ostrava', seatEn: 'Ostrava' },
];

export const nationalPool = {
  cs: {
    name: 'Národní pool: Ministerstvo kultury / Národní plán obnovy',
    note: 'Kreativní vouchery jsou financovány z Národního plánu obnovy a administrovány přes portál DPMK a regionální partnery.',
  },
  en: {
    name: 'National pool: Ministry of Culture / National Recovery Plan',
    note: 'Creative vouchers are funded from the National Recovery Plan and administered through the DPMK portal and regional partners.',
  },
  url: 'https://www.dpmk.cz/',
};

/** Rough silhouette of the Czech Republic for the schematic hub map (viewBox 0 0 100 62). */
export const czechOutlinePath =
  'M6,31 L10,21 L17,15 L26,12 L34,9 L42,12 L50,14 L57,10 L65,13 L72,10 L80,14 L87,20 L93,26 L89,32 L83,36 L87,42 L81,47 L76,51 L78,57 L71,60 L63,58 L56,54 L48,58 L40,60 L32,58 L24,53 L16,48 L10,40 Z';
