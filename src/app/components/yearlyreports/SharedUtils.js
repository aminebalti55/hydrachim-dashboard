// SharedUtils.js - Common utilities for yearly reports
import { Calendar } from 'lucide-react';

export const getStatusColor = (status) => {
  switch (status) {
    case 'excellent': return 'bg-emerald-500';
    case 'good': return 'bg-blue-500';
    case 'warning': return 'bg-amber-500';
    case 'critical': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
};

export const getPerformanceColor = (score) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
};

export const navigateYear = (currentYear, direction, setYear) => {
  setYear(prev => prev + direction);
};

export const exportToPDF = (title, year, data) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${title} - ${year}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1f2937; }
          .metric { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>${title} - ${year}</h1>
        <div class="metric">
          <h2>Performance Globale: ${data.overall}%</h2>
          ${data.details || ''}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

export const exportToCSV = (filename, headers, data) => {
  const csvContent = [
    headers,
    ...data
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const groupDataByQuarters = (data, year) => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  const filteredData = data.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= yearStart && entryDate <= yearEnd;
  });

  const quarters = {
    Q1: { months: [0, 1, 2], data: [], name: 'T1' },
    Q2: { months: [3, 4, 5], data: [], name: 'T2' },
    Q3: { months: [6, 7, 8], data: [], name: 'T3' },
    Q4: { months: [9, 10, 11], data: [], name: 'T4' }
  };

  filteredData.forEach(entry => {
    const month = new Date(entry.date).getMonth();
    Object.keys(quarters).forEach(quarter => {
      if (quarters[quarter].months.includes(month)) {
        quarters[quarter].data.push(entry);
      }
    });
  });

  return { filteredData, quarters };
};

export const calculateQuarterlyAverage = (quarterData) => {
  if (quarterData.length === 0) return 0;
  return Math.round(quarterData.reduce((sum, entry) => sum + entry.value, 0) / quarterData.length);
};

export const generateCommonChartOptions = (isDark, quarterNames, series) => ({
  backgroundColor: 'transparent',
  textStyle: {
    color: isDark ? '#E2E8F0' : '#475569',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderColor: isDark ? '#475569' : '#E2E8F0',
    borderWidth: 1,
    textStyle: { color: isDark ? '#E2E8F0' : '#1E293B' }
  },
  legend: {
    bottom: '5%',
    textStyle: { color: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: quarterNames,
    axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
    axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
    axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 },
    splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
  },
  series
});

export const getNoDataComponent = (isDark, onClose, year, title, buttonColor = 'blue') => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className={`w-full max-w-lg rounded-2xl shadow-lg border ${
      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="p-8 text-center">
        <div className={`w-14 h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
          <Calendar className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Aucune Donnée Disponible
        </h3>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Aucune donnée {title.toLowerCase()} pour l'année {year}.
        </p>
        <button 
          onClick={onClose} 
          className={`px-4 py-2 bg-${buttonColor}-600 hover:bg-${buttonColor}-700 text-white rounded-lg font-medium transition-colors text-sm`}
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);