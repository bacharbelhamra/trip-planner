import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconCheck, IconRoute, IconMap, IconHome, IconMapPin, IconCalendar, IconWallet, IconHeart, IconWalking } from '../components/icons';
import { Button, Badge, Card, CoverPhoto, cx } from '../components/ui';

const POPULAR = [
  { kind: 'paris', name: 'Paris', country: 'France', days: 3 },
  { kind: 'tokyo', name: 'Tokyo', country: 'Japan', days: 7 },
  { kind: 'nyc', name: 'New York City', country: 'USA', days: 4 },
  { kind: 'lisbon', name: 'Lisbon', country: 'Portugal', days: 5 },
  { kind: 'iceland', name: 'Reykjavík', country: 'Iceland', days: 6 },
  { kind: 'rome', name: 'Rome', country: 'Italy', days: 3 },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute inset-0 hero-radial" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/5 border border-white/10 text-[12px] text-white/70 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Now generating itineraries in seconds
            </div>
            <h1 className="text-[56px] leading-[1.05] tracking-tight max-w-[560px]">
              <span className="font-extrabold">Plan smarter.</span>{' '}
              <span className="font-light text-white/85">Travel better.</span>
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-white/65 max-w-[520px]">
              Describe your trip — destination, budget, travel style — and get a complete
              day-by-day itinerary with hotels, restaurants, and a live map. In seconds.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button variant="primary" size="lg" onClick={() => navigate('/create-trip')}>
                Start planning <IconArrowRight size={16} />
              </Button>
              <Button variant="ghostWhite" size="lg" onClick={() => navigate('/my-trips')}>
                See my trips
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-[12px] text-white/50">
              <div className="flex items-center gap-2"><IconCheck size={14} className="text-accent" /> No credit card</div>
              <div className="flex items-center gap-2"><IconCheck size={14} className="text-accent" /> Free during beta</div>
              <div className="flex items-center gap-2"><IconCheck size={14} className="text-accent" /> Powered by Groq</div>
            </div>
          </div>
          <HeroMockup />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white dark:bg-ink">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-px bg-gray-200 dark:bg-white/10 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
            <Feature icon={<IconRoute size={20} className="text-primary" />} tag="AI Itineraries"
              title="Day-by-day schedules with real places"
              body="Groq generates a logical, walkable schedule — opening hours, travel times and reservations all accounted for." />
            <Feature icon={<IconMap size={20} className="text-accent" />} tag="Interactive Map"
              title="Every stop plotted on a live map"
              body="Click any place to fly the map to it. See routes between stops, hotels and restaurants — all in one Leaflet view." />
            <Feature icon={<IconHome size={20} className="text-highlight" />} tag="Hotels & Restaurants"
              title="Curated picks with photos and ratings"
              body="Hand-checked recommendations matched to your budget and travel style. Save the ones you love." />
          </div>

          <div className="mt-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="label-xs text-primary mb-2">How it works</div>
                <h2 className="text-[32px] tracking-tight font-medium text-gray-900 dark:text-white">Three steps from idea to itinerary</h2>
              </div>
              <Button variant="ghost" size="md" onClick={() => navigate('/create-trip')}>Try it now <IconArrowRight size={14} /></Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Step n={1} title="Describe your trip" body="Tell us where you're headed, how long you're staying, your budget and who's coming." />
              <Step n={2} title="We build it in seconds" body="Our AI drafts a day-by-day plan with hotels, restaurants, and timing." />
              <Step n={3} title="Tweak, save, share" body="Drag to reorder, swap places, or generate a fresh take. Export when you're ready." />
            </div>
          </div>

          <div className="mt-24">
            <div className="label-xs text-gray-500 dark:text-gray-400 mb-4">Popular this week</div>
            <div className="flex gap-3 overflow-x-auto nice-scroll pb-2 -mx-2 px-2">
              {POPULAR.map(d => (
                <button key={d.kind} onClick={() => navigate('/create-trip')} className="shrink-0 w-[220px] text-left">
                  <CoverPhoto kind={d.kind} className="h-[140px] rounded-xl">
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-white font-medium text-[15px]">{d.name}</div>
                      <div className="text-white/70 text-[12px]">{d.country} · {d.days} days</div>
                    </div>
                  </CoverPhoto>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-[24px] tracking-tight font-medium text-gray-900 dark:text-white">Your next trip is one prompt away.</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Free during beta. No credit card required.</p>
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate('/create-trip')}>Start planning <IconArrowRight size={16} /></Button>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-ink border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-[12px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2"><IconMapPin size={14} className="text-primary" /> TripPlanner — © 2026</div>
          <div className="flex items-center gap-6">
            <a className="hover:text-gray-900 dark:hover:text-white" href="#">Terms</a>
            <a className="hover:text-gray-900 dark:hover:text-white" href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, tag, title, body }) {
  return (
    <div className="bg-white dark:bg-carddark p-7">
      <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-5">
        {icon}
      </div>
      <div className="label-xs text-gray-500 dark:text-gray-400 mb-1">{tag}</div>
      <div className="text-[17px] text-gray-900 dark:text-white font-medium tracking-tight mb-2">{title}</div>
      <div className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{body}</div>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-full bg-primary text-white text-[13px] font-medium flex items-center justify-center">{n}</div>
        <div className="label-xs text-gray-500 dark:text-gray-400">Step {n}</div>
      </div>
      <div className="text-[16px] font-medium text-gray-900 dark:text-white mb-1">{title}</div>
      <div className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{body}</div>
    </Card>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-primary/20 rounded-3xl blur-3xl opacity-50" />
      <div className="relative rounded-2xl border border-white/10 bg-carddark overflow-hidden shadow-2xl">
        <div className="h-8 bg-black/40 border-b border-white/5 flex items-center gap-1.5 px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-4 text-[10px] text-white/40 font-mono">tripplanner.app/trips/paris-3d</div>
        </div>
        <div className="grid grid-cols-5 gap-0">
          <div className="col-span-3 p-5 border-r border-white/5">
            <CoverPhoto kind="paris" className="h-[100px] rounded-lg mb-4">
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-3 text-white font-medium text-[14px]">Paris</div>
            </CoverPhoto>
            <div className="flex items-center gap-1.5 mb-4">
              <Badge color="primary"><IconCalendar size={10} /> 3 days</Badge>
              <Badge color="accent"><IconWallet size={10} /> Moderate</Badge>
              <Badge color="highlight"><IconHeart size={10} /> Couple</Badge>
            </div>
            <div className="space-y-3">
              {[{ n: 1, name: 'The Louvre', t: '09:00 – 11:30' }, { n: 2, name: 'Café de Flore', t: '12:00 – 13:30' }, { n: 3, name: 'Eiffel Tower', t: '18:30 – 20:00' }].map(i => (
                <div key={i.n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-medium flex items-center justify-center shrink-0">{i.n}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-white font-medium truncate">{i.name}</div>
                    <div className="text-[11px] text-white/50">{i.t}</div>
                  </div>
                  <Badge color="accent"><IconWalking size={10} /> 12m</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 bg-[#0F1626] relative">
            <svg className="absolute inset-0 w-full h-full">
              <path d="M 30 60 L 70 110 L 120 90 L 160 180 L 100 220" stroke="#534AB7" strokeWidth="2" strokeDasharray="5 4" fill="none" opacity="0.6" />
            </svg>
            {[{n:1,x:30,y:60},{n:2,x:70,y:110},{n:3,x:120,y:90},{n:4,x:160,y:180},{n:5,x:100,y:220}].map(p => (
              <div key={p.n} className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary text-white text-[11px] font-medium flex items-center justify-center ring-2 ring-carddark"
                   style={{ left: p.x, top: p.y }}>{p.n}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
