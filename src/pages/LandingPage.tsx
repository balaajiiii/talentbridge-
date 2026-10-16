import { Link } from 'react-router-dom';
import {
  Sparkles,
  Music,
  Camera,
  Palette,
  Mic,
  ArrowRight,
  Search,
  Users,
  Zap,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCountUp, useInView } from '@/hooks/useCountUp';

const orbitIcons = [
  { Icon: Music, className: 'top-[6%] left-[10%]', delay: '0s' },
  { Icon: Camera, className: 'top-[4%] right-[12%]', delay: '1.2s' },
  { Icon: Palette, className: 'bottom-[8%] left-[6%]', delay: '2s' },
  { Icon: Mic, className: 'bottom-[6%] right-[8%]', delay: '0.6s' },
  { Icon: Sparkles, className: 'top-[42%] right-[2%]', delay: '1.8s' },
];

const features = [
  {
    Icon: Search,
    title: 'Find Opportunities',
    description: 'Browse events from colleges, cafes, and cultural festivals looking for talent like you.',
  },
  {
    Icon: Users,
    title: 'Discover Local Talent',
    description: 'Organizers can find vetted artists, musicians, and performers in their city.',
  },
  {
    Icon: Zap,
    title: 'Smart Event Matching',
    description: 'Our matching system connects the right talent with the right events based on category and location.',
  },
  {
    Icon: FolderOpen,
    title: 'Build Your Portfolio',
    description: 'Showcase your work, collect reviews, and grow your reputation as a performer.',
  },
];

const stats = [
  { value: 500, suffix: '+', label: 'Talents' },
  { value: 150, suffix: '+', label: 'Events' },
  { value: 80, suffix: '+', label: 'Organizers' },
];

function StatItem({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 2000, start);
  return (
    <div className="text-center">
      <p className="font-display text-5xl font-extrabold tracking-tight text-white">
        {Math.floor(count)}{suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-ink-300">{label}</p>
    </div>
  );
}

export function LandingPage() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-50/60 via-ink-50 to-ink-50" />
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent-300/20 blur-[120px]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent)',
          }}
        />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-600" />
                <span className="font-mono text-xs font-medium tracking-wide text-accent-700">
                  CONNECTING TALENT WITH OPPORTUNITY
                </span>
              </div>

              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
                Talent Deserves
                <br />
                <span className="bg-gradient-to-r from-accent-600 to-accent-400 bg-clip-text text-transparent">
                  a Stage.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600">
                Connecting talented individuals with colleges, cultural festivals,
                cafes, and event organizers.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/signup">
                  <Button size="lg" className="group">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative h-[440px] fade-up sm:h-[520px]" style={{ animationDelay: '0.15s' }}>
              <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/20 blur-[100px] animate-pulse-glow" />

              {orbitIcons.map(({ Icon, className, delay }, i) => (
                <div key={i} className={`absolute ${className} animate-float`} style={{ animationDelay: delay }}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-float backdrop-blur-md">
                    <Icon className="h-6 w-6 text-accent-600" strokeWidth={2} />
                  </div>
                </div>
              ))}

              <div className="absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:w-[320px]">
                <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-float backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-semibold text-success-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
                      LIVE
                    </span>
                    <span className="font-mono text-xs text-ink-400">Event #4821</span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white">
                      <Music className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-ink-900">Rangrez Fest 2026</p>
                      <p className="mt-0.5 text-sm font-medium text-ink-500">Bandra, Mumbai · Nov 21</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Budget</p>
                      <p className="text-sm font-bold text-ink-900">₹8,500</p>
                    </div>
                    <button className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800">
                      Apply now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-sm font-medium uppercase tracking-wider text-accent-600">
              Why TalentBridge
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
              Everything you need to shine
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              A platform built for artists and organizers to find each other effortlessly.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-ink-100 bg-white p-7 transition-all hover:border-accent-300 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div
            ref={ref}
            className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-16 sm:px-16 sm:py-20"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent-500/20 blur-[120px]" />

            <div className="relative">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Growing every day
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {stats.map((stat) => (
                  <StatItem key={stat.label} {...stat} start={inView} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
