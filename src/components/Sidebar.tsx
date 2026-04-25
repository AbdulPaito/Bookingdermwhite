import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, LayoutDashboard, LogOut, Menu, Settings, Tag, Ticket, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const items = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: Ticket },
  { label: "Promos", href: "/admin/promos", icon: Tag },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const Nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Brand = (
    <Link to="/" className="flex items-center gap-3 px-6 py-5">
      <img
        src={logo}
        alt="Derm Whitening"
        className="h-12 w-12 object-contain drop-shadow-[0_4px_12px_hsl(var(--primary)/0.35)]"
      />
      <span className="font-display text-base font-bold leading-tight">
        Derm Whitening
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Admin
        </span>
      </span>
    </Link>
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin/login";
  };

  const Logout = (
    <div className="border-t border-border p-4">
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {Brand}
        {Nav}
        {Logout}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="Derm Whitening" className="h-10 w-10 object-contain" />
          <span className="font-display font-bold">Derm Admin</span>
        </Link>
        <button onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 26 }}
            className="absolute left-0 top-0 flex h-full w-72 flex-col bg-card shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pr-3">
              {Brand}
              <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted" aria-label="Close menu">
                <X className="h-4 w-4" />
              </button>
            </div>
            {Nav}
            {Logout}
          </motion.aside>
        </div>
      )}
    </>
  );
};