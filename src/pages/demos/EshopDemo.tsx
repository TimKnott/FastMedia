import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star, Search, X, Plus, Minus, Trash2, ChevronRight, Package, CreditCard, Truck, Shield, BarChart3, Users, Settings, FileText, Menu, Tag, Heart, ArrowUpDown, ChevronDown } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import WhyThisWebsiteWorks from '@/components/WhyThisWebsiteWorks';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { products, categories, type Product } from '@/data/eshopProducts';
import { eshopImages } from '@/data/eshopImages';
import CheckoutFlow from '@/components/eshop/CheckoutFlow';

interface CartItem {
  product: Product;
  quantity: number;
}

const EshopDemo = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('default');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const wishlistProducts = useMemo(() => products.filter(p => wishlist.has(p.id)), [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = searchQuery === '' ||
        p.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description[language].toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    switch (sortBy) {
      case 'price-asc': return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...filtered].sort((a, b) => b.price - a.price);
      case 'rating': return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'newest': return [...filtered].sort((a, b) => parseInt(b.id.slice(1)) - parseInt(a.id.slice(1)));
      default: return filtered;
    }
  }, [selectedCategory, searchQuery, language, sortBy]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i;
      const newQ = i.quantity + delta;
      return newQ > 0 ? { ...i, quantity: newQ } : i;
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const backOfficeFeatures = [
    { icon: BarChart3, title: { cs: 'Dashboard & Analytika', en: 'Dashboard & Analytics', de: 'Dashboard & Analytik' }, desc: { cs: 'Přehled objednávek, tržeb a návštěvnosti v reálném čase', en: 'Real-time overview of orders, revenue, and traffic', de: 'Echtzeit-Übersicht über Bestellungen, Umsatz und Traffic' } },
    { icon: Package, title: { cs: 'Správa produktů', en: 'Product Management', de: 'Produktverwaltung' }, desc: { cs: 'Přidávání, editace a správa variant s AI popisky', en: 'Add, edit, and manage variants with AI-generated descriptions', de: 'Hinzufügen, Bearbeiten und Verwalten von Varianten mit KI-Beschreibungen' } },
    { icon: Users, title: { cs: 'CRM & zákazníci', en: 'CRM & Customers', de: 'CRM & Kunden' }, desc: { cs: 'Segmentace zákazníků, historie nákupů, věrnostní program', en: 'Customer segmentation, purchase history, loyalty program', de: 'Kundensegmentierung, Kaufhistorie, Treueprogramm' } },
    { icon: CreditCard, title: { cs: 'Platby & objednávky', en: 'Payments & Orders', de: 'Zahlungen & Bestellungen' }, desc: { cs: 'Kanban objednávek, automatické faktury, více platebních metod', en: 'Order kanban, auto-invoicing, multiple payment methods', de: 'Bestellungs-Kanban, Auto-Rechnungen, verschiedene Zahlungsmethoden' } },
    { icon: Truck, title: { cs: 'Doprava & logistika', en: 'Shipping & Logistics', de: 'Versand & Logistik' }, desc: { cs: 'Integrace s přepravci, sledování zásilek, automatické štítky', en: 'Carrier integration, shipment tracking, auto-labels', de: 'Spediteur-Integration, Sendungsverfolgung, Auto-Labels' } },
    { icon: Tag, title: { cs: 'Slevy & marketing', en: 'Discounts & Marketing', de: 'Rabatte & Marketing' }, desc: { cs: 'Slevové kódy, flash sales, e-mail kampaně, remarketing', en: 'Discount codes, flash sales, email campaigns, remarketing', de: 'Rabattcodes, Flash Sales, E-Mail-Kampagnen, Remarketing' } },
    { icon: FileText, title: { cs: 'Blog & SEO', en: 'Blog & SEO', de: 'Blog & SEO' }, desc: { cs: 'Integrovaný blog, automatické meta tagy, sitemap', en: 'Integrated blog, auto meta tags, sitemap', de: 'Integrierter Blog, Auto-Meta-Tags, Sitemap' } },
    { icon: Settings, title: { cs: 'Nastavení & role', en: 'Settings & Roles', de: 'Einstellungen & Rollen' }, desc: { cs: 'Správa uživatelů, role, audit log, vícejazyčnost', en: 'User management, roles, audit log, multi-language', de: 'Benutzerverwaltung, Rollen, Audit-Log, Mehrsprachigkeit' } },
  ];

  const gradientClass = 'bg-gradient-to-br from-violet-600 to-fuchsia-500';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="E-shop Demo — FastMedia.Pro"
        description={language === 'cs' ? 'Ukázka moderního e-shopu s košíkem, recenzemi a back-office správou' : 'Modern e-shop demo with cart, reviews, and back-office management'}
        canonical="/demo/eshop"
        pagePath="/demo/eshop"
      />

      {/* Back to FastMedia Banner */}
      <div className="bg-foreground text-background py-2 px-4 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {language === 'cs' ? 'Zpět na FastMedia.Pro' : language === 'en' ? 'Back to FastMedia.Pro' : 'Zurück zu FastMedia.Pro'}
          </Link>
          <span className="mx-1">|</span>
          <span className="text-background/70 hidden sm:inline">
            {language === 'cs' ? 'Toto je ukázkový e-shop – může být váš!' : language === 'en' ? 'This is a demo e-shop – it could be yours!' : 'Dies ist ein Demo-E-Shop – er könnte Ihnen gehören!'}
          </span>
        </div>
        <LanguageSwitcher triggerClassName="text-background/80 hover:text-background hover:bg-primary-foreground/10 h-7 px-2" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${gradientClass} rounded-lg flex items-center justify-center text-xl`}>🛍️</div>
            <span className="font-display font-bold text-lg text-foreground">StyleShop</span>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'cs' ? 'Hledat produkty...' : language === 'en' ? 'Search products...' : 'Produkte suchen...'}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wishlist button */}
            <button onClick={() => setWishlistOpen(true)} className="relative p-2 text-foreground hover:text-primary transition-colors">
              <Heart className={`w-6 h-6 ${wishlist.size > 0 ? 'fill-destructive text-destructive' : ''}`} />
              {wishlist.size > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-bold">
                  {wishlist.size}
                </span>
              )}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'cs' ? 'Hledat produkty...' : 'Search products...'}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <section className={`relative py-16 sm:py-24 ${gradientClass} overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center text-primary-foreground max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm">
              🛍️ {language === 'cs' ? 'Ukázkový E-shop' : language === 'en' ? 'Demo E-shop' : 'Demo E-Shop'}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              {language === 'cs' ? 'Moderní e-shop na klíč' : language === 'en' ? 'Modern Turnkey E-shop' : 'Moderner Schlüsselfertig E-Shop'}
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              {language === 'cs' ? '24+ produktů, košík, recenze zákazníků a kompletní back-office správa' : language === 'en' ? '24+ products, shopping cart, customer reviews, and complete back-office management' : '24+ Produkte, Warenkorb, Kundenbewertungen und komplette Backoffice-Verwaltung'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
                <Shield className="w-4 h-4" /> {language === 'cs' ? 'Bezpečné platby' : 'Secure Payments'}
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
                <Truck className="w-4 h-4" /> {language === 'cs' ? 'Rychlé doručení' : 'Fast Delivery'}
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
                <Star className="w-4 h-4" /> {language === 'cs' ? '4.8 hodnocení' : '4.8 Rating'}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-b border-border sticky top-[57px] z-40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                {cat.label[language]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {language === 'cs' ? `${filteredProducts.length} produktů` : `${filteredProducts.length} products`}
            </h2>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sortBy === 'default' && (language === 'cs' ? 'Řazení' : 'Sort')}
                  {sortBy === 'price-asc' && (language === 'cs' ? 'Cena ↑' : 'Price ↑')}
                  {sortBy === 'price-desc' && (language === 'cs' ? 'Cena ↓' : 'Price ↓')}
                  {sortBy === 'rating' && (language === 'cs' ? 'Hodnocení' : 'Rating')}
                  {sortBy === 'newest' && (language === 'cs' ? 'Nejnovější' : 'Newest')}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-1 z-20">
                    {([
                      { value: 'default', label: language === 'cs' ? 'Výchozí' : 'Default' },
                      { value: 'price-asc', label: language === 'cs' ? 'Cena: nejnižší' : 'Price: Low to High' },
                      { value: 'price-desc', label: language === 'cs' ? 'Cena: nejvyšší' : 'Price: High to Low' },
                      { value: 'rating', label: language === 'cs' ? 'Nejlépe hodnocené' : 'Top Rated' },
                      { value: 'newest', label: language === 'cs' ? 'Nejnovější' : 'Newest' },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt.value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground hover:bg-secondary/50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 8) * 0.05 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-secondary/30 flex items-center justify-center">
                  <img src={eshopImages[product.id]} alt={product.name[language]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 ${gradientClass} text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full`}>
                      {product.badge[language]}
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(product); }}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className={`absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${wishlist.has(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${wishlist.has(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{product.name[language]}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-1">{product.description[language]}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-foreground">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-foreground">{product.price.toLocaleString()} {product.currency}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">{product.originalPrice.toLocaleString()} {product.currency}</span>
                    )}
                  </div>
                  {product.colors && (
                    <div className="flex gap-1 mt-2">
                      {product.colors.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] bg-secondary/30 flex items-center justify-center rounded-t-3xl">
                <img src={eshopImages[selectedProduct.id]} alt={selectedProduct.name[language]} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-foreground" />
                </button>
                {selectedProduct.badge && (
                  <span className={`absolute top-4 left-4 ${gradientClass} text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full`}>
                    {selectedProduct.badge[language]}
                  </span>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-display font-bold text-foreground">{selectedProduct.name[language]}</h2>
                <p className="text-muted-foreground mt-2">{selectedProduct.description[language]}</p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{selectedProduct.rating}</span>
                  <span className="text-sm text-muted-foreground">({selectedProduct.reviewCount} {language === 'cs' ? 'recenzí' : 'reviews'})</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-3xl font-bold text-foreground">{selectedProduct.price.toLocaleString()} {selectedProduct.currency}</span>
                  {selectedProduct.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">{selectedProduct.originalPrice.toLocaleString()} {selectedProduct.currency}</span>
                  )}
                </div>

                {selectedProduct.colors && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-foreground">{language === 'cs' ? 'Barvy:' : 'Colors:'}</span>
                    <div className="flex gap-2 mt-2">
                      {selectedProduct.colors.map((c, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-border hover:border-primary cursor-pointer transition-colors" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.sizes && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-foreground">{language === 'cs' ? 'Velikosti:' : 'Sizes:'}</span>
                    <div className="flex gap-2 mt-2">
                      {selectedProduct.sizes.map(s => (
                        <button key={s} className="px-3 py-1.5 border border-border rounded-lg text-sm text-foreground hover:border-primary transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setCartOpen(true); }} className={`w-full mt-6 ${gradientClass} text-primary-foreground font-semibold h-12 text-base`}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {language === 'cs' ? 'Přidat do košíku' : language === 'en' ? 'Add to Cart' : 'In den Warenkorb'}
                </Button>

                {/* Reviews */}
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">
                    {language === 'cs' ? 'Recenze zákazníků' : 'Customer Reviews'}
                  </h3>
                  <div className="space-y-4">
                    {selectedProduct.reviews.map((review, i) => (
                      <div key={i} className="bg-secondary/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{review.name.charAt(0)}</div>
                            <span className="text-sm font-medium text-foreground">{review.name}</span>
                            {review.verified && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">✓</span>}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.text[language]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {wishlistOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-foreground/50" onClick={() => setWishlistOpen(false)}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display font-bold text-xl text-foreground">
                  <Heart className="w-5 h-5 inline-block mr-2 fill-destructive text-destructive" />
                  {language === 'cs' ? 'Oblíbené' : language === 'en' ? 'Wishlist' : 'Wunschliste'} ({wishlist.size})
                </h2>
                <button onClick={() => setWishlistOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">{language === 'cs' ? 'Zatím nemáte žádné oblíbené produkty' : language === 'en' ? 'No wishlist items yet' : 'Noch keine Wunschlisten-Artikel'}</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">{language === 'cs' ? 'Klikněte na srdíčko u produktu' : 'Click the heart icon on a product'}</p>
                  </div>
                ) : (
                  wishlistProducts.map(product => (
                    <div key={product.id} className="flex gap-4 bg-secondary/30 rounded-xl p-4">
                      <div
                        className="w-20 h-20 rounded-lg bg-secondary/50 flex-shrink-0 overflow-hidden cursor-pointer"
                        onClick={() => { setWishlistOpen(false); setSelectedProduct(product); }}
                      >
                        <img src={eshopImages[product.id]} alt={product.name[language]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-semibold text-foreground text-sm truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => { setWishlistOpen(false); setSelectedProduct(product); }}
                        >
                          {product.name[language]}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-foreground">{product.rating}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-foreground">{product.price.toLocaleString()} {product.currency}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            className={`${gradientClass} text-primary-foreground text-xs h-8`}
                            onClick={() => { addToCart(product); }}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            {language === 'cs' ? 'Do košíku' : language === 'en' ? 'Add to Cart' : 'In den Warenkorb'}
                          </Button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            title={language === 'cs' ? 'Odebrat z oblíbených' : 'Remove from wishlist'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {wishlistProducts.length > 0 && (
                <div className="p-6 border-t border-border">
                  <Button
                    className={`w-full ${gradientClass} text-primary-foreground font-semibold h-12`}
                    onClick={() => {
                      wishlistProducts.forEach(p => addToCart(p));
                      setWishlistOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {language === 'cs' ? 'Přidat vše do košíku' : language === 'en' ? 'Add All to Cart' : 'Alle in den Warenkorb'}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-foreground/50" onClick={() => setCartOpen(false)}>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display font-bold text-xl text-foreground">
                  {language === 'cs' ? 'Košík' : language === 'en' ? 'Cart' : 'Warenkorb'} ({cartCount})
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">{language === 'cs' ? 'Košík je prázdný' : 'Cart is empty'}</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 bg-secondary/30 rounded-xl p-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary/50 flex-shrink-0 overflow-hidden">
                        <img src={eshopImages[item.product.id]} alt={item.product.name[language]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{item.product.name[language]}</h4>
                        <p className="text-sm font-bold text-foreground mt-1">{item.product.price.toLocaleString()} {item.product.currency}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-foreground w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeFromCart(item.product.id)} className="ml-auto p-1 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border space-y-4">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>{language === 'cs' ? 'Celkem' : 'Total'}</span>
                    <span>{cartTotal.toLocaleString()} Kč</span>
                  </div>
                  <Button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className={`w-full ${gradientClass} text-primary-foreground font-semibold h-12`}>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {language === 'cs' ? 'Přejít k pokladně' : language === 'en' ? 'Checkout' : 'Zur Kasse'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {language === 'cs' ? 'Bezpečná platba • Doprava zdarma od 1 500 Kč' : 'Secure payment • Free shipping over 1,500 Kč'}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back-office Features Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider mb-3 text-violet-500">
              {language === 'cs' ? 'Back-office' : 'Back-office'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              {language === 'cs' ? 'Kompletní správa e-shopu' : language === 'en' ? 'Complete E-shop Management' : 'Komplette E-Shop-Verwaltung'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {language === 'cs' ? 'Vše co potřebujete pro provoz e-shopu v jednom prostředí' : 'Everything you need to run your e-shop in one place'}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {backOfficeFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{feature.title[language]}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc[language]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Website Works */}
      <WhyThisWebsiteWorks />

      {/* CTA */}
      <section className={`py-16 lg:py-24 ${gradientClass} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto text-primary-foreground">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
              {language === 'cs' ? 'Chcete vlastní e-shop?' : language === 'en' ? 'Want Your Own E-shop?' : 'Möchten Sie Ihren eigenen E-Shop?'}
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              {language === 'cs' ? 'Získejte profesionální e-shop na klíč s kompletní správou' : 'Get a professional turnkey e-shop with complete management'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/calculator">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-semibold text-lg px-8">
                  {language === 'cs' ? 'Spočítat cenu' : 'Calculate Price'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/#booking">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8">
                  {language === 'cs' ? 'Konzultace zdarma' : 'Free Consultation'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Checkout Flow */}
      <AnimatePresence>
        {checkoutOpen && cart.length > 0 && (
          <CheckoutFlow
            cart={cart}
            cartTotal={cartTotal}
            onBack={() => setCheckoutOpen(false)}
            onComplete={() => { setCheckoutOpen(false); setCart([]); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EshopDemo;
