import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3,
  Trash2,
  Play,
  Timer,
  Zap,
  Calendar,
  Edit3
} from 'lucide-react';

const ProductDevelopmentTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState(existingData?.products || []);
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    finishDate: '',
    isCompleted: false
  });

  // Calculate target weeks for new product based on dates
  const getCalculatedTargetWeeks = () => {
    if (!newProduct.startDate || !newProduct.finishDate) return 0;
    
    const startDate = new Date(newProduct.startDate);
    const finishDate = new Date(newProduct.finishDate);
    const diffTime = Math.abs(finishDate - startDate);
    const weeks = diffTime / (7 * 24 * 60 * 60 * 1000);
    return Math.round(weeks * 10) / 10;
  };

  // Helper function to convert weeks to months display
  const getMonthsFromWeeks = (weeks) => {
    const months = weeks / 4.33;
    if (months < 1) {
      return `${weeks} sem.`;
    } else if (months < 2) {
      return `≈ 1 mois`;
    } else {
      return `≈ ${Math.round(months)} mois`;
    }
  };

  // Helper function to format elapsed time
  const formatElapsedTime = (weeks) => {
    const days = Math.round(weeks * 7);
    const months = weeks / 4.33;
    
    if (weeks < 1) {
      return `${days} jour${days !== 1 ? 's' : ''}`;
    } else if (weeks < 4) {
      return `${weeks.toFixed(1)} sem. (${days} jours)`;
    } else {
      return `${weeks.toFixed(1)} sem. (≈ ${months.toFixed(1)} mois)`;
    }
  };

  // Calculate how much time has passed since start
  const calculateElapsedTime = (product) => {
    const startDate = new Date(product.startDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - startDate);
    const diffWeeks = diffTime / (7 * 24 * 60 * 60 * 1000);
    return Math.round(diffWeeks * 10) / 10;
  };

  // Check if project is overdue (current date > planned finish date)
  const isProjectOverdue = (product) => {
    const currentDate = new Date();
    const plannedFinishDate = new Date(product.finishDate);
    return currentDate > plannedFinishDate;
  };

  // Get current status of product
  const getProductStatus = (product) => {
    if (product.isCompleted) {
      return 'completed';
    }
    
    if (isProjectOverdue(product)) {
      return 'overdue';
    }
    
    return 'in_progress';
  };

  // Calculate actual development time vs target
  const calculateDevelopmentEfficiency = (product) => {
    const elapsedTime = calculateElapsedTime(product);
    const targetTime = product.targetWeeks;
    
    if (elapsedTime <= targetTime) {
      return 100;
    } else {
      return Math.round((targetTime / elapsedTime) * 100);
    }
  };

  // Get completion performance for completed products only
  const getCompletionPerformance = (product) => {
    if (!product.isCompleted) return null;
    
    const elapsedTime = calculateElapsedTime(product);
    const targetTime = product.targetWeeks;
    const wasOverdue = isProjectOverdue(product);
    
    // If the project was completed after the planned deadline, it's late regardless of development time
    if (wasOverdue) {
      const currentDate = new Date();
      const plannedFinishDate = new Date(product.finishDate);
      const extraDays = Math.ceil((currentDate - plannedFinishDate) / (24 * 60 * 60 * 1000));
      const extraWeeks = extraDays / 7;
      
      return { 
        type: 'late', 
        message: `⚠️ Terminé ${extraDays} jour${extraDays > 1 ? 's' : ''} après l'échéance`, 
        color: 'red' 
      };
    }
    
    // If completed on time, check development efficiency
    if (elapsedTime < targetTime) {
      const savedTime = targetTime - elapsedTime;
      return { 
        type: 'early', 
        message: `🎉 Terminé ${formatElapsedTime(savedTime)} en avance`, 
        color: 'green' 
      };
    } else if (elapsedTime > targetTime) {
      const extraTime = elapsedTime - targetTime;
      return { 
        type: 'slow', 
        message: `⚠️ Développement lent (+${formatElapsedTime(extraTime)})`, 
        color: 'orange' 
      };
    } else {
      return { 
        type: 'exact', 
        message: `✅ Développement optimal`, 
        color: 'blue' 
      };
    }
  };

  // Calculate overall KPI
  const calculateOverallKPI = () => {
    if (products.length === 0) return 0;
    
    let totalScore = 0;
    
    products.forEach(product => {
      const efficiency = calculateDevelopmentEfficiency(product);
      const isOverdue = isProjectOverdue(product);
      
      if (product.isCompleted) {
        // Completed projects: full efficiency if delivered on time, penalized if late
        if (isOverdue) {
          totalScore += Math.min(efficiency, 60); // Cap at 60% for late deliveries
        } else {
          totalScore += efficiency;
        }
      } else {
        // In-progress projects: penalize overdue projects
        if (isOverdue) {
          totalScore += Math.min(efficiency, 40); // Heavy penalty for overdue ongoing projects
        } else {
          totalScore += efficiency;
        }
      }
    });
    
    return Math.round(totalScore / products.length);
  };

  // Get development statistics
  const getDevelopmentStats = () => {
    const total = products.length;
    const completed = products.filter(p => p.isCompleted).length;
    const inProgress = products.filter(p => !p.isCompleted && !isProjectOverdue(p)).length;
    const overdue = products.filter(p => isProjectOverdue(p)).length;
    
    // On-time projects: not overdue (regardless of completion status)
    const onTime = products.filter(p => !isProjectOverdue(p)).length;
    const successRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
    
    return { total, completed, inProgress, overdue, onTime, successRate };
  };

  const addProduct = () => {
    if (!newProduct.name.trim()) {
      setErrors({ name: 'Le nom du produit est requis' });
      return;
    }

    if (!newProduct.startDate) {
      setErrors({ startDate: 'La date de début est requise' });
      return;
    }

    if (!newProduct.finishDate) {
      setErrors({ finishDate: 'La date de fin est requise pour calculer l\'objectif' });
      return;
    }

    const startDate = new Date(newProduct.startDate);
    const finishDate = new Date(newProduct.finishDate);
    
    if (finishDate <= startDate) {
      setErrors({ finishDate: 'La date de fin doit être après la date de début' });
      return;
    }
    
    const calculatedTargetWeeks = getCalculatedTargetWeeks();

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      startDate: newProduct.startDate,
      finishDate: newProduct.finishDate,
      targetWeeks: calculatedTargetWeeks,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      finishDate: '',
      isCompleted: false
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removeProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProduct = (productId, field, value) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value };
        
        // If updating dates, recalculate target
        if (field === 'finishDate' || field === 'startDate') {
          if (updatedProduct.startDate && updatedProduct.finishDate) {
            const startDate = new Date(updatedProduct.startDate);
            const finishDate = new Date(updatedProduct.finishDate);
            const diffTime = Math.abs(finishDate - startDate);
            updatedProduct.targetWeeks = Math.round((diffTime / (7 * 24 * 60 * 60 * 1000)) * 10) / 10;
          }
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  const handleSubmit = () => {
    if (products.length === 0) {
      setErrors({ products: 'Ajoutez au moins un produit' });
      return;
    }
    
    const overallKPI = calculateOverallKPI();
    const devStats = getDevelopmentStats();
    
    const developmentData = {
      value: overallKPI,
      date: selectedDate,
      products: products,
      stats: devStats,
      type: 'product_development_time'
    };
    
    onSave('rnd', 'product_development_time', developmentData, '');
  };

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20'
  }`;

  const stats = getDevelopmentStats();
  const overallKPI = calculateOverallKPI();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl border flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Temps de Développement Produits
                </h3>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Suivi intelligent avec détection des retards d'échéance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-sm font-medium">KPI Global</div>
                <div className={`text-3xl font-bold ${
                  overallKPI >= 80 ? 'text-emerald-600' : 
                  overallKPI >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {overallKPI}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`p-3 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            
            {/* Left Column - Controls & Overview */}
            <div className={`w-2/5 border-r p-8 overflow-y-auto ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            }`}>
              
              {/* Date Settings */}
              <div className={`p-6 rounded-xl border mb-6 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Configuration
                  </h4>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Date de Référence
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={baseInputClasses}
                  />
                </div>
              </div>

              {/* KPI Overview */}
              <div className="space-y-4 mb-6">
                {/* Overall KPI */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Performance Globale
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Efficacité avec pénalités
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      overallKPI >= 80 ? 'text-emerald-600' : 
                      overallKPI >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {overallKPI}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs px-2 py-1 rounded-lg font-semibold inline-block ${
                      overallKPI >= 80 
                        ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : overallKPI >= 60
                        ? isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                        : isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {overallKPI >= 80 ? '🎯 Excellent' : 
                       overallKPI >= 60 ? '⚡ Moyen' : '⚠️ À Améliorer'}
                    </div>
                  </div>
                </div>

                {/* Success Rate */}
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Respect Échéances
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Projets à temps
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      stats.successRate >= 70 ? 'text-emerald-600' : 
                      stats.successRate >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {stats.successRate}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {stats.onTime} sur {stats.total} projets
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {stats.total}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        Total
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {stats.completed}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        Terminés
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-amber-900 border-amber-800' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        {stats.inProgress}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                        En Cours
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {stats.overdue}
                      </div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                        En Retard
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Product Form */}
              <div className={`rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`p-6 ${showAddForm ? 'border-b' : ''} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 mr-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
                          Nouveau Produit
                        </h4>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Créez un nouveau projet de développement
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${
                        showAddForm
                          ? isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{showAddForm ? 'Annuler' : 'Ajouter'}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {showAddForm && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                          Nom du Produit
                        </label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Nouveau Détergent Bio"
                          className={baseInputClasses}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-2 font-medium">{errors.name}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Date de Début
                          </label>
                          <input
                            type="date"
                            value={newProduct.startDate}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, startDate: e.target.value }))}
                            className={baseInputClasses}
                          />
                          {errors.startDate && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.startDate}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                            Échéance Prévue
                          </label>
                          <input
                            type="date"
                            value={newProduct.finishDate}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, finishDate: e.target.value }))}
                            className={baseInputClasses}
                          />
                          {errors.finishDate && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.finishDate}</p>
                          )}
                        </div>
                      </div>

                      {newProduct.startDate && newProduct.finishDate && (
                        <div className={`p-4 rounded-lg border ${
                          isDark ? 'bg-emerald-900 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Calendar className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <div>
                              <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Objectif calculé: {getCalculatedTargetWeeks()} semaines
                              </span>
                              <div className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                Soit environ {getMonthsFromWeeks(getCalculatedTargetWeeks())}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={addProduct}
                          className="px-8 py-3 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Ajouter le Produit</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Products List */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Projets en Développement ({products.length})
                    </h4>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Gérez vos projets et suivez leur progression
                    </p>
                  </div>
                </div>
              </div>

              {products.length === 0 ? (
                <div className={`text-center py-12 border-2 border-dashed rounded-xl ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'
                }`}>
                  <Timer className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Aucun produit en développement
                  </p>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Utilisez le formulaire ci-contre pour ajouter votre premier projet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => {
                    const elapsedTime = calculateElapsedTime(product);
                    const efficiency = calculateDevelopmentEfficiency(product);
                    const performance = getCompletionPerformance(product);
                    const isOverdue = isProjectOverdue(product);
                    
                    return (
                      <div 
                        key={product.id}
                        className={`p-6 rounded-xl border transition-colors ${
                          isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {/* Product Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {product.name}
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Début: {new Date(product.startDate).toLocaleDateString('fr-FR')}
                              </div>
                              <div className={`text-sm font-medium ${isOverdue ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <Clock className="w-4 h-4 inline mr-1" />
                                Échéance: {new Date(product.finishDate).toLocaleDateString('fr-FR')}
                              </div>
                              <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                                product.isCompleted
                                  ? isDark ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                  : isOverdue
                                  ? isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700'
                                  : isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {product.isCompleted ? '✅ Terminé' : 
                                 isOverdue ? '⚠️ Retard' : '⏳ En Cours'}
                              </div>
                            </div>
                            {performance && (
                              <div className={`text-sm font-medium mt-2 ${
                                performance.color === 'green' ? 'text-emerald-600' :
                                performance.color === 'blue' ? 'text-blue-600' :
                                performance.color === 'orange' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {performance.message}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                            }`}
                            title="Supprimer le projet"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Progress & Controls */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => updateProduct(product.id, 'isCompleted', !product.isCompleted)}
                              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                                product.isCompleted
                                  ? isDark ? 'bg-emerald-900 text-emerald-400 border border-emerald-700' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                  : isDark ? 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-emerald-50'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{product.isCompleted ? 'Terminé' : 'Marquer comme terminé'}</span>
                            </button>
                            
                            <div className="flex items-center space-x-4">
                              <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {formatElapsedTime(elapsedTime)} écoulé
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-bold ${
                                  efficiency >= 100 ? 'text-emerald-600' :
                                  efficiency >= 80 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {efficiency}%
                                </span>
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  efficacité
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Progression du développement
                              </span>
                              <span className={`text-xs font-bold ${
                                efficiency >= 100 ? 'text-emerald-600' :
                                efficiency >= 80 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {Math.min(efficiency, 100)}%
                              </span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  efficiency >= 100 ? 'bg-emerald-600' :
                                  efficiency >= 80 ? 'bg-amber-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${Math.min(efficiency, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.products && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{errors.products}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Performance Globale: <span className={`text-lg ${
                overallKPI >= 80 ? 'text-emerald-600' : 
                overallKPI >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {overallKPI}%
              </span> • {stats.onTime}/{stats.total} projets à temps
            </div>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors bg-emerald-600 hover:bg-emerald-700"
              >
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDevelopmentTracker;