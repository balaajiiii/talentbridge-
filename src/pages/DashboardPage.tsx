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
import { Calendar, MapPin, Clock, Users, IndianRupee, Bookmark } from 'lucide-react';

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
    description: 'One of India\'s largest college cultural festivals. Looking for performers across categories.',
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

export function DashboardPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [applyEvent, setApplyEvent] = useState<EventRow | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (data && data.length > 0) {
      setEvents(data as EventRow[]);
    } else {
      setEvents(SAMPLE_EVENTS as EventRow[]);
    }
    setLoading(false);
  };

  const filtered = events.filter((ev) => {
    if (search && !ev.title.toLowerCase().includes(search.toLowerCase()) && !ev.organizer_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && ev.talent_category !== category) return false;
    if (city && ev.city !== city) return false;
    if (date && ev.date !== date) return false;
    return true;
  });

  const handleApply = (event: EventRow) => {
    setApplyEvent(event);
  };

  const confirmApply = () => {
    showToast('success', `Applied to ${applyEvent?.title}!`);
    setApplyEvent(null);
  };

  const handleSave = (event: EventRow) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(event.id)) {
        next.delete(event.id);
        showToast('info', 'Removed from saved');
      } else {
        next.add(event.id);
        showToast('success', 'Saved to your list');
      }
      return next;
    });
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

          {/* Search + Filters */}
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
                onClick={() => { setSearch(''); setCategory(''); setCity(''); setDate(''); }}
                className="text-sm font-semibold text-accent-600 hover:text-accent-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white py-20">
              <Calendar className="h-10 w-10 text-ink-300" strokeWidth={1.5} />
              <p className="mt-4 font-display text-lg font-bold text-ink-900">No events found</p>
              <p className="mt-1 text-sm text-ink-500">Try adjusting your filters</p>
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

      {/* Apply Modal */}
      <Modal
        open={!!applyEvent}
        onClose={() => setApplyEvent(null)}
        title="Apply to Event"
      >
        {applyEvent && (
          <div>
            <div className="mb-4">
              <h4 className="font-display text-lg font-bold text-ink-900">{applyEvent.title}</h4>
              <p className="text-sm text-ink-500">{applyEvent.organizer_name}</p>
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
              <Button variant="outline" fullWidth onClick={() => setApplyEvent(null)}>
                Cancel
              </Button>
              <Button fullWidth onClick={confirmApply}>
                Confirm Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
