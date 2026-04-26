import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ZoomIn, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Promo } from "@/lib/api";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80";

type Props = {
  promo: Promo;
  onBook: (promo: Promo) => void;
  index?: number;
};

export const PromoCard = ({ promo, onBook, index = 0 }: Props) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-glow"
    >
      <div 
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted"
        onClick={() => setShowFullImage(true)}
      >
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-medium text-primary/70">Loading...</span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Image unavailable</span>
          </div>
        )}
        <img
          src={promo.image_url}
          alt={promo.title}
          loading={index < 3 ? "eager" : "lazy"}
          className={"w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 " + (imgLoaded && !imgError ? "opacity-100" : "opacity-0")}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
        />
        {/* Mobile tap indicator - always visible */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-lg md:hidden">
          <ZoomIn className="h-4 w-4" />
        </div>
        {/* Desktop hover indicator */}
        <div className="absolute inset-0 hidden items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100 md:flex">
          <div className="rounded-full bg-white/90 p-2 shadow-lg">
            <ZoomIn className="h-5 w-5 text-foreground" />
          </div>
        </div>
        {/* Badge Type Label */}
        {promo.badgeType && (
          <span className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-soft ${
            promo.badgeType === 'hot-deal' ? 'bg-red-500 text-white' :
            promo.badgeType === 'best-seller' ? 'bg-amber-500 text-white' :
            promo.badgeType === 'limited-time' ? 'bg-purple-500 text-white' :
            'bg-accent text-accent-foreground'
          }`}>
            {promo.badgeType === 'hot-deal' && '🔥'}
            {promo.badgeType === 'best-seller' && '⭐'}
            {promo.badgeType === 'limited-time' && '⏰'}
            {promo.badgeType === 'hot-deal' ? 'Hot Deal' :
             promo.badgeType === 'best-seller' ? 'Best Seller' :
             promo.badgeType === 'limited-time' ? 'Limited Time' : ''}
          </span>
        )}
        {/* Custom Badge Text */}
        {promo.badge && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-soft">
            <Sparkles className="h-3 w-3" /> {promo.badge}
          </span>
        )}
      </div>

      {/* Full Image Modal - Using Portal */}
      {showFullImage && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute -right-3 -top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={imgError ? FALLBACK_IMAGE : promo.image_url}
                alt={promo.title}
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Title</span>
          <h3 className="font-display text-xl font-bold leading-tight">{promo.title}</h3>
        </div>
        
        {/* Description */}
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Description</span>
          <p className="text-sm text-muted-foreground line-clamp-3">{promo.description}</p>
        </div>

        {/* Limited Time Dates */}
        {promo.badgeType === 'limited-time' && (promo.startDate || promo.endDate) && (
          <div className="rounded-lg bg-purple-50 p-2 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">⏰ Promo Period</span>
            <div className="mt-1 text-purple-700">
              {promo.startDate && (
                <div>Starts: {new Date(promo.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              )}
              {promo.endDate && (
                <div>Ends: {new Date(promo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        )}
        
        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</span>
            <p className="font-display text-2xl font-bold text-primary">₱{promo.price?.toLocaleString() || '0'}</p>
          </div>
          <Button variant="hero" size="sm" onClick={() => onBook(promo)}>
            Book Now
          </Button>
        </div>
      </div>
    </motion.article>
  );
};