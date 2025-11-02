import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ShimmerButton({
  children,
  className = '',
  shimmerColor = '#ffffff',
  shimmerSize = '200%',
  borderRadius = '0.75rem',
  shimmerDuration = '2.5s',
  background = 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 100%)',
  onClick,
  disabled = false
}: ShimmerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden px-6 py-3 font-medium text-white transition-all duration-300 ease-out',
        'hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      style={{
        borderRadius,
        background,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={cn(
          'absolute inset-0 -translate-x-full',
          'bg-gradient-to-r from-transparent via-white/20 to-transparent',
          'transition-transform duration-1000 ease-out'
        )}
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
          width: shimmerSize,
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: `transform ${shimmerDuration} ease-out`,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}