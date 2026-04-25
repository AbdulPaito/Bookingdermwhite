import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lightbulb,
  Plus,
  Settings2,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  getBookingStats,
  getWeeklyData,
  getRecentBookings,
  getTodaysAppointments,
  getPromos,
  type BookingStatus,
  type Booking,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

/* -------------------------------- helpers -------------------------------- */

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground/90 border-warning/30",
  confirmed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusLabel: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[status]}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {statusLabel[status]}
  </span>
);

/* -------------------------------- page -------------------------------- */

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });
  const [promoCount, setPromoCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; bookings: number }[]>([]);
  const [todayAppts, setTodayAppts] = useState<Booking[]>([]);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, w, t, r, p] = await Promise.all([
          getBookingStats(),
          getWeeklyData(),
          getTodaysAppointments(),
          getRecentBookings(5),
          getPromos(),
        ]);
        setStats(s);
        setWeeklyData(w.map((d) => ({ day: d.day, bookings: d.bookings })));
        setTodayAppts(t);
        setRecent(r);
        setPromoCount(p.length);
      } catch {
        toast({ title: "Error", description: "Failed to load dashboard data." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.total,
      delta: "+12.5%",
      icon: TrendingUp,
      gradient: "from-primary to-secondary",
      ring: "ring-primary/20",
    },
    {
      label: "Pending",
      value: stats.pending,
      delta: "+3 today",
      icon: Clock,
      gradient: "from-accent to-primary",
      ring: "ring-accent/20",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      delta: "+8.1%",
      icon: CheckCircle2,
      gradient: "from-success to-primary-glow",
      ring: "ring-success/20",
    },
    {
      label: "Active Promos",
      value: promoCount,
      delta: "Live",
      icon: Tag,
      gradient: "from-secondary to-accent",
      ring: "ring-secondary/20",
    },
  ];

  const quickActions = [
    { label: "Add Promo", icon: Plus, to: "/admin/promos", gradient: "from-primary to-secondary" },
    { label: "View Bookings", icon: Users, to: "/admin/bookings", gradient: "from-secondary to-accent" },
    { label: "Manage Schedule", icon: CalendarDays, to: "/admin/schedule", gradient: "from-accent to-primary" },
    { label: "Site Settings", icon: Settings2, to: "/admin/settings", gradient: "from-primary-glow to-primary" },
  ];

  return (
    <AdminLayout title="Dashboard" description="Welcome back ✨ Here's what's happening today.">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card ring-1 ${s.ring} transition-shadow hover:shadow-glow`}
          >
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
            />
            <div className="flex items-start justify-between">
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-primary-foreground shadow-soft`}
              >
                <s.icon className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                <ArrowUpRight className="h-3 w-3" />
                {s.delta}
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="font-display text-3xl font-black tracking-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card xl:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold">Booking Overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> +28% this week
            </div>
          </div>
          <div className="mt-6 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-card)",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#bookingFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-base font-bold">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">Jump back into your workflow</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActions.map((q) => (
                <Link
                  key={q.label}
                  to={q.to}
                  className={`group flex flex-col items-start gap-2 rounded-xl bg-gradient-to-br ${q.gradient} p-4 text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-glow`}
                >
                  <q.icon className="h-5 w-5" />
                  <span className="text-xs font-bold leading-tight">{q.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-secondary to-accent p-5 text-primary-foreground shadow-glow">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Tip of the day</p>
                <p className="mt-1 text-xs leading-relaxed text-primary-foreground/90">
                  Confirm pending bookings within 24 hours to boost customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today + Recent */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Today's Appointments</h3>
              <p className="text-xs text-muted-foreground">{todayAppts.length} sessions scheduled</p>
            </div>
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            {todayAppts.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-gradient-to-r from-muted/40 to-transparent p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  <span className="text-[10px] font-bold uppercase opacity-80">{a.time.split(" ")[1]}</span>
                  <span className="text-sm font-black leading-none">{a.time.split(" ")[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.service}</p>
                </div>
                <StatusBadge status={a.status} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Recent Bookings</h3>
              <p className="text-xs text-muted-foreground">Latest activity across your clinic</p>
            </div>
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recent.map((b, i) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-bold text-primary">
                  {b.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.service}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium">{b.date}</p>
                  <p className="text-[11px] text-muted-foreground">{b.time}</p>
                </div>
                <StatusBadge status={b.status} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;