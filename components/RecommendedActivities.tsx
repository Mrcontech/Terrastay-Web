
import React from 'react';
import { LayoutGrid, List, MoreHorizontal, Dumbbell, User2, Zap, Timer } from 'lucide-react';

const RecommendedActivities: React.FC = () => {
  const activities = [
    { 
      name: 'Fitness for Beginner', 
      date: 'Start from 20 June 2024', 
      time: '7:00 AM to 9:00 AM', 
      price: '$11.70/m',
      icon: <Timer size={18} />
    },
    { 
      name: 'Beginner to Advance gym', 
      date: 'Start from 01 July 2024', 
      time: '08:00 AM to 9:00 AM', 
      price: '$15.70/m',
      icon: <Dumbbell size={18} />
    },
    { 
      name: 'Ultimate Body Workout', 
      date: 'Start from 24 June 2024', 
      time: '7:30 AM to 9:30 AM', 
      price: '$8.70/m',
      icon: <Zap size={18} />
    },
  ];

  return (
    <div className="bg-[#16181b] p-8 rounded-3xl border border-white/5">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold">Recommended activity</h3>
        <div className="flex gap-2">
          <button className="p-2 bg-[#212429] rounded-lg text-gray-500"><List size={18} /></button>
          <button className="p-2 bg-[#c0ff72] rounded-lg text-black"><LayoutGrid size={18} /></button>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.name} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-[#212429] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#c0ff72] transition-colors">
              {activity.icon}
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-sm">{activity.name}</h4>
              <p className="text-xs text-gray-500">{activity.date}</p>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Timer size={14} />
              <span className="text-xs font-medium">{activity.time}</span>
            </div>

            <div className="bg-[#212429] px-4 py-2 rounded-xl text-xs font-bold text-gray-300">
              {activity.price}
            </div>

            <button className="text-gray-600 hover:text-white">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedActivities;
