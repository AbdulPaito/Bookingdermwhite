import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crop, SkipForward, Check, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCrop: (croppedBlob: Blob) => void;
  onSkip: () => void;
}

// Simple canvas crop using croppedAreaPixels from react-easy-crop
const getCroppedImg = async (
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  // Create image and wait for load
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  // Create canvas with exact crop dimensions
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  // Draw cropped area directly
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  // Export as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas to blob failed"));
        return;
      }
      resolve(blob);
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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Create object URL when file changes
  if (imageFile && !imageUrl) {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
  }

  // Called when crop completes - gives us pixel coordinates
  const onCropComplete = useCallback(
    (
      _: { x: number; y: number; width: number; height: number },
      pixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!imageUrl || !croppedAreaPixels) return;

    setIsProcessing(true);
    
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      
      setUploadSuccess(true);
      setIsProcessing(false);
      
      // Pass blob to parent
      setTimeout(() => {
        onCrop(croppedBlob);
      }, 300);
    } catch (error) {
      console.error("Crop failed:", error);
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
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsProcessing(false);
    setUploadSuccess(false);
  };

  if (!isOpen || !imageUrl) return null;

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
          className="w-full max-w-lg mx-auto rounded-2xl bg-background p-4 sm:p-6 shadow-glow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Crop Image</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Zoom and drag to position
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
          <div className="relative w-full h-[300px] sm:h-[400px] bg-gray-100 rounded-xl overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={true}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f3f4f6",
                },
              }}
            />
          </div>

          {/* Zoom Slider */}
          <div className="mt-4 flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Drag to move • Use slider to zoom • Fixed 4:3 ratio
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
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

            <Button
              type="button"
              variant="hero"
              className={`w-full sm:flex-1 ${uploadSuccess ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={handleCrop}
              disabled={isProcessing || uploadSuccess}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : uploadSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Cropped!
                </>
              ) : (
                <>
                  <Crop className="mr-2 h-4 w-4" />
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
