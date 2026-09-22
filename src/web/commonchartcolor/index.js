// Chart Color Constants

export const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const CHART_COLOR_PALETTES = {
  default: [
    '#0ea5e9',
    '#64748b',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ],
  warm: [
    '#f59e0b',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#dc2626',
    '#ea580c',
  ],
  cool: [
    '#0ea5e9',
    '#3b82f6',
    '#8b5cf6',
    '#06b6d4',
    '#6366f1',
    '#64748b',
  ],
  monochrome: [
    '#0f172a',
    '#334155',
    '#475569',
    '#64748b',
    '#94a3b8',
    '#cbd5e1',
  ],
};

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getChartColor = (index) => {
  return CHART_COLOR_PALETTES.default[index % CHART_COLOR_PALETTES.default.length];
};
