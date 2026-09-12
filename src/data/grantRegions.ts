export type GrantRegion = {
  id: string;
  cs: string;
  en: string;
  hub: string;
  hubUrl: string;
};

/** All 14 Czech regions with their regional innovation / creative-voucher partner. */
export const grantRegions: GrantRegion[] = [
  { id: 'praha', cs: 'Praha', en: 'Prague', hub: 'Pražský inovační institut (Pii)', hubUrl: 'https://www.prazskyinovacniinstitut.cz/' },
  { id: 'stredocesky', cs: 'Středočeský kraj', en: 'Central Bohemia', hub: 'Středočeské inovační centrum (SIC)', hubUrl: 'https://s-ic.cz/' },
  { id: 'jihocesky', cs: 'Jihočeský kraj', en: 'South Bohemia', hub: 'Jihočeský vědeckotechnický park (JVTP)', hubUrl: 'https://www.jvtp.cz/' },
  { id: 'plzensky', cs: 'Plzeňský kraj', en: 'Plzeň Region', hub: 'BIC Plzeň', hubUrl: 'https://www.bic.cz/' },
  { id: 'karlovarsky', cs: 'Karlovarský kraj', en: 'Karlovy Vary Region', hub: 'Karlovarská agentura rozvoje podnikání (KARP)', hubUrl: 'https://www.karp-kv.cz/' },
  { id: 'ustecky', cs: 'Ústecký kraj', en: 'Ústí Region', hub: 'Inovační centrum Ústeckého kraje (ICUK)', hubUrl: 'https://www.icuk.cz/' },
  { id: 'liberecky', cs: 'Liberecký kraj', en: 'Liberec Region', hub: 'Agentura regionálního rozvoje (ARR)', hubUrl: 'https://www.arr-nisa.cz/' },
  { id: 'kralovehradecky', cs: 'Královéhradecký kraj', en: 'Hradec Králové Region', hub: 'Centrum investic, rozvoje a inovací (CIRI)', hubUrl: 'https://www.cirihk.cz/' },
  { id: 'pardubicky', cs: 'Pardubický kraj', en: 'Pardubice Region', hub: 'Regionální rozvojová agentura Pardubického kraje', hubUrl: 'https://www.rrapk.cz/' },
  { id: 'vysocina', cs: 'Kraj Vysočina', en: 'Vysočina Region', hub: 'Krajská hospodářská komora Kraje Vysočina', hubUrl: 'https://www.khkvysocina.cz/' },
  { id: 'jihomoravsky', cs: 'Jihomoravský kraj', en: 'South Moravia', hub: 'Jihomoravské inovační centrum (JIC)', hubUrl: 'https://www.jic.cz/' },
  { id: 'olomoucky', cs: 'Olomoucký kraj', en: 'Olomouc Region', hub: 'Inovační centrum Olomouckého kraje (OK4Inovace)', hubUrl: 'https://www.ok4inovace.cz/' },
  { id: 'zlinsky', cs: 'Zlínský kraj', en: 'Zlín Region', hub: 'Technologické inovační centrum Zlín (TIC)', hubUrl: 'https://www.ticzlin.cz/' },
  { id: 'moravskoslezsky', cs: 'Moravskoslezský kraj', en: 'Moravian-Silesian Region', hub: 'Moravskoslezské inovační centrum (MSIC)', hubUrl: 'https://www.ms-ic.cz/' },
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
