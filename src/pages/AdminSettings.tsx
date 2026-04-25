import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, RotateCcw, Save, Type, Upload, X } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getSettings, updateSettings, uploadImage, type SiteSettings } from "@/lib/api";

const defaults: SiteSettings = {
  hero_image: "",
  hero_badge: "Premium Skincare & Wellness",
  hero_title_line1: "Glow with",
  hero_title_line2: "Confidence ✨",
  hero_subtext: "Premium skincare & wellness treatments starting at ₱599. Reveal your best skin in just one session.",
  hero_primary_cta: "Book Now",
  hero_secondary_cta: "View Promos",
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [draft, setDraft] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      setDraft(data);
    } catch {
      toast({ title: "Error", description: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please choose an image under 5MB." });
      return;
    }
    try {
      const url = await uploadImage(file);
      setField("hero_image", url);
      toast({ title: "Uploaded", description: "Image uploaded to Cloudinary." });
    } catch {
      toast({ title: "Upload failed", description: "Failed to upload image." });
    }
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateSettings(draft);
      setSettings(updated);
      toast({ title: "Saved ✨", description: "Your landing page has been updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await updateSettings(defaults);
      setSettings(defaults);
      setDraft(defaults);
      toast({ title: "Reset", description: "Reverted to default content." });
    } catch {
      toast({ title: "Error", description: "Failed to reset settings." });
    }
  };

  return (
    <AdminLayout
      title="Site Settings"
      description="Customize the hero section that customers see first."
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="hero" onClick={save} disabled={!dirty || saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[1.1fr_1fr]"
      >
        {/* Editor column */}
        <div className="space-y-6">
          {/* Image editor */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Hero Image</h2>
            </div>

            {draft.hero_image ? (
              <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-background p-3">
                <img
                  src={draft.hero_image}
                  alt="Hero preview"
                  className="max-h-[520px] w-auto max-w-full rounded-xl object-contain shadow-soft"
                />
                <button
                  type="button"
                  onClick={() => setField("hero_image", "")}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow-soft backdrop-blur transition hover:bg-background"
                  aria-label="Clear image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[4/5] max-h-[360px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm font-semibold">Click to upload an image</span>
                <span className="text-xs">PNG or JPG, up to 5MB</span>
              </button>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

            <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {draft.hero_image ? "Replace Image" : "Upload File"}
            </Button>
          </div>

          {/* Text editor */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Hero Content</h2>
            </div>

            <div className="space-y-2">
              <Label>Top badge</Label>
              <Input
                className="h-11 rounded-xl"
                value={draft.hero_badge}
                onChange={(e) => setField("hero_badge", e.target.value)}
                placeholder="Premium Skincare & Wellness"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Headline (line 1)</Label>
                <Input
                  className="h-11 rounded-xl"
                  value={draft.hero_title_line1}
                  onChange={(e) => setField("hero_title_line1", e.target.value)}
                  placeholder="Glow with"
                />
              </div>
              <div className="space-y-2">
                <Label>Headline (line 2 — pink)</Label>
                <Input
                  className="h-11 rounded-xl"
                  value={draft.hero_title_line2}
                  onChange={(e) => setField("hero_title_line2", e.target.value)}
                  placeholder="Confidence ✨"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtext</Label>
              <Textarea
                className="rounded-xl"
                rows={3}
                value={draft.hero_subtext}
                onChange={(e) => setField("hero_subtext", e.target.value)}
                placeholder="Premium skincare & wellness treatments..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary button</Label>
                <Input
                  className="h-11 rounded-xl"
                  value={draft.hero_primary_cta}
                  onChange={(e) => setField("hero_primary_cta", e.target.value)}
                  placeholder="Book Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary button</Label>
                <Input
                  className="h-11 rounded-xl"
                  value={draft.hero_secondary_cta}
                  onChange={(e) => setField("hero_secondary_cta", e.target.value)}
                  placeholder="View Promos"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Live Preview</h3>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              Draft
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-hero p-6 shadow-card">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[10px] font-semibold text-primary backdrop-blur">
              ✨ {draft.hero_badge || "—"}
            </span>
            <h1 className="mt-4 font-display text-3xl font-black leading-[1.05] tracking-tight">
              {draft.hero_title_line1 || "Headline"} <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {draft.hero_title_line2 || "Headline"}
              </span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
              {draft.hero_subtext || "Subtext goes here."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="hero" size="sm">{draft.hero_primary_cta || "Button"}</Button>
              <Button variant="outline" size="sm">{draft.hero_secondary_cta || "Button"}</Button>
            </div>
            {draft.hero_image && (
              <div className="relative mt-5 flex max-h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-background/40 p-2 shadow-glow ring-1 ring-primary/10">
                <img
                  src={draft.hero_image}
                  alt="Hero"
                  className="max-h-[400px] w-auto max-w-full rounded-xl object-contain"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Changes only go live after you click <strong>Save Changes</strong>.
          </p>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSettings;
