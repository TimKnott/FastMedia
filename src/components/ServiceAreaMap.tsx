import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LearnMoreModal from '@/components/LearnMoreModal';

const SERVICE_CENTER = { lat: 50.0755, lng: 14.4378 }; // Prague
const SERVICE_RADIUS_KM = 80;

const learnMore = {
  title: { cs: 'Mapa pokrytí', en: 'Service Area Map', de: 'Servicebereiche' },
  explanation: {
    cs: 'Interaktivní mapa ukazuje oblasti, kde poskytujeme naše služby. Zadejte svou adresu a zjistěte, zda jsme dostupní ve vaší lokalitě.',
    en: 'Interactive map shows the areas where we provide our services. Enter your address to check if we\'re available in your area.',
    de: 'Interaktive Karte zeigt die Gebiete, in denen wir unsere Dienstleistungen anbieten. Geben Sie Ihre Adresse ein, um zu prüfen, ob wir in Ihrem Gebiet verfügbar sind.',
  },
  benefits: {
    cs: ['Eliminuje dotazy mimo oblast pokrytí', 'Šetří čas zákazníkům i nám', 'Jasně komunikuje dosah služeb'],
    en: ['Eliminates out-of-area inquiries', 'Saves time for customers and us', 'Clearly communicates service reach'],
    de: ['Eliminiert Anfragen außerhalb des Gebiets', 'Spart Zeit für Kunden und uns', 'Kommuniziert klar die Servicereichweite'],
  },
};

const ServiceAreaMap = () => {
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<{ inArea: boolean; message: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const title = {
    cs: 'Kde působíme',
    en: 'Our Service Area',
    de: 'Unser Servicegebiet',
  };

  const subtitle = {
    cs: `Poskytujeme služby v okruhu ${SERVICE_RADIUS_KM} km od Prahy.`,
    en: `We provide services within ${SERVICE_RADIUS_KM} km of Prague.`,
    de: `Wir bieten Dienstleistungen im Umkreis von ${SERVICE_RADIUS_KM} km um Prag an.`,
  };

  useEffect(() => {
    if (loaded) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).L) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = (window as any).L;
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
      }).setView([SERVICE_CENTER.lat, SERVICE_CENTER.lng], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Service area circle
      L.circle([SERVICE_CENTER.lat, SERVICE_CENTER.lng], {
        radius: SERVICE_RADIUS_KM * 1000,
        color: 'hsl(var(--accent))',
        fillColor: 'hsl(var(--accent))',
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);

      // Center marker
      L.marker([SERVICE_CENTER.lat, SERVICE_CENTER.lng]).addTo(map)
        .bindPopup('FastMedia.Pro — Praha');

      mapInstanceRef.current = map;
      setLoaded(true);
    });
  }, [loaded]);

  const checkAddress = async () => {
    if (!address.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await res.json();
      if (data.length === 0) {
        setResult({
          inArea: false,
          message: lang === 'cs' ? 'Adresa nenalezena. Zkuste jiný formát.' : lang === 'de' ? 'Adresse nicht gefunden.' : 'Address not found. Try a different format.',
        });
        return;
      }
      const { lat, lon } = data[0];
      const distance = getDistanceKm(SERVICE_CENTER.lat, SERVICE_CENTER.lng, parseFloat(lat), parseFloat(lon));
      const inArea = distance <= SERVICE_RADIUS_KM;

      // Add marker on map
      if (mapInstanceRef.current) {
        const L = (window as any).L;
        L.marker([parseFloat(lat), parseFloat(lon)], {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:12px;height:12px;border-radius:50%;background:${inArea ? '#22c55e' : '#ef4444'};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.3)"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 10);
      }

      setResult({
        inArea,
        message: inArea
          ? (lang === 'cs' ? `✅ Skvělé! Vaše lokalita (${Math.round(distance)} km) je v našem dosahu.` : lang === 'de' ? `✅ Großartig! Ihr Standort (${Math.round(distance)} km) liegt in unserem Servicegebiet.` : `✅ Great! Your location (${Math.round(distance)} km) is within our service area.`)
          : (lang === 'cs' ? `⚠️ Vaše lokalita (${Math.round(distance)} km) je mimo standardní dosah. Kontaktujte nás pro individuální nabídku.` : lang === 'de' ? `⚠️ Ihr Standort (${Math.round(distance)} km) liegt außerhalb unseres Standardgebiets. Kontaktieren Sie uns.` : `⚠️ Your location (${Math.round(distance)} km) is outside our standard area. Contact us for a custom quote.`),
      });
    } catch {
      setResult({
        inArea: false,
        message: lang === 'cs' ? 'Chyba při hledání. Zkuste to znovu.' : 'Error looking up address. Please try again.',
      });
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {lang === 'cs' ? 'Oblast pokrytí' : lang === 'de' ? 'Servicegebiet' : 'Service Area'}
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-2">
            {title[lang]}
          </h2>
          <p className="text-muted-foreground">{subtitle[lang]}</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {/* Address lookup */}
          <div className="flex gap-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={lang === 'cs' ? 'Zadejte adresu nebo město...' : lang === 'de' ? 'Adresse oder Stadt eingeben...' : 'Enter address or city...'}
              className="h-11"
              onKeyDown={(e) => e.key === 'Enter' && checkAddress()}
            />
            <Button onClick={checkAddress} className="h-11 px-5 gap-2 shrink-0">
              <Search className="w-4 h-4" />
              {lang === 'cs' ? 'Ověřit' : lang === 'de' ? 'Prüfen' : 'Check'}
            </Button>
          </div>

          {result && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-medium px-4 py-2.5 rounded-lg ${
                result.inArea ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              }`}
            >
              {result.message}
            </motion.p>
          )}

          {/* Map container */}
          <div
            ref={mapRef}
            className="w-full h-[400px] rounded-2xl border border-border overflow-hidden shadow-sm"
            style={{ zIndex: 1 }}
          />
        </div>
      </div>
    </section>
  );
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default ServiceAreaMap;
