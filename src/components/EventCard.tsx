import { MapPin, Calendar, Clock, Users, IndianRupee, Tag } from 'lucide-react';
import type { EventRow } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

type EventCardProps = {
  event: EventRow;
  onApply?: (event: EventRow) => void;
  onSave?: (event: EventRow) => void;
  saved?: boolean;
};

export function EventCard({ event, onApply, onSave, saved }: EventCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
      {/* Poster */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-accent-500 to-accent-700">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <Tag className="mx-auto h-8 w-8 opacity-60" strokeWidth={1.5} />
              <p className="mt-2 font-display text-lg font-bold">{event.talent_category}</p>
            </div>
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 font-mono text-xs font-semibold text-accent-700 backdrop-blur-sm">
          {event.available_slots} slots
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-ink-900">
          {event.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-ink-500">{event.organizer_name}</p>

        <p className="mt-3 text-sm leading-relaxed text-ink-600 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-ink-400" />
            {event.date}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-ink-400" />
            {event.time}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ink-400" />
            {event.venue}, {event.city}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-ink-400" />
            {event.talent_category}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700">
          <IndianRupee className="h-4 w-4" />
          {event.budget}
        </div>

        <div className="mt-auto flex gap-2 pt-4">
          <Button size="sm" fullWidth onClick={() => onApply?.(event)}>
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSave?.(event)}
            className={saved ? 'border-accent-500 text-accent-600' : ''}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
