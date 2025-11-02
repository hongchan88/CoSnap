import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  format?: boolean;
  decimals?: number;
}

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5,
  className = '',
  format = false,
  decimals = 0
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const range = endValue - startValue;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (range * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress >= 1) {
        clearInterval(timer);
        setIsAnimating(false);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  const formatNumber = (num: number) => {
    if (format) {
      return num.toLocaleString();
    }
    return num.toFixed(decimals);
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="tabular-nums"
        >
          {prefix}{formatNumber(displayValue)}{suffix}
        </motion.span>
      </AnimatePresence>
      {isAnimating && (
        <motion.div
          className="ml-1 w-1 h-1 bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}