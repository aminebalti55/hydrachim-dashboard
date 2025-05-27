import React, { useState, useContext } from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  ShieldCheck, 
  Factory, 
  Package, 
  Users, 
  Menu,
  X,
  Bell,
  Settings,
  Sun,
  Moon,
  Plus,
  TrendingUp,
  Sparkles,
  Globe
} from 'lucide-react';

// Mock context for demonstration
const AppContext = React.createContext({
  isDark: false,
  setIsDark: () => {}
});

// Language Switch Component
const LanguageSwitch = () => {
  const { language = 'en', setLanguage, isDark } = useContext(AppContext);
     
  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
      isDark 
        ? 'bg-slate-800/50 hover:bg-slate-800'
        : 'bg-slate-100 hover:bg-slate-200'
    }`}>
      <Globe className="w-3 h-3 text-indigo-500" />
      <select
        value={language}
        onChange={(e) => setLanguage?.(e.target.value)}
        className={`bg-transparent border-0 text-xs font-medium focus:outline-none cursor-pointer ${
          isDark ? 'text-slate-200' : 'text-slate-700'
        }`}
      >
        <option value="en" className={isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'}>
          EN
        </option>
        <option value="fr" className={isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'}>
          FR
        </option>
      </select>
    </div>
  );
};

export const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark = false, setIsDark } = useContext(AppContext);

  const navItems = [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-600'
    },
    { 
      id: 'rnd', 
      icon: FlaskConical, 
      label: 'R&D Innovation',
      iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600'
    },
    { 
      id: 'quality', 
      icon: ShieldCheck, 
      label: 'Quality Assurance',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600'
    },
    { 
      id: 'production', 
      icon: Factory, 
      label: 'Production',
      iconBg: 'bg-gradient-to-br from-orange-600 to-red-600'
    },
    { 
      id: 'warehouses', 
      icon: Package, 
      label: 'Warehouses',
      iconBg: 'bg-gradient-to-br from-violet-600 to-purple-600'
    },
    { 
      id: 'team', 
      icon: Users, 
      label: 'Team Management',
      iconBg: 'bg-gradient-to-br from-pink-600 to-rose-600'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      
      {/* Mobile Header */}
      <div className={`lg:hidden sticky top-0 z-50 backdrop-blur-sm border-b ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Hydrachim
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg transition-colors relative ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </span>
            </button>
            <button 
              onClick={() => setIsDark?.(!isDark)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } border-r`}>
        
        {/* Sidebar Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">H</span>
              </div>
              <div>
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hydrachim
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  KPI Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'bg-slate-100 text-slate-900 border border-slate-200'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${item.iconBg}`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Add KPI Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl">
            <Plus className="w-4 h-4" />
            <span>Add KPI</span>
          </button>
        </div>

        {/* Status Widget */}
        <div className="p-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                System Status
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-600">Online</span>
              </div>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              All systems operational
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Desktop Header */}
        <header className={`hidden lg:block sticky top-0 z-30 backdrop-blur-sm border-b ${
          isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="flex items-center justify-end px-6 h-16">
            <div className="flex items-center space-x-2">
              <button className={`p-2 rounded-lg transition-all relative ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}>
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </span>
              </button>
              
              <LanguageSwitch />
              
              <button 
                onClick={() => setIsDark?.(!isDark)}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button className={`p-2 rounded-lg transition-all ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};