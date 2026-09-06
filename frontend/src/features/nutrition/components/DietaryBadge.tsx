import React from 'react';

export type DietaryType = 'VEG' | 'EGG' | 'NON_VEG';

interface DietaryBadgeProps {
  type?: DietaryType | string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({
  type = 'VEG',
  showLabel = false,
  size = 'sm',
  className = '',
}) => {
  const normType = (type || 'VEG').toUpperCase();

  if (normType === 'NON_VEG') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium ${className}`}
        title="Non-Vegetarian"
      >
        {/* Square indicator with dot/triangle */}
        <span
          className={`flex items-center justify-center border border-red-500 rounded-sm bg-red-950/40 shrink-0 ${
            size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          }`}
        >
          <span
            className={`rounded-full bg-red-500 ${
              size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
            }`}
          />
        </span>
        {showLabel && (
          <span className="text-red-400 text-[11px] font-semibold tracking-wide">
            Non-Veg
          </span>
        )}
      </span>
    );
  }

  if (normType === 'EGG') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium ${className}`}
        title="Egg / Ovo-Vegetarian"
      >
        <span
          className={`flex items-center justify-center border border-amber-500 rounded-sm bg-amber-950/40 shrink-0 ${
            size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          }`}
        >
          <span
            className={`rounded-full bg-amber-500 ${
              size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
            }`}
          />
        </span>
        {showLabel && (
          <span className="text-amber-400 text-[11px] font-semibold tracking-wide">
            Egg-Veg
          </span>
        )}
      </span>
    );
  }

  // Default: VEG
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${className}`}
      title="Vegetarian"
    >
      <span
        className={`flex items-center justify-center border border-emerald-500 rounded-sm bg-emerald-950/40 shrink-0 ${
          size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
        }`}
      >
        <span
          className={`rounded-full bg-emerald-500 ${
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
          }`}
        />
      </span>
      {showLabel && (
        <span className="text-emerald-400 text-[11px] font-semibold tracking-wide">
          Veg
        </span>
      )}
    </span>
  );
};
