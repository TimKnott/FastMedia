import blog1Hero from '@/assets/blog/blog1_hero.jpg';
import blog2Hero from '@/assets/blog/blog2_hero.jpg';
import blog3Hero from '@/assets/blog/blog3_hero.jpg';
import inlineAnalytics from '@/assets/blog/inline-analytics.jpg';
import inlineContentStrategy from '@/assets/blog/inline-content-strategy.jpg';
import inlineWireframe from '@/assets/blog/inline-wireframe.jpg';
import type { BlogPost } from './blogPosts';

export const performanceBlogPosts: BlogPost[] = [
  // ─── Post A: TikTok Ads ────────────────────────────────────────────
  {
    id: 'perf-1',
    slug: 'how-to-structure-tiktok-ads-2026',
    title: {
      cs: 'Jak strukturovat TikTok reklamy pro maximální konverze (2026)',
      en: 'How to structure TikTok ads for maximum conversion (2026)',
      de: 'Wie man TikTok-Anzeigen für maximale Conversion strukturiert (2026)',
    },
    excerpt: {
      cs: 'Ověřená struktura, kreativní hooky a testovací tipy pro vyšší konverze TikTok reklam v roce 2026.',
      en: 'Proven structure, creative hooks and testing tips to boost TikTok ad conversions in 2026.',
      de: 'Bewährte Struktur, kreative Hooks und Testing-Tipps für höhere TikTok-Werbekonversionen 2026.',
    },
    sections: [
      { type: 'paragraph', text: {
        cs: 'TikTok se stal dominantní platformou pro performance marketing — ale většina značek stále přistupuje k tvorbě reklam stejně jako na Facebooku nebo YouTube. To je chyba. TikTok vyžaduje zcela jinou strukturu, pacing a vizuální jazyk. V tomto článku vám ukážeme přesně, jak vytvořit reklamy, které konvertují.',
        en: 'TikTok has become the dominant platform for performance marketing — yet most brands still approach ad creation the same way they do for Facebook or YouTube. That\'s a mistake. TikTok demands an entirely different structure, pacing, and visual language. In this article, we\'ll show you exactly how to build ads that convert.',
        de: 'TikTok ist zur dominanten Plattform für Performance-Marketing geworden — doch die meisten Marken erstellen Anzeigen noch immer wie für Facebook oder YouTube. Das ist ein Fehler. TikTok verlangt eine völlig andere Struktur, Tempo und visuelle Sprache.',
      }},
      { type: 'heading', text: { cs: 'Proč TikTok vyžaduje jinou strukturu', en: 'Why TikTok demands a different structure', de: 'Warum TikTok eine andere Struktur verlangt' }},
      { type: 'paragraph', text: {
        cs: 'Uživatelé TikToku scrollují rychleji než na jakékoli jiné platformě. Průměrná doba pozornosti je pod 3 sekundy. Pokud váš hook nezaujme okamžitě, uživatel scrollne dál. Na rozdíl od YouTube, kde diváci přicházejí s úmyslem sledovat, na TikToku musíte přerušit scroll pattern — a to vyžaduje specifický přístup k prvním framům vašeho videa.',
        en: 'TikTok users scroll faster than on any other platform. The average attention span is under 3 seconds. If your hook doesn\'t grab them immediately, they swipe past. Unlike YouTube, where viewers arrive with intent to watch, on TikTok you need to interrupt the scroll pattern — and that requires a specific approach to the first frames of your video.',
        de: 'TikTok-Nutzer scrollen schneller als auf jeder anderen Plattform. Die durchschnittliche Aufmerksamkeitsspanne liegt unter 3 Sekunden.',
      }},
      { type: 'image', src: inlineAnalytics, alt: { cs: 'TikTok analytika a metriky výkonu', en: 'TikTok analytics and performance metrics', de: 'TikTok-Analytik und Leistungsmetriken' }, caption: { cs: 'Sledování CTR a konverzí je klíčem k optimalizaci', en: 'Tracking CTR and conversions is key to optimization', de: 'Die Verfolgung von CTR und Conversions ist der Schlüssel zur Optimierung' }},
      { type: 'heading', text: { cs: 'Pětidílný vzorec pro TikTok reklamu', en: 'The 5-part TikTok ad blueprint', de: 'Die 5-teilige TikTok-Anzeigen-Formel' }},
      { type: 'paragraph', text: {
        cs: 'Každá úspěšná TikTok reklama sleduje tento osvědčený vzorec: Hook → Hodnota → Důkaz → CTA → Thumbnail. Pojďme si projít každou část detailně.',
        en: 'Every successful TikTok ad follows this proven blueprint: Hook → Value → Proof → CTA → Thumbnail. Let\'s break down each component in detail.',
        de: 'Jede erfolgreiche TikTok-Anzeige folgt dieser bewährten Formel: Hook → Wert → Beweis → CTA → Thumbnail.',
      }},
      { type: 'list', items: [
        { cs: 'Hook (0–2s): Začněte pohybem, překvapením nebo provokativní otázkou. Žádné logo intro.', en: 'Hook (0–2s): Start with movement, surprise, or a provocative question. No logo intros.', de: 'Hook (0–2s): Beginnen Sie mit Bewegung, Überraschung oder einer provokanten Frage.' },
        { cs: 'Hodnota (2–8s): Jasně ukažte benefit produktu. Jeden klíčový argument, vizuálně podpořený.', en: 'Value (2–8s): Clearly demonstrate the product benefit. One key argument, visually supported.', de: 'Wert (2–8s): Zeigen Sie klar den Produktvorteil. Ein Schlüsselargument, visuell unterstützt.' },
        { cs: 'Důkaz (8–15s): Zákaznické testimonial, before/after, nebo statistika. Budujte důvěru.', en: 'Proof (8–15s): Customer testimonial, before/after, or statistic. Build trust.', de: 'Beweis (8–15s): Kundenstimme, Vorher/Nachher oder Statistik. Vertrauen aufbauen.' },
        { cs: 'CTA (15–20s): Jasný, specifický call-to-action. "Nakupte nyní" funguje lépe než "Zjistěte více".', en: 'CTA (15–20s): Clear, specific call-to-action. "Shop now" works better than "Learn more".', de: 'CTA (15–20s): Klarer, spezifischer Call-to-Action. "Jetzt kaufen" funktioniert besser als "Mehr erfahren".' },
        { cs: 'Thumbnail: Vaše reklama je často zobrazena jako statický náhled. Testujte 3+ varianty.', en: 'Thumbnail: Your ad is often displayed as a static preview. Test 3+ variations.', de: 'Thumbnail: Ihre Anzeige wird oft als statische Vorschau angezeigt. Testen Sie 3+ Varianten.' },
      ]},
      { type: 'heading', text: { cs: 'Produkční tipy pro každý segment', en: 'Production tips for each segment', de: 'Produktionstipps für jedes Segment' }},
      { type: 'paragraph', text: {
        cs: 'Pro hook segmenty používejte rychlé střihy (pod 1 sekundu), close-up záběry a dynamický pohyb kamery. Natáčejte vertikálně (9:16) od začátku — nepřeformátovávejte horizontální obsah. Text overlays by měly být velké, kontrastní a čitelné i bez zvuku. Titulky jsou povinné — až 85 % uživatelů sleduje bez zvuku.',
        en: 'For hook segments, use fast cuts (under 1 second), close-up shots, and dynamic camera movement. Shoot vertical (9:16) from the start — don\'t reformat horizontal content. Text overlays should be large, high-contrast, and readable without sound. Captions are mandatory — up to 85% of users watch without sound.',
        de: 'Für Hook-Segmente verwenden Sie schnelle Schnitte (unter 1 Sekunde), Nahaufnahmen und dynamische Kamerabewegungen. Drehen Sie von Anfang an vertikal (9:16).',
      }},
      { type: 'image', src: inlineContentStrategy, alt: { cs: 'Plánování obsahu TikTok reklam', en: 'TikTok ad content planning', de: 'TikTok-Anzeigen Inhaltsplanung' }, caption: { cs: 'Strukturované plánování obsahu zvyšuje efektivitu produkce', en: 'Structured content planning increases production efficiency', de: 'Strukturierte Inhaltsplanung steigert die Produktionseffizienz' }},
      { type: 'heading', text: { cs: 'Testovací matice: jak systematicky optimalizovat', en: 'Testing matrix: how to systematically optimize', de: 'Testing-Matrix: systematisch optimieren' }},
      { type: 'paragraph', text: {
        cs: 'Nedělejte ad-hoc testy. Vytvořte strukturovanou matici: 3 hooky × 2 délky videa (15s a 30s) × 3 thumbnaily = 18 variací. Testujte v malých skupinách audiencí 3–5 dní, pak škálujte vítěze. Sledujte CTR (cíl: >1,5 %), CPA a ROAS. Optimalizujte týdně, ne denně.',
        en: 'Don\'t run ad-hoc tests. Build a structured matrix: 3 hooks × 2 video lengths (15s and 30s) × 3 thumbnails = 18 variations. Test in small audience groups for 3–5 days, then scale winners. Track CTR (target: >1.5%), CPA, and ROAS. Optimize weekly, not daily.',
        de: 'Führen Sie keine Ad-hoc-Tests durch. Erstellen Sie eine strukturierte Matrix: 3 Hooks × 2 Videolängen (15s und 30s) × 3 Thumbnails = 18 Variationen.',
      }},
      { type: 'heading', text: { cs: 'Případová studie: NovaFit (mock)', en: 'Case study: NovaFit (mock)', de: 'Fallstudie: NovaFit (Mock)' }},
      { type: 'paragraph', text: {
        cs: 'Mock značka NovaFit (fitness vybavení) implementovala tuto strukturu pro svou TikTok kampaň. Výsledky po 30 dnech: CTR vzrostl z 0,8 % na 2,3 %, CPA se snížil o 41 % a ROAS dosáhl 4,2×. Klíčové faktory: UGC-style hooky s trenéry, 15s formát pro studenou audienci a 30s pro retargeting.',
        en: 'Mock brand NovaFit (fitness equipment) implemented this structure for their TikTok campaign. Results after 30 days: CTR increased from 0.8% to 2.3%, CPA dropped by 41%, and ROAS reached 4.2×. Key factors: UGC-style hooks with trainers, 15s format for cold audiences, and 30s for retargeting.',
        de: 'Mock-Marke NovaFit (Fitnessgeräte) implementierte diese Struktur für ihre TikTok-Kampagne. Ergebnisse nach 30 Tagen: CTR stieg von 0,8% auf 2,3%, CPA sank um 41%.',
      }},
      { type: 'quote', text: {
        cs: 'Přechod na strukturovaný přístup k TikTok reklamám nám ušetřil 60 % rozpočtu na testování a zdvojnásobil konverze.',
        en: 'Switching to a structured approach to TikTok ads saved us 60% of our testing budget and doubled conversions.',
        de: 'Der Wechsel zu einem strukturierten Ansatz für TikTok-Anzeigen sparte uns 60% des Testbudgets.',
      }, author: 'Mock — NovaFit Marketing Team' },
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=9SyAtuFqb0c', caption: {
        cs: 'Kompletní průvodce TikTok reklamami pro rok 2026 (Nathan Nazareth)',
        en: 'Complete TikTok ads guide for 2026 (Nathan Nazareth)',
        de: 'Vollständiger TikTok-Anzeigen-Leitfaden für 2026 (Nathan Nazareth)',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=j19rMDiQ4Fs', caption: {
        cs: 'Jak vytvořit TikTok reklamy, které konvertují (krok za krokem)',
        en: 'How to create TikTok ads that convert like crazy (step-by-step)',
        de: 'Wie man TikTok-Anzeigen erstellt, die konvertieren (Schritt für Schritt)',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=PScXauCKHiQ', caption: {
        cs: 'TikTok Ads kompletní tutoriál 2025 pro začátečníky (Ivan Mana)',
        en: 'TikTok Ads complete tutorial 2025 for beginners (Ivan Mana)',
        de: 'TikTok Ads vollständiges Tutorial 2025 für Anfänger (Ivan Mana)',
      }},
      { type: 'heading', text: { cs: 'Stáhněte si checklist', en: 'Download the checklist', de: 'Laden Sie die Checkliste herunter' }},
      { type: 'paragraph', text: {
        cs: 'Připravili jsme pro vás jednostránkový checklist se všemi klíčovými body pro tvorbu konverzních TikTok reklam.',
        en: 'We\'ve prepared a one-page checklist with all the key points for creating high-converting TikTok ads.',
        de: 'Wir haben eine einseitige Checkliste mit allen Schlüsselpunkten für die Erstellung hochkonvertierender TikTok-Anzeigen vorbereitet.',
      }},
      { type: 'download', href: '/checklist_tiktok_ads.pdf', label: {
        cs: 'Stáhnout TikTok Ads Checklist (PDF)',
        en: 'Download TikTok Ads Checklist (PDF)',
        de: 'TikTok Ads Checkliste herunterladen (PDF)',
      }},
      { type: 'cta', text: {
        cs: 'Získejte personalizovanou cenovou nabídku — vyzkoušejte náš AI kalkulátor',
        en: 'Get a personalized estimate — try our AI quote form',
        de: 'Erhalten Sie ein personalisiertes Angebot — probieren Sie unser AI-Formular',
      }, href: '/get-a-quote', trackingLabel: 'how-to-structure-tiktok-ads-2026' },
    ],
    category: 'marketing',
    image: blog1Hero,
    videoUrl: 'https://www.youtube.com/watch?v=9SyAtuFqb0c',
    author: 'Tim Knott',
    authorRole: { cs: 'Video produkce & strategie', en: 'Video Production & Strategy', de: 'Videoproduktion & Strategie' },
    date: '2026-04-07',
    readTime: 10,
    featured: true,
    tags: ['performance-video', 'tiktok', 'ecommerce'],
  },

  // ─── Post B: Video Sizing & Thumbnails ─────────────────────────────
  {
    id: 'perf-2',
    slug: 'video-sizing-thumbnail-best-practices',
    title: {
      cs: 'Video formáty a thumbnaily: best practices pro Meta a TikTok',
      en: 'Video sizing & thumbnail best practices for Meta and TikTok',
      de: 'Videoformate & Thumbnail Best Practices für Meta und TikTok',
    },
    excerpt: {
      cs: 'Přesné specifikace, tipy na thumbnaily a kreativní pravidla pro vyšší view rate a CTR na Meta a TikTok.',
      en: 'Exact specs, thumbnail tips and creative rules to improve view rate and CTR on Meta and TikTok.',
      de: 'Exakte Spezifikationen, Thumbnail-Tipps und kreative Regeln für höhere View-Rate und CTR auf Meta und TikTok.',
    },
    sections: [
      { type: 'paragraph', text: {
        cs: 'Správný formát videa může znamenat rozdíl mezi 0,5 % a 3 % CTR. Přesto většina značek stále exportuje jedno video a doufá, že bude fungovat všude. V roce 2026 platformy aktivně penalizují neoptimalizovaný obsah nižším reach a vyšší cenou za imprese. Pojďme si projít přesné specifikace a osvědčené postupy.',
        en: 'The right video format can mean the difference between 0.5% and 3% CTR. Yet most brands still export one video and hope it works everywhere. In 2026, platforms actively penalize non-optimized content with lower reach and higher cost per impression. Let\'s walk through the exact specs and best practices.',
        de: 'Das richtige Videoformat kann den Unterschied zwischen 0,5% und 3% CTR ausmachen. Trotzdem exportieren die meisten Marken ein Video und hoffen, dass es überall funktioniert.',
      }},
      { type: 'heading', text: { cs: 'Specifikace platforem pro rok 2026', en: 'Platform specs for 2026', de: 'Plattform-Spezifikationen für 2026' }},
      { type: 'list', items: [
        { cs: 'TikTok Feed/For You: 9:16 (1080×1920), max 60s pro reklamy, H.264, do 500 MB', en: 'TikTok Feed/For You: 9:16 (1080×1920), max 60s for ads, H.264, up to 500 MB', de: 'TikTok Feed/For You: 9:16 (1080×1920), max 60s für Anzeigen, H.264, bis 500 MB' },
        { cs: 'Instagram Reels: 9:16 (1080×1920), 15–90s, MP4/MOV', en: 'Instagram Reels: 9:16 (1080×1920), 15–90s, MP4/MOV', de: 'Instagram Reels: 9:16 (1080×1920), 15–90s, MP4/MOV' },
        { cs: 'Facebook Feed: 1:1 (1080×1080) nebo 4:5 (1080×1350), do 240 minut', en: 'Facebook Feed: 1:1 (1080×1080) or 4:5 (1080×1350), up to 240 minutes', de: 'Facebook Feed: 1:1 (1080×1080) oder 4:5 (1080×1350), bis 240 Minuten' },
        { cs: 'Meta Stories: 9:16 (1080×1920), max 15s per story segment', en: 'Meta Stories: 9:16 (1080×1920), max 15s per story segment', de: 'Meta Stories: 9:16 (1080×1920), max 15s pro Story-Segment' },
        { cs: 'YouTube Shorts: 9:16 (1080×1920), max 60s', en: 'YouTube Shorts: 9:16 (1080×1920), max 60s', de: 'YouTube Shorts: 9:16 (1080×1920), max 60s' },
      ]},
      { type: 'image', src: inlineWireframe, alt: { cs: 'Porovnání video formátů napříč platformami', en: 'Video format comparison across platforms', de: 'Videoformatvergleich über Plattformen hinweg' }, caption: { cs: 'Každá platforma má optimální formát — jeden formát nestačí', en: 'Each platform has an optimal format — one size doesn\'t fit all', de: 'Jede Plattform hat ein optimales Format — eine Größe passt nicht für alle' }},
      { type: 'heading', text: { cs: 'Psychologie thumbnailů a A/B testování', en: 'Thumbnail psychology and A/B testing', de: 'Thumbnail-Psychologie und A/B-Testing' }},
      { type: 'paragraph', text: {
        cs: 'Thumbnail je první věc, kterou uživatel vidí — ještě předtím, než se video přehraje. Výzkumy ukazují, že thumbnaily s obličeji (zejména s emocemi) mají o 38 % vyšší CTR než ty bez lidí. Další faktory: vysoký kontrast, minimální text (max 3–4 slova) a jasný vizuální fokus na jeden prvek.',
        en: 'The thumbnail is the first thing a user sees — before the video even plays. Research shows that thumbnails with faces (especially showing emotion) have 38% higher CTR than those without people. Other factors: high contrast, minimal text (max 3–4 words), and a clear visual focus on one element.',
        de: 'Das Thumbnail ist das Erste, was ein Nutzer sieht — bevor das Video überhaupt abgespielt wird. Studien zeigen, dass Thumbnails mit Gesichtern 38% höhere CTR haben.',
      }},
      { type: 'list', items: [
        { cs: 'Testujte vždy minimálně 3 varianty thumbnailů na kreativu', en: 'Always test at least 3 thumbnail variants per creative', de: 'Testen Sie immer mindestens 3 Thumbnail-Varianten pro Creative' },
        { cs: 'Používejte kontrastní barvy — jasný objekt na tmavém pozadí (nebo naopak)', en: 'Use contrasting colors — bright subject on dark background (or vice versa)', de: 'Verwenden Sie kontrastierende Farben — helles Motiv auf dunklem Hintergrund' },
        { cs: 'Close-up na produkt nebo lidskou emoci funguje lépe než wide shot', en: 'Close-up on product or human emotion works better than wide shots', de: 'Nahaufnahme von Produkt oder menschlicher Emotion funktioniert besser als Weitwinkelaufnahmen' },
        { cs: 'Brand barvy ano, ale subtilně — nepřekrývejte hlavní vizuál', en: 'Brand colors yes, but subtly — don\'t overwhelm the main visual', de: 'Markenfarben ja, aber dezent — überwältigen Sie nicht das Hauptbild' },
      ]},
      { type: 'heading', text: { cs: 'Velikost souboru a encoding tipy', en: 'File size & encoding tips', de: 'Dateigröße & Encoding-Tipps' }},
      { type: 'paragraph', text: {
        cs: 'Exportujte v H.264 codecu s bitrate 3–6 Mbps pro 1080p. Používejte sRGB barevný prostor a 72 dpi. Příliš velké soubory (>500 MB) způsobují pomalé načítání a platformy je mohou přecompressovat s viditelnou ztrátou kvality. Pro nejvyšší kvalitu exportujte přímo v nativním rozlišení platformy.',
        en: 'Export in H.264 codec with 3–6 Mbps bitrate for 1080p. Use sRGB color space and 72 dpi. Files too large (>500 MB) cause slow loading and platforms may recompress them with visible quality loss. For highest quality, export directly at the platform\'s native resolution.',
        de: 'Exportieren Sie im H.264-Codec mit 3–6 Mbps Bitrate für 1080p. Verwenden Sie sRGB-Farbraum und 72 dpi.',
      }},
      { type: 'image', src: inlineAnalytics, alt: { cs: 'Analýza výkonu thumbnailů', en: 'Thumbnail performance analysis', de: 'Thumbnail-Leistungsanalyse' }, caption: { cs: 'A/B testování thumbnailů odhaluje výrazné rozdíly v CTR', en: 'A/B testing thumbnails reveals significant CTR differences', de: 'A/B-Testing von Thumbnails zeigt signifikante CTR-Unterschiede' }},
      { type: 'heading', text: { cs: 'Šablony a nástroje', en: 'Templates and tools', de: 'Vorlagen und Werkzeuge' }},
      { type: 'paragraph', text: {
        cs: 'Vytvořte si 3 master šablony v editoru: 9:16, 1:1 a 4:5. Do každé zakomponujte safe zones pro text (mimo spodních 250 px pro TikTok UI a horních 150 px pro status bar). Použijte frame guides, abyste zajistili, že klíčový obsah nebude oříznut na žádné platformě.',
        en: 'Create 3 master templates in your editor: 9:16, 1:1, and 4:5. Build in safe zones for text (outside the bottom 250px for TikTok UI and top 150px for status bars). Use frame guides to ensure key content isn\'t cropped on any platform.',
        de: 'Erstellen Sie 3 Master-Vorlagen in Ihrem Editor: 9:16, 1:1 und 4:5. Bauen Sie Safe Zones für Text ein.',
      }},
      { type: 'callout', text: {
        cs: '💡 Pro tip: Při exportu pro TikTok a Reels vždy zkontrolujte, jak video vypadá s aktivním UI overlay (like/comment tlačítka, popis). Kritický obsah musí být v \"safe zone\" — centrální oblast bez překrytí.',
        en: '💡 Pro tip: When exporting for TikTok and Reels, always check how the video looks with active UI overlay (like/comment buttons, description). Critical content must be in the "safe zone" — the central area without overlaps.',
        de: '💡 Pro-Tipp: Beim Export für TikTok und Reels immer prüfen, wie das Video mit aktivem UI-Overlay aussieht.',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=_ZHS6tW3f_Q', caption: {
        cs: '10 kreativních formátů Meta reklam, které konvertují v roce 2026 (Dara Denney)',
        en: '10 Meta ad creative formats that convert like crazy in 2026 (Dara Denney)',
        de: '10 Meta-Anzeigen-Kreativformate, die 2026 konvertieren (Dara Denney)',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=Yv6RLQv889M', caption: {
        cs: 'Nové thumbnaily dominující YouTube v roce 2026 (vidIQ)',
        en: 'The new thumbnails dominating YouTube in 2026 (vidIQ)',
        de: 'Die neuen Thumbnails, die YouTube 2026 dominieren (vidIQ)',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=0TolBiTrUg4', caption: {
        cs: 'Jak vytvořit killer YouTube thumbnail (Aprilynne Alter)',
        en: 'How to make a killer YouTube thumbnail (Aprilynne Alter)',
        de: 'Wie man ein Killer-YouTube-Thumbnail erstellt (Aprilynne Alter)',
      }},
      { type: 'heading', text: { cs: 'Stáhněte si checklist', en: 'Download the checklist', de: 'Laden Sie die Checkliste herunter' }},
      { type: 'download', href: '/checklist_thumbnails_meta_tiktok.pdf', label: {
        cs: 'Stáhnout Video Sizing & Thumbnail Checklist (PDF)',
        en: 'Download Video Sizing & Thumbnail Checklist (PDF)',
        de: 'Video Sizing & Thumbnail Checkliste herunterladen (PDF)',
      }},
      { type: 'cta', text: {
        cs: 'Získejte personalizovanou cenovou nabídku — vyzkoušejte náš AI kalkulátor',
        en: 'Get a personalized estimate — try our AI quote form',
        de: 'Erhalten Sie ein personalisiertes Angebot — probieren Sie unser AI-Formular',
      }, href: '/get-a-quote', trackingLabel: 'video-sizing-thumbnail-best-practices' },
    ],
    category: 'marketing',
    image: blog2Hero,
    videoUrl: 'https://www.youtube.com/watch?v=_ZHS6tW3f_Q',
    author: 'Tim Knott',
    authorRole: { cs: 'Video produkce & strategie', en: 'Video Production & Strategy', de: 'Videoproduktion & Strategie' },
    date: '2026-04-07',
    readTime: 9,
    featured: true,
    tags: ['creatives', 'thumbnails', 'social-video'],
  },

  // ─── Post C: How to Brief a Video Agency ───────────────────────────
  {
    id: 'perf-3',
    slug: 'how-to-brief-video-agency',
    title: {
      cs: 'Jak briefovat video agenturu: 10 věcí, které musíte uvést',
      en: 'How to brief a video agency: 10 things to include',
      de: 'Wie man eine Videoagentur briefet: 10 Dinge, die enthalten sein müssen',
    },
    excerpt: {
      cs: 'Jednoduchý briefing checklist, který vám pomůže získat lepší videa rychleji — co uvést, když najímáte agenturu.',
      en: 'A simple briefing checklist to help you get better videos, faster — what to include when you hire an agency.',
      de: 'Eine einfache Briefing-Checkliste für bessere Videos, schneller — was bei der Agenturbeauftragung enthalten sein muss.',
    },
    sections: [
      { type: 'paragraph', text: {
        cs: 'Dobrý brief je investice, která se mnohonásobně vrátí. Jasný, strukturovaný brief šetří čas oběma stranám, eliminuje zbytečné kola revizí a vede k lepšímu výsledku. Přesto většina klientů přichází s vágními požadavky jako „udělejte to cool" nebo „chceme něco jako Apple". V tomto článku vám ukážeme 10 konkrétních bodů, které by měl obsahovat každý video brief.',
        en: 'A good brief is an investment that pays for itself many times over. A clear, structured brief saves time for both sides, eliminates unnecessary revision rounds, and leads to better outcomes. Yet most clients arrive with vague requests like "make it cool" or "we want something like Apple." In this article, we\'ll show you 10 specific items every video brief should contain.',
        de: 'Ein gutes Briefing ist eine Investition, die sich vielfach auszahlt. Ein klares, strukturiertes Briefing spart Zeit für beide Seiten.',
      }},
      { type: 'heading', text: { cs: '1. Cíl projektu a KPI', en: '1. Project goal & KPI', de: '1. Projektziel & KPI' }},
      { type: 'paragraph', text: {
        cs: 'Začněte od konce: čeho chcete videem dosáhnout? Zvýšit povědomí o značce? Generovat leads? Zvýšit konverze na produktové stránce? Definujte jeden primární KPI (např. „zvýšit CTR o 20 % oproti stávajícím kreativám") a jeden sekundární. Agentura tak může optimalizovat kreativní rozhodnutí směrem k vašemu cíli.',
        en: 'Start from the end: what do you want the video to achieve? Increase brand awareness? Generate leads? Boost product page conversions? Define one primary KPI (e.g., "increase CTR by 20% vs. current creatives") and one secondary. This way, the agency can optimize creative decisions toward your goal.',
        de: 'Beginnen Sie vom Ende: Was soll das Video erreichen? Definieren Sie ein primäres KPI.',
      }},
      { type: 'heading', text: { cs: '2. Cílová skupina a persony', en: '2. Target audience & personas', de: '2. Zielgruppe & Personas' }},
      { type: 'paragraph', text: {
        cs: 'Kdo bude video sledovat? Uveďte demografické údaje, zájmy, bolesti a motivace. Čím konkrétnější budete, tím lépe může agentura cílit tone, vizuální styl a messaging. Pokud máte existující buyer persony, sdílejte je.',
        en: 'Who will watch the video? Provide demographics, interests, pain points, and motivations. The more specific you are, the better the agency can target tone, visual style, and messaging. If you have existing buyer personas, share them.',
        de: 'Wer wird das Video sehen? Geben Sie Demografien, Interessen, Schmerzpunkte und Motivationen an.',
      }},
      { type: 'heading', text: { cs: '3. Příkladová videa a moodboard', en: '3. Example videos & moodboard', de: '3. Beispielvideos & Moodboard' }},
      { type: 'paragraph', text: {
        cs: 'Sdílejte 3–5 příkladových videí, která se vám líbí — a specifikujte, CO přesně se vám na nich líbí (tempo, barvy, hudba, styl střihu). Stejně důležité je ukázat, co NECHCETE. Vizuální moodboard s referenčními obrázky, barvami a typografií pomáhá eliminovat subjektivní interpretace.',
        en: 'Share 3–5 example videos you like — and specify WHAT exactly you like about them (pacing, colors, music, editing style). Equally important: show what you DON\'T want. A visual moodboard with reference images, colors, and typography helps eliminate subjective interpretations.',
        de: 'Teilen Sie 3–5 Beispielvideos, die Ihnen gefallen — und spezifizieren Sie, WAS genau Ihnen daran gefällt.',
      }},
      { type: 'image', src: inlineContentStrategy, alt: { cs: 'Příprava moodboardu pro video brief', en: 'Preparing a moodboard for video brief', de: 'Vorbereitung eines Moodboards für das Video-Briefing' }, caption: { cs: 'Vizuální reference eliminují nedorozumění', en: 'Visual references eliminate misunderstandings', de: 'Visuelle Referenzen eliminieren Missverständnisse' }},
      { type: 'heading', text: { cs: '4. Seznam deliverables a formátů', en: '4. Deliverables list & formats', de: '4. Deliverables-Liste & Formate' }},
      { type: 'paragraph', text: {
        cs: 'Specifikujte přesně, co potřebujete: kolik videí, v jakých délkách, v jakých formátech (16:9, 9:16, 1:1). Potřebujete titulky? V jakých jazycích? Potřebujete i statické thumbnail obrázky? Čím detailnější seznam, tím přesnější nabídka.',
        en: 'Specify exactly what you need: how many videos, what lengths, what formats (16:9, 9:16, 1:1). Do you need captions? In what languages? Do you need static thumbnail images too? The more detailed the list, the more accurate the quote.',
        de: 'Spezifizieren Sie genau, was Sie brauchen: Wie viele Videos, welche Längen, welche Formate.',
      }},
      { type: 'heading', text: { cs: '5. Časový harmonogram a milníky', en: '5. Timeline & milestones', de: '5. Zeitplan & Meilensteine' }},
      { type: 'paragraph', text: {
        cs: 'Definujte klíčová data: schválení skriptu, natáčení, rough cut, finální verze, launch. Realistický harmonogram pro 60s komerční video je typicky 3–4 týdny od schválení briefu. Pokud máte hard deadline (např. product launch), sdělte to hned na začátku.',
        en: 'Define key dates: script approval, shoot day, rough cut, final version, launch. A realistic timeline for a 60s commercial video is typically 3–4 weeks from brief approval. If you have a hard deadline (e.g., product launch), communicate it upfront.',
        de: 'Definieren Sie Schlüsseldaten: Skriptfreigabe, Drehtag, Rohschnitt, Endversion, Launch.',
      }},
      { type: 'heading', text: { cs: '6. Rozpočtový rámec', en: '6. Budget range', de: '6. Budgetrahmen' }},
      { type: 'paragraph', text: {
        cs: 'Buďte upřímní ohledně rozpočtu. Agentura potřebuje vědět, zda pracujete s €2 000 nebo €20 000, aby mohla navrhnout řešení odpovídající vašim možnostem. Vágní „uvidíme" vede k plýtvání časem na obou stranách. Rozpočtové rozpětí (např. €5–8 000) je naprosto v pořádku.',
        en: 'Be honest about budget. The agency needs to know whether you\'re working with €2,000 or €20,000 so they can propose solutions matching your capabilities. A vague "we\'ll see" wastes time on both sides. A budget range (e.g., €5–8,000) is perfectly fine.',
        de: 'Seien Sie ehrlich über das Budget. Die Agentur muss wissen, ob Sie mit €2.000 oder €20.000 arbeiten.',
      }},
      { type: 'heading', text: { cs: '7. Brand guidelines a assets', en: '7. Brand guidelines & assets', de: '7. Markenrichtlinien & Assets' }},
      { type: 'paragraph', text: {
        cs: 'Sdílejte logo soubory (vektorové formáty), fonty, barevné kódy, tone of voice dokument a jakékoli další brand materiály. Pokud nemáte formalizované brand guidelines, sdílejte alespoň příklady existujících materiálů a vizuální identity.',
        en: 'Share logo files (vector formats), fonts, color codes, tone of voice document, and any other brand materials. If you don\'t have formalized brand guidelines, share at least examples of existing materials and visual identity.',
        de: 'Teilen Sie Logo-Dateien (Vektorformate), Schriftarten, Farbcodes, Tone-of-Voice-Dokument.',
      }},
      { type: 'image', src: inlineWireframe, alt: { cs: 'Organizace brand assets pro video produkci', en: 'Organizing brand assets for video production', de: 'Organisation von Marken-Assets für die Videoproduktion' }, caption: { cs: 'Organizované brand assets urychlují produkci', en: 'Organized brand assets speed up production', de: 'Organisierte Marken-Assets beschleunigen die Produktion' }},
      { type: 'heading', text: { cs: '8. Voiceover a jazykové potřeby', en: '8. Voiceover & language needs', de: '8. Voiceover & Sprachanforderungen' }},
      { type: 'paragraph', text: {
        cs: 'Potřebujete voiceover? V jakém jazyce? Jaký tón (autoritativní, přátelský, energický)? Preferujete mužský nebo ženský hlas? Potřebujete titulky v dalších jazycích? Tyto informace ovlivňují rozpočet a harmonogram.',
        en: 'Do you need a voiceover? In what language? What tone (authoritative, friendly, energetic)? Do you prefer male or female voice? Do you need subtitles in additional languages? This information impacts budget and timeline.',
        de: 'Brauchen Sie ein Voiceover? In welcher Sprache? Welcher Ton? Bevorzugen Sie eine männliche oder weibliche Stimme?',
      }},
      { type: 'heading', text: { cs: '9. Právní požadavky a releases', en: '9. Legal requirements & releases', de: '9. Rechtliche Anforderungen & Freigaben' }},
      { type: 'paragraph', text: {
        cs: 'Potřebujete licenci na hudbu? Vystupují ve videu zaměstnanci nebo zákazníci (model release)? Máte specifické regulatorní požadavky (např. farmaceutický průmysl, finanční služby)? Právní aspekty řešte předem, ne po natočení.',
        en: 'Do you need music licensing? Will employees or customers appear in the video (model release)? Do you have specific regulatory requirements (e.g., pharmaceutical, financial services)? Handle legal aspects upfront, not after shooting.',
        de: 'Brauchen Sie eine Musiklizenz? Erscheinen Mitarbeiter oder Kunden im Video (Model Release)?',
      }},
      { type: 'heading', text: { cs: '10. Kontaktní osoba a schvalovací proces', en: '10. Contact person & approval flow', de: '10. Ansprechpartner & Freigabeprozess' }},
      { type: 'paragraph', text: {
        cs: 'Určete jednu kontaktní osobu, která je rozhodovací autoritou. Definujte, kdo schvaluje v každé fázi (skript, rough cut, finál). Příliš mnoho schvalovatelů = příliš mnoho revizí = překročení rozpočtu. Ideální je 1–2 osoby s pravomocí říct finální ano.',
        en: 'Designate one contact person who is the decision-making authority. Define who approves at each stage (script, rough cut, final). Too many approvers = too many revisions = budget overrun. Ideal is 1–2 people with authority to give the final yes.',
        de: 'Bestimmen Sie eine Kontaktperson als Entscheidungsträger. Definieren Sie, wer in jeder Phase genehmigt.',
      }},
      { type: 'callout', text: {
        cs: '💡 Tip: Použijte náš AI kalkulátor k automatickému vyplnění části briefu a získání okamžitého odhadu nákladů na základě vašich požadavků.',
        en: '💡 Tip: Use our AI calculator to auto-fill parts of your brief and get an instant cost estimate based on your requirements.',
        de: '💡 Tipp: Verwenden Sie unseren AI-Kalkulator, um Teile Ihres Briefings automatisch auszufüllen.',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=m9KNriatkZs', caption: {
        cs: 'Jak napsat silný kreativní brief (HubSpot)',
        en: 'How to write a powerful creative brief (HubSpot)',
        de: 'Wie man ein starkes kreatives Briefing schreibt (HubSpot)',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=EpdBLfSVno4', caption: {
        cs: 'Šablona kreativního briefu pro rok 2025 — GET WHO TO BY formule (Julian Cole)',
        en: 'Creative brief template for 2025 — The GET WHO TO BY formula (Julian Cole)',
        de: 'Kreativ-Briefing-Vorlage 2025 — Die GET WHO TO BY Formel (Julian Cole)',
      }},
      { type: 'video-embed', url: 'https://www.youtube.com/watch?v=DLCarzQFwXY', caption: {
        cs: 'Jak napsat kreativní brief s příkladem kampaně (Strategy Tips)',
        en: 'How to write a creative brief with seamless campaign example (Strategy Tips)',
        de: 'Wie man ein kreatives Briefing schreibt — Kampagnenbeispiel (Strategy Tips)',
      }},
      { type: 'heading', text: { cs: 'Stáhněte si checklist', en: 'Download the checklist', de: 'Laden Sie die Checkliste herunter' }},
      { type: 'download', href: '/checklist_briefing_video_agency.pdf', label: {
        cs: 'Stáhnout Video Agency Briefing Checklist (PDF)',
        en: 'Download Video Agency Briefing Checklist (PDF)',
        de: 'Video Agency Briefing Checkliste herunterladen (PDF)',
      }},
      { type: 'cta', text: {
        cs: 'Získejte personalizovanou cenovou nabídku — vyzkoušejte náš AI kalkulátor',
        en: 'Get a personalized estimate — try our AI quote form',
        de: 'Erhalten Sie ein personalisiertes Angebot — probieren Sie unser AI-Formular',
      }, href: '/get-a-quote', trackingLabel: 'how-to-brief-video-agency' },
    ],
    category: 'marketing',
    image: blog3Hero,
    videoUrl: 'https://www.youtube.com/watch?v=m9KNriatkZs',
    author: 'Tim Knott',
    authorRole: { cs: 'Video produkce & strategie', en: 'Video Production & Strategy', de: 'Videoproduktion & Strategie' },
    date: '2026-04-07',
    readTime: 11,
    tags: ['briefs', 'project-management', 'clients'],
  },
];
