import { useState, useRef } from 'react';
import { GripVertical, User, Calendar, Euro } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Booking, BookingStatus } from '@/types/bookings';
import { statusConfig, priorityConfig, pipelineStages } from '@/types/bookings';

interface BookingsKanbanProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
}

const KanbanCard = ({
  booking,
  onSelect,
  onDragStart,
}: {
  booking: Booking;
  onSelect: (b: Booking) => void;
  onDragStart: (e: React.DragEvent, bookingId: string) => void;
}) => (
  <motion.div
    layout
    layoutId={booking.id}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
  >
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-border/60 group"
      draggable
      onDragStart={(e) => onDragStart(e, booking.id)}
      onClick={() => onSelect(booking)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{booking.name}</p>
            <p className="text-xs text-muted-foreground truncate">{booking.service}</p>
          </div>
          <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={priorityConfig[booking.priority].variant as any} className="text-[10px] px-1.5 py-0">
            {priorityConfig[booking.priority].label}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{booking.id}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {booking.assignedTo}
          </span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Euro className="w-3 h-3" />
            {booking.estimatedValue}
          </span>
        </div>
        {booking.requestedDate !== '—' && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {booking.requestedDate}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const BookingsKanban = ({ bookings, onSelect, onStatusChange }: BookingsKanbanProps) => {
  const [dragOverColumn, setDragOverColumn] = useState<BookingStatus | null>(null);
  const draggedId = useRef<string | null>(null);

  const handleDragStart = (_e: React.DragEvent, bookingId: string) => {
    draggedId.current = bookingId;
  };

  const handleDragOver = (e: React.DragEvent, status: BookingStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: BookingStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedId.current) {
      onStatusChange(draggedId.current, targetStatus);
      draggedId.current = null;
    }
  };

  const getColumnBookings = (status: BookingStatus) =>
    bookings.filter((b) => b.status === status);

  // Include storniert as a separate dim column
  const allColumns = [...pipelineStages, { key: 'storniert' as BookingStatus, label: 'Storniert' }];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
      {allColumns.map((stage) => {
        const columnBookings = getColumnBookings(stage.key);
        const isOver = dragOverColumn === stage.key;

        return (
          <div
            key={stage.key}
            className={`flex-shrink-0 w-64 rounded-lg transition-colors ${
              isOver ? 'bg-accent/30 ring-2 ring-accent' : 'bg-muted/30'
            }`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            {/* Column header */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusConfig[stage.key].dot}`} />
                <span className="text-sm font-semibold text-foreground">{stage.label}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {columnBookings.length}
              </Badge>
            </div>

            {/* Cards */}
            <div className="px-2 pb-3 space-y-2 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {columnBookings.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-border/40 rounded-md"
                  >
                    Hierher ziehen
                  </motion.div>
                )}
                {columnBookings.map((booking) => (
                  <KanbanCard
                    key={booking.id}
                    booking={booking}
                    onSelect={onSelect}
                    onDragStart={handleDragStart}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingsKanban;
