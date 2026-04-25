import { Facebook, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border bg-muted/40">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Derm Whitening"
              className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_hsl(var(--primary)/0.35)]"
            />
            <span className="font-display text-lg font-bold leading-tight">
              Derm Whitening
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Wellness & Beauty
              </span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Premium skincare and wellness for every glow-getter.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Visit Us</h4>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            Sta. Cruz, Magalang, Pampanga, Philippines
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Contact</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="tel:+639196052089" className="flex items-center gap-2 transition-colors hover:text-primary">
              <Phone className="h-4 w-4 text-primary" />
              0919 605 2089
            </a>
            <a href="tel:+639058872390" className="flex items-center gap-2 transition-colors hover:text-primary">
              <Phone className="h-4 w-4 text-primary" />
              0905 887 2390
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Follow</h4>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/profile.php?id=61588586916026" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-primary hover:text-primary-foreground">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Follow us on Facebook for updates!</p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Derm Whitening Wellness & Beauty Clinic. All rights reserved.
      </div>
    </footer>
  );
};