import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

const defaultCols = {
  mobile: 1,
  tablet: 2,
  desktop: 3
};

const defaultGap = {
  mobile: 4,
  tablet: 6,
  desktop: 6
};

export default function ResponsiveGrid({
  children,
  cols = defaultCols,
  gap = defaultGap,
  className = ''
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${cols.mobile}`,
        `md:grid-cols-${cols.tablet}`,
        `lg:grid-cols-${cols.desktop}`,
        `gap-${gap.mobile}`,
        `md:gap-${gap.tablet}`,
        `lg:gap-${gap.desktop}`,
        className
      )}
    >
      {children}
    </div>
  );
}

// Staggered animation wrapper for grid items
interface ResponsiveGridItemProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ResponsiveGridItem({
  children,
  delay = 0,
  className = ''
}: ResponsiveGridItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}