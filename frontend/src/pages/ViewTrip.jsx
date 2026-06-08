import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  IconArrowLeft, IconCalendar, IconWallet, IconHeart, IconClock,
  IconMapPin, IconStar, IconExternal, IconWalking, IconHome,
  IconUtensils, IconLayers, IconSparkles, IconCompass, IconRoute,
} from '../components/icons';
import { Button, Badge, Card, CoverPhoto, cx } from '../components/ui';
import apiClient from '../services/apiClient';
import { fetchCategoryPhotos } from '../services/unsplash';

const photosSaved = new Set();

function makeIcon(label, color = '#534AB7', size = 32) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.42)}px;font-weight:600;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyToPin({ pin }) {
  const map = useMap();
  useEffect(() => {
    if (pin && pin.lat && pin.lng) map.flyTo([pin.lat, pin.lng], 16, { duration: 0.8 });
  }, [pin, map]);
  return null;
}

async function fetchOsrmSegment(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch (_) {}
  return [from, to]; // fallback: straight line
}

function OsrmRoutes({ points }) {
  const [segments, setSegments] = useState([]);
  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    if (!points || points.length < 2) { setSegments([]); return; }
    let cancelled = false;
    const pairs = points.slice(0, -1).map((p, i) => [p, points[i + 1]]);
    Promise.all(pairs.map(([a, b]) => fetchOsrmSegment(a, b))).then(segs => {
      if (!cancelled) setSegments(segs);
    });
    return () => { cancelled = true; };
  }, [pointsKey]);

  return segments.map((seg, i) => (
    <Polyline key={i} positions={seg} color="#534AB7" weight={3} opacity={0.8} dashArray="6,4" />
  ));
}

export default function ViewTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('schedule');
  const [activePin, setActivePin] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const hotelMarkersRef = useRef({});
  const restMarkersRef  = useRef({});

  useEffect(() => {
    if (!id) { navigate('/my-trips'); return; }
    apiClient.get(`/trips/${id}`)
      .then(r => setTrip(r.data))
      .catch(() => setError('Could not load this trip.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Reset selection and stale refs when tab changes
  useEffect(() => {
    setSelectedCard(null);
    hotelMarkersRef.current = {};
    restMarkersRef.current  = {};
  }, [tab]);

  // Open popup after flyTo finishes (~0.8 s)
  useEffect(() => {
    if (selectedCard === null) return;
    const refs = tab === 'hotels' ? hotelMarkersRef : restMarkersRef;
    const timer = setTimeout(() => refs.current[selectedCard]?.openPopup?.(), 900);
    return () => clearTimeout(timer);
  }, [selectedCard, tab]);


  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <IconSparkles size={16} className="text-primary animate-spin" /> Loading trip…
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Trip not found.'}</p>
          <Button onClick={() => navigate('/my-trips')}>Back to my trips</Button>
        </div>
      </div>
    );
  }

  const data = trip.trip_data || {};
  const scheduleDays = data.days || [];
  const hotels = data.hotels || [];
  const restaurants = data.restaurants || [];

  let _stopN = 0;
  const allScheduleItems = scheduleDays.flatMap((day, di) =>
    (day.activities || day.places || []).map((a) => ({
      ...a,
      dayIndex: di,
      n: ++_stopN,
      lat: a.geo?.lat || a.lat,
      lng: a.geo?.lng || a.lng,
    }))
  );

  const mapCenter = allScheduleItems.find(i => i.lat && i.lng)
    ? [allScheduleItems.find(i => i.lat && i.lng).lat, allScheduleItems.find(i => i.lat && i.lng).lng]
    : [48.8566, 2.3522];

  const polylinePoints = allScheduleItems.filter(i => i.lat && i.lng).map(i => [i.lat, i.lng]);

  return (
    <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)]">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_540px] gap-6">
          {/* LEFT */}
          <div className="min-w-0">
            <div className="relative">
              <CoverPhoto src={trip.cover_image} kind={trip.destination?.split(',')[0].toLowerCase().replace(/\s+/g,'') || 'default'} className="h-[280px] rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button onClick={() => navigate('/my-trips')}
                  className="absolute top-4 left-4 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-black/30 text-white/90 hover:bg-black/50 backdrop-blur text-[13px]">
                  <IconArrowLeft size={14} /> My Trips
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="label-xs text-white/70 mb-1">Itinerary</div>
                  <h1 className="text-white text-[44px] tracking-tight font-medium leading-none">{trip.destination}</h1>
                </div>
              </CoverPhoto>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge color="primary"><IconCalendar size={11} /> {trip.days} days</Badge>
              <Badge color="accent"><IconWallet size={11} /> {trip.budget}</Badge>
              <Badge color="highlight"><IconHeart size={11} /> {trip.travelers}</Badge>
            </div>

            <div className="mt-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-7">
                {[{ id: 'schedule', label: 'Schedule' }, { id: 'hotels', label: 'Hotels' }, { id: 'restaurants', label: 'Restaurants' }].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={cx('relative pb-3 text-[14px] font-medium transition-colors',
                      tab === t.id ? 'text-gray-900 dark:text-white tab-active' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div style={{ display: tab === 'schedule' ? 'block' : 'none' }}>
                <Schedule days={scheduleDays} activePin={activePin} setActivePin={setActivePin} />
              </div>
              <div style={{ display: tab === 'hotels' ? 'block' : 'none' }}>
                <CardGrid items={hotels} type="hotel" city={trip.destination} tripId={trip.id} selectedIndex={selectedCard}
                  onCardClick={(i, item) => {
                    setSelectedCard(i);
                    if (item.lat && item.lng) setActivePin({ lat: item.lat, lng: item.lng });
                  }} />
              </div>
              <div style={{ display: tab === 'restaurants' ? 'block' : 'none' }}>
                <CardGrid items={restaurants} type="restaurant" city={trip.destination} tripId={trip.id} selectedIndex={selectedCard}
                  onCardClick={(i, item) => {
                    setSelectedCard(i);
                    if (item.lat && item.lng) setActivePin({ lat: item.lat, lng: item.lng });
                  }} />
              </div>
            </div>

            <BudgetTracker trip={trip} />
          </div>

          {/* RIGHT — Sticky Map */}
          <div className="hidden lg:block">
            <div className="sticky top-[80px] h-[calc(100vh-100px)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                {tab === 'schedule' && polylinePoints.length > 1 && (
                  <OsrmRoutes points={polylinePoints} />
                )}
                {tab === 'schedule' && allScheduleItems.filter(i => i.lat && i.lng).map(item => (
                  <Marker key={item.n} position={[item.lat, item.lng]} icon={makeIcon(item.n, activePin?.n === item.n ? '#3C3489' : '#534AB7')}>
                    <Popup><b>{item.name || item.placeName}</b><br />{item.time}</Popup>
                  </Marker>
                ))}
                {tab === 'hotels' && hotels.filter(h => h.lat && h.lng).map((h, i) => (
                  <Marker key={i}
                    ref={el => { if (el) hotelMarkersRef.current[i] = el; }}
                    position={[h.lat, h.lng]}
                    icon={makeIcon('H', selectedCard === i ? '#6d28d9' : '#7c3aed', selectedCard === i ? 38 : 32)}>
                    <Popup><b>{h.name}</b><br />{h.area || ''}</Popup>
                  </Marker>
                ))}
                {tab === 'restaurants' && restaurants.filter(r => r.lat && r.lng).map((r, i) => (
                  <Marker key={i}
                    ref={el => { if (el) restMarkersRef.current[i] = el; }}
                    position={[r.lat, r.lng]}
                    icon={makeIcon('R', selectedCard === i ? '#6d28d9' : '#7c3aed', selectedCard === i ? 38 : 32)}>
                    <Popup><b>{r.name}</b><br />{r.cuisine || ''}</Popup>
                  </Marker>
                ))}
                {activePin && activePin.lat && <FlyToPin pin={activePin} />}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Schedule({ days, activePin, setActivePin }) {
  if (!days || days.length === 0) {
    return <p className="text-gray-500 text-[14px]">No schedule available.</p>;
  }
  let n = 0;
  return (
    <div className="space-y-8">
      {days.map((day, di) => {
        const items = day.activities || day.places || [];
        return (
          <div key={di}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-primary text-white text-[14px] font-medium flex items-center justify-center">{di + 1}</div>
              <div>
                <div className="text-[18px] font-medium text-gray-900 dark:text-white">Day {di + 1}</div>
                {day.title && <div className="text-[12px] text-gray-500 dark:text-gray-400">{day.title}</div>}
              </div>
            </div>
            <div className="relative pl-[18px]">
              <div className="absolute left-[17px] top-0 bottom-0 w-px tl-line" />
              <div className="space-y-0">
                {items.map((item, ii) => {
                  n++;
                  const itemN = n;
                  const isActive = activePin?.n === itemN;
                  return (
                    <div key={ii} className="relative">
                      <div className="flex gap-4 pb-1">
                        <div className={cx('relative -ml-[18px] z-10 w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white text-[12px] font-medium transition-transform',
                          isActive ? 'bg-primary-dark scale-110 ring-4 ring-primary-light dark:ring-primary/20' : 'bg-primary')}>
                          {itemN}
                        </div>
                        <div className="flex-1 min-w-0 pb-5">
                          <Card className={cx('p-4 transition-colors cursor-pointer', isActive && 'border-primary')}
                                onClick={() => setActivePin({ n: itemN, lat: item.geo?.lat || item.lat, lng: item.geo?.lng || item.lng })}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-3 flex-wrap">
                                  <h3 className="text-[15px] font-medium text-gray-900 dark:text-white">{item.name || item.placeName}</h3>
                                  {item.time && (
                                    <span className="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums flex items-center gap-1">
                                      <IconClock size={11} /> {item.time}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="mt-1.5 text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                                )}
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name || item.placeName || '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="mt-2 inline-flex items-center gap-1 text-[13px] transition-opacity hover:opacity-70"
                                  style={{ color: '#a78bfa' }}>
                                  <IconExternal size={13} /> View on Maps
                                </a>
                              </div>
                              {(item.geo?.lat || item.lat) && (
                                <Button variant="ghost" size="sm"
                                  onClick={e => { e.stopPropagation(); setActivePin({ n: itemN, lat: item.geo?.lat || item.lat, lng: item.geo?.lng || item.lng }); }}>
                                  <IconMapPin size={13} /> Map
                                </Button>
                              )}
                            </div>
                          </Card>
                          {item.travelNext && (
                            <div className="flex items-center gap-3 mt-3 pl-1">
                              <div className="h-6 w-px tl-line-accent" />
                              <Badge color="accent">
                                <IconWalking size={11} /> {item.travelNext.mins} min {item.travelNext.mode}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CARD_KINDS = ['paris', 'tokyo', 'lisbon', 'rome', 'iceland', 'nyc', 'default'];

const PRICE_LABELS = {
  '$': '$', 'budget': '$',
  '$$': '$$', 'moderate': '$$',
  '$$$': '$$$', 'luxury': '$$$',
};
const getPriceLabel = (p) =>
  p ? (PRICE_LABELS[String(p).trim().toLowerCase()] ?? '$$') : '$$';

function CardGrid({ items, type, city, tripId, onCardClick, selectedIndex }) {
  const [photos, setPhotos] = useState(() => {
    const map = {};
    items?.forEach((item, i) => { if (item.photo_url) map[i] = item.photo_url; });
    return map;
  });

  const category = type === 'hotel' ? 'hotel' : 'restaurant';

  useEffect(() => {
    if (!items || items.length === 0) return;
    if (items.every(item => item.photo_url)) return; // all already in DB
    let cancelled = false;
    fetchCategoryPhotos(category, city || '', items.length).then(urls => {
      if (cancelled) return;
      const map = {};
      urls.forEach((url, i) => { if (url) map[i] = url; });
      setPhotos(map);
      // persist to DB once per trip per type (fire-and-forget)
      const saveKey = `${tripId}:${type}`;
      if (tripId && urls.some(Boolean) && !photosSaved.has(saveKey)) {
        photosSaved.add(saveKey);
        apiClient.patch(`/trips/${tripId}/photos`, {
          [type === 'hotel' ? 'hotels' : 'restaurants']: urls,
        }).catch(() => {});
      }
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-[14px]">No {type}s available.</p>;
  }

  const formatPrice = (price) => {
    if (!price) return null;
    const p = String(price).trim();
    if (p.includes('-')) {
      const [lo, hi] = p.split('-').map(s => s.trim());
      return `$${lo}–$${hi}`;
    }
    return `$${p}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((item, i) => {
        const kind = CARD_KINDS[i % CARD_KINDS.length];
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(item.name + (item.area ? ` ${item.area}` : ''))}`;
        const priceFormatted = formatPrice(item.price);

        return (
          <Card key={i}
            className={cx('overflow-hidden cursor-pointer trip-card transition-all',
              selectedIndex === i ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary')}
            onClick={() => onCardClick(i, item)}>
            {/* Image / gradient cover */}
            <CoverPhoto src={photos[i] ?? item.image ?? null} kind={kind} className="h-[180px]">
              {(photos[i] ?? item.image) && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
              )}
            </CoverPhoto>

            <div className="p-4">
              {/* Name + price row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug">{item.name}</div>
                  <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {type === 'hotel' ? (item.area || '') : (item.cuisine || '')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {type === 'hotel' && priceFormatted && (
                    <>
                      <div className="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums leading-tight">{priceFormatted}/night</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">per night</div>
                    </>
                  )}
                  {type === 'restaurant' && (
                    <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 11, borderRadius: 999, padding: '2px 10px', display: 'inline-block', whiteSpace: 'nowrap' }}>
                      {getPriceLabel(item.priceRange)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              {item.rating && (
                <div className="mt-2.5 flex items-center gap-1 text-[12px] text-gray-600 dark:text-gray-300">
                  <IconStar size={12} style={{ fill: '#FBBF24', color: '#FBBF24' }} />
                  <span className="tabular-nums font-medium">{item.rating}</span>
                </div>
              )}

              {/* View on Maps */}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-70"
                style={{ color: '#a78bfa' }}>
                <IconExternal size={13} /> View on Maps
              </a>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const BUDGET_RANGES = {
  cheap:    { min: 30,  max: 80,  label: 'Budget',   color: '#22c55e' },
  moderate: { min: 120, max: 250, label: 'Moderate',  color: '#6366f1' },
  luxury:   { min: 400, max: 800, label: 'Luxury',    color: '#f59e0b' },
};

const TRAVELER_COUNTS = { solo: 1, couple: 2, family: 4, friends: 3 };

const CATEGORY_ROWS = [
  { key: 'hotel',      label: 'Hotels',     Icon: IconHome,     pct: 0.40 },
  { key: 'food',       label: 'Food',       Icon: IconUtensils, pct: 0.30 },
  { key: 'activities', label: 'Activities', Icon: IconCompass,  pct: 0.20 },
  { key: 'transport',  label: 'Transport',  Icon: IconRoute,    pct: 0.10 },
];

function fmt(n) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

function BudgetTracker({ trip }) {
  const range     = BUDGET_RANGES[trip.budget] ?? BUDGET_RANGES.moderate;
  const travelers = TRAVELER_COUNTS[trip.travelers] ?? 1;
  const days      = trip.days;
  const totalMin  = range.min * days * travelers;
  const totalMax  = range.max * days * travelers;

  return (
    <div className="mt-8">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">Estimated Budget</h3>
          <span className="text-[20px] font-bold tabular-nums leading-tight" style={{ color: range.color }}>
            {fmt(totalMin)} – {fmt(totalMax)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-600 dark:text-gray-300">
            {fmt(Math.round(totalMin / travelers))} – {fmt(Math.round(totalMax / travelers))} per person
          </span>
          <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-600 dark:text-gray-300">
            {fmt(Math.round(totalMin / days))} – {fmt(Math.round(totalMax / days))} per day
          </span>
        </div>

        <div className="space-y-3.5">
          {CATEGORY_ROWS.map(({ key, label, Icon, pct }) => {
            const min = Math.round(totalMin * pct);
            const max = Math.round(totalMax * pct);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-300">
                    <Icon size={14} style={{ color: range.color, opacity: 0.8 }} />
                    <span>{label}</span>
                  </div>
                  <span className="text-[13px] font-medium tabular-nums text-gray-900 dark:text-white">
                    {fmt(min)} – {fmt(max)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct * 100}%`, background: range.color, opacity: 0.65 }} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
          Estimates based on {range.label.toLowerCase()} travel style · {travelers} traveler{travelers !== 1 ? 's' : ''} · {days} day{days !== 1 ? 's' : ''}
        </p>
      </Card>
    </div>
  );
}
