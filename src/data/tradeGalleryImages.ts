// Trade gallery images - multiple images per trade for variety

export interface TradeGalleryConfig {
  hero: string;
  about: string;
  gallery: {
    src: string;
    title: { cs: string; en: string; de: string };
  }[];
  team: string[];
}

// Image prompts/descriptions for each trade (used to generate via AI)
export const tradeGalleryDescriptions: Record<string, {
  hero: string;
  about: string;
  gallery: string[];
  galleryTitles: { cs: string; en: string; de: string }[];
}> = {
  plumbing: {
    hero: "Professional plumber fixing pipes under a sink, blue work uniform, modern bathroom",
    about: "Team of plumbers working together on a large plumbing installation project",
    gallery: [
      "Modern bathroom renovation with new plumbing fixtures",
      "Professional pipe installation in a basement",
      "Luxurious shower installation with rain showerhead",
      "Kitchen sink plumbing repair work",
      "Water heater installation in utility room",
      "Copper pipe soldering close-up work"
    ],
    galleryTitles: [
      { cs: "Rekonstrukce koupelny", en: "Bathroom Renovation", de: "Badezimmerrenovierung" },
      { cs: "Instalace potrubí", en: "Pipe Installation", de: "Rohrinstallation" },
      { cs: "Sprchový kout", en: "Shower Installation", de: "Duschinstallation" },
      { cs: "Kuchyňský dřez", en: "Kitchen Sink", de: "Küchenspüle" },
      { cs: "Ohřívač vody", en: "Water Heater", de: "Warmwasserbereiter" },
      { cs: "Měděné potrubí", en: "Copper Piping", de: "Kupferverrohrung" }
    ]
  },
  electrical: {
    hero: "Electrician working on electrical panel with safety equipment, professional tools",
    about: "Electrical team installing modern lighting system in commercial building",
    gallery: [
      "Modern LED lighting installation in living room",
      "Electrical panel upgrade with circuit breakers",
      "Smart home wiring and automation system",
      "Standalone freestanding EV charging station pedestal in parking lot",
      "Commercial electrical work in office building",
      "Outdoor lighting installation for garden"
    ],
    galleryTitles: [
      { cs: "LED osvětlení", en: "LED Lighting", de: "LED-Beleuchtung" },
      { cs: "Elektrický panel", en: "Electrical Panel", de: "Elektrische Schalttafel" },
      { cs: "Smart home", en: "Smart Home", de: "Smart Home" },
      { cs: "Nabíjecí stanice", en: "EV Charging", de: "E-Ladestation" },
      { cs: "Komerční elektrika", en: "Commercial Wiring", de: "Kommerzielle Verkabelung" },
      { cs: "Venkovní osvětlení", en: "Outdoor Lighting", de: "Außenbeleuchtung" }
    ]
  },
  roofing: {
    hero: "Roofers installing clay tiles on a residential roof with safety harnesses",
    about: "Professional roofing team working on large commercial building",
    gallery: [
      "Beautiful red tile roof installation on villa",
      "Metal roof installation with precision work",
      "Roof repair and leak fixing work",
      "Skylight window installation in roof",
      "Gutter system installation and repair",
      "Flat roof waterproofing membrane installation"
    ],
    galleryTitles: [
      { cs: "Taškové střechy", en: "Tile Roof", de: "Ziegeldach" },
      { cs: "Plechová střecha", en: "Metal Roof", de: "Metalldach" },
      { cs: "Oprava střechy", en: "Roof Repair", de: "Dachreparatur" },
      { cs: "Střešní okna", en: "Skylights", de: "Dachfenster" },
      { cs: "Okapový systém", en: "Gutter System", de: "Rinnensystem" },
      { cs: "Plochá střecha", en: "Flat Roof", de: "Flachdach" }
    ]
  },
  building: {
    hero: "Construction workers building modern house structure with crane",
    about: "Construction team working on foundation of new residential building",
    gallery: [
      "Modern house construction in progress",
      "Concrete foundation pouring work",
      "Brick wall construction by masons",
      "Steel frame structure installation",
      "House extension building project",
      "Demolition and site preparation work"
    ],
    galleryTitles: [
      { cs: "Výstavba domu", en: "House Construction", de: "Hausbau" },
      { cs: "Betonové základy", en: "Concrete Foundation", de: "Betonfundament" },
      { cs: "Zděné konstrukce", en: "Masonry Work", de: "Mauerwerk" },
      { cs: "Ocelová konstrukce", en: "Steel Frame", de: "Stahlrahmen" },
      { cs: "Přístavba", en: "House Extension", de: "Anbau" },
      { cs: "Demolice", en: "Demolition", de: "Abriss" }
    ]
  },
  painting: {
    hero: "Professional painter with roller painting interior wall in modern apartment",
    about: "Painting team working on exterior facade of residential building",
    gallery: [
      "Interior wall painting with precision edges",
      "Exterior house facade painting work",
      "Decorative wall texture application",
      "Ceiling painting in modern living room",
      "Wood varnishing and restoration work",
      "Wallpaper installation in bedroom"
    ],
    galleryTitles: [
      { cs: "Interiérové malby", en: "Interior Painting", de: "Innenanstrich" },
      { cs: "Fasádní nátěry", en: "Facade Painting", de: "Fassadenanstrich" },
      { cs: "Dekorativní techniky", en: "Decorative Techniques", de: "Dekorative Techniken" },
      { cs: "Malování stropů", en: "Ceiling Painting", de: "Deckenanstrich" },
      { cs: "Lakování dřeva", en: "Wood Varnishing", de: "Holzlackierung" },
      { cs: "Tapetování", en: "Wallpapering", de: "Tapezieren" }
    ]
  },
  heatpumps: {
    hero: "Modern heat pump unit installation outside residential home",
    about: "HVAC technicians installing ground source heat pump system",
    gallery: [
      "Air source heat pump outdoor unit",
      "Ground source heat pump drilling",
      "Indoor heat pump installation",
      "Heat pump control panel setup",
      "Underfloor heating with heat pump",
      "Heat pump maintenance service"
    ],
    galleryTitles: [
      { cs: "Vzduch-voda jednotka", en: "Air Source Unit", de: "Luft-Wasser-Einheit" },
      { cs: "Zemní vrty", en: "Ground Drilling", de: "Erdbohrungen" },
      { cs: "Vnitřní jednotka", en: "Indoor Unit", de: "Inneneinheit" },
      { cs: "Ovládací panel", en: "Control Panel", de: "Steuerungspanel" },
      { cs: "Podlahové topení", en: "Underfloor Heating", de: "Fußbodenheizung" },
      { cs: "Servis čerpadel", en: "Pump Service", de: "Pumpenwartung" }
    ]
  },
  solar: {
    hero: "Solar panel installation on residential roof with technicians",
    about: "Solar installation team mounting panels on commercial building roof",
    gallery: [
      "Rooftop solar panel array installation",
      "Battery storage system in garage",
      "Solar inverter installation",
      "Commercial solar farm project",
      "Solar panel cleaning and maintenance",
      "Residential solar system completed"
    ],
    galleryTitles: [
      { cs: "Střešní panely", en: "Rooftop Panels", de: "Dachpaneele" },
      { cs: "Bateriové úložiště", en: "Battery Storage", de: "Batteriespeicher" },
      { cs: "Solární měnič", en: "Solar Inverter", de: "Solarwechselrichter" },
      { cs: "Solární park", en: "Solar Farm", de: "Solarpark" },
      { cs: "Údržba panelů", en: "Panel Maintenance", de: "Panelwartung" },
      { cs: "Dokončený systém", en: "Completed System", de: "Fertiges System" }
    ]
  },
  gardening: {
    hero: "Professional gardener designing beautiful landscaped garden",
    about: "Landscaping team working on garden transformation project",
    gallery: [
      "Beautiful landscape garden design",
      "Automatic irrigation system installation",
      "Garden pond with water feature",
      "Professional lawn maintenance",
      "Tree pruning and care service",
      "Outdoor terrace garden design"
    ],
    galleryTitles: [
      { cs: "Zahradní design", en: "Garden Design", de: "Gartengestaltung" },
      { cs: "Zavlažovací systém", en: "Irrigation System", de: "Bewässerungssystem" },
      { cs: "Zahradní jezírko", en: "Garden Pond", de: "Gartenteich" },
      { cs: "Péče o trávník", en: "Lawn Care", de: "Rasenpflege" },
      { cs: "Ořez stromů", en: "Tree Pruning", de: "Baumschnitt" },
      { cs: "Terasa", en: "Terrace", de: "Terrasse" }
    ]
  },
  locksmith: {
    hero: "Professional locksmith working on security door lock",
    about: "Locksmith team installing high-security access system",
    gallery: [
      "Emergency door opening service",
      "High-security lock installation",
      "Safe opening and repair",
      "Car lockout service",
      "Electronic access system",
      "Security door installation"
    ],
    galleryTitles: [
      { cs: "Nouzové otevírání", en: "Emergency Opening", de: "Notöffnung" },
      { cs: "Bezpečnostní zámky", en: "Security Locks", de: "Sicherheitsschlösser" },
      { cs: "Otevírání trezorů", en: "Safe Opening", de: "Tresoröffnung" },
      { cs: "Autoklíče", en: "Car Keys", de: "Autoschlüssel" },
      { cs: "Elektronické systémy", en: "Electronic Systems", de: "Elektronische Systeme" },
      { cs: "Bezpečnostní dveře", en: "Security Doors", de: "Sicherheitstüren" }
    ]
  },
  carpentry: {
    hero: "Master carpenter crafting custom wooden furniture in workshop",
    about: "Carpentry team installing custom kitchen cabinetry",
    gallery: [
      "Custom kitchen cabinet installation",
      "Built-in wardrobe design",
      "Wooden staircase construction",
      "Handcrafted furniture piece",
      "Interior door installation",
      "Wood floor installation"
    ],
    galleryTitles: [
      { cs: "Kuchyňská linka", en: "Kitchen Cabinets", de: "Küchenschränke" },
      { cs: "Vestavěné skříně", en: "Built-in Wardrobes", de: "Einbauschränke" },
      { cs: "Dřevěné schody", en: "Wooden Stairs", de: "Holztreppe" },
      { cs: "Nábytek na míru", en: "Custom Furniture", de: "Maßmöbel" },
      { cs: "Interiérové dveře", en: "Interior Doors", de: "Innentüren" },
      { cs: "Dřevěná podlaha", en: "Wood Flooring", de: "Holzfußboden" }
    ]
  },
  cleaning: {
    hero: "Professional cleaning team with equipment in modern office",
    about: "Cleaning crew performing deep cleaning service",
    gallery: [
      "Office space deep cleaning",
      "Window cleaning service",
      "Carpet deep cleaning",
      "Post-construction cleanup",
      "Kitchen sanitization",
      "Floor polishing service"
    ],
    galleryTitles: [
      { cs: "Úklid kanceláří", en: "Office Cleaning", de: "Büroreinigung" },
      { cs: "Mytí oken", en: "Window Cleaning", de: "Fensterreinigung" },
      { cs: "Čištění koberců", en: "Carpet Cleaning", de: "Teppichreinigung" },
      { cs: "Úklid po stavbě", en: "Post-Construction", de: "Bauendreinigung" },
      { cs: "Sanitace kuchyně", en: "Kitchen Sanitation", de: "Küchenhygiene" },
      { cs: "Leštění podlah", en: "Floor Polishing", de: "Bodenpolieren" }
    ]
  },
  interior: {
    hero: "Interior designer presenting 3D visualization to client",
    about: "Interior design team working on luxury home project",
    gallery: [
      "Modern living room design",
      "Luxury bedroom interior",
      "Contemporary kitchen design",
      "Home office setup",
      "Bathroom design project",
      "Open plan living space"
    ],
    galleryTitles: [
      { cs: "Obývací pokoj", en: "Living Room", de: "Wohnzimmer" },
      { cs: "Ložnice", en: "Bedroom", de: "Schlafzimmer" },
      { cs: "Moderní kuchyně", en: "Modern Kitchen", de: "Moderne Küche" },
      { cs: "Domácí kancelář", en: "Home Office", de: "Heimarbeitszimmer" },
      { cs: "Koupelna", en: "Bathroom", de: "Badezimmer" },
      { cs: "Otevřený prostor", en: "Open Plan", de: "Offener Raum" }
    ]
  },
  exterior: {
    hero: "Workers installing thermal insulation on building facade",
    about: "Facade renovation team with scaffolding on building",
    gallery: [
      "Building facade renovation",
      "Thermal insulation installation",
      "Decorative facade plaster",
      "Outdoor terrace construction",
      "Fence and gate installation",
      "Driveway paving work"
    ],
    galleryTitles: [
      { cs: "Renovace fasády", en: "Facade Renovation", de: "Fassadenrenovierung" },
      { cs: "Zateplení ETICS", en: "Thermal Insulation", de: "Wärmedämmung" },
      { cs: "Dekorativní omítka", en: "Decorative Plaster", de: "Dekorputz" },
      { cs: "Venkovní terasa", en: "Outdoor Terrace", de: "Außenterrasse" },
      { cs: "Oplocení", en: "Fencing", de: "Einzäunung" },
      { cs: "Dlažba příjezdu", en: "Driveway Paving", de: "Einfahrtspflasterung" }
    ]
  },
  drywall: {
    hero: "Worker installing drywall partition in renovation project",
    about: "Drywall team working on suspended ceiling installation",
    gallery: [
      "Drywall partition construction",
      "Suspended ceiling installation",
      "Attic insulation work",
      "Acoustic wall panels",
      "Shaft wall construction",
      "Drywall finishing and taping"
    ],
    galleryTitles: [
      { cs: "SDK příčky", en: "Drywall Partitions", de: "Trockenbauwände" },
      { cs: "Podhledy", en: "Suspended Ceilings", de: "Abhangdecken" },
      { cs: "Zateplení podkroví", en: "Attic Insulation", de: "Dachbodendämmung" },
      { cs: "Akustické panely", en: "Acoustic Panels", de: "Akustikpaneele" },
      { cs: "Šachtové stěny", en: "Shaft Walls", de: "Schachtwände" },
      { cs: "Tmelení spár", en: "Drywall Taping", de: "Fugenverspachteln" }
    ]
  },
  wells: {
    hero: "Drilling rig operating for well drilling in rural area",
    about: "Well drilling team with heavy equipment on site",
    gallery: [
      "Well drilling equipment in action",
      "Completed dug well with cover",
      "Pump system installation",
      "Geothermal drilling project",
      "Well water testing service",
      "Water storage tank installation"
    ],
    galleryTitles: [
      { cs: "Vrtací práce", en: "Drilling Work", de: "Bohrarbeiten" },
      { cs: "Kopaná studna", en: "Dug Well", de: "Gegrabener Brunnen" },
      { cs: "Čerpadlový systém", en: "Pump System", de: "Pumpensystem" },
      { cs: "Geotermální vrty", en: "Geothermal Drilling", de: "Erdwärmebohrung" },
      { cs: "Rozbor vody", en: "Water Testing", de: "Wasseranalyse" },
      { cs: "Zásobník vody", en: "Water Tank", de: "Wassertank" }
    ]
  },
  heating: {
    hero: "HVAC technician servicing gas boiler in utility room",
    about: "Heating installation team working on radiator system",
    gallery: [
      "Modern condensing boiler installation",
      "Underfloor heating pipes",
      "Radiator installation work",
      "Boiler maintenance service",
      "Gas pipeline installation",
      "Heating system controls"
    ],
    galleryTitles: [
      { cs: "Kondenzační kotel", en: "Condensing Boiler", de: "Brennwertkessel" },
      { cs: "Podlahové topení", en: "Underfloor Heating", de: "Fußbodenheizung" },
      { cs: "Instalace radiátorů", en: "Radiator Installation", de: "Heizkörperinstallation" },
      { cs: "Servis kotlů", en: "Boiler Service", de: "Kesselwartung" },
      { cs: "Plynový rozvod", en: "Gas Pipeline", de: "Gasleitung" },
      { cs: "Ovládání topení", en: "Heating Controls", de: "Heizungssteuerung" }
    ]
  },
  autorepair: {
    hero: "Professional auto mechanic working under car hood in modern garage",
    about: "Auto repair team performing vehicle diagnostics and maintenance",
    gallery: [
      "Mechanic inspecting engine under hood",
      "Brake disc replacement service",
      "OBD engine diagnostics scan",
      "Tire change and wheel alignment",
      "Oil change service on vehicle lift",
      "Car body paint repair in spray booth"
    ],
    galleryTitles: [
      { cs: "Oprava motoru", en: "Engine Repair", de: "Motorreparatur" },
      { cs: "Výměna brzd", en: "Brake Replacement", de: "Bremsenwechsel" },
      { cs: "Diagnostika", en: "Diagnostics", de: "Diagnostik" },
      { cs: "Přezutí pneumatik", en: "Tire Change", de: "Reifenwechsel" },
      { cs: "Výměna oleje", en: "Oil Change", de: "Ölwechsel" },
      { cs: "Lakování karoserie", en: "Body Paint", de: "Karosserielackierung" }
    ]
  },
  beautysalon: {
    hero: "Elegant beauty salon interior with professional styling stations",
    about: "Beauty team providing luxury hair and skincare services",
    gallery: [
      "Professional hair styling session",
      "Beauty product display shelf",
      "Facial skincare treatment",
      "Makeup application for event",
      "Hair coloring service",
      "Relaxing massage therapy"
    ],
    galleryTitles: [
      { cs: "Účes a styling", en: "Hair Styling", de: "Haarstyling" },
      { cs: "Kosmetické produkty", en: "Beauty Products", de: "Schönheitsprodukte" },
      { cs: "Péče o pleť", en: "Skincare", de: "Hautpflege" },
      { cs: "Líčení", en: "Makeup", de: "Make-up" },
      { cs: "Barvení vlasů", en: "Hair Coloring", de: "Haarfärbung" },
      { cs: "Masáže", en: "Massage", de: "Massage" }
    ]
  },
  photography: {
    hero: "Professional photographer in studio with lighting equipment",
    about: "Photography team capturing moments at various events",
    gallery: [
      "Portrait photography studio setup",
      "Wedding photography outdoor session",
      "Product photography white background",
      "Real estate interior photography",
      "Corporate event photography",
      "Food photography styled dishes"
    ],
    galleryTitles: [
      { cs: "Portrétní focení", en: "Portrait Session", de: "Porträtfotografie" },
      { cs: "Svatební fotografie", en: "Wedding Photos", de: "Hochzeitsfotografie" },
      { cs: "Produktové foto", en: "Product Photos", de: "Produktfotografie" },
      { cs: "Interiérové foto", en: "Interior Photos", de: "Immobilienfotografie" },
      { cs: "Firemní akce", en: "Corporate Events", de: "Firmenevents" },
      { cs: "Food fotografie", en: "Food Photography", de: "Food-Fotografie" }
    ]
  },
  catering: {
    hero: "Elegant catering buffet setup for wedding event",
    about: "Professional catering team preparing gourmet dishes",
    gallery: [
      "Wedding buffet table arrangement",
      "Chef preparing gourmet plates",
      "Corporate event catering",
      "Food truck at outdoor festival",
      "BBQ grill outdoor party",
      "Dessert table with pastries"
    ],
    galleryTitles: [
      { cs: "Svatební raut", en: "Wedding Buffet", de: "Hochzeitsbuffet" },
      { cs: "Příprava jídel", en: "Food Preparation", de: "Speisezubereitung" },
      { cs: "Firemní catering", en: "Corporate Catering", de: "Firmen-Catering" },
      { cs: "Food truck", en: "Food Truck", de: "Food Truck" },
      { cs: "Grilování", en: "BBQ Grill", de: "Grillen" },
      { cs: "Dezerty", en: "Desserts", de: "Desserts" }
    ]
  },
  fitness: {
    hero: "Modern fitness gym interior with professional equipment",
    about: "Fitness trainers coaching clients in state-of-the-art facility",
    gallery: [
      "Weight training area with dumbbells",
      "Personal training kettlebell session",
      "Group yoga class in bright studio",
      "CrossFit functional training zone",
      "Spinning cycling class",
      "Gym reception and lounge area"
    ],
    galleryTitles: [
      { cs: "Posilovna", en: "Weight Room", de: "Kraftraum" },
      { cs: "Osobní trénink", en: "Personal Training", de: "Personal Training" },
      { cs: "Skupinové lekce", en: "Group Classes", de: "Gruppenkurse" },
      { cs: "CrossFit", en: "CrossFit", de: "CrossFit" },
      { cs: "Spinning", en: "Spinning", de: "Spinning" },
      { cs: "Recepce", en: "Reception", de: "Empfang" }
    ]
  },
  moving: {
    hero: "Professional movers loading furniture into moving truck",
    about: "Moving team carefully packing and transporting belongings",
    gallery: [
      "Loading furniture into truck",
      "Professional packing service",
      "Office relocation service",
      "Piano moving with special equipment",
      "Storage facility warehouse",
      "Furniture assembly after move"
    ],
    galleryTitles: [
      { cs: "Nakládání nábytku", en: "Furniture Loading", de: "Möbelverladung" },
      { cs: "Balicí služby", en: "Packing Service", de: "Verpackungsservice" },
      { cs: "Stěhování kanceláří", en: "Office Moving", de: "Büroumzug" },
      { cs: "Přeprava klavíru", en: "Piano Moving", de: "Klaviertransport" },
      { cs: "Skladování", en: "Storage", de: "Lagerung" },
      { cs: "Montáž nábytku", en: "Furniture Assembly", de: "Möbelmontage" }
    ]
  },
  pestcontrol: {
    hero: "Pest control technician in protective gear treating home",
    about: "Professional pest management team performing inspections",
    gallery: [
      "Interior pest treatment spraying",
      "Termite inspection with flashlight",
      "Rodent bait station placement",
      "House fumigation tent setup",
      "Wasp nest removal from roof",
      "Commercial kitchen pest inspection"
    ],
    galleryTitles: [
      { cs: "Postřik interiéru", en: "Interior Treatment", de: "Innenbehandlung" },
      { cs: "Kontrola termitů", en: "Termite Inspection", de: "Termiteninspektion" },
      { cs: "Deratizace", en: "Rodent Control", de: "Nagerbekämpfung" },
      { cs: "Fumigace domu", en: "Fumigation", de: "Begasung" },
      { cs: "Odstranění hnízd", en: "Nest Removal", de: "Nestentfernung" },
      { cs: "Inspekce kuchyně", en: "Kitchen Inspection", de: "Kücheninspektion" }
    ]
  },
  itservices: {
    hero: "IT technician setting up server rack in data center",
    about: "IT team providing comprehensive technology solutions",
    gallery: [
      "Server rack setup in data center",
      "Computer repair and component replacement",
      "Office network cable installation",
      "Cybersecurity monitoring center",
      "WiFi access point installation",
      "IT helpdesk support service"
    ],
    galleryTitles: [
      { cs: "Serverová infrastruktura", en: "Server Infrastructure", de: "Serverinfrastruktur" },
      { cs: "Oprava počítačů", en: "Computer Repair", de: "Computerreparatur" },
      { cs: "Síťová instalace", en: "Network Setup", de: "Netzwerkinstallation" },
      { cs: "Kybernetická bezpečnost", en: "Cybersecurity", de: "Cybersicherheit" },
      { cs: "WiFi řešení", en: "WiFi Solutions", de: "WLAN-Lösungen" },
      { cs: "IT podpora", en: "IT Support", de: "IT-Support" }
    ]
  },
  womeninbusiness: {
    hero: "Professional businesswoman at executive desk in modern office",
    about: "Women business leaders collaborating in boardroom",
    gallery: [
      "Businesswoman leading team meeting at whiteboard",
      "Female entrepreneur working on laptop in stylish office",
      "Two businesswomen collaborating on strategy",
      "Woman giving keynote speech at business conference",
      "Professional women at networking event",
      "Confident female business owner in her office"
    ],
    galleryTitles: [
      { cs: "Vedení týmu", en: "Team Leadership", de: "Teamführung" },
      { cs: "Digitální podnikání", en: "Digital Business", de: "Digitales Business" },
      { cs: "Strategická spolupráce", en: "Strategic Collaboration", de: "Strategische Zusammenarbeit" },
      { cs: "Konferenční prezentace", en: "Conference Presentation", de: "Konferenzpräsentation" },
      { cs: "Networking", en: "Networking", de: "Networking" },
      { cs: "Osobní branding", en: "Personal Branding", de: "Personal Branding" }
    ]
  }
};
