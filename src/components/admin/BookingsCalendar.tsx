import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Booking } from '@/types/bookings';
import { statusConfig, priorityConfig } from '@/types/bookings';
import { cn } from '@/lib/utils';

interface BookingsCalendarProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
}

/** Parse German date string "DD.MM.YYYY" to a Date (ignoring "—") */
const parseGermanDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === '—') return null;
  const parts = dateStr.split('.');
  if (parts.length < 3) return null;
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day);
};

const BookingsCalendar = ({ bookings, onSelect }: BookingsCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  /** Map of date-string → bookings for that day */
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const d = parseGermanDate(b.requestedDate);
      if (!d) return;
      const key = d.toDateString();
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    });
    return map;
  }, [bookings]);

  /** All dates that have at least one booking */
  const datesWithBookings = useMemo(
    () => Array.from(bookingsByDate.keys()).map((k) => new Date(k)),
    [bookingsByDate],
  );

  /** Bookings for the currently selected date */
  const selectedBookings = selectedDate
    ? bookingsByDate.get(selectedDate.toDateString()) ?? []
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
      {/* Calendar picker */}
      <Card className="shadow-card self-start">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="p-3 pointer-events-auto"
            modifiers={{ booked: datesWithBookings }}
            modifiersClassNames={{
              booked: 'bg-primary/15 font-semibold text-primary',
            }}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Tage mit Terminen sind farbig markiert.
          </p>
        </CardContent>
      </Card>

      {/* Selected day's bookings */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {selectedDate
              ? `Termine am ${selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Wählen Sie einen Tag aus dem Kalender'}
          </h3>

          {!selectedDate && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Klicken Sie auf ein Datum, um die Termine anzuzeigen.
            </p>
          )}

          {selectedDate && selectedBookings.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Keine Termine an diesem Tag.
            </p>
          )}

          {selectedBookings.length > 0 && (
            <ScrollArea className="max-h-[480px]">
              <div className="space-y-3">
                {selectedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onSelect(b)}
                  >
                    <span className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', statusConfig[b.status].dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.service}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={priorityConfig[b.priority].variant as any} className="text-xs">
                          {priorityConfig[b.priority].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{b.estimatedValue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsCalendar;
