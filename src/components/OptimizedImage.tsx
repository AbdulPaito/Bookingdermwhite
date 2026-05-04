import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  onError?: () => void;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80";

/**
 * Optimized Image Component
 * - Handles loading states properly
 * - Ensures visibility even if onLoad fires early
 * - Adds Cloudinary optimizations automatically
 * - Smooth fade-in animation
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  priority = false,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading trigger
  useEffect(() => {
    if (priority || loading === 'eager') {
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
  }, [priority, loading]);

  // Check if image is already complete (cached) on mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  // Handle successful load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // Handle error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  // Optimize Cloudinary URL
  const getOptimizedUrl = (url: string): string => {
    if (!url || hasError) return FALLBACK_IMAGE;
    
    // Only optimize Cloudinary URLs
    if (!url.includes('cloudinary.com')) return url;
    
    // Add f_auto (format auto), q_auto (quality auto), w_600 (width 600)
    // Pattern: /upload/ -> /upload/f_auto,q_auto,w_600/
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
    }
    
    return url;
  };

  const optimizedSrc = getOptimizedUrl(src);
  const displaySrc = hasError ? FALLBACK_IMAGE : optimizedSrc;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {/* Skeleton Loader - shows until image loads */}
      <div 
        className={`absolute inset-0 bg-muted animate-pulse transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Actual Image - always rendered, visibility controlled by opacity */}
      {(isInViewport || priority) && (
        <img
          ref={imgRef}
          src={displaySrc}
          alt={alt}
          loading={loading}
          decoding={priority ? 'sync' : 'async'}
          className={`${className} transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ 
            willChange: 'opacity',
            transform: 'translateZ(0)', // Force GPU layer
          }}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
