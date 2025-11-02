import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from './card';

interface FocusDataPoint {
  date: string;
  score: number;
  event: string;
}

interface FocusChartProps {
  data: FocusDataPoint[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">
          {new Date(label).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
          })}
        </p>
        <p className="text-lg font-bold text-blue-600">
          Focus: {data.score}점
        </p>
        {data.event && (
          <p className="text-xs text-gray-500 mt-1">
            {data.event}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function FocusChart({ data, className = '' }: FocusChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Focus 점수 변화</h3>
          <p className="text-sm text-gray-600">최근 30일간의 Focus 점수 추이</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric'
                    });
                  }}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    fill: '#3b82f6',
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: '#1d4ed8',
                    stroke: '#1d4ed8',
                    r: 6,
                  }}
                  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}