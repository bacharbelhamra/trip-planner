import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { jsPDF } from 'jspdf';
import {
  IconArrowLeft, IconCalendar, IconWallet, IconHeart, IconClock,
  IconMapPin, IconStar, IconExternal, IconWalking, IconHome,
  IconUtensils, IconLayers, IconDownload, IconSparkles,
} from '../components/icons';
import { Button, Badge, Card, CoverPhoto, cx } from '../components/ui';
import apiClient from '../services/apiClient';

function makeIcon(label, color = '#534AB7') {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FlyToPin({ pin }) {
  const map = useMap();
  useEffect(() => {
    if (pin && pin.lat && pin.lng) map.flyTo([pin.lat, pin.lng], 16, { duration: 0.8 });
  }, [pin, map]);
  return null;
}

export default function ViewTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('schedule');
  const [activePin, setActivePin] = useState(null);

  useEffect(() => {
    if (!id) { navigate('/my-trips'); return; }
    apiClient.get(`/trips/${id}`)
      .then(r => setTrip(r.data))
      .catch(() => setError('Could not load this trip.'))
      .finally(() => setLoading(false));
  }, [id]);

  const exportPDF = () => {
    if (!trip) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`${trip.destination} — ${trip.days} days`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Budget: ${trip.budget} | Travelers: ${trip.travelers}`, 20, 32);
    let y = 48;
    (trip.trip_data?.days || []).forEach((day, di) => {
      doc.setFontSize(14);
      doc.text(`Day ${di + 1}: ${day.title || ''}`, 20, y); y += 10;
      doc.setFontSize(11);
      (day.activities || day.places || []).forEach(a => {
        doc.text(`  • ${a.name || a.placeName} — ${a.time || ''}`, 20, y); y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      y += 4;
    });
    doc.save(`${trip.destination.replace(/\s+/g, '-')}-itinerary.pdf`);
  };

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

  const allScheduleItems = scheduleDays.flatMap((day, di) =>
    (day.activities || day.places || []).map((a, ai) => ({
      ...a,
      dayIndex: di,
      n: di * 20 + ai + 1,
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
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={exportPDF}><IconDownload size={13} /> PDF</Button>
              </div>
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
              {tab === 'schedule' && <Schedule days={scheduleDays} activePin={activePin} setActivePin={setActivePin} />}
              {tab === 'hotels' && <CardGrid items={hotels} type="hotel" onCardClick={(i) => setActivePin({ type: 'hotel', i })} />}
              {tab === 'restaurants' && <CardGrid items={restaurants} type="restaurant" onCardClick={(i) => setActivePin({ type: 'restaurant', i })} />}
            </div>
          </div>

          {/* RIGHT — Sticky Map */}
          <div className="hidden lg:block">
            <div className="sticky top-[80px] h-[calc(100vh-100px)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                {polylinePoints.length > 1 && (
                  <Polyline positions={polylinePoints} color="#534AB7" weight={2} dashArray="6 5" opacity={0.7} />
                )}
                {tab === 'schedule' && allScheduleItems.filter(i => i.lat && i.lng).map(item => (
                  <Marker key={item.n} position={[item.lat, item.lng]} icon={makeIcon(item.n, activePin?.n === item.n ? '#3C3489' : '#534AB7')}>
                    <Popup><b>{item.name || item.placeName}</b><br />{item.time}</Popup>
                  </Marker>
                ))}
                {tab === 'hotels' && hotels.filter(h => h.lat && h.lng).map((h, i) => (
                  <Marker key={i} position={[h.lat, h.lng]} icon={makeIcon(<span style={{fontSize:10}}>🏨</span>, '#D97706')}>
                    <Popup><b>{h.name}</b><br />{h.area || ''}</Popup>
                  </Marker>
                ))}
                {tab === 'restaurants' && restaurants.filter(r => r.lat && r.lng).map((r, i) => (
                  <Marker key={i} position={[r.lat, r.lng]} icon={makeIcon(<span style={{fontSize:10}}>🍽</span>, '#1D9E75')}>
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

function CardGrid({ items, type, onCardClick }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-[14px]">No {type}s available.</p>;
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <Card key={i} className="overflow-hidden cursor-pointer hover:border-primary trip-card" onClick={() => onCardClick(i)}>
          {item.image && (
            <div className="h-[160px] overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover trip-photo" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-[12px] text-gray-500 dark:text-gray-400">{type === 'hotel' ? (item.area || '') : (item.cuisine || '')}</div>
              </div>
              <div className="text-right shrink-0">
                {type === 'hotel' && item.price && (
                  <>
                    <div className="text-[14px] font-medium text-gray-900 dark:text-white tabular-nums">${item.price}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">per night</div>
                  </>
                )}
                {type === 'restaurant' && item.priceRange && (
                  <div className="text-[14px] font-medium text-gray-900 dark:text-white">{item.priceRange}</div>
                )}
              </div>
            </div>
            {item.rating && (
              <div className="mt-3 flex items-center gap-1 text-[12px] text-gray-600 dark:text-gray-300">
                <IconStar size={12} style={{ fill: '#FBBF24', color: '#FBBF24' }} />
                <span className="tabular-nums font-medium">{item.rating}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
