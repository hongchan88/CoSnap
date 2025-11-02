import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import AnimatedNumber from './AnimatedNumber';

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  delay?: number;
  decimals?: number;
  startValue?: number;
  autoStart?: boolean;
  direction?: 'up' | 'down';
}

export default function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  className = '',
  delay = 0,
  decimals = 0,
  startValue = 0,
  autoStart = true,
  direction = 'up'
}: NumberTickerProps) {
  const [isVisible, setIsVisible] = useState(autoStart);
  const [displayValue, setDisplayValue] = useState(startValue);

  useEffect(() => {
    if (!autoStart) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [autoStart, delay]);

  useEffect(() => {
    if (isVisible) {
      setDisplayValue(value);
    }
  }, [isVisible, value]);

  return (
    <div className={cn('tabular-nums', className)}>
      <AnimatedNumber
        value={displayValue}
        prefix={prefix}
        suffix={suffix}
        duration={duration}
        format={true}
        decimals={decimals}
        className="inline-flex items-baseline"
      />
    </div>
  );
}