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
import { RnDPage } from './components/RnD';
import { WarehousesPage } from './components/Warehouses';

// Import utilities and context
import { kpiDefinitions } from './utils/kpiDefinitions';
import { useKPIData } from './hook/useKPIData';

// Create Context
const AppContext = createContext({
  isDark: false,
  setIsDark: () => {},
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

  useEffect(() => {
    const storedUser = localStorage.getItem('hydrachim_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Erreur lors de l\'analyse de l\'utilisateur stocké:', err);
        localStorage.removeItem('hydrachim_user');
      }
    }
  }, []);

  const login = (username, password) => {
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
      console.error('Erreur de lecture des utilisateurs:', err);
    }
    return { success: false, error: 'Identifiants invalides' };
  };

  const signup = (username, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
      if (username === 'rihemjaziri24' || users.some(u => u.username === username)) {
        return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
      }
      const newUser = { username, password, role: 'user', createdAt: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('hydrachim_users', JSON.stringify(users));
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      return { success: false, error: 'Échec de la création de l\'utilisateur' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hydrachim_user');
  };

  return { user, isAuthenticated, login, logout, signup };
};

// Login Component
const AuthPage = () => {
  const { isDark, login } = useContext(AppContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = login(formData.username, formData.password);
      if (!result.success) {
        setError(result.error || 'Échec de la connexion. Vérifiez vos identifiants.');
      }
    } catch (err) {
      setError('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`} />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>
      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"><span className="text-white font-bold text-2xl">H</span></div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hydrachim</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Système de Tableau de Bord KPI</p>
        </div>
        <div className={`relative p-8 rounded-2xl border backdrop-blur-sm shadow-xl ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
          <div className="text-center mb-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Connectez-vous à votre compte</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Content de vous revoir ! Veuillez saisir vos identifiants.</p>
          </div>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nom d'utilisateur</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /></div>
                <input type="text" value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} onKeyPress={handleKeyPress} className={`w-full pl-10 pr-3 py-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`} placeholder="Entrez votre nom d'utilisateur" />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /></div>
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} onKeyPress={handleKeyPress} className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`} placeholder="Entrez votre mot de passe" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'}`}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02]'} text-white shadow-lg hover:shadow-xl`}>
              {loading ? (<div className="flex items-center justify-center space-x-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Chargement...</span></div>) : ('Connexion')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management Component (Admin Only)
const UserManagement = ({ onClose }) => {
  const { isDark, signup } = useContext(AppContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = () => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
        setUsers(storedUsers);
      } catch (err) { console.error('Erreur de chargement des utilisateurs:', err); setUsers([]); }
    };
    loadUsers();
    const syncInterval = setInterval(loadUsers, 5000);
    return () => clearInterval(syncInterval);
  }, []);

  const handleCreateUser = async () => {
    if (!formData.username || !formData.password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const result = signup(formData.username, formData.password);
      if (result.success) {
        setSuccess('Utilisateur créé avec succès.');
        setFormData({ username: '', password: '' });
        const updatedUsers = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
        setUsers(updatedUsers);
        setTimeout(() => setSuccess(''), 3000);
      } else { setError(result.error || 'Une erreur s\'est produite.'); }
    } catch (err) { setError('Une erreur s\'est produite lors de la création.'); } finally { setLoading(false); }
  };

  const handleDeleteUser = (username) => {
    if (window.confirm(`Confirmer la suppression de l'utilisateur "${username}" ?`)) {
      try {
        const currentUsers = JSON.parse(localStorage.getItem('hydrachim_users') || '[]');
        const updatedUsers = currentUsers.filter(u => u.username !== username);
        localStorage.setItem('hydrachim_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setSuccess('Utilisateur supprimé avec succès.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) { setError('Échec de la suppression de l\'utilisateur.'); }
    }
  };
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleCreateUser(); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}><Users className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} /></div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Gestion des Utilisateurs</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Créer et gérer les comptes utilisateurs.</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /></button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row">
          <div className={`flex-1 p-6 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Créer un Nouvel Utilisateur</h4>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
            {success && <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"><p className="text-sm text-green-600 dark:text-green-400">{success}</p></div>}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nom d'utilisateur</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /></div>
                  <input type="text" value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} onKeyPress={handleKeyPress} className={`w-full pl-10 pr-3 py-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`} placeholder="Entrez le nom d'utilisateur" />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} /></div>
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} onKeyPress={handleKeyPress} className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`} placeholder="Entrez le mot de passe" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'}`}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <button onClick={handleCreateUser} disabled={loading} className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white`}>
                {loading ? (<div className="flex items-center justify-center space-x-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Création...</span></div>) : ('Créer l\'Utilisateur')}
              </button>
            </div>
          </div>
          <div className="flex-1 p-6">
            <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Utilisateurs Existants</h4>
            <div className={`p-4 rounded-lg border mb-3 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>rihemjaziri24</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Administrateur (Système)</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>Admin</span>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.length > 0 ? (
                users.map((userObj) => (
                  <div key={userObj.username} className={`p-4 rounded-lg border ${isDark ? 'border-slate-600 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{userObj.username}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Créé le: {new Date(userObj.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>Utilisateur</span>
                        <button onClick={() => handleDeleteUser(userObj.username)} className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}><Users className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} /></div>
                  <p className={`text-base font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Aucun utilisateur n'a été créé.</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Créez votre premier utilisateur via le formulaire.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="flex justify-end"><button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>Fermer</button></div>
        </div>
      </div>
    </div>
  );
};

// Layout Component - Compact No Scroll
const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const { isDark = false, setIsDark, user, logout } = useContext(AppContext);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-600' },
    { id: 'rnd', icon: FlaskConical, label: 'R&D et Innovation', iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600' },
    { id: 'quality', icon: ShieldCheck, label: 'Management Qualité', iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600' },
    { id: 'production', icon: Factory, label: 'Production', iconBg: 'bg-gradient-to-br from-orange-600 to-red-600' },
    { id: 'warehouses', icon: Package, label: 'Magasin', iconBg: 'bg-gradient-to-br from-violet-600 to-purple-600' },
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

      {/* Sidebar: Better sized elements without scroll */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col`}>
        
        {/* Sidebar Header - Better sized */}
        <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hydrachim Tunisie</h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tableau de Bord KPI</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info - Better sized */}
        {user && (
          <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${user.role === 'admin' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Better sized */}
        <nav className="p-3 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? (isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-200') 
                      : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 ${item.iconBg}`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer section - Better sized */}
        <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {user?.role === 'admin' && (
            <div className="p-3">
              <button
                onClick={() => setShowUserManagement(true)}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDark ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30 border border-yellow-800/30' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Utilisateurs</span>
              </button>
            </div>
          )}

          <div className="p-3">
            <button
              onClick={logout}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Status Widget - Better sized */}
          <div className="p-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Système</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
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

// Main App Component
export default function HydrachimKPIApp() {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const auth = useAuth();
  const kpiData = useKPIData();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('hydrachim_dark_mode');
    if (savedDarkMode) setIsDark(JSON.parse(savedDarkMode));
  }, []);

  useEffect(() => {
    localStorage.setItem('hydrachim_dark_mode', JSON.stringify(isDark));
  }, [isDark]);

  const contextValue = { isDark, setIsDark, ...auth, ...kpiData };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'rnd': return <RnDPage />;
      case 'quality': return <QualityPage />;
      case 'production': return <ProductionPage />;
      case 'warehouses': return <WarehousesPage />;
      case 'team': return <TeamPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {!auth.isAuthenticated ? (<AuthPage />) : (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>{renderPage()}</Layout>
      )}
    </AppContext.Provider>
  );
}