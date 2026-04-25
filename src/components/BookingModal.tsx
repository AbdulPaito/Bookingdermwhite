import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock, Sparkles, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createBooking, getAvailability, type Promo } from "@/lib/api";
import { cn } from "@/lib/utils";

type Slot = {
  time: string;
  count: number;
};

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  promo?: Promo;
};

export const BookingModal = ({ open, onClose, promo }: BookingModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      setSuccess(false);
      setName(""); setPhone(""); setDate(""); setTime("");
      setSlots([]);
    }
  }, [open]);

  useEffect(() => {
    setTime("");
    if (!date) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    getAvailability(date)
      .then((data) => {
        setIsOpen(data.isOpen);
        setSlots(data.slots || []);
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load available slots." });
      })
      .finally(() => setSlotsLoading(false));
  }, [date]);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !time) {
      toast({ title: "Missing information", description: "Please complete all fields." });
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({
        name,
        phone,
        date,
        time,
        service: promo?.title || "General Appointment",
        price: promo?.price || 0,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 5000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create booking. Please try again.";
      toast({ title: "Booking failed", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-md sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background shadow-glow sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center"
              >
                <div className="rounded-full bg-success/15 p-4">
                  <CheckCircle2 className="h-14 w-14 text-success" />
                </div>
                <h3 className="font-display text-2xl font-bold">You're booked!</h3>
                <p className="text-sm text-muted-foreground">We'll call or text you for confirmation shortly.</p>
              </motion.div>
            ) : (
              <>
                {promo ? (
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/15">
                    <img src={promo.image_url} alt={promo.title} className="h-full w-full object-contain p-3" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-background">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-background/80">Selected Promo</p>
                        <h2 className="font-display text-xl font-bold leading-tight">{promo.title}</h2>
                      </div>
                      <div className="rounded-2xl bg-background/95 px-3 py-1.5 text-right text-foreground shadow-soft backdrop-blur">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                        <p className="font-display text-lg font-bold text-primary">₱{promo.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 pt-8 sm:px-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <Sparkles className="h-3 w-3" /> Book Your Glow
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-bold">Reserve Your Appointment</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Choose a time that works for you.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0919 000 0000" className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" /> Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Available Time
                    </Label>
                    {!date ? (
                      <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
                        Pick a date to see available time slots.
                      </p>
                    ) : slotsLoading ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
                        ))}
                      </div>
                    ) : !isOpen ? (
                      <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
                        Clinic is closed on this day. Please choose another date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {slots.map((slot) => {
                          const selected = time === slot.time;
                          const count = slot.count;

                          // Color coding based on booking count (unlimited system)
                          let colorClasses = "";
                          let statusText = "";
                          let statusColor = "";

                          if (selected) {
                            colorClasses = "bg-pink-500 text-white border-pink-500 shadow-lg scale-105";
                            statusColor = "text-white/90";
                          } else if (count >= 6) {
                            // 6+ bookings → red (Very Busy)
                            colorClasses = "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:scale-105";
                            statusText = `${count} booked`;
                            statusColor = "text-red-600";
                          } else if (count >= 3) {
                            // 3-5 bookings → yellow (Busy)
                            colorClasses = "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 hover:scale-105";
                            statusText = `${count} booked`;
                            statusColor = "text-yellow-600";
                          } else {
                            // 0-2 bookings → green (Available)
                            colorClasses = "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:scale-105";
                            statusText = count === 0 ? "Available" : `${count} booked`;
                            statusColor = "text-green-600";
                          }

                          return (
                            <button
                              type="button"
                              key={slot.time}
                              onClick={() => setTime(slot.time)}
                              className={cn(
                                "relative min-h-[50px] rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                                !selected && "hover:shadow-md",
                                colorClasses,
                              )}
                            >
                              <span className="block text-sm font-bold">{slot.time}</span>
                              <span className={cn("mt-0.5 block text-[10px] font-medium", statusColor)}>
                                {statusText}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {promo && (
                    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/5 to-accent/10 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                        <p className="font-display text-2xl font-bold text-primary">₱{promo.price.toLocaleString()}</p>
                      </div>
                      <p className="max-w-[55%] text-right text-xs text-muted-foreground">
                        Pay at the clinic. Reschedule up to 24 h before your appointment.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="outline" className="w-full" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
