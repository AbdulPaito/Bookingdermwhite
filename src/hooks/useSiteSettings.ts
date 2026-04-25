import { useEffect, useState } from "react";
import { getSettings } from "@/lib/api";

export type SiteSettings = {
  heroImage: string;
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtext: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
};

// Transform snake_case API response to camelCase for frontend
const transformToCamelCase = (data: any): SiteSettings => ({
  heroImage: data.hero_image || "",
  heroBadge: data.hero_badge || "Premium Skincare & Wellness",
  heroTitleLine1: data.hero_title_line1 || "Glow with",
  heroTitleLine2: data.hero_title_line2 || "Confidence ✨",
  heroSubtext: data.hero_subtext || "Premium skincare & wellness treatments starting at ₱599. Reveal your best skin in just one session.",
  heroPrimaryCta: data.hero_primary_cta || "Book Now",
  heroSecondaryCta: data.hero_secondary_cta || "View Promos",
});

const defaults: SiteSettings = {
  heroImage: "",
  heroBadge: "Premium Skincare & Wellness",
  heroTitleLine1: "Glow with",
  heroTitleLine2: "Confidence ✨",
  heroSubtext: "Premium skincare & wellness treatments starting at ₱599. Reveal your best skin in just one session.",
  heroPrimaryCta: "Book Now",
  heroSecondaryCta: "View Promos",
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        setSettings(transformToCamelCase(data));
      } catch (err) {
        console.error("Failed to load site settings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { settings, loading, defaults };
};
