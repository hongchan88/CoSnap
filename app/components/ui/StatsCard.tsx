import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import AnimatedNumber from './AnimatedNumber';

interface StatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-500',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    border: 'border-orange-200'
  }
};

export default function StatsCard({
  title,
  value,
  icon,
  prefix = '',
  suffix = '',
  color = 'blue',
  trend,
  isLoading = false,
  className = ''
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative ${className}`}
    >
      <Card className={`h-full border ${colors.border} hover:shadow-md transition-all duration-200`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              {icon}
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>
                  {trend.isPositive ? '↑' : '↓'}
                </span>
                <span className="font-medium">
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className={`text-3xl font-bold ${colors.text} tabular-nums`}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <AnimatedNumber
                  value={value}
                  prefix={prefix}
                  suffix={suffix}
                  format={true}
                  className="flex items-center"
                />
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}