'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  formatCurrency,
  formatNumber,
  formatPercentRaw
} from '@/lib/utils/formatters';

type ValueType = 'currency' | 'percentRaw' | 'number' | 'raw';

interface AreaChartProps {
  data: { label: string | number; value: number }[];
  valueType?: ValueType;
  gradientColor?: string; // hex
}

function getFormatter(type: ValueType) {
  switch (type) {
    case 'currency':
      return formatCurrency;
    case 'percentRaw':
      return formatPercentRaw;
    case 'number':
      return formatNumber;
    case 'raw':
    default:
      return (v: number) => String(v);
  }
}

export function AreaChart({
  data,
  valueType = 'raw',
  gradientColor = '#3B82F6'
}: AreaChartProps) {
  const [mounted, setMounted] = useState(false);
  const formatter = getFormatter(valueType);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full animate-pulse bg-muted/10 rounded-lg" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          stroke="rgba(255,255,255,0.4)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.4)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatter}
        />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.18 0.014 285.82)',
            border: '1px solid oklch(0.28 0.015 280)',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px'
          }}
          formatter={(value: any) => [formatter(Number(value)), 'Valor']}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={gradientColor}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#areaColor)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
