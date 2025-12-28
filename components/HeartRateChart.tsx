
import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const HeartRateChart: React.FC = () => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    val: 60 + Math.random() * 40
  }));

  return (
    <div className="bg-[#16181b] p-8 rounded-3xl border border-white/5 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Heart rate</h3>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="val" 
              stroke="#c0ff72" 
              strokeWidth={2} 
              dot={false}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold mb-4">Core strength</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current</p>
            <p className="text-sm font-bold">1.6 <span className="text-[10px] font-normal text-gray-600">sec/sqt</span></p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Average</p>
            <p className="text-sm font-bold">2.2 <span className="text-[10px] font-normal text-gray-600">sec/sqt</span></p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Max</p>
            <p className="text-sm font-bold">4.2 <span className="text-[10px] font-normal text-gray-600">sec/sqt</span></p>
          </div>
        </div>
      </div>

      {/* Background glow effect */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#c0ff72] opacity-[0.03] blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default HeartRateChart;
