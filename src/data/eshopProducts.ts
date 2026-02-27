export interface ProductReview {
  name: string;
  rating: number;
  text: { cs: string; en: string; de: string };
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: { cs: string; en: string; de: string };
  description: { cs: string; en: string; de: string };
  price: number;
  originalPrice?: number;
  currency: string;
  category: string;
  badge?: { cs: string; en: string; de: string };
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  images: string[];
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
}

const makeReviews = (count: number): ProductReview[] => {
  const names = ['Jana K.', 'Petr M.', 'Martin D.', 'Lucie H.', 'Tomáš V.', 'Eva S.'];
  const texts = [
    { cs: 'Skvělá kvalita, rychlé doručení!', en: 'Great quality, fast delivery!', de: 'Tolle Qualität, schnelle Lieferung!' },
    { cs: 'Přesně jak na obrázku, doporučuji.', en: 'Exactly as pictured, recommended.', de: 'Genau wie abgebildet, empfehlenswert.' },
    { cs: 'Za tu cenu výborný produkt.', en: 'Excellent product for the price.', de: 'Ausgezeichnetes Produkt für den Preis.' },
    { cs: 'Velmi spokojená, kupuji znovu.', en: 'Very satisfied, buying again.', de: 'Sehr zufrieden, kaufe wieder.' },
    { cs: 'Kvalitní zpracování, bez vad.', en: 'Quality craftsmanship, no defects.', de: 'Qualitätsverarbeitung, keine Mängel.' },
    { cs: 'Překvapivě dobrá kvalita!', en: 'Surprisingly good quality!', de: 'Überraschend gute Qualität!' },
  ];
  return Array.from({ length: Math.min(count, 6) }, (_, i) => ({
    name: names[i],
    rating: i < count - 1 ? 5 : 4,
    text: texts[i],
    date: `2024-0${i + 1}-${10 + i}`,
    verified: true,
  }));
};

export const categories = [
  { id: 'all', label: { cs: 'Vše', en: 'All', de: 'Alle' } },
  { id: 'electronics', label: { cs: 'Elektronika', en: 'Electronics', de: 'Elektronik' } },
  { id: 'fashion', label: { cs: 'Móda', en: 'Fashion', de: 'Mode' } },
  { id: 'home', label: { cs: 'Domácnost', en: 'Home', de: 'Haushalt' } },
  { id: 'sports', label: { cs: 'Sport', en: 'Sports', de: 'Sport' } },
  { id: 'beauty', label: { cs: 'Krása', en: 'Beauty', de: 'Schönheit' } },
];

export const products: Product[] = [
  {
    id: 'p1', category: 'electronics', price: 1299, originalPrice: 1899, currency: 'Kč',
    name: { cs: 'Bezdrátová sluchátka Pro', en: 'Wireless Headphones Pro', de: 'Kabellose Kopfhörer Pro' },
    description: { cs: 'Aktivní potlačení hluku, 40h výdrž baterie', en: 'Active noise cancellation, 40h battery life', de: 'Aktive Geräuschunterdrückung, 40h Akkulaufzeit' },
    badge: { cs: 'Výprodej', en: 'Sale', de: 'Sale' },
    rating: 4.8, reviewCount: 234, reviews: makeReviews(5), images: ['🎧'], inStock: true, colors: ['#000', '#fff', '#1e40af'],
  },
  {
    id: 'p2', category: 'electronics', price: 899, currency: 'Kč',
    name: { cs: 'Chytré hodinky Fit', en: 'Smart Watch Fit', de: 'Smartwatch Fit' },
    description: { cs: 'GPS, měření tepu, vodotěsné IP68', en: 'GPS, heart rate monitor, IP68 waterproof', de: 'GPS, Herzfrequenzmessung, IP68 wasserdicht' },
    rating: 4.6, reviewCount: 189, reviews: makeReviews(4), images: ['⌚'], inStock: true, colors: ['#000', '#16a34a', '#dc2626'],
  },
  {
    id: 'p3', category: 'electronics', price: 2499, originalPrice: 3299, currency: 'Kč',
    name: { cs: 'Bluetooth reproduktor', en: 'Bluetooth Speaker', de: 'Bluetooth-Lautsprecher' },
    description: { cs: '360° zvuk, 24h baterie, vodotěsný', en: '360° sound, 24h battery, waterproof', de: '360°-Sound, 24h Akku, wasserdicht' },
    badge: { cs: 'Bestseller', en: 'Bestseller', de: 'Bestseller' },
    rating: 4.9, reviewCount: 412, reviews: makeReviews(6), images: ['🔊'], inStock: true,
  },
  {
    id: 'p4', category: 'fashion', price: 1599, currency: 'Kč',
    name: { cs: 'Kožená crossbody kabelka', en: 'Leather Crossbody Bag', de: 'Leder-Umhängetasche' },
    description: { cs: 'Pravá kůže, nastavitelný popruh', en: 'Genuine leather, adjustable strap', de: 'Echtes Leder, verstellbarer Riemen' },
    rating: 4.7, reviewCount: 156, reviews: makeReviews(4), images: ['👜'], inStock: true, colors: ['#92400e', '#000', '#be185d'],
  },
  {
    id: 'p5', category: 'fashion', price: 799, originalPrice: 1199, currency: 'Kč',
    name: { cs: 'Pánské tenisky Urban', en: 'Men\'s Urban Sneakers', de: 'Herren Urban Sneakers' },
    description: { cs: 'Lehká podrážka, prodyšný materiál', en: 'Light sole, breathable material', de: 'Leichte Sohle, atmungsaktives Material' },
    badge: { cs: '-33%', en: '-33%', de: '-33%' },
    rating: 4.5, reviewCount: 298, reviews: makeReviews(5), images: ['👟'], inStock: true, sizes: ['40', '41', '42', '43', '44', '45'],
  },
  {
    id: 'p6', category: 'fashion', price: 599, currency: 'Kč',
    name: { cs: 'Dámský šátek Premium', en: 'Women\'s Premium Scarf', de: 'Damen Premium-Schal' },
    description: { cs: '100% hedvábí, ručně šitý', en: '100% silk, hand-sewn', de: '100% Seide, handgenäht' },
    rating: 4.8, reviewCount: 87, reviews: makeReviews(3), images: ['🧣'], inStock: true,
  },
  {
    id: 'p7', category: 'home', price: 3499, originalPrice: 4499, currency: 'Kč',
    name: { cs: 'Robotický vysavač X1', en: 'Robot Vacuum X1', de: 'Saugroboter X1' },
    description: { cs: 'LiDAR navigace, mopování, app ovládání', en: 'LiDAR navigation, mopping, app control', de: 'LiDAR-Navigation, Wischen, App-Steuerung' },
    badge: { cs: 'Top', en: 'Top', de: 'Top' },
    rating: 4.7, reviewCount: 523, reviews: makeReviews(6), images: ['🤖'], inStock: true,
  },
  {
    id: 'p8', category: 'home', price: 1899, currency: 'Kč',
    name: { cs: 'Espresso kávovar', en: 'Espresso Machine', de: 'Espressomaschine' },
    description: { cs: '15 bar, pěnič mléka, nerezová ocel', en: '15 bar, milk frother, stainless steel', de: '15 Bar, Milchschäumer, Edelstahl' },
    rating: 4.6, reviewCount: 341, reviews: makeReviews(5), images: ['☕'], inStock: true,
  },
  {
    id: 'p9', category: 'home', price: 699, currency: 'Kč',
    name: { cs: 'Aroma difuzér', en: 'Aroma Diffuser', de: 'Aroma-Diffusor' },
    description: { cs: 'Ultrazvukový, LED podsvícení, 300ml', en: 'Ultrasonic, LED lighting, 300ml', de: 'Ultraschall, LED-Beleuchtung, 300ml' },
    rating: 4.4, reviewCount: 178, reviews: makeReviews(4), images: ['🌸'], inStock: true,
  },
  {
    id: 'p10', category: 'sports', price: 2199, currency: 'Kč',
    name: { cs: 'Fitness tracker Band', en: 'Fitness Tracker Band', de: 'Fitness-Tracker Band' },
    description: { cs: 'SpO2, spánek, 14 dní výdrž', en: 'SpO2, sleep tracking, 14-day battery', de: 'SpO2, Schlaftracking, 14 Tage Akku' },
    rating: 4.5, reviewCount: 267, reviews: makeReviews(5), images: ['💪'], inStock: true,
  },
  {
    id: 'p11', category: 'sports', price: 1299, originalPrice: 1699, currency: 'Kč',
    name: { cs: 'Jóga podložka Premium', en: 'Premium Yoga Mat', de: 'Premium Yogamatte' },
    description: { cs: 'Protiskluzová, 6mm, ekologický materiál', en: 'Non-slip, 6mm, eco-friendly material', de: 'Rutschfest, 6mm, umweltfreundliches Material' },
    rating: 4.8, reviewCount: 134, reviews: makeReviews(4), images: ['🧘'], inStock: true, colors: ['#7c3aed', '#059669', '#0284c7'],
  },
  {
    id: 'p12', category: 'sports', price: 3999, currency: 'Kč',
    name: { cs: 'Skládací běžecký pás', en: 'Foldable Treadmill', de: 'Klappbares Laufband' },
    description: { cs: 'Kompaktní, do 120kg, LCD displej', en: 'Compact, up to 120kg, LCD display', de: 'Kompakt, bis 120kg, LCD-Display' },
    rating: 4.3, reviewCount: 89, reviews: makeReviews(3), images: ['🏃'], inStock: true,
  },
  {
    id: 'p13', category: 'beauty', price: 459, currency: 'Kč',
    name: { cs: 'Sérum s kyselinou hyaluronovou', en: 'Hyaluronic Acid Serum', de: 'Hyaluronsäure-Serum' },
    description: { cs: 'Hydratace, anti-aging, 30ml', en: 'Hydration, anti-aging, 30ml', de: 'Hydratation, Anti-Aging, 30ml' },
    rating: 4.9, reviewCount: 567, reviews: makeReviews(6), images: ['💧'], inStock: true,
  },
  {
    id: 'p14', category: 'beauty', price: 1299, originalPrice: 1799, currency: 'Kč',
    name: { cs: 'Elektrický kartáček na obličej', en: 'Electric Face Brush', de: 'Elektrische Gesichtsbürste' },
    description: { cs: 'Sonický, 5 režimů, vodotěsný', en: 'Sonic, 5 modes, waterproof', de: 'Sonic, 5 Modi, wasserdicht' },
    badge: { cs: 'Hit', en: 'Hit', de: 'Hit' },
    rating: 4.6, reviewCount: 203, reviews: makeReviews(5), images: ['✨'], inStock: true,
  },
  {
    id: 'p15', category: 'beauty', price: 349, currency: 'Kč',
    name: { cs: 'Přírodní bambusový kartáč', en: 'Natural Bamboo Brush Set', de: 'Natürliches Bambusbürsten-Set' },
    description: { cs: 'Set 8 kusů, vegánské, ekologické', en: 'Set of 8, vegan, eco-friendly', de: 'Set mit 8 Stück, vegan, umweltfreundlich' },
    rating: 4.7, reviewCount: 312, reviews: makeReviews(5), images: ['🖌️'], inStock: true,
  },
  {
    id: 'p16', category: 'electronics', price: 4999, originalPrice: 6499, currency: 'Kč',
    name: { cs: 'Tablet Pro 10"', en: 'Tablet Pro 10"', de: 'Tablet Pro 10"' },
    description: { cs: '10" IPS, 128GB, stylus v ceně', en: '10" IPS, 128GB, stylus included', de: '10" IPS, 128GB, Stylus inklusive' },
    badge: { cs: 'Novinka', en: 'New', de: 'Neu' },
    rating: 4.5, reviewCount: 78, reviews: makeReviews(3), images: ['📱'], inStock: true,
  },
  {
    id: 'p17', category: 'home', price: 899, currency: 'Kč',
    name: { cs: 'Chytrá LED žárovka set', en: 'Smart LED Bulb Set', de: 'Smart LED-Birnen Set' },
    description: { cs: '4 ks, WiFi, 16M barev, hlasové ovládání', en: '4 pcs, WiFi, 16M colors, voice control', de: '4 Stk, WiFi, 16M Farben, Sprachsteuerung' },
    rating: 4.4, reviewCount: 445, reviews: makeReviews(5), images: ['💡'], inStock: true,
  },
  {
    id: 'p18', category: 'fashion', price: 2499, currency: 'Kč',
    name: { cs: 'Zimní bunda Thermo', en: 'Winter Jacket Thermo', de: 'Winterjacke Thermo' },
    description: { cs: 'Voděodolná, -20°C, lehký materiál', en: 'Water-resistant, -20°C, lightweight', de: 'Wasserabweisend, -20°C, leicht' },
    rating: 4.7, reviewCount: 198, reviews: makeReviews(4), images: ['🧥'], inStock: true, sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'p19', category: 'sports', price: 599, currency: 'Kč',
    name: { cs: 'Odporové gumy set', en: 'Resistance Bands Set', de: 'Widerstandsbänder Set' },
    description: { cs: '5 úrovní, taška v ceně', en: '5 levels, bag included', de: '5 Stufen, Tasche inklusive' },
    rating: 4.6, reviewCount: 423, reviews: makeReviews(5), images: ['🏋️'], inStock: true,
  },
  {
    id: 'p20', category: 'electronics', price: 1699, currency: 'Kč',
    name: { cs: 'Webkamera 4K Pro', en: 'Webcam 4K Pro', de: 'Webcam 4K Pro' },
    description: { cs: '4K, autofokus, mikrofon, USB-C', en: '4K, autofocus, microphone, USB-C', de: '4K, Autofokus, Mikrofon, USB-C' },
    rating: 4.5, reviewCount: 156, reviews: makeReviews(4), images: ['📸'], inStock: true,
  },
  {
    id: 'p21', category: 'home', price: 1499, originalPrice: 1999, currency: 'Kč',
    name: { cs: 'Vzduchová fritéza 5L', en: 'Air Fryer 5L', de: 'Heißluftfritteuse 5L' },
    description: { cs: 'Digitální, 8 programů, nerezová', en: 'Digital, 8 programs, stainless steel', de: 'Digital, 8 Programme, Edelstahl' },
    badge: { cs: 'Populární', en: 'Popular', de: 'Beliebt' },
    rating: 4.8, reviewCount: 678, reviews: makeReviews(6), images: ['🍟'], inStock: true,
  },
  {
    id: 'p22', category: 'beauty', price: 799, currency: 'Kč',
    name: { cs: 'Masážní pistole Mini', en: 'Mini Massage Gun', de: 'Mini Massagepistole' },
    description: { cs: '4 nástavce, USB-C, tichý provoz', en: '4 heads, USB-C, quiet operation', de: '4 Aufsätze, USB-C, leiser Betrieb' },
    rating: 4.5, reviewCount: 289, reviews: makeReviews(5), images: ['💆'], inStock: true,
  },
  {
    id: 'p23', category: 'fashion', price: 449, currency: 'Kč',
    name: { cs: 'Sportovní sluneční brýle', en: 'Sport Sunglasses', de: 'Sport-Sonnenbrille' },
    description: { cs: 'UV400, polarizované, lehký rám', en: 'UV400, polarized, lightweight frame', de: 'UV400, polarisiert, leichter Rahmen' },
    rating: 4.4, reviewCount: 167, reviews: makeReviews(4), images: ['🕶️'], inStock: true, colors: ['#000', '#1e40af', '#dc2626'],
  },
  {
    id: 'p24', category: 'home', price: 2999, currency: 'Kč',
    name: { cs: 'Čistička vzduchu HEPA', en: 'HEPA Air Purifier', de: 'HEPA-Luftreiniger' },
    description: { cs: 'HEPA 13, senzor kvality, tichý', en: 'HEPA 13, quality sensor, quiet', de: 'HEPA 13, Qualitätssensor, leise' },
    rating: 4.7, reviewCount: 234, reviews: makeReviews(5), images: ['🌬️'], inStock: true,
  },
];
