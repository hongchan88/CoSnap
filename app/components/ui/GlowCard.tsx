import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { cn } from '../../lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
  border?: boolean;
  hover?: boolean;
  variant?: 'default' | 'gradient' | 'glass';
}

const glowIntensities = {
  low: '0 0 20px -5px',
  medium: '0 0 30px -5px',
  high: '0 0 40px -5px'
};

const variants = {
  default: '',
  gradient: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm',
  glass: 'bg-white/5 backdrop-blur-lg border border-white/10'
};

export default function GlowCard({
  children,
  className = '',
  glowColor = 'rgb(59, 130, 246)',
  glowIntensity = 'medium',
  border = true,
  hover = true,
  variant = 'default'
}: GlowCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl transition-all duration-300',
          isHovered && hover ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          boxShadow: `${glowIntensities[glowIntensity]} ${glowColor}`,
          background: `radial-gradient(circle at 50% 50%, ${glowColor}20, transparent 70%)`,
        }}
      />

      {/* Main card */}
      <Card
        className={cn(
          'relative h-full transition-all duration-300',
          border && 'border-gray-200',
          hover && isHovered && 'shadow-xl',
          variants[variant]
        )}
        style={{
          boxShadow: isHovered && hover
            ? `0 10px 40px -10px ${glowColor}30`
            : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }}
      >
        <CardContent className="p-6 relative z-10">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}