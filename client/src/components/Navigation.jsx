import React from 'react';
import { Home, PieChart, Layers, Target, Settings } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'budgets', icon: PieChart, label: 'Budgets' },
    { id: 'categorize', icon: Layers, label: 'Categorize' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="absolute bottom-0 w-full h-[80px] bg-dark-card/80 backdrop-blur-lg border-t border-white/10 flex justify-around items-center px-2 z-50 rounded-b-2xl md:rounded-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id} 
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className={`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-primary/20 scale-110' : ''}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'opacity-100 font-semibold' : 'opacity-70'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
