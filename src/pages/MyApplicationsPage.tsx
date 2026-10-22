
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Clock,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { supabase, type EventRow } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';

type ApplicationRow = {
  id: number;
  user_id: string;
  event_id: string;
  status: string;
  created_at: string;
};

type ApplicationWithEvent = {
  application: ApplicationRow;
  event: EventRow | null;
};

export function MyApplicationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ApplicationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadApplications = async () => {
      setLoading(true);
      setError('');

      const { data: applications, error: applicationError } = await supabase
        .from('applications')
        .select('id, user_id, event_id, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (applicationError) {
        console.error('Could not load applications:', applicationError.message);
        if (!cancelled) {
          setError('We could not load your applications. Please try again.');
          setLoading(false);
        }
        return;
      }

      const rows = (applications ?? []) as ApplicationRow[];
      const eventIds = [...new Set(rows.map((row) => row.event_id))];

      let eventMap = new Map<string, EventRow>();

      if (eventIds.length > 0) {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (eventsError) {
          console.error('Could not load application events:', eventsError.message);
        } else {
          eventMap = new Map(
            ((events ?? []) as EventRow[]).map((event) => [event.id, event])
          );
        }
      }

      if (!cancelled) {
        setItems(
          rows.map((application) => ({
            application,
            event: eventMap.get(application.event_id) ?? null,
          }))
        );
        setLoading(false);
      }
    };

    void loadApplications();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const statusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-extrabold text-ink-900">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Track the events you've applied to and check your application status.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-accent-600" />
              <p className="mt-3 text-sm text-ink-500">
                Loading your applications...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 bg-white px-6 py-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-ink-300" />
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">
                No applications yet
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                When you apply to an event, it will appear here.
              </p>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex rounded-xl bg-accent-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ application, event }) => (
                <article
                  key={application.id}
                  className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold text-ink-900">
                        {event?.title ?? 'Event details unavailable'}
                      </h2>
                      <p className="mt-1 text-sm text-ink-500">
                        {event?.organizer_name ?? 'Organizer unavailable'}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {event ? (
                    <div className="mt-5 grid gap-3 text-sm text-ink-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-ink-400" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                        {event.venue}, {event.city}
                      </div>
                      <div>
                        Category: <span className="font-medium">{event.talent_category}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-ink-500">
                      Application ID: {application.id}
                    </p>
                  )}

                  <div className="mt-5 border-t border-ink-100 pt-4 text-xs text-ink-400">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
