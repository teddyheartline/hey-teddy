import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showStudioSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  onClick,
  showStudioSubtitle = false,
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col cursor-pointer select-none group ${className}`}
    >
      <div className="flex items-baseline font-black tracking-tight leading-none text-neutral-900 dark:text-neutral-100">
        <span className={`${sizeClasses[size]} font-extrabold tracking-tight`}>
          Hey Teddy
        </span>
        <span className={`${sizeClasses[size]} text-amber-400 font-black`}>,</span>
      </div>

      {showStudioSubtitle && (
        <span className="text-[10px] font-black tracking-widest uppercase text-amber-500 mt-0.5">
          BUSSO Studios
        </span>
      )}

      {/* Signature yellow brush stroke */}
      <div className="relative mt-1 w-full h-[3px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 group-hover:w-full" />
      </div>
    </div>
  );
};
