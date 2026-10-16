import { SlidersHorizontal } from 'lucide-react';
import { Select } from '@/components/ui/Input';
import { TALENT_CATEGORIES } from '@/lib/supabase';

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Hyderabad',
  'Chennai', 'Kolkata', 'Jaipur', 'Kohima', 'Shillong',
];

type FilterPanelProps = {
  category: string;
  city: string;
  date: string;
  onCategoryChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onDateChange: (v: string) => void;
};

export function FilterPanel({
  category,
  city,
  date,
  onCategoryChange,
  onCityChange,
  onDateChange,
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-500">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </div>
      <div className="w-44">
        <Select
          label="Category"
          options={TALENT_CATEGORIES}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        />
      </div>
      <div className="w-40">
        <Select
          label="City"
          options={CITIES}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
        />
      </div>
      <div className="w-44">
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-900 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          />
        </div>
      </div>
    </div>
  );
}
