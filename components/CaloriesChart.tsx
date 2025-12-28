
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CaloriesChart: React.FC = () => {
  const data = [
    { name: 'Burned', value: 87 },
    { name: 'Remaining', value: 13 },
  ];

  const metrics = [
    { label: 'Calories burn', value: '31.2%', diff: '+0.22%', positive: true, color: '#c0ff72' },
    { label: 'Carbs', value: '23.2%', diff: '-3.06%', positive: false, color: '#4d525a' },
    { label: 'Protein', value: '11.9%', diff: '+2.22%', positive: true, color: '#888d93' },
  ];

  return (
    <div className="bg-[#16181b] p-8 rounded-3xl border border-white/5">
      <div className="flex gap-8">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={80}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#c0ff72" />
                <Cell fill="#212429" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">87%</span>
            <span className="text-gray-500 text-xs">1,980ml</span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: m.color }}></div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">{m.label}</p>
                  <p className="text-lg font-bold">{m.value}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${m.positive ? 'text-[#c0ff72]' : 'text-red-400'}`}>
                {m.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {m.diff}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button className="w-full mt-8 py-3 bg-[#212429] hover:bg-[#2a2d33] transition-colors rounded-2xl text-sm font-medium text-gray-300">
        View full details
      </button>
    </div>
  );
};

export default CaloriesChart;
