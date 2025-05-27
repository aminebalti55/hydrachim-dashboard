'use client'
import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
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
  Globe,
  User,
  Eye,
  EyeOff,
  LogOut,
  Lock
} from 'lucide-react';

// Import all the existing page components
import { DashboardPage } from './components/Dashboard';
import { TeamPage } from './components/Team';
import { ProductionPage } from './components/Production';
import { QualityPage } from './components/Quality';
import { RnDPage } from './components/RnD'; // FIXED: Changed to named import
import { WarehousesPage } from './components/Warehouses';

// Import utilities and context
import { kpiDefinitions } from './utils/kpiDefinitions';
import { translations } from './utils/translations';
import { useKPIData } from './hook/useKPIData';

// Create Context
const AppContext = createContext({
  isDark: false,
  setIsDark: () => {},
  language: 'en',
  setLanguage: () => {},
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  signup: () => {}
});

// Authentication Hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hydrachim_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('hydrachim_user');
      }
    }
  }, []);

  const login = (username, password) => {
    // Check hardcoded admin credentials
    if (username === 'rihemjaziri24' && password === 'rihemrihem') {
      const adminUser = {
        username: 'rihemjaziri24',
        role: 'admin',
        loginTime: new Date().toISOString()
      };
      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('hydrachim_user', JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // Check registered users
    try {
      const users = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
      const foundUser = users.find(u => u.username === username && u.password === password);
      
      if (foundUser) {
        const userData = {
          username: foundUser.username,
          role: 'user',
          loginTime: new Date().toISOString()
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('hydrachim_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error('Error reading users:', err);
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const signup = (username, password) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
      
      // Check if username already exists (including admin)
      if (username === 'rihemjaziri24' || users.some(u => u.username === username)) {
        return { success: false, error: 'Username already exists' };
      }

      // Create new user
      const newUser = {
        username,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      // Save to users array
      users.push(newUser);
      localStorage.setItem('hydrachim_users', JSON.stringify(users));

      return { success: true };
    } catch (err) {
      console.error('Error creating user:', err);
      return { success: false, error: 'Failed to create user' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hydrachim_user');
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    signup
  };
};

// Login Component - FIXED
const AuthPage = () => {
  const { isDark, language, login } = useContext(AppContext);
  const t = translations[language];
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = login(formData.username, formData.password);
      if (!result.success) {
        setError(t.loginFailed);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
        }`} />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Hydrachim
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            KPI Dashboard System
          </p>
        </div>

        {/* Auth Card */}
        <div className={`relative p-8 rounded-2xl border backdrop-blur-sm shadow-xl ${
          isDark 
            ? 'bg-slate-800/90 border-slate-700/50' 
            : 'bg-white/90 border-slate-200/50'
        }`}>
          <div className="text-center mb-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.signInToAccount}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.welcomeBack}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t.username}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02]'
              } text-white shadow-lg hover:shadow-xl`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                t.login
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management Component (Admin Only) - FIXED
const UserManagement = ({ onClose }) => {
  const { isDark, language, signup } = useContext(AppContext);
  const t = translations[language];
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = () => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
        setUsers(storedUsers);
      } catch (err) {
        console.error('Error loading users from localStorage:', err);
        setUsers([]);
      }
    };
    
    loadUsers();
    const syncInterval = setInterval(loadUsers, 5000);
    return () => clearInterval(syncInterval);
  }, []);

  const handleCreateUser = async () => {
    if (!formData.username || !formData.password) {
      setError(t.fillAllFields);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = signup(formData.username, formData.password);
      if (result.success) {
        setSuccess(t.userCreatedSuccess);
        setFormData({ username: '', password: '' });
        const updatedUsers = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
        setUsers(updatedUsers);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error === 'Username already exists' ? t.usernameExists : result.error);
      }
    } catch (err) {
      setError(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (username) => {
    if (window.confirm(`${t.confirmDeleteUser} "${username}"?`)) {
      try {
        const currentUsers = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
        const updatedUsers = currentUsers.filter(u => u.username !== username);
        localStorage.setItem('hydrachim_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setSuccess(t.userDeletedSuccess);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(t.failedDeleteUser);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateUser();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <Users className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t.userManagement}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.createManageUsers}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}>
              <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Create User */}
          <div className={`flex-1 p-6 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.createNewUser}
            </h4>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Create User Form */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.username}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    placeholder={t.enterUsername}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    placeholder={t.enterPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateUser}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } text-white`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.creating}</span>
                  </div>
                ) : (
                  t.createUser
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Users List */}
          <div className="flex-1 p-6">
            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.existingUsers}
            </h4>

            {/* Admin User */}
            <div className={`p-4 rounded-lg border mb-3 ${
              isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      rihemjaziri24
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t.administratorSystem}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {t.admin}
                </span>
              </div>
            </div>

            {/* Regular Users */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.username} className={`p-4 rounded-lg border ${
                    isDark ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user.username}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {t.created}: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {t.user}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
                    <Users className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t.noUsersCreated}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t.createFirstUser}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="flex justify-end">
            <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
            }`}>
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// Layout Component
const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const { isDark = false, setIsDark, user, logout, language } = useContext(AppContext);
  const t = translations[language];

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
      
      {/* User Management Modal */}
      {showUserManagement && user?.role === 'admin' && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
      
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

        {/* User Info */}
        {user && (
          <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                user.role === 'admin' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.username}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Admin Controls */}
        {user?.role === 'admin' && (
          <div className="p-4 border-t border-slate-800 dark:border-slate-700">
            <button
              onClick={() => setShowUserManagement(true)}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                isDark 
                  ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30 border border-yellow-800/30' 
                  : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.manageUsers}</span>
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4">
          <button 
            onClick={logout}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
              isDark 
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
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

// Main App Component
export default function HydrachimKPIApp() {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Initialize auth and KPI data
  const auth = useAuth();
  const kpiData = useKPIData();

  // Load preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('hydrachim_language');
    const savedDarkMode = localStorage.getItem('hydrachim_dark_mode');
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedDarkMode) {
      setIsDark(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('hydrachim_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('hydrachim_dark_mode', JSON.stringify(isDark));
  }, [isDark]);

  const contextValue = {
    isDark,
    setIsDark,
    language,
    setLanguage,
    ...auth,
    ...kpiData
  };

  // Render the appropriate page component
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'rnd':
  return <RnDPage />; // Make sure this matches the imported component name
      case 'quality':
        return <QualityPage />;
      case 'production':
        return <ProductionPage />;
      case 'warehouses':
        return <WarehousesPage />;
      case 'team':
        return <TeamPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {!auth.isAuthenticated ? (
        <AuthPage />
      ) : (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
          {renderPage()}
        </Layout>
      )}
    </AppContext.Provider>
  );
}