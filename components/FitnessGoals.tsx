
import React from 'react';

const FitnessGoals: React.FC = () => {
  const goals = [
    { name: 'ABS & Stretch', duration: '10 Min', target: '10 min / day', progress: 66 },
    { name: 'Side planks', duration: '12 Sets', target: '12 sets / day', progress: 35 },
    { name: 'Rope lifting', duration: '10 Sets', target: '10 sets / day', progress: 50 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col mb-4">
        <h3 className="text-lg font-bold">Fitness Goal Building</h3>
        <p className="text-gray-500 text-sm">Your Fitness:</p>
      </div>

      {goals.map((goal) => (
        <div key={goal.name} className="bg-[#16181b] p-4 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-white/10 transition-colors">
          <div className="w-14 h-14 bg-[#212429] rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold leading-tight">{goal.duration.split(' ')[0]}</span>
            <span className="text-[10px] text-gray-500 uppercase leading-tight">{goal.duration.split(' ')[1]}</span>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white group-hover:text-[#c0ff72] transition-colors">{goal.name}</h4>
            <p className="text-xs text-gray-500">{goal.target}</p>
          </div>

          <div className="relative w-10 h-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                className="text-gray-800"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={100}
                strokeDashoffset={100 - goal.progress}
                strokeLinecap="round"
                className="text-[#c0ff72]"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              {goal.progress}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FitnessGoals;
