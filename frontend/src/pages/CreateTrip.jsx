import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { IconArrowLeft, IconArrowRight, IconMapPin, IconMinus, IconPlus, IconWallet, IconCompass, IconGem, IconCheck, IconSparkles } from '../components/icons';
import { Button, Badge, Card, cx } from '../components/ui';
import apiClient from '../services/apiClient';

const SAMPLE_DESTINATIONS = [
  { flag: '🇫🇷', city: 'Paris', country: 'France' },
  { flag: '🇯🇵', city: 'Tokyo', country: 'Japan' },
  { flag: '🇺🇸', city: 'New York City', country: 'United States' },
  { flag: '🇮🇹', city: 'Rome', country: 'Italy' },
  { flag: '🇪🇸', city: 'Barcelona', country: 'Spain' },
  { flag: '🇲🇽', city: 'Mexico City', country: 'Mexico' },
  { flag: '🇹🇭', city: 'Bangkok', country: 'Thailand' },
  { flag: '🇵🇹', city: 'Lisbon', country: 'Portugal' },
  { flag: '🇮🇸', city: 'Reykjavík', country: 'Iceland' },
  { flag: '🇬🇧', city: 'London', country: 'United Kingdom' },
  { flag: '🇦🇺', city: 'Sydney', country: 'Australia' },
  { flag: '🇦🇪', city: 'Dubai', country: 'UAE' },
];

const STEPS = [
  { n: 1, label: 'Destination' },
  { n: 2, label: 'Duration' },
  { n: 3, label: 'Budget' },
  { n: 4, label: 'Travelers' },
];

const LOADING_MSGS = ['Calling the AI…', 'Building your schedule…', 'Finding hotels…', 'Almost there…'];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(null);
  const [search, setSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(null);
  const [travelers, setTravelers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');

  const filtered = SAMPLE_DESTINATIONS.filter(d =>
    !search || d.city.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())
  );

  const canNext = (() => {
    if (step === 1) return !!destination;
    if (step === 2) return days > 0;
    if (step === 3) return !!budget;
    if (step === 4) return !!travelers;
    return false;
  })();

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setLoadingMsg(0);
    const interval = setInterval(() => setLoadingMsg(m => Math.min(m + 1, 3)), 3700);
    try {
      const res = await apiClient.post('/trips/generate', {
        destination: `${destination.city}, ${destination.country}`,
        days,
        budget: budget.toLowerCase(),
        travelers: travelers.toLowerCase(),
      });
      clearInterval(interval);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => navigate(`/view-trip/${res.data.id}`), 600);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.message || 'Failed to generate trip. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-ink min-h-[calc(100vh-64px)]">
      <div className="max-w-[640px] mx-auto px-6 py-12">
        <Stepper step={step} />

        <Card className="mt-8 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-[22px] tracking-tight font-medium text-gray-900 dark:text-white">Where are you going?</h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">Start typing a city — we'll auto-complete.</p>
              <div className="mt-6 relative">
                <div className="relative">
                  <IconMapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={destination ? `${destination.flag}  ${destination.city}, ${destination.country}` : search}
                    onChange={e => { setDestination(null); setSearch(e.target.value); setShowDrop(true); }}
                    onFocus={() => setShowDrop(true)}
                    placeholder="Paris, Tokyo, New York…"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-carddark text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
                {showDrop && !destination && filtered.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-carddark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden z-10 max-h-[280px] overflow-y-auto">
                    {filtered.map((d, i) => (
                      <button key={i} onClick={() => { setDestination(d); setShowDrop(false); setSearch(''); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-light dark:hover:bg-primary/10 text-left">
                        <span className="text-[20px]">{d.flag}</span>
                        <span className="text-[14px] text-gray-900 dark:text-white">{d.city}</span>
                        <span className="text-[13px] text-gray-500 dark:text-gray-400">{d.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-[22px] tracking-tight font-medium text-gray-900 dark:text-white">How many days?</h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">We'll plan one day at a time.</p>
              <div className="mt-10 flex items-center justify-center gap-8">
                <button onClick={() => setDays(Math.max(1, days - 1))}
                  className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
                  <IconMinus size={18} />
                </button>
                <div className="text-center">
                  <div className="text-[64px] font-medium text-gray-900 dark:text-white tabular-nums leading-none">{days}</div>
                  <div className="label-xs text-gray-500 dark:text-gray-400 mt-2">{days === 1 ? 'day' : 'days'}</div>
                </div>
                <button onClick={() => setDays(Math.min(14, days + 1))}
                  className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
                  <IconPlus size={18} />
                </button>
              </div>
              <div className="mt-10">
                <input type="range" min="1" max="14" value={days} onChange={e => setDays(+e.target.value)} className="vio w-full" />
                <div className="mt-2 flex justify-between text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  <span>1</span><span>7</span><span>14</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-[22px] tracking-tight font-medium text-gray-900 dark:text-white">What's your budget?</h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">Affects hotel and dining picks.</p>
              <div className="mt-6 space-y-3">
                <BudgetCard active={budget === 'Budget'} onClick={() => setBudget('Budget')}
                  icon={<IconWallet size={20} className="text-gray-600 dark:text-gray-300" />}
                  title="Budget" body="Cheap stays, street food, free sights" hint="$30–80 / day" />
                <BudgetCard active={budget === 'Moderate'} onClick={() => setBudget('Moderate')}
                  icon={<IconCompass size={20} className="text-gray-600 dark:text-gray-300" />}
                  title="Moderate" body="3-star hotels, casual dining, paid attractions" hint="$120–250 / day" />
                <BudgetCard active={budget === 'Luxury'} onClick={() => setBudget('Luxury')}
                  icon={<IconGem size={20} className="text-gray-600 dark:text-gray-300" />}
                  title="Luxury" body="5-star resorts, fine dining, private guides" hint="$400+ / day" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-[22px] tracking-tight font-medium text-gray-900 dark:text-white">Who's traveling?</h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">We'll tune the vibe accordingly.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { id: 'Solo',    emoji: '✈️', body: 'Just me' },
                  { id: 'Couple',  emoji: '🥂', body: 'Two travelers' },
                  { id: 'Family',  emoji: '🏡', body: 'Family with kids' },
                  { id: 'Friends', emoji: '⛵', body: 'Group of friends' },
                ].map(t => {
                  const active = travelers === t.id;
                  return (
                    <button key={t.id} onClick={() => setTravelers(t.id)}
                      className={cx('w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-colors',
                        active ? 'border-primary bg-primary-light dark:bg-primary/10 border-l-[4px]'
                               : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700')}>
                      <div className={cx('w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[22px] leading-none',
                        active ? 'bg-white dark:bg-primary/20' : 'bg-gray-100 dark:bg-white/5')}>
                        {t.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cx('text-[15px] font-medium', active ? 'text-primary-dark dark:text-primary-light' : 'text-gray-900 dark:text-white')}>{t.id}</div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400">{t.body}</div>
                      </div>
                      {active && <IconCheck size={16} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {travelers && (
                <div className="mt-7 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
                  <div className="label-xs text-gray-500 dark:text-gray-400 mb-2">Trip summary</div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-gray-700 dark:text-gray-200">
                    <span>{destination?.flag} {destination?.city}</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span>{days} {days === 1 ? 'day' : 'days'}</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span>{budget}</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span>{travelers}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-7 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-3 text-[14px] text-gray-900 dark:text-white">
                <IconSparkles size={16} className="text-primary" />
                <span className="font-medium">{LOADING_MSGS[loadingMsg]}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-primary prog-pulse rounded-full" />
              </div>
              <div className="mt-3 text-[12px] text-gray-500 dark:text-gray-400">This usually takes about 15 seconds.</div>
            </div>
          )}

          {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

          {!loading && (
            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}>
                <IconArrowLeft size={14} /> Back
              </Button>
              {step < 4 ? (
                <Button variant="primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
                  Next <IconArrowRight size={14} />
                </Button>
              ) : (
                <Button variant="accent" size="lg" disabled={!canNext} onClick={handleGenerate} className="w-[260px]">
                  <IconSparkles size={16} /> Generate my trip
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((s, i) => {
        const completed = step > s.n;
        const current   = step === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={cx('w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors',
                completed ? 'bg-primary text-white'
                : current  ? 'bg-white dark:bg-carddark border-2 border-primary text-primary'
                           : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500')}>
                {completed ? <IconCheck size={14} /> : s.n}
              </div>
              <div className={cx('text-[11px] font-medium tracking-wide', current || completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500')}>
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-3 -mt-5">
                <div className={cx('h-px w-full', step > s.n ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800')} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BudgetCard({ active, onClick, icon, title, body, hint }) {
  return (
    <button onClick={onClick}
      className={cx('w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-colors',
        active ? 'border-primary bg-primary-light dark:bg-primary/10 border-l-[4px]'
               : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700')}>
      <div className={cx('w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
        active ? 'bg-white dark:bg-primary/20' : 'bg-gray-100 dark:bg-white/5')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cx('text-[15px] font-medium', active ? 'text-primary-dark dark:text-primary-light' : 'text-gray-900 dark:text-white')}>{title}</div>
        <div className="text-[12px] text-gray-500 dark:text-gray-400">{body}</div>
      </div>
      <div className="text-right">
        <div className="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums">{hint}</div>
        {active && <IconCheck size={16} className="text-primary mt-1 ml-auto" />}
      </div>
    </button>
  );
}
