import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const ThemeToggle = () => {
  const { isDark = false, setIsDark } = useContext(AppContext);
     
  return (
    <button
      onClick={() => setIsDark?.(!isDark)}
      className={`group relative p-3 rounded-2xl transition-all duration-500 transform hover:scale-110 overflow-hidden ${
        isDark 
          ? 'bg-slate-800/80 hover:bg-slate-700/90 text-amber-400 border border-slate-700/60 hover:border-amber-500/60' 
          : 'bg-white/80 hover:bg-white/95 text-slate-700 hover:text-amber-600 border border-slate-300/60 hover:border-amber-400/60'
      } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Animated background gradients */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 opacity-0 group-hover:opacity-100' 
          : 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100'
      }`} />
      
      {/* Rotating icon container */}
      <div className="relative">
        <div className="transform transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-110">
          {isDark ? (
            <Sun className="w-5 h-5 transition-all duration-300 group-hover:text-amber-300 drop-shadow-lg" />
          ) : (
            <Moon className="w-5 h-5 transition-all duration-300 group-hover:text-indigo-600 drop-shadow-lg" />
          )}
        </div>
        
        {/* Glow effect */}
        <div className={`absolute inset-0 transition-all duration-500 blur-lg ${
          isDark 
            ? 'text-amber-400 opacity-0 group-hover:opacity-60' 
            : 'text-indigo-500 opacity-0 group-hover:opacity-40'
        }`}>
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </div>
      </div>
      
      {/* Orbital rings effect */}
      <div className={`absolute inset-0 rounded-2xl border transition-all duration-700 ${
        isDark 
          ? 'border-amber-500/0 group-hover:border-amber-500/30' 
          : 'border-indigo-500/0 group-hover:border-indigo-500/30'
      } animate-pulse opacity-0 group-hover:opacity-100`} />
      
      {/* Additional magical sparkle effect */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500" />
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-700" />
    </button>
  );
};