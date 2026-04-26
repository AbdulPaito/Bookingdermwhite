import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crop as CropIcon, Upload, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactCrop, { type Crop as CropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCrop: (croppedBlob: Blob) => void;
  onSkip: () => void;
}

// Helper to get cropped image as blob
const getCroppedImg = (
  image: HTMLImageElement,
  crop: CropType
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // Calculate pixel values from percentage
  const pixelCrop = {
    x: (crop.x * image.width) / 100 * scaleX,
    y: (crop.y * image.height) / 100 * scaleY,
    width: (crop.width * image.width) / 100 * scaleX,
    height: (crop.height * image.height) / 100 * scaleY,
  };

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

export const ImageCropModal = ({
  isOpen,
  imageFile,
  onClose,
  onCrop,
  onSkip,
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState<CropType>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Create object URL when file changes
  if (imageFile && !imageUrl) {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
  }, []);

  const handleCrop = async () => {
    if (!imgRef.current || !imageUrl) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, crop);
      onCrop(croppedBlob);
    } catch (error) {
      console.error("Crop failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    cleanup();
    onSkip();
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setCrop({
      unit: "%",
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    });
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl mx-auto rounded-2xl bg-background p-4 sm:p-6 shadow-glow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Crop Image</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Drag to resize, move to reposition
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Crop Container */}
          <div className="relative w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: "100%", maxHeight: "60vh", display: "block" }}
              />
            </ReactCrop>
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Drag the corners to resize, drag inside to move. No fixed ratio.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:flex-1"
              onClick={handleSkip}
              disabled={isProcessing}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip & Use Original
            </Button>
            <Button
              type="button"
              variant="hero"
              className="w-full sm:flex-1"
              onClick={handleCrop}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <CropIcon className="mr-2 h-4 w-4" />
                  Crop & Upload
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
