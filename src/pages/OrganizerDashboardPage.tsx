
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  Plus, CalendarDays, MapPin, Pencil, Trash2, X,
  LoaderCircle, RefreshCw, Users, CheckCircle2, Clock3, Eye, XCircle
} from 'lucide-react';

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  organizer_name: string | null;
  organizer_id: string;
  date: string;
  time: string | null;
  venue: string | null;
  city: string | null;
  budget: string | null;
  talent_category: string | null;
  available_slots: number | null;
  poster_url: string | null;
};

type EventForm = {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  budget: string;
  talent_category: string;
  available_slots: string;
  poster_url: string;
};

type ApplicantProfile = {
  id: string;
  full_name: string | null;
  city: string | null;
  talent_category: string | null;
};

type ApplicationItem = {
  // The current database may use an integer or UUID application ID.
  id: string | number;
  event_id: string;
  user_id: string;
  message: string | null;
  status: string | null;
  created_at: string | null;
  applicant?: ApplicantProfile | null;
};

const emptyForm: EventForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  city: '',
  budget: '',
  talent_category: 'Music',
  available_slots: '1',
  poster_url: '',
};

export function OrganizerDashboardPage() {
  const { user, profile } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);

  async function loadApplications(eventIds: string[]) {
    if (!user || eventIds.length === 0) {
      setApplications([]);
      setApplicationsError('');
      setApplicationsLoading(false);
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError('');

    try {
      // Applications are keyed by user_id in the current frontend flow.
      const { data, error: fetchError } = await supabase
        .from('applications')
        .select('id,event_id,user_id,status,created_at')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setApplications([]);
        setApplicationsError(fetchError.message);
        return;
      }

      const rows = (data ?? []) as unknown as ApplicationItem[];
      const talentIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
      const profileById: Record<string, ApplicantProfile> = {};

      if (talentIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id,full_name,city,talent_category')
          .in('id', talentIds);

        if (profileError) {
          setApplicationsError(`Applications loaded, but applicant profiles could not be loaded: ${profileError.message}`);
        } else {
          (profileRows ?? []).forEach((row) => {
            const profileRow = row as unknown as ApplicantProfile;
            profileById[profileRow.id] = profileRow;
          });
        }
      }

      setApplications(
        rows.map((row) => ({
          ...row,
          applicant: profileById[row.user_id] ?? null,
        }))
      );
    } catch (loadError) {
      setApplications([]);
      setApplicationsError(
        loadError instanceof Error ? loadError.message : 'Could not load applications.'
      );
    } finally {
      setApplicationsLoading(false);
    }
  }

  async function updateApplicationStatus(
    application: ApplicationItem,
    nextStatus: 'reviewed' | 'accepted' | 'rejected'
  ) {
    if (!user || !selectedEvent || updatingApplicationId !== null) return;

    setUpdatingApplicationId(String(application.id));
    setApplicationsError('');

    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: nextStatus })
      .eq('id', application.id as never)
      .eq('event_id', selectedEvent.id);

    if (updateError) {
      setApplicationsError(updateError.message);
    } else {
      setApplications((current) =>
        current.map((item) =>
          String(item.id) === String(application.id)
            ? { ...item, status: nextStatus }
            : item
        )
      );
      setMessage(
        nextStatus === 'accepted'
          ? 'Artist accepted successfully.'
          : nextStatus === 'rejected'
            ? 'Application rejected.'
            : 'Application marked as reviewed.'
      );
    }

    setUpdatingApplicationId(null);
  }

  function applicationsForEvent(eventId: string) {
    return applications.filter((application) => application.event_id === eventId);
  }

  function confirmedForEvent(eventId: string) {
    return applicationsForEvent(eventId).filter((application) => application.status === 'accepted').length;
  }

  async function loadEvents() {
    if (!user) return;

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setEvents([]);
      setApplications([]);
    } else {
      const loadedEvents = (data ?? []) as EventItem[];
      setEvents(loadedEvents);
      await loadApplications(loadedEvents.map((event) => event.id));
    }

    setLoading(false);
  }

  useEffect(() => {
    if (user) void loadEvents();
  }, [user?.id]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setShowForm(true);
  }

  function openEditForm(event: EventItem) {
    setEditingId(event.id);
    setForm({
      title: event.title ?? '',
      description: event.description ?? '',
      date: event.date ?? '',
      time: event.time ?? '',
      venue: event.venue ?? '',
      city: event.city ?? '',
      budget: event.budget ?? '',
      talent_category: event.talent_category ?? 'Music',
      available_slots: String(event.available_slots ?? 1),
      poster_url: event.poster_url ?? '',
    });
    setMessage('');
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      setError('Please log in to manage events.');
      return;
    }

    if (profile?.role !== 'organizer') {
      setError('Only organizer accounts can create or edit events.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const eventData = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      organizer_name:
        profile?.full_name || profile?.organization_name || 'Organizer',
      organizer_id: user.id,
      date: form.date,
      time: form.time || null,
      venue: form.venue.trim() || null,
      city: form.city.trim() || null,
      budget: form.budget.trim() || null,
      talent_category: form.talent_category,
      available_slots: Number(form.available_slots),
      poster_url: form.poster_url.trim() || null,
    };

    const result = editingId
      ? await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingId)
          .eq('organizer_id', user.id)
      : await supabase.from('events').insert(eventData);

    if (result.error) {
      setError(result.error.message);
    } else {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(editingId ? 'Event updated successfully.' : 'Event created successfully.');
      await loadEvents();
    }

    setSaving(false);
  }

  async function deleteEvent(event: EventItem) {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id)
      .eq('organizer_id', user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setEvents((current) => current.filter((item) => item.id !== event.id));
    setMessage('Event deleted successfully.');
  }

  if (profile?.role !== 'organizer') {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Organizer access required
          </h1>
          <p className="mt-3 text-slate-600">
            Please sign in with an account registered with the Organizer role.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              TALENTBRIDGE
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Organizer Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Create events and manage the opportunities you publish.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={19} />
            Create Event
          </button>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Your events</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{events.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Upcoming events</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {events.filter((event) => event.date >= new Date().toISOString().slice(0, 10)).length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total applications</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{applications.length}</p>
            <p className="mt-1 text-xs text-slate-500">Across your events</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Confirmed artists</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {applications.filter((application) => application.status === 'accepted').length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Accepted applications</p>
          </div>
        </section>

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 break-words text-sm">{error}</p>
            <button
              onClick={() => void loadEvents()}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold underline"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {applicationsError && !selectedEvent && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Application data could not be fully loaded: {applicationsError}. Check the applications table policies if this keeps happening.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center rounded-2xl border bg-white p-16">
            <LoaderCircle className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CalendarDays className="mx-auto text-slate-400" size={42} />
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No events created yet
            </h2>
            <p className="mt-2 text-slate-500">
              Create your first event to start discovering local talent.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Create your first event
            </button>
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {event.poster_url && (
                  <img
                    src={event.poster_url}
                    alt={event.title}
                    className="h-44 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {event.title}
                    </h2>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {event.talent_category || 'General'}
                    </span>
                  </div>

                  {event.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {event.date}
                      {event.time ? ` · ${event.time}` : ''}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      {[event.venue, event.city].filter(Boolean).join(', ') || 'Location not specified'}
                    </p>
                    {event.budget && <p>Budget: {event.budget}</p>}
                    <p>Artist category needed: <span className="font-semibold text-slate-800">{event.talent_category || 'General'}</span></p>
                    <p>Positions advertised: {event.available_slots ?? 0}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="text-xs text-slate-500">Applications</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{applicationsForEvent(event.id).length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Confirmed artists</p>
                        <p className="mt-1 text-lg font-bold text-emerald-700">{confirmedForEvent(event.id)}</p>
                      </div>
                      <p className="col-span-2 text-xs text-slate-500">
                        Remaining positions: {Math.max(0, (event.available_slots ?? 0) - confirmedForEvent(event.id))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Users size={16} /> Manage applicants ({applicationsForEvent(event.id).length})
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(event)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={15} /> Edit
                      </button>
                      <button
                        onClick={() => void deleteEvent(event)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-6 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Event title *
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="e.g. College Cultural Festival"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Describe the event and the talents you need"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Event date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-3"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Time
                  </label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="e.g. 6:00 PM"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Venue
                  </label>
                  <input
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Venue name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Talent category *
                  </label>
                  <select
                    required
                    value={form.talent_category}
                    onChange={(e) => setForm({ ...form, talent_category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    {['Music', 'Dance', 'Art', 'Photography', 'Acting', 'Comedy', 'Writing', 'Other'].map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Available talent slots *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={form.available_slots}
                    onChange={(e) => setForm({ ...form, available_slots: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Budget
                </label>
                <input
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="e.g. ₹5,000 or Negotiable"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Poster image URL (optional)
                </label>
                <input
                  type="url"
                  value={form.poster_url}
                  onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              {error && (
                <p className="break-words rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving && <LoaderCircle size={18} className="animate-spin" />}
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section className="my-6 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-600">EVENT APPLICATIONS</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedEvent.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {applicationsForEvent(selectedEvent.id).length} applications · {confirmedForEvent(selectedEvent.id)} confirmed artists
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close applicants"
              >
                <X size={20} />
              </button>
            </div>

            {applicationsError && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {applicationsError}
                <p className="mt-1">If this is a permission error, the Supabase applications table needs a policy allowing an organizer to view and update applications for their own events.</p>
              </div>
            )}

            {applicationsLoading ? (
              <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-indigo-600" size={28} /></div>
            ) : applicationsForEvent(selectedEvent.id).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                <Users className="mx-auto text-slate-400" size={38} />
                <h3 className="mt-3 font-bold text-slate-900">No applications yet</h3>
                <p className="mt-1 text-sm text-slate-500">When artists apply to this event, their applications will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applicationsForEvent(selectedEvent.id).map((application) => {
                  const status = application.status || 'pending';
                  const busy = updatingApplicationId === String(application.id);
                  return (
                    <article key={String(application.id)} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900">{application.applicant?.full_name || `Artist ${application.user_id.slice(0, 8)}`}</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {[application.applicant?.talent_category, application.applicant?.city].filter(Boolean).join(' · ') || 'Artist profile details unavailable'}
                          </p>
                          {application.message && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{application.message}</p>}
                          <p className="mt-2 text-xs text-slate-400">
                            Applied {application.created_at ? new Date(application.created_at).toLocaleString() : 'date unavailable'}
                          </p>
                        </div>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : status === 'rejected' ? 'bg-red-50 text-red-700' : status === 'reviewed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800'}`}>
                          {status === 'accepted' ? <CheckCircle2 size={14} /> : status === 'rejected' ? <XCircle size={14} /> : <Clock3 size={14} />}
                          {status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        <button
                          disabled={busy || status === 'accepted'}
                          onClick={() => void updateApplicationStatus(application, 'accepted')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} /> Accept artist
                        </button>
                        <button
                          disabled={busy || status === 'rejected'}
                          onClick={() => void updateApplicationStatus(application, 'rejected')}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                        <button
                          disabled={busy || status === 'reviewed'}
                          onClick={() => void updateApplicationStatus(application, 'reviewed')}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye size={15} /> Mark reviewed
                        </button>
                        {busy && <span className="self-center text-xs text-slate-500">Saving status…</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <button onClick={() => setSelectedEvent(null)} className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
