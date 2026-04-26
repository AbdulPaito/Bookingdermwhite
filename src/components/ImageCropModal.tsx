import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crop as CropIcon, Upload, SkipForward, RotateCcw, Check, Loader2 } from "lucide-react";
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

// Helper to get cropped image as blob with proper canvas rendering
const getCroppedImg = async (
  imageSrc: string,
  crop: CropType,
  imageElement: HTMLImageElement
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      // Calculate actual pixel coordinates based on the displayed image dimensions
      const scaleX = image.naturalWidth / imageElement.width;
      const scaleY = image.naturalHeight / imageElement.height;
      
      const pixelCrop = {
        x: Math.round((crop.x * imageElement.width) / 100 * scaleX),
        y: Math.round((crop.y * imageElement.height) / 100 * scaleY),
        width: Math.round((crop.width * imageElement.width) / 100 * scaleX),
        height: Math.round((crop.height * imageElement.height) / 100 * scaleY),
      };

      // Ensure valid dimensions
      if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
        reject(new Error("Invalid crop dimensions"));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No 2d context"));
        return;
      }

      // Fill white background first (prevent transparency issues)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the cropped portion
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

      // Export as JPEG with high quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas to Blob failed"));
          }
        },
        "image/jpeg",
        0.95
      );
    };

    image.onerror = () => {
      reject(new Error("Failed to load image for cropping"));
    };

    image.src = imageSrc;
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
    width: 80,
    height: 60,
    x: 10,
    y: 20,
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create object URL when file changes
  useEffect(() => {
    if (imageFile && !imageUrl) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
    }
  }, [imageFile, imageUrl]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    
    // Set initial crop to center of image with good starting size
    const img = e.currentTarget;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    
    // Default crop covering most of the image
    let newCrop: CropType;
    if (imgAspect > 4/3) {
      // Wide image - crop to 4:3 aspect from width
      newCrop = {
        unit: "%",
        x: 10,
        y: 5,
        width: 80,
        height: (80 * 3) / (4 * imgAspect) * 100,
      };
    } else {
      // Tall image - crop to 4:3 aspect from height
      newCrop = {
        unit: "%",
        x: 10,
        y: 5,
        width: (80 * 4 * imgAspect) / 3,
        height: 80,
      };
    }
    
    setCrop(newCrop);
  }, []);

  const handleCrop = async () => {
    if (!imgRef.current || !imageUrl) return;

    setIsProcessing(true);
    setUploadError(false);
    
    try {
      const croppedBlob = await getCroppedImg(imageUrl, crop, imgRef.current);
      
      // Show success state briefly
      setUploadSuccess(true);
      setIsProcessing(false);
      
      // Pass blob to parent after success animation
      setTimeout(() => {
        onCrop(croppedBlob);
      }, 500);
      
    } catch (error) {
      console.error("Crop failed:", error);
      setUploadError(true);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (!imgRef.current) return;
    
    const img = imgRef.current;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    
    // Reset to centered crop
    let newCrop: CropType;
    if (imgAspect > 4/3) {
      newCrop = {
        unit: "%",
        x: 10,
        y: 5,
        width: 80,
        height: (80 * 3) / (4 * imgAspect) * 100,
      };
    } else {
      newCrop = {
        unit: "%",
        x: 10,
        y: 5,
        width: (80 * 4 * imgAspect) / 3,
        height: 80,
      };
    }
    
    setCrop(newCrop);
    setUploadSuccess(false);
    setUploadError(false);
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
      width: 80,
      height: 60,
      x: 10,
      y: 20,
    });
    setIsProcessing(false);
    setUploadSuccess(false);
    setUploadError(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl mx-auto rounded-2xl bg-background p-4 sm:p-6 shadow-glow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Crop Image</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Drag corners to resize, drag inside to move
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Crop Container - Large with gray background */}
          <div 
            ref={containerRef}
            className="relative w-full min-h-[320px] sm:min-h-[450px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center"
          >
            {!imageUrl ? (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Loading image...</span>
              </div>
            ) : (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                className="max-w-full max-h-full"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "60vh",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
              </ReactCrop>
            )}
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Resize freely (no fixed ratio). Crop box controls final image area.
          </p>

          {/* Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {/* Skip Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:flex-1"
              onClick={handleSkip}
              disabled={isProcessing || uploadSuccess}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip & Use Original
            </Button>

            {/* Reset Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleReset}
              disabled={isProcessing || uploadSuccess || !imageUrl}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            {/* Crop & Upload Button */}
            <Button
              type="button"
              variant="hero"
              className={`w-full sm:flex-1 ${
                uploadSuccess 
                  ? "bg-green-600 hover:bg-green-700" 
                  : uploadError 
                    ? "bg-red-600 hover:bg-red-700" 
                    : ""
              }`}
              onClick={handleCrop}
              disabled={isProcessing || uploadSuccess || !imageUrl}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : uploadSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Cropped! Uploading...
                </>
              ) : uploadError ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Try Again
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
