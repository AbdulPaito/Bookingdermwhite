import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crop, Upload, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCrop: (croppedBlob: Blob) => void;
  onSkip: () => void;
}

export const ImageCropModal = ({ isOpen, imageFile, onClose, onCrop, onSkip }: ImageCropModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);

  const loadImage = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      setImageObj(img);
      setImageLoaded(true);
      // Draw image on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Calculate scale to fit within max dimensions
          const maxWidth = 600;
          const maxHeight = 500;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          setScale(width / img.width);
          ctx.drawImage(img, 0, 0, width, height);
        }
      }
    };
    img.src = URL.createObjectURL(file);
  }, []);

  // Load image when file changes
  if (imageFile && !imageObj) {
    loadImage(imageFile);
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCropArea(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropArea({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCrop = () => {
    if (!cropArea || !imageObj || !canvasRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate actual crop coordinates on original image
    const actualX = cropArea.x / scale;
    const actualY = cropArea.y / scale;
    const actualWidth = cropArea.width / scale;
    const actualHeight = cropArea.height / scale;

    canvas.width = actualWidth;
    canvas.height = actualHeight;
    
    ctx.drawImage(
      imageObj,
      actualX, actualY, actualWidth, actualHeight,
      0, 0, actualWidth, actualHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSkip = () => {
    setCropArea(null);
    setImageObj(null);
    setImageLoaded(false);
    onSkip();
  };

  const handleClose = () => {
    setCropArea(null);
    setImageObj(null);
    setImageLoaded(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-glow"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="mb-4 font-display text-xl font-bold">Crop Image (Optional)</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag to select area to crop, or skip to use original image.
          </p>

          <div className="relative mb-4 overflow-hidden rounded-xl border border-border bg-muted">
            {!imageLoaded ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="cursor-crosshair"
                />
                {cropArea && (
                  <div
                    className="pointer-events-none absolute border-2 border-primary bg-primary/20"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip & Use Original
            </Button>
            <Button
              type="button"
              variant="hero"
              className="flex-1"
              onClick={handleCrop}
              disabled={!cropArea}
            >
              <Crop className="mr-2 h-4 w-4" />
              {cropArea ? "Crop & Upload" : "Select Area First"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
