import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Promo } from "@/lib/api";

type Props = {
  promo: Promo;
  onBook: (promo: Promo) => void;
  index?: number;
};

export const PromoCard = ({ promo, onBook, index = 0 }: Props) => {
  const [showFullImage, setShowFullImage] = useState(false);

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
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-gradient-to-br from-primary/10 via-muted/40 to-accent/10"
        onClick={() => setShowFullImage(true)}
      >
        <img
          src={promo.image_url}
          alt={promo.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        {promo.badge && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-soft">
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
                src={promo.image_url}
                alt={promo.title}
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
                onError={(e) => console.error('Image load error:', e)}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl font-bold leading-tight">{promo.title}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{promo.description}</p>
        <div className="flex items-end justify-between pt-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">From</span>
            <p className="font-display text-2xl font-bold text-primary">₱{promo.price.toLocaleString()}</p>
          </div>
          <Button variant="hero" size="sm" onClick={() => onBook(promo)}>
            Book Now
          </Button>
        </div>
      </div>
    </motion.article>
  );
};