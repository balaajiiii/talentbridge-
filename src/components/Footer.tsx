import { Link } from 'react-router-dom';
import { Sparkles, Globe, AtSign, Hash, Rss } from 'lucide-react';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Find Events', href: '/events' },
      { label: 'How it works', href: '/#about' },
      { label: 'Pricing', href: '/#about' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Contact', href: '/#contact' },
      { label: 'Blog', href: '/#about' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

const socials = [
  { Icon: Globe, href: '#', label: 'Website' },
  { Icon: AtSign, href: '#', label: 'Social' },
  { Icon: Hash, href: '#', label: 'Community' },
  { Icon: Rss, href: '#', label: 'Blog' },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-lg shadow-accent-600/30">
                <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
                TalentBridge
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              Connecting talented individuals with colleges, cultural festivals,
              cafes, and event organizers across India.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600"
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-bold text-ink-900">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-ink-500 transition-colors hover:text-accent-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-ink-100 pt-8">
          <p className="font-mono text-xs text-ink-400">
            © 2026 TalentBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
