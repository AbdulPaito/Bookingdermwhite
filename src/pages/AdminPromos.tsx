import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, Upload, X, ZoomIn, Check, Loader2 } from "lucide-react";
import { ImageCropModal } from "@/components/ImageCropModal";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPromos, createPromo, updatePromo, deletePromo, uploadImage, type Promo } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FormState = Omit<Promo, "_id"> & { _id?: string };

const empty: FormState = { title: "", description: "", price: undefined, image_url: "", active: true };

const AdminPromos = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const openImageView = useCallback((url: string) => setViewImage(url), []);
  const closeImageView = useCallback(() => setViewImage(null), []);

  const handleToggleActive = async (promo: Promo) => {
    try {
      const updated = await updatePromo(promo._id, { ...promo, active: !promo.active });
      setPromos((prev) => prev.map((p) => (p._id === promo._id ? updated : p)));
      toast({ 
        title: updated.active ? "Activated" : "Deactivated", 
        description: `Promo ${updated.active ? "activated" : "deactivated"} successfully.` 
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update status." });
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const data = await getPromos();
      setPromos(data);
    } catch {
      toast({ title: "Error", description: "Failed to load promos." });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setPendingFile(file);
    setCropModalOpen(true);
    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSkipCrop = async () => {
    if (!pendingFile) return;
    setCropModalOpen(false);
    await performUpload(pendingFile);
    setPendingFile(null);
  };

  const handleCrop = async (croppedBlob: Blob) => {
    if (!pendingFile) return;
    setCropModalOpen(false);
    // Create new file from blob
    const croppedFile = new File([croppedBlob], pendingFile.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    await performUpload(croppedFile);
    setPendingFile(null);
  };

  const performUpload = async (file: File) => {
    setUploading(true);
    setUploadSuccess(false);
    try {
      const url = await uploadImage(file);
      setForm({ ...form, image_url: url });
      setUploadSuccess(true);
      toast({ title: "Uploaded", description: "Image uploaded to Cloudinary." });
      // Reset success state after 2 seconds
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch {
      toast({ title: "Upload failed", description: "Failed to upload image." });
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (form._id) {
        const updated = await updatePromo(form._id, form);
        setPromos((p) => p.map((x) => (x._id === form._id ? updated : x)));
        toast({ title: "Updated", description: "Promo updated successfully." });
      } else {
        const created = await createPromo(form);
        setPromos((p) => [created, ...p]);
        toast({ title: "Created", description: "Promo created successfully." });
      }
      setForm(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save promo." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromo(id);
      setPromos((p) => p.filter((x) => x._id !== id));
      toast({ title: "Deleted", description: "Promo deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete." });
    }
  };

  return (
    <AdminLayout
      title="Promos"
      description="Manage your promotional packages."
      action={
        <Button variant="hero" onClick={() => setForm(empty)}>
          <Plus className="h-4 w-4" /> Add Promo
        </Button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <motion.div
              key={promo._id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className={cn(
              "group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-glow",
              promo.active === false && "opacity-60"
            )}
          >
            <div 
              className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted"
              onClick={() => openImageView(promo.image_url)}
            >
              <img
                src={promo.image_url}
                alt={promo.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Mobile tap indicator */}
              <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-lg md:hidden">
                <ZoomIn className="h-4 w-4" />
              </div>
              {/* Desktop hover indicator */}
              <div className="absolute inset-0 hidden items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 md:flex">
                <div className="rounded-full bg-white/90 p-2 shadow-lg">
                  <ZoomIn className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
              {promo.price > 0 && (
                <span className="absolute right-3 top-3 rounded-full bg-background/95 px-3 py-1 text-sm font-bold text-primary shadow-soft backdrop-blur">
                  ₱{promo.price.toLocaleString()}
                </span>
              )}
              {promo.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-gradient-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-soft">
                  {promo.badge}
                </span>
              )}
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-bold leading-tight">{promo.title}</h3>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  promo.active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                )}>
                  {promo.active !== false ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setForm(promo)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1",
                    promo.active !== false ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"
                  )}
                  onClick={() => handleToggleActive(promo)}
                >
                  {promo.active !== false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {promo.active !== false ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(promo._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}

      {/* Full Image View Modal */}
      {viewImage && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
            onClick={closeImageView}
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
                onClick={closeImageView}
                className="absolute -right-3 -top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={viewImage}
                alt="Full view"
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setForm(null)}
          >
            <motion.form
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onSubmit={save}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-background p-6 shadow-glow sm:rounded-3xl"
            >
              <button
                type="button"
                onClick={() => setForm(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="font-display text-2xl font-bold">{form._id ? "Edit Promo" : "Add Promo"}</h2>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input className="h-11 rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea className="rounded-xl" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Price (₱) <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input className="h-11 rounded-xl" type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })} placeholder="e.g. 599" />
                </div>
                <div className="space-y-2">
                  <Label>Badge (optional)</Label>
                  <Input className="h-11 rounded-xl" value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Promo Image</Label>

                {uploading ? (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-sm font-medium">Uploading image...</span>
                  </div>
                ) : uploadSuccess ? (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 text-green-600">
                    <Check className="h-8 w-8" />
                    <span className="text-sm font-medium">Upload successful!</span>
                  </div>
                ) : form.image_url ? (
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
                    <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: "" })}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-soft backdrop-blur transition hover:bg-background"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-sm font-medium">Click to upload an image</span>
                    <span className="text-xs">PNG, JPG up to ~5MB</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : uploadSuccess ? (
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {uploading ? "Uploading..." : uploadSuccess ? "Uploaded!" : form.image_url ? "Replace Image" : "Upload File"}
                </Button>

              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button type="button" variant="outline" className="w-full" onClick={() => setForm(null)}>Cancel</Button>
                <Button type="submit" variant="hero" className="w-full">{saving ? "Saving..." : form._id ? "Save Changes" : "Add Promo"}</Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageFile={pendingFile}
        onClose={() => {
          setCropModalOpen(false);
          setPendingFile(null);
        }}
        onCrop={handleCrop}
        onSkip={handleSkipCrop}
      />
    </AdminLayout>
  );
};

export default AdminPromos;