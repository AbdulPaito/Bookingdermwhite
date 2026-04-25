import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { BookingCard } from "@/components/BookingCard";
import { Button } from "@/components/ui/button";
import { getBookings, confirmBooking, cancelBooking, deleteBooking, type Booking, type BookingStatus } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "Pending", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
];

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch {
      toast({ title: "Error", description: "Failed to load bookings." });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const updated = await confirmBooking(id);
      setBookings((prev) => prev.map((b) => (b._id === id ? updated : b)));
      toast({ title: "Confirmed", description: "Booking confirmed successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to confirm." });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const updated = await cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b._id === id ? updated : b)));
      toast({ title: "Cancelled", description: "Booking cancelled successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to cancel." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast({ title: "Deleted", description: "Booking deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete." });
    }
  };

  const list = filter === "all" 
    ? bookings.filter((b) => b.status === "pending")
    : bookings.filter((b) => b.status === filter);

  return (
    <AdminLayout title="Bookings" description="Manage and confirm customer appointments.">
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "hero" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={cn("rounded-full")}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence>
            {list.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          No bookings in this category.
        </p>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;