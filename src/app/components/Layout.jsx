// Layout Component - No Sidebar Scroll
const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const { isDark = false, setIsDark, user, logout } = useContext(AppContext);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-600' },
    { id: 'rnd', icon: FlaskConical, label: 'R&D et Innovation', iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600' },
    { id: 'quality', icon: ShieldCheck, label: 'Assurance Qualité', iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600' },
    { id: 'production', icon: Factory, label: 'Production', iconBg: 'bg-gradient-to-br from-orange-600 to-red-600' },
    { id: 'warehouses', icon: Package, label: 'Entrepôts', iconBg: 'bg-gradient-to-br from-violet-600 to-purple-600' },
    { id: 'team', icon: Users, label: 'Gestion d\'Équipe', iconBg: 'bg-gradient-to-br from-pink-600 to-rose-600' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {showUserManagement && user?.role === 'admin' && <UserManagement onClose={() => setShowUserManagement(false)} />}
      
      {/* Mobile Header */}
      <div className={`lg:hidden sticky top-0 z-50 backdrop-blur-sm border-b ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hydrachim</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg transition-colors relative ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </span>
            </button>
            <button onClick={() => setIsDark?.(!isDark)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Removed overflow-y-auto and made more compact */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col`}>
        
        {/* Sidebar Header - More compact */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hydrachim</h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tableau de Bord KPI</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info - More compact */}
        {user && (
          <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${user.role === 'admin' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - More compact */}
        <nav className="p-2 flex-1">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? (isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-200') 
                      : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  <div className={`p-1 rounded-md mr-2 ${item.iconBg}`}>
                    <item.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="flex-1 text-left text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer section - Much more compact */}
        <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {user?.role === 'admin' && (
            <div className="p-2">
              <button
                onClick={() => setShowUserManagement(true)}
                className={`w-full flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isDark ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30 border border-yellow-800/30' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Utilisateurs</span>
              </button>
            </div>
          )}

          <div className="p-2">
            <button
              onClick={logout}
              className={`w-full flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Status Widget - Very compact */}
          <div className="p-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Système</span>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-600">En Ligne</span>
                </div>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Systèmes opérationnels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className={`hidden lg:block sticky top-0 z-30 backdrop-blur-sm border-b ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
          <div className="flex items-center justify-end px-6 h-16">
            <div className="flex items-center space-x-2">
              <button className={`p-2 rounded-lg transition-all relative ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'}`}>
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </span>
              </button>
              <button onClick={() => setIsDark?.(!isDark)} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'}`}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'}`}>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};