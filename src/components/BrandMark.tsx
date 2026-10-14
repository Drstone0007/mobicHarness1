import React from 'react';

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'w-7 h-7', compact = false }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm ${className}`}
      style={{ backgroundColor: '#0B0E14' }}
    >
      <svg viewBox="0 0 108 108" className="w-full h-full">
        <rect width="108" height="108" fill="#0B0E14" />
        <g transform="translate(54 54) scale(1.1) translate(-54 -54)">
          <path fill="#F28C52" d="M22 26h47c10 0 18 8 18 18v20c0 10-8 18-18 18H51L39 93V82H22Z" />
          <path fill="#0B0E14" d="m39 43-10 10 10 10 5-5-5-5 5-5Zm17 0-5 5 5 5-5 5 5 5 10-10Z" />
        </g>
      </svg>
    </div>
  );
};
