import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Heart, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PromoCard } from "@/components/PromoCard";
import { BookingModal } from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { getPromos, type Promo } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";

const features = [
  { icon: ShieldCheck, title: "Safe & Effective", text: "FDA-approved treatments performed in a sterile environment." },
  { icon: Zap, title: "No Downtime", text: "Walk in and glow out — most treatments fit your lunch break." },
  { icon: Heart, title: "Affordable Packages", text: "Premium results without the premium-only price tag." },
  { icon: Award, title: "Certified Staff", text: "Licensed dermatologists and trained estheticians, always." },
];

type FilterTab = 'all' | 'hot-deal' | 'best-seller' | 'limited-time';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promo | undefined>();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);

  // Filter promos based on active tab
  const filteredPromos = promos.filter((promo) => {
    if (activeFilter === 'all') return true;
    return promo.badgeType === activeFilter;
  });

  // Fetch promos with retry logic - NO ERROR TOAST (silent retry)
  useEffect(() => {
    const fetchPromos = async (retries = 3) => {
      try {
        setLoading(true);
        const data = await getPromos();
        setPromos(data.filter((p) => p.active !== false));
        setLoading(false);
      } catch (err: any) {
        console.error('[Home] Failed to load promos:', err);
        
        // Silent retry on timeout - NO ERROR SHOWN TO USER
        if (retries > 0 && (err.code === 'ECONNABORTED' || err.message?.includes('timeout'))) {
          console.log(`[Home] Server waking up, retrying... ${retries} left`);
          setTimeout(() => fetchPromos(retries - 1), 3000);
          return; // Keep loading state, don't show error
        }
        
        // Only show error if truly failed after all retries
        setLoading(false);
        // Don't show toast - just show empty state with retry button
      }
    };
    
    fetchPromos();
  }, []);

  const openBooking = (promo?: Promo) => {
    setSelectedPromo(promo);
    setOpen(true);
  };

  const scrollToPromos = () => {
    document.getElementById("promos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onBookClick={() => openBooking()} />

      {/* Hero */}
      <section id="home" className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />

        <div className="container relative mx-auto grid gap-8 px-4 py-10 sm:py-12 md:grid-cols-2 md:items-center md:gap-10 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 space-y-6 md:order-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-xs font-semibold text-primary shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {settings.heroBadge}
            </span>
            <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              {settings.heroTitleLine1} <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">{settings.heroTitleLine2}</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground whitespace-pre-line">
              {settings.heroSubtext}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="xl" onClick={() => openBooking()}>
                {settings.heroPrimaryCta}
              </Button>
              <Button variant="outline" size="xl" onClick={scrollToPromos}>
                {settings.heroSecondaryCta}
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-gradient-primary shadow-soft" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-xs text-muted-foreground">Loved by 5,000+ glow-getters</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative order-1 md:order-2"
          >
            <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-2 shadow-glow ring-1 ring-primary/10 sm:aspect-[4/5] sm:rounded-3xl sm:p-3 md:rounded-[2.5rem]">
              {(!heroImgLoaded || settingsLoading) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium text-primary/70">Loading image...</span>
                </div>
              )}
              <img
                src={settings.heroImage || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"}
                alt="Premium beauty clinic hero"
                className="h-full w-full rounded-xl object-contain sm:rounded-2xl md:rounded-[2rem]"
                onLoad={() => setHeroImgLoaded(true)}
                onError={() => setHeroImgLoaded(true)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promos */}
      <section id="promos" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Our Promos</span>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Treatments You'll Love</h2>
          <p className="mt-3 text-muted-foreground">
            Curated packages designed to deliver real, visible results.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {[
            { id: 'all', label: 'All', emoji: '🔥', count: promos.length },
            { id: 'hot-deal', label: 'Hot Deals', emoji: '🔥', count: promos.filter(p => p.badgeType === 'hot-deal').length },
            { id: 'best-seller', label: 'Best Sellers', emoji: '⭐', count: promos.filter(p => p.badgeType === 'best-seller').length },
            { id: 'limited-time', label: 'Limited Time', emoji: '⏰', count: promos.filter(p => p.badgeType === 'limited-time').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterTab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.emoji} {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeFilter === tab.id ? 'bg-white/20' : 'bg-background'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-8">
            {/* Server waking up message */}
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-6 py-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium text-primary">
                  Loading promos... Please wait a moment
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Our server is waking up ⏰
              </p>
            </div>
            {/* Skeleton cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-gradient-to-br from-muted via-muted/80 to-muted" />
              ))}
            </div>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No promos found in this category.</p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Show all promos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPromos.map((promo, i) => (
              <PromoCard key={promo._id} promo={promo} onBook={openBooking} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section id="why" className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Why Choose Us</span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">A Standard of Care</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-glow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-primary p-10 text-center text-primary-foreground shadow-glow sm:p-16"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-background/20 blur-2xl" />
          <div className="relative space-y-5">
            <Sparkles className="mx-auto h-10 w-10" />
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready to Glow?</h2>
            <p className="mx-auto max-w-xl text-primary-foreground/90">
              Join thousands of glow-getters who trust us with their skin. Book your appointment today.
            </p>
            <Button variant="accent" size="xl" onClick={() => openBooking()}>
              Book Appointment
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />

      <BookingModal open={open} onClose={() => setOpen(false)} promo={selectedPromo} />
    </div>
  );
};

export default Home;
