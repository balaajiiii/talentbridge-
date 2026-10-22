
import { useEffect, useState, type FormEvent } from 'react';
import type { EventRow } from '@/lib/supabase';
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
  Plus,
} from 'lucide-react';

const SAMPLE_EVENTS: Omit<EventRow, 'organizer_id'>[] = [
  {
    id: 's1',
    title: 'Rangrez Fest 2026',
    description:
      'Annual cultural festival featuring live music, dance, and art performances.',
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
    description:
      "One of India's largest college cultural festivals. Looking for performers across categories.",
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
    description:
      'Weekly open mic night. Singers, poets, and comedians welcome.',
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
    description:
      'Premier music festival in Northeast India seeking diverse performers.',
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
    description:
      'Three-day cultural extravaganza. Multiple performance slots available.',
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
    description:
      'Intimate live music venue seeking solo artists and duos for weekend gigs.',
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
    description:
      'Stand-up comedy open mic. New and experienced comedians both welcome.',
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
    description:
      'Outdoor music festival in the scenic Ziro Valley. Seeking indie and folk artists.',
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
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );

// PostgreSQL time values may arrive as HH:mm:ss; keep the dashboard display at HH:mm.
const formatEventTime = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const match = value.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : value;
};

// Convert Spring Boot's camelCase JSON fields to the frontend's EventRow format.
const mapBackendEvent = (event: any): EventRow => ({
  id: String(event.id),
  title: event.title ?? '',
  description: event.description ?? '',
  organizer_name: event.organizerName ?? '',
  organizer_id: event.organizerId ?? '',
  date: event.date ?? '',
  time: formatEventTime(event.time),
  venue: event.venue ?? '',
  city: event.city ?? '',
  budget: String(event.budget ?? ''),
  talent_category: event.talentCategory ?? '',
  available_slots: event.availableSlots ?? 0,
  poster_url: event.posterUrl ?? null,
  created_at: event.createdAt ?? new Date().toISOString(),
});

const emptyEventForm = () => ({
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  city: '',
  budget: '',
  talentCategory: 'Music',
  availableSlots: '1',
});

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
  const [submittingApplication, setSubmittingApplication] =
    useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createForm, setCreateForm] = useState(emptyEventForm);

  const isOrganizer =
    String(profile?.role ?? '').trim().toLowerCase() === 'organizer';

  // Load events from the Spring Boot backend.
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          'http://localhost:8084/api/events'
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            'The backend did not return an array of events.'
          );
        }

        const mappedEvents: EventRow[] = data.map(mapBackendEvent);
        setEvents(mappedEvents);
      } catch (error) {
        console.error(
          'Failed to load events from Spring Boot:',
          error
        );

        showToast(
          'error',
          'Could not load events. Check that the backend is running and CORS is configured.'
        );

        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchEvents();
  }, []);

  // Load saved event IDs from the Spring Boot backend.
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    const fetchSavedEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:8084/api/saved-events?userId=${encodeURIComponent(user.id)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: { eventId: string }[] =
          await response.json();

        setSavedIds(
          new Set(data.map((item) => item.eventId))
        );
      } catch (error) {
        console.error('Failed to load saved events:', error);
        showToast('error', 'Could not load saved events.');
      }
    };

    void fetchSavedEvents();
  }, [user?.id]);

  // Search and filter events.
  const filtered = events.filter((event) => {
    if (
      search &&
      !event.title.toLowerCase().includes(search.toLowerCase()) &&
      !event.organizer_name
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }

    if (category && event.talent_category !== category) {
      return false;
    }

    if (city && event.city !== city) {
      return false;
    }

    if (date && event.date !== date) {
      return false;
    }

    return true;
  });

  // Open the application modal only for logged-in talent users.
  const handleApply = (event: EventRow) => {
    if (!user) {
      showToast('error', 'Please log in to apply.');
      return;
    }

    if (
      String(profile?.role ?? '').trim().toLowerCase() !==
      'talent'
    ) {
      showToast(
        'error',
        'Only talent accounts can apply to events.'
      );
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

  // Submit an application through Spring Boot.
  const confirmApply = async () => {
    if (!user || !applyEvent || submittingApplication) {
      return;
    }

    setSubmittingApplication(true);

    try {
      const response = await fetch(
        'http://localhost:8084/api/applications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            eventId: applyEvent.id,
            status: 'pending',
          }),
        }
      );

      if (response.status === 409) {
        showToast(
          'info',
          'You have already applied to this event.'
        );
        return;
      }

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || `HTTP error: ${response.status}`
        );
      }

      showToast(
        'success',
        `Application submitted for ${applyEvent.title}!`
      );

      setApplyEvent(null);
    } catch (error) {
      console.error('Application submission failed:', error);

      showToast(
        'error',
        'Could not submit your application. Please try again.'
      );
    } finally {
      setSubmittingApplication(false);
    }
  };

  // Save or remove an event through Spring Boot.
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

    if (savingEvent) {
      return;
    }

    setSavingEvent(event.id);

    try {
      if (savedIds.has(event.id)) {
        const params = new URLSearchParams({
          userId: user.id,
          eventId: event.id,
        });

        const response = await fetch(
          `http://localhost:8084/api/saved-events?${params.toString()}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          const message = await response.text();

          throw new Error(
            message || `HTTP error: ${response.status}`
          );
        }

        setSavedIds((previous) => {
          const next = new Set(previous);
          next.delete(event.id);
          return next;
        });

        showToast('info', 'Removed from saved events.');
        return;
      }

      const response = await fetch(
        'http://localhost:8084/api/saved-events',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            eventId: event.id,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || `HTTP error: ${response.status}`
        );
      }

      setSavedIds(
        (previous) => new Set(previous).add(event.id)
      );

      showToast('success', 'Event saved successfully!');
    } catch (error) {
      console.error(
        'Saving/removing event failed:',
        error
      );

      showToast(
        'error',
        'Could not update saved events. Please try again.'
      );
    } finally {
      setSavingEvent(null);
    }
  };

  // Create and publish an event through Spring Boot.
  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      showToast('error', 'Please log in to create an event.');
      return;
    }

    if (!isOrganizer) {
      showToast('error', 'Only organizer accounts can publish events.');
      return;
    }

    if (creatingEvent) return;
    setCreatingEvent(true);

    try {
      const response = await fetch('http://localhost:8084/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          organizerName: profile?.full_name?.trim() || user.email?.split('@')[0] || 'Organizer',
          organizerId: user.id,
          date: createForm.date,
          time: createForm.time,
          venue: createForm.venue.trim(),
          city: createForm.city.trim(),
          budget: createForm.budget.trim(),
          talentCategory: createForm.talentCategory,
          availableSlots: Number(createForm.availableSlots),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP error: ${response.status}`);
      }

      const savedEvent = mapBackendEvent(await response.json());
      setEvents((previous) => [savedEvent, ...previous]);
      setSearch('');
      setCategory('');
      setCity('');
      setDate('');
      setCreateForm(emptyEventForm());
      setCreateModalOpen(false);
      showToast('success', 'Your event has been published!');
    } catch (error) {
      console.error('Event creation failed:', error);
      showToast(
        'error',
        error instanceof Error && error.message
          ? `Could not create event: ${error.message}`
          : 'Could not create event. Please check that the backend is running.'
      );
    } finally {
      setCreatingEvent(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />

      <div className="flex-1 px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink-900">
                Welcome back,{' '}
                {profile?.full_name?.split(' ')[0] ?? 'there'}!
              </h1>

              <p className="mt-1 text-sm text-ink-500">
                {isOrganizer
                  ? 'Publish events and discover local talent.'
                  : 'Browse events and find opportunities near you.'}
              </p>
            </div>

            {isOrganizer && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </span>
              </Button>
            )}
          </div>

          {/* Search and filters */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
            <SearchBar
              value={search}
              onChange={setSearch}
            />

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
              {filtered.length} event
              {filtered.length !== 1 ? 's' : ''} found
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
              <Calendar
                className="h-10 w-10 text-ink-300"
                strokeWidth={1.5}
              />

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

      {/* Create event modal */}
      <Modal
        open={createModalOpen}
        onClose={() => {
          if (!creatingEvent) setCreateModalOpen(false);
        }}
        title="Create an Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label htmlFor="event-title" className="mb-1 block text-sm font-semibold text-ink-700">
              Event title *
            </label>
            <input
              id="event-title"
              required
              maxLength={150}
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. College Cultural Festival"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
          </div>

          <div>
            <label htmlFor="event-description" className="mb-1 block text-sm font-semibold text-ink-700">
              Description
            </label>
            <textarea
              id="event-description"
              rows={3}
              maxLength={2000}
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the event and the performers you need"
              className="w-full resize-y rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-date" className="mb-1 block text-sm font-semibold text-ink-700">
                Date *
              </label>
              <input
                id="event-date"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={createForm.date}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              />
            </div>
            <div>
              <label htmlFor="event-time" className="mb-1 block text-sm font-semibold text-ink-700">
                Time *
              </label>
              <input
                id="event-time"
                type="time"
                required
                value={createForm.time}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-venue" className="mb-1 block text-sm font-semibold text-ink-700">
                Venue *
              </label>
              <input
                id="event-venue"
                required
                maxLength={200}
                value={createForm.venue}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, venue: e.target.value }))}
                placeholder="Venue or location"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              />
            </div>
            <div>
              <label htmlFor="event-city" className="mb-1 block text-sm font-semibold text-ink-700">
                City *
              </label>
              <input
                id="event-city"
                required
                maxLength={100}
                value={createForm.city}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="e.g. Mumbai"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-category" className="mb-1 block text-sm font-semibold text-ink-700">
                Talent category *
              </label>
              <select
                id="event-category"
                required
                value={createForm.talentCategory}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, talentCategory: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              >
                {['Music', 'Dance', 'Theatre', 'Comedy', 'Poetry', 'Art', 'Photography', 'Other'].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="event-slots" className="mb-1 block text-sm font-semibold text-ink-700">
                Available slots *
              </label>
              <input
                id="event-slots"
                type="number"
                required
                min={1}
                max={10000}
                step={1}
                value={createForm.availableSlots}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, availableSlots: e.target.value }))}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-budget" className="mb-1 block text-sm font-semibold text-ink-700">
              Performer budget
            </label>
            <input
              id="event-budget"
              maxLength={100}
              value={createForm.budget}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, budget: e.target.value }))}
              placeholder="e.g. ₹5,000 - ₹15,000"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={creatingEvent}
              onClick={() => setCreateModalOpen(false)}
              className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingEvent}
              className="flex w-full items-center justify-center rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingEvent ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply modal */}
      <Modal
        open={!!applyEvent}
        onClose={() => {
          if (!submittingApplication) {
            setApplyEvent(null);
          }
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
                {submittingApplication
                  ? 'Submitting...'
                  : 'Confirm Application'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
