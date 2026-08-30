'use client';

import { useEffect, useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants/colors';
import {
  formatCurrency,
  formatNumber,
  formatPercentRaw
} from '@/lib/utils/formatters';

type ValueType = 'currency' | 'percentRaw' | 'number' | 'raw';

interface BarChartProps {
  data: { label: string; value: number }[];
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

export function BarChart({ data, valueType = 'raw' }: BarChartProps) {
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
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
      >
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
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
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
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
