import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

type NavbarProps = {
  onBookClick: () => void;
};

const links = [
  { label: "Home", href: "#home" },
  { label: "Promos", href: "#promos" },
  { label: "Why Us", href: "#why" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = ({ onBookClick }: NavbarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="Derm Whitening Wellness & Beauty Clinic"
            className="h-12 w-12 object-contain drop-shadow-[0_4px_12px_hsl(var(--primary)/0.35)] sm:h-14 sm:w-14"
          />
          <span className="font-display text-base font-bold leading-tight tracking-tight sm:text-lg">
            Derm Whitening
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
              Wellness & Beauty
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="hero" size="sm" onClick={onBookClick}>
            Book Now
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border bg-background md:hidden"
        >
          <div className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <Button variant="hero" className="mt-2 w-full" onClick={() => { setOpen(false); onBookClick(); }}>
              Book Now
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};