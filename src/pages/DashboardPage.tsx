
import { useEffect, useState } from 'react';
import { supabase, type EventRow } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { EventCardSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  IndianRupee,
} from 'lucide-react';

const SAMPLE_EVENTS: Omit<EventRow, 'organizer_id'>[] = [
  {
    id: 's1',
    title: 'Rangrez Fest 2026',
    description: 'Annual cultural festival featuring live music, dance, and art performances.',
    organizer_name: 'Rangrez Collective',
    date: '2026-11-21',
    time: '7:30 PM',
    venue: 'Bandra Amphitheatre',
    city: 'Mumbai',
    budget: '₹5,000 - ₹15,000',
    talent_category: 'Music',
    available_slots: 12,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's2',
    title: 'IIT Bombay Mood Indigo',
    description: "One of India's largest college cultural festivals. Looking for performers across categories.",
    organizer_name: 'IIT Bombay',
    date: '2026-12-18',
    time: '6:00 PM',
    venue: 'IIT Campus, Powai',
    city: 'Mumbai',
    budget: '₹3,000 - ₹10,000',
    talent_category: 'Dance',
    available_slots: 8,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's3',
    title: 'AntiSOC Open Mic',
    description: 'Weekly open mic night. Singers, poets, and comedians welcome.',
    organizer_name: 'AntiSOC Cafe',
    date: '2026-10-29',
    time: '8:00 PM',
    venue: 'AntiSOC, Koramangala',
    city: 'Bengaluru',
    budget: '₹1,500 - ₹4,000',
    talent_category: 'Poetry',
    available_slots: 6,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's4',
    title: 'Hornbill Festival',
    description: 'Premier music festival in Northeast India seeking diverse performers.',
    organizer_name: 'Nagaland Tourism',
    date: '2026-12-01',
    time: '5:00 PM',
    venue: 'Kisama Heritage Village, Kohima',
    city: 'Kohima',
    budget: '₹8,000 - ₹25,000',
    talent_category: 'Music',
    available_slots: 5,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's5',
    title: 'BITS Pilani Oasis',
    description: 'Three-day cultural extravaganza. Multiple performance slots available.',
    organizer_name: 'BITS Pilani',
    date: '2026-11-07',
    time: '7:00 PM',
    venue: 'BITS Campus, Pilani',
    city: 'Jaipur',
    budget: '₹4,000 - ₹12,000',
    talent_category: 'Theatre',
    available_slots: 10,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's6',
    title: 'The Humming Tree Live',
    description: 'Intimate live music venue seeking solo artists and duos for weekend gigs.',
    organizer_name: 'The Humming Tree',
    date: '2026-11-14',
    time: '9:00 PM',
    venue: 'The Humming Tree, Indiranagar',
    city: 'Bengaluru',
    budget: '₹2,000 - ₹5,000',
    talent_category: 'Music',
    available_slots: 4,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's7',
    title: 'Catalyst Comedy Night',
    description: 'Stand-up comedy open mic. New and experienced comedians both welcome.',
    organizer_name: 'Catalyst',
    date: '2026-10-22',
    time: '8:30 PM',
    venue: 'Catalyst, Whitefield',
    city: 'Bengaluru',
    budget: '₹500 - ₹2,000',
    talent_category: 'Comedy',
    available_slots: 15,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 's8',
    title: 'Ziro Festival of Music',
    description: 'Outdoor music festival in the scenic Ziro Valley. Seeking indie and folk artists.',
    organizer_name: 'Ziro Festival',
    date: '2027-01-09',
    time: '4:00 PM',
    venue: 'Ziro Valley, Arunachal Pradesh',
    city: 'Shillong',
    budget: '₹6,000 - ₹20,000',
    talent_category: 'Music',
    available_slots: 7,
    poster_url: null,
    created_at: new Date().toISOString(),
  },
];

const isDatabaseEvent = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function DashboardPage() {
  const { profile, user } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [applyEvent, setApplyEvent] = useState<EventRow | null>(null);
  const [savingEvent, setSavingEvent] = useState<string | null>(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    void fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Failed to load events:', error.message);
      showToast('error', 'Could not load events from the database.');
      setEvents([]);
    } else if (data && data.length > 0) {
      setEvents(data as EventRow[]);
    } else {
      // Sample events are for display only; they cannot be saved or applied to.
      setEvents(SAMPLE_EVENTS as EventRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    const fetchSavedEvents = async () => {
      const { data, error } = await supabase
        .from('saved_events')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to load saved events:', error.message);
        showToast('error', 'Could not load saved events.');
        return;
      }

      setSavedIds(new Set((data ?? []).map((row) => row.event_id)));
    };

    void fetchSavedEvents();
  }, [user?.id]);

  const filtered = events.filter((event) => {
    if (
      search &&
      !event.title.toLowerCase().includes(search.toLowerCase()) &&
      !event.organizer_name.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (category && event.talent_category !== category) return false;
    if (city && event.city !== city) return false;
    if (date && event.date !== date) return false;

    return true;
  });

  const handleApply = (event: EventRow) => {
    if (!user) {
      showToast('error', 'Please log in to apply.');
      return;
    }

    if (profile?.role !== 'talent') {
      showToast('error', 'Only talent accounts can apply to events.');
      return;
    }

    if (!isDatabaseEvent(event.id)) {
      showToast(
        'info',
        'This sample event cannot be applied to. Try an event published in the database.'
      );
      return;
    }

    setApplyEvent(event);
  };

  const confirmApply = async () => {
    if (!user || !applyEvent || submittingApplication) return;

    setSubmittingApplication(true);

    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        event_id: applyEvent.id,
        status: 'pending',
      });

    setSubmittingApplication(false);

    if (error) {
      console.error('Application submission failed:', error.message);

      if (error.code === '23505') {
        showToast('info', 'You have already applied to this event.');
      } else {
        showToast('error', 'Could not submit your application. Please try again.');
      }

      return;
    }

    showToast('success', `Application submitted for ${applyEvent.title}!`);
    setApplyEvent(null);
  };

  const handleSave = async (event: EventRow) => {
    if (!user) {
      showToast('error', 'Please log in to save events.');
      return;
    }

    if (!isDatabaseEvent(event.id)) {
      showToast(
        'info',
        'This sample event cannot be saved. Try an event published in the database.'
      );
      return;
    }

    if (savingEvent) return;

    setSavingEvent(event.id);

    if (savedIds.has(event.id)) {
      const { error } = await supabase
        .from('saved_events')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', event.id);

      setSavingEvent(null);

      if (error) {
        console.error('Removing saved event failed:', error.message);
        showToast('error', 'Could not remove the saved event.');
        return;
      }

      setSavedIds((previous) => {
        const next = new Set(previous);
        next.delete(event.id);
        return next;
      });

      showToast('info', 'Removed from saved events.');
      return;
    }

    const { error } = await supabase
      .from('saved_events')
      .insert({
        user_id: user.id,
        event_id: event.id,
      });

    setSavingEvent(null);

    if (error) {
      console.error('Saving event failed:', error.message);
      showToast('error', 'Could not save this event. Please try again.');
      return;
    }

    setSavedIds((previous) => new Set(previous).add(event.id));
    showToast('success', 'Event saved successfully!');
  };

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />

      <div className="flex-1 px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-ink-900">
              Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}!
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Browse events and find opportunities near you.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
            <SearchBar value={search} onChange={setSearch} />

            <FilterPanel
              category={category}
              city={city}
              date={date}
              onCategoryChange={setCategory}
              onCityChange={setCity}
              onDateChange={setDate}
            />
          </div>

          {/* Results count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-500">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </p>

            {(search || category || city || date) && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setCity('');
                  setDate('');
                }}
                className="text-sm font-semibold text-accent-600 hover:text-accent-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white py-20">
              <Calendar className="h-10 w-10 text-ink-300" strokeWidth={1.5} />
              <p className="mt-4 font-display text-lg font-bold text-ink-900">
                No events found
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onApply={handleApply}
                  onSave={handleSave}
                  saved={savedIds.has(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply modal */}
      <Modal
        open={!!applyEvent}
        onClose={() => {
          if (!submittingApplication) setApplyEvent(null);
        }}
        title="Apply to Event"
      >
        {applyEvent && (
          <div>
            <div className="mb-4">
              <h4 className="font-display text-lg font-bold text-ink-900">
                {applyEvent.title}
              </h4>
              <p className="text-sm text-ink-500">
                {applyEvent.organizer_name}
              </p>
            </div>

            <div className="space-y-2.5 rounded-xl bg-ink-50 p-4">
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Calendar className="h-4 w-4 text-ink-400" />
                {applyEvent.date}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Clock className="h-4 w-4 text-ink-400" />
                {applyEvent.time}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-600">
                <MapPin className="h-4 w-4 text-ink-400" />
                {applyEvent.venue}, {applyEvent.city}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Users className="h-4 w-4 text-ink-400" />
                {applyEvent.talent_category}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-accent-700">
                <IndianRupee className="h-4 w-4" />
                {applyEvent.budget}
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-600">
              {applyEvent.description}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                disabled={submittingApplication}
                onClick={() => setApplyEvent(null)}
              >
                Cancel
              </Button>

              <Button
                fullWidth
                disabled={submittingApplication}
                onClick={confirmApply}
              >
                {submittingApplication ? 'Submitting...' : 'Confirm Application'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
