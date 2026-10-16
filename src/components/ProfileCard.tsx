import { MapPin, Phone, Star } from 'lucide-react';
import type { Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

type ProfileCardProps = {
  profile: Profile;
  onEdit?: () => void;
};

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 font-display text-xl font-bold text-white shadow-lg shadow-accent-600/25">
          {initials}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink-900">
            {profile.full_name}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-accent-700">
            {profile.role}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-ink-100 pt-4">
        {profile.talent_category && (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Star className="h-4 w-4 text-ink-400" />
            {profile.talent_category}
          </div>
        )}
        {profile.organization_name && (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Star className="h-4 w-4 text-ink-400" />
            {profile.organization_name}
          </div>
        )}
        {profile.city && (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <MapPin className="h-4 w-4 text-ink-400" />
            {profile.city}
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Phone className="h-4 w-4 text-ink-400" />
            {profile.phone}
          </div>
        )}
      </div>

      {onEdit && (
        <Button variant="outline" size="sm" fullWidth className="mt-5" onClick={onEdit}>
          Edit Profile
        </Button>
      )}
    </div>
  );
}
