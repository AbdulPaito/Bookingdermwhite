import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getSchedule, updateSchedule } from "@/lib/api";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AdminSchedule = () => {
  const [active, setActive] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [interval, setInterval] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await getSchedule();
      setActive(data.active_days);
      setStart(data.start_time);
      setEnd(data.end_time);
      setInterval(data.interval);
    } catch {
      toast({ title: "Error", description: "Failed to load schedule." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSchedule({ active_days: active, start_time: start, end_time: end, interval });
      toast({ title: "Saved", description: "Schedule updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (d: string) =>
    setActive((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <AdminLayout title="Schedule" description="Set your weekly working hours and slot intervals.">
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="font-display text-lg font-bold">Working Days</h3>
          <p className="mb-5 text-sm text-muted-foreground">Toggle the days you accept bookings.</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = active.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggle(d)}
                  className={cn(
                    "h-12 w-14 rounded-xl text-sm font-bold transition-all",
                    on
                      ? "bg-gradient-primary text-primary-foreground shadow-soft"
                      : "border border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="font-display text-lg font-bold">Time Settings</h3>
          <p className="mb-5 text-sm text-muted-foreground">Daily availability and slot length.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Interval (minutes)</Label>
              <Input type="number" value={interval} min={10} step={5} onChange={(e) => setInterval(Number(e.target.value))} className="h-11 rounded-xl" />
            </div>
          </div>
        </motion.div>
      </div>
    )}

      <div className="mt-6 flex justify-end">
        <Button variant="hero" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;