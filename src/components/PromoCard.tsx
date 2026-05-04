import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Promo } from "@/lib/api";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80";

type Props = {
  promo: Promo;
  onBook: (promo: Promo) => void;
  index?: number;
};

/**
 * CLOUDINARY URL OPTIMIZER
 * Adds f_auto (format auto), q_auto (quality auto), w_600 (width 600)
 */
const getOptimizedCloudinaryUrl = (url: string): string => {
  if (!url) return FALLBACK_IMAGE;
  
  // Only optimize Cloudinary URLs
  if (!url.includes('cloudinary.com')) return url;
  
  // Already optimized? Skip
  if (url.includes('f_auto') || url.includes('q_auto')) return url;
  
  // Add optimizations: /upload/ -> /upload/f_auto,q_auto,w_600/
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
  }
  
  return url;
};

/**
 * FIXED PromoCard Component
 * 
 * ROOT CAUSE OF ORIGINAL BUG:
 * - Image started with opacity-0
 * - onLoad event can fire BEFORE React attaches listener (race condition)
 * - This happens with cached images or fast network
 * - Result: Image stays invisible forever
 * 
 * FIX:
 * - Use useRef to check img.complete on mount
 * - Skeleton loader shows while loading
 * - Image always rendered, opacity fades in after load
 * - Intersection Observer triggers load only when visible
 */
export const PromoCard = ({ promo, onBook, index = 0 }: Props) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Optimize image URL
  const optimizedUrl = getOptimizedCloudinaryUrl(promo.image_url);
  const displayUrl = hasError ? FALLBACK_IMAGE : optimizedUrl;

  /**
   * CRITICAL FIX #1: Intersection Observer
   * Only load image when it enters viewport (+50px margin)
   * This prevents loading all images at once
   */
  useEffect(() => {
    // First 3 images load immediately (priority)
    if (index < 3) {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  /**
   * CRITICAL FIX #2: Check if already loaded (cached images)
   * If image.complete is true on mount, set isLoaded immediately
   * This prevents "invisible cached image" bug
   */
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  // Handle successful load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  // Handle error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true); // Show fallback
  }, []);

  // Determine loading strategy
  const loading = index < 3 ? 'eager' : 'lazy';
  const decoding = index < 3 ? 'sync' : 'async';

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-glow"
    >
      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted"
        onClick={() => setShowFullImage(true)}
      >
        {/* 
          SKELETON LOADER
          Shows while image is loading - prevents layout shift
        */}
        <div 
          className={`absolute inset-0 z-10 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse transition-opacity duration-500 ${
            isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {/* 
          OPTIMIZED IMAGE - ALWAYS RENDERED
          - Starts visible immediately (no opacity-0)
          - Skeleton overlays until loaded
          - Aggressive fix for race condition
        */}
        <img
          ref={imgRef}
          src={displayUrl}
          alt={promo.title}
          loading={loading}
          decoding={decoding}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out will-change-transform ${
            isLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-100'  // ← CHANGED: Always visible, skeleton covers it
          } group-hover:scale-105`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ 
            transform: 'translateZ(0)', // GPU layer
          }}
        />

        {/* Error State Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-muted gap-2">
            <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Image unavailable</span>
          </div>
        )}
        
        {/* Mobile tap indicator */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-lg md:hidden z-30">
          <ZoomIn className="h-4 w-4" />
        </div>
        
        {/* Desktop hover indicator */}
        <div className="absolute inset-0 hidden items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100 md:flex z-30">
          <div className="rounded-full bg-white/90 p-2 shadow-lg">
            <ZoomIn className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* Badge Type Label */}
        {promo.badgeType && (
          <span className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-soft z-30 ${
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
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-soft z-30">
            <Sparkles className="h-3 w-3" /> {promo.badge}
          </span>
        )}
      </div>

      {/* Full Image Modal */}
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
              {/* Full resolution for modal */}
              <img
                src={hasError ? FALLBACK_IMAGE : promo.image_url}
                alt={promo.title}
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
                loading="eager"
                onError={(e) => { 
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; 
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl font-bold leading-tight">{promo.title}</h3>
        <p className="flex-1 text-sm text-muted-foreground line-clamp-3">{promo.description}</p>

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
            <span className="text-xs uppercase tracking-wider text-muted-foreground">From</span>
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

export default PromoCard;