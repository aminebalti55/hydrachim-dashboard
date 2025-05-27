import React, { useState, useContext } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const LanguageSwitch = () => {
  const { language = 'en', setLanguage, isDark } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
     
  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      code: 'fr', 
      name: 'French', 
      nativeName: 'Français',
      flag: '🇫🇷',
      gradient: 'from-red-500 to-blue-600'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${
          isDark 
            ? 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 hover:border-slate-600/80' 
            : 'bg-white/80 hover:bg-white/95 text-slate-700 border border-slate-300/60 hover:border-slate-400/80'
        } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentLanguage.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* Globe icon with glow */}
        <div className="relative">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentLanguage.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Globe className="w-3.5 h-3.5 text-white" />
          </div>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentLanguage.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-md`} />
        </div>
        
        {/* Flag and text */}
        <div className="flex items-center space-x-2">
          <span className="text-lg select-none">{currentLanguage.flag}</span>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-wider leading-none">{currentLanguage.code}</span>
            <span className="text-xs opacity-70 leading-none">{currentLanguage.nativeName}</span>
          </div>
        </div>
        
        {/* Animated chevron */}
        <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''} group-hover:text-indigo-500`} />
      </button>

      {/* Modern Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute top-full right-0 mt-3 w-64 rounded-2xl border shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-300 ${
            isDark 
              ? 'bg-slate-800/95 border-slate-700/60 backdrop-blur-2xl' 
              : 'bg-white/95 border-slate-200/60 backdrop-blur-2xl'
          }`}>
            <div className={`p-2 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select Language
              </p>
            </div>
            
            <div className="p-2 space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage?.(lang.code);
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 relative overflow-hidden ${
                    language === lang.code
                      ? isDark
                        ? 'bg-slate-700/70 text-white border border-slate-600/50'
                        : 'bg-slate-100/70 text-slate-900 border border-slate-300/50'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100/40 hover:text-slate-900'
                  }`}
                >
                  {/* Selection gradient overlay */}
                  {language === lang.code && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${lang.gradient} opacity-5`} />
                  )}
                  
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${lang.gradient} flex items-center justify-center shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-105`}>
                      <span className="text-sm">{lang.flag}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{lang.name}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lang.nativeName}
                    </div>
                  </div>
                  
                  {language === lang.code && (
                    <div className="relative">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <div className="absolute inset-0 text-emerald-500 animate-ping">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};