import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconPlus, IconTrash, IconCalendar, IconWallet, IconHeart, IconGem, IconCompass, IconUser, IconUsers } from '../components/icons';
import { Button, Badge, Card, CoverPhoto, ConfirmDialog, cx } from '../components/ui';
import apiClient from '../services/apiClient';

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} navigate={navigate} onDelete={() => setConfirm(trip)} />
          ))}
        </div>
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
