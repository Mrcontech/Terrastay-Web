
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const TrainersSection: React.FC = () => {
  const trainers = [
    { 
      name: 'John Arnold', 
      role: 'Cardio specialist', 
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200&h=300' 
    },
    { 
      name: 'Kathryn Murphy', 
      role: 'Weight lifting specialist', 
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200&h=300' 
    },
    { 
      name: 'Harry B', 
      role: 'Yoga instructor', 
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200&h=300' 
    },
  ];

  return (
    <div className="bg-[#16181b] p-6 rounded-3xl border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Trainer</h3>
        <button className="w-8 h-8 bg-[#212429] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="flex gap-4">
        {trainers.map((trainer) => (
          <div key={trainer.name} className="relative min-w-[120px] h-48 rounded-2xl overflow-hidden group cursor-pointer flex-1">
            <img 
              src={trainer.image} 
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110" 
              alt={trainer.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[10px] font-bold text-white leading-tight">{trainer.name}</p>
              <p className="text-[8px] text-gray-400 leading-tight">{trainer.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainersSection;
