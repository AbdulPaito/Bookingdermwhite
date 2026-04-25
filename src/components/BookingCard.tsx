import { motion } from "framer-motion";
import { Calendar, Clock, Phone, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  booking: Booking;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
};

const statusStyles: Record<Booking["status"], string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

export const BookingCard = ({ booking, onConfirm, onCancel, onDelete }: Props) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">{booking.name}</h3>
          <p className="text-sm text-primary">{booking.service}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider", statusStyles[booking.status])}>
          {booking.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <p className="flex items-center gap-2"><User className="h-4 w-4 text-primary" />{booking.name}</p>
        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{booking.phone}</p>
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />{booking.date}</p>
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{booking.time}</p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {booking.status === "pending" && (
          <>
            <Button variant="hero" size="sm" className="w-full sm:w-auto" onClick={() => onConfirm(booking._id)}>
              Confirm
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onCancel(booking._id)}>
              Cancel
            </Button>
          </>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-destructive hover:bg-destructive/10 sm:w-auto sm:ml-auto"
          onClick={() => onDelete(booking._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};