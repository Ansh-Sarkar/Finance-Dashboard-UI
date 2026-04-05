import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Sector 
} from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';


const COLORS = ['#dfff00', '#1a1c1e', '#9ca3af', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];


const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-main)]/90 backdrop-blur-xl border border-[var(--border-color)] p-4 rounded-2xl shadow-2xl">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-secondary)] mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-bold text-[var(--text-secondary)] capitalize">{entry.name}</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--text-primary)] ml-auto" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload.fill || data.color || '#dfff00';
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/30 backdrop-blur-xl text-white font-bold flex flex-col items-center gap-1"
        style={{ 
          background: `linear-gradient(135deg, ${color}ee, ${color}cc)`,
          boxShadow: `0 10px 30px -5px ${color}80`
        }}
      >
        <span className="text-[10px] uppercase tracking-widest opacity-90 font-extrabold">{data.name}</span>
        <span className="text-xl font-black drop-shadow-md">{formatCurrency(data.value)}</span>
      </motion.div>
    );
  }
  return null;
};


const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-md"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 11}
        fill={fill}
      />
    </g>
  );
};

export default function ChartsSection() {
  const transactions = useStore((state) => state.transactions);
  const [activeIndex, setActiveIndex] = useState(0);

  const { areaData, pieData, totalExpense } = useMemo(() => {
    
    const groupedByDate = transactions.reduce((acc, t) => {
      const date = format(parseISO(t.date), 'MMM dd');
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0, timestamp: parseISO(t.date).getTime() };
      }
      if (t.type === 'Income') acc[date].income += Number(t.amount);
      else acc[date].expense += Number(t.amount);
      return acc;
    }, {});

    const sortedAreaData = Object.values(groupedByDate).sort((a, b) => a.timestamp - b.timestamp);

    
    const expenses = transactions.filter(t => t.type === 'Expense');
    const groupedByCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const pieDataMap = Object.entries(groupedByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }));

    const calcTotalExpense = pieDataMap.reduce((sum, item) => sum + item.value, 0);

    return { areaData: sortedAreaData, pieData: pieDataMap, totalExpense: calcTotalExpense };
  }, [transactions]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  if (transactions.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="grid gap-6 lg:grid-cols-3 mb-12"
    >
      {}
      <div className="glass-card rounded-[2rem] p-6 sm:p-8 lg:col-span-2 border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group flex flex-col h-[380px]">
        {}
        <div className="pointer-events-none absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-[var(--accent-lime)]/10 blur-[100px]" />
        
        <div className="mb-4 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Analytics</p>
          <h3 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Cash Flow Trend</h3>
        </div>
        
        <div className="flex-1 w-full relative z-10 min-h-[200px]
          [&_.recharts-cartesian-grid-horizontal_line]:stroke-[var(--border-color)] 
          [&_.recharts-cartesian-grid-horizontal_line]:opacity-50
          [&_.recharts-cartesian-grid-vertical]:hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b8e600" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#dfff00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                {}
                <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                  <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#dfff00" floodOpacity="0.35"/>
                </filter>
                <filter id="glow-rose" height="300%" width="300%" x="-100%" y="-100%">
                  <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#f43f5e" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} 
                tickMargin={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} 
                tickFormatter={(value) => `$${value}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke="#9cb800" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ r: 8, strokeWidth: 0, fill: '#dfff00', style: { filter: 'drop-shadow(0px 0px 8px rgba(223,255,0,0.7))' } }}
                style={{ filter: 'url(#glow)' }}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="Expense"
                stroke="#f43f5e" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                activeDot={{ r: 8, strokeWidth: 0, fill: '#f43f5e', style: { filter: 'drop-shadow(0px 0px 8px rgba(244,63,94,0.8))' } }}
                style={{ filter: 'url(#glow-rose)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="glass-card rounded-[2rem] p-6 sm:p-8 lg:col-span-1 border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative flex flex-col group h-[380px]">
        {}
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-rose-500/10 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="mb-2 relative z-10 w-full flex justify-between items-start shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Distribution</p>
            <h3 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Expenses</h3>
          </div>
        </div>
        
        {pieData.length > 0 ? (
          <div className="flex-1 flex flex-col relative z-10 min-h-0 items-center justify-center">
            
            <div className="flex-1 w-full relative group-hover:scale-105 transition-transform duration-500 ease-out mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <circle cx="50%" cy="50%" r="75" fill="var(--bg-card)" className="shadow-inner" />
                  <Tooltip 
                    content={<CustomPieTooltip />}
                    cursor={false}
                    isAnimationActive={true}
                    animationDuration={300}
                    animationEasing="ease-out"
                  />
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    stroke="none"
                    paddingAngle={8}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-secondary)]">Total</span>
                <span className="text-xl font-extrabold text-red-500">{formatCurrency(totalExpense)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] font-bold text-sm">
            Not enough expense data to generate chart.
          </div>
        )}
      </div>
    </motion.div>
  );
}
