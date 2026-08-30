'use client';

import { useEffect, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants/colors';
import {
  formatCurrency,
  formatNumber,
  formatPercentRaw
} from '@/lib/utils/formatters';

type ValueType = 'currency' | 'percentRaw' | 'number' | 'raw';

interface LineChartProps {
  data: any[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  valueType?: ValueType;
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

export function LineChart({
  data,
  xKey,
  series,
  valueType = 'raw'
}: LineChartProps) {
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
      <RechartsLineChart
        data={data}
        margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey={xKey}
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
          formatter={(value: any) => [formatter(Number(value))]}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            fontSize: '12px',
            fontFamily: 'var(--font-sans)'
          }}
        />
        {series.map((s, index) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color || CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
