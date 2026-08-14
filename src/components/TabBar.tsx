import React from 'react';
import { TABS } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import type { TabId } from '../types';

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  const { color } = useTheme();

  return (
    <div
      role="tablist"
      aria-label="Plan views"
      className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 gap-1 backdrop-blur-md"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${id}`}
            onClick={() => onChange(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isActive ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            style={isActive ? { backgroundColor: color, outlineColor: color } : { outlineColor: color }}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
