import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconPlus, IconTrash, IconCalendar, IconMapPin, IconWallet, IconHeart, IconGem, IconCompass, IconUser, IconUsers } from '../components/icons';
import { Button, Badge, Card, CoverPhoto, ConfirmDialog, cx } from '../components/ui';
import apiClient from '../services/apiClient';

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiClient.get('/trips')
      .then(r => setTrips(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteTrip = async (trip) => {
    try {
      await apiClient.delete(`/trips/${trip.id}`);
      setTrips(cur => cur.filter(t => t.id !== trip.id));
    } catch {}
    setConfirm(null);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <SkeletonHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-[400px] mx-auto text-center">
            <div className="text-[64px] leading-none mb-4">🗺️</div>
            <h2 className="text-[24px] tracking-tight font-medium text-gray-900 dark:text-white">No trips yet</h2>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2">Your AI-generated itineraries will appear here.</p>
            <Button variant="primary" size="lg" className="mt-6" onClick={() => navigate('/create-trip')}>
              Plan my first trip <IconArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getSevenDaysAfterCreation = (trip) => {
    const created = new Date(trip.created_at);
    created.setDate(created.getDate() + 7);
    return created;
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    if (trip.start_date) {
      const tripDate = new Date(trip.start_date);
      tripDate.setHours(0, 0, 0, 0);
      if (filter === 'upcoming') return tripDate >= today;
      if (filter === 'past') return tripDate < today;
    } else {
      const expiresAt = getSevenDaysAfterCreation(trip);
      if (filter === 'upcoming') return expiresAt >= today;
      if (filter === 'past') return expiresAt < today;
    }
    return true;
  });

  const FILTERS = [
    { id: 'all',      label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past',     label: 'Past' },
  ];

  const EMPTY_STATES = {
    upcoming: { text: 'No upcoming trips. Plan your next adventure!' },
    past:     { text: 'No past trips yet.' },
  };

  return (
    <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[28px] tracking-tight font-medium text-gray-900 dark:text-white">My Trips</h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              {trips.length} saved itinerar{trips.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/create-trip')}><IconPlus size={14} /> New Trip</Button>
        </div>

        <div className="flex items-center gap-2 mt-5">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cx('h-8 px-4 rounded-full text-[13px] font-medium transition-colors',
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary')}>
              {f.label}
            </button>
          ))}
        </div>

        {filteredTrips.length === 0 && filter !== 'all' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '80px', color: '#94a3b8', fontSize: '15px' }}>
            <div style={{ color: '#6366f1', opacity: 0.6 }}>
              {filter === 'upcoming' && <IconMapPin size={48} />}
              {filter === 'past'     && <IconCalendar size={48} />}
            </div>
            <span>{EMPTY_STATES[filter]?.text}</span>
            {filter === 'upcoming' && (
              <Button variant="primary" size="md" className="mt-2" onClick={() => navigate('/create-trip')}>
                Plan a trip <IconArrowRight size={14} />
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} navigate={navigate} onDelete={() => setConfirm(trip)} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this trip?"
        body={`"${confirm?.destination}" will be permanently removed.`}
        onCancel={() => setConfirm(null)}
        onConfirm={() => deleteTrip(confirm)} />
    </div>
  );
}

function TripCard({ trip, navigate, onDelete }) {
  const kindKey = trip.destination?.split(',')[0].toLowerCase().replace(/\s+/g, '') || 'default';
  return (
    <Card className="overflow-hidden trip-card cursor-pointer hover:border-primary"
          onClick={() => navigate(`/view-trip/${trip.id}`)}>
      <div className="relative h-[180px] overflow-hidden">
        <div className="absolute inset-0 trip-photo">
          <CoverPhoto src={trip.cover_image} kind={kindKey} className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="text-white text-[20px] font-medium leading-tight">{trip.destination}</div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge color="primary"><IconCalendar size={10} /> {trip.days}d</Badge>
          <Badge color="accent">
            {trip.budget === 'luxury' ? <IconGem size={10} /> : trip.budget === 'cheap' ? <IconWallet size={10} /> : <IconCompass size={10} />}
            {trip.budget}
          </Badge>
          <Badge color="highlight">
            {trip.travelers === 'solo' ? <IconUser size={10} /> : trip.travelers === 'family' ? <IconUsers size={10} /> : <IconHeart size={10} />}
            {trip.travelers}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/view-trip/${trip.id}`); }}>
            View trip <IconArrowRight size={12} />
          </Button>
          <Button variant="ghostDanger" size="sm"
            onClick={e => { e.stopPropagation(); onDelete(); }}>
            <IconTrash size={13} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SkeletonHeader() {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="h-7 w-40 shimmer rounded-md" />
        <div className="h-3 w-24 shimmer rounded-md mt-2" />
      </div>
      <div className="h-10 w-32 shimmer rounded-lg" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="h-[180px] shimmer" />
      <div className="p-4">
        <div className="flex gap-2">
          <div className="h-6 w-14 shimmer rounded-full" />
          <div className="h-6 w-20 shimmer rounded-full" />
          <div className="h-6 w-16 shimmer rounded-full" />
        </div>
        <div className="mt-4 flex justify-between">
          <div className="h-8 w-24 shimmer rounded-lg" />
          <div className="h-8 w-8 shimmer rounded-lg" />
        </div>
      </div>
    </Card>
  );
}
