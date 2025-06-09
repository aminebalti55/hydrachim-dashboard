import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Package,
  Flame,
  RotateCcw,
  Zap
} from 'lucide-react';

const ProductionWasteTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Helper function to get Monday of any given date
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper function to get Sunday of any given date
  const getSundayOfWeek = (date) => {
    const monday = getMondayOfWeek(date);
    return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || new Date().toISOString().split('T')[0]
  );
  const [weeklyTarget, setWeeklyTarget] = useState(existingData?.weeklyTarget || 5);
  const [wastedMaterials, setWastedMaterials] = useState(existingData?.wastedMaterials || []);
  const [errors, setErrors] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);

  // Complete list of raw materials
  const rawMaterials = [
    'Acide citrique', 'Acticide DDQ 50', 'Acticide GDA 50', 'Amidét B112',
    'BAC 50 Bactéricide Fangicide', 'Butyl glycol', 'Chimisol 13 LH FD',
    'Chlorhexidine gluconate 20%', 'Colorant bleu acide', 'Colorant jaune tartracina E-102',
    'Colorant marron SAV 648', 'Colorant rose rodhamine', 'Colorant vert olive',
    'Colorant violet acide 17', 'Décapant carrelage', 'Dehscofix CO 125',
    'DPG', 'Eau déminéralisée', 'EDTA-Masqual', 'EDTA Na',
    'Eltesol SC 93', 'Empicol OP 301', 'Empigen BAC 80', 'Empigen BS/FA',
    'Empigen OB', 'Empilan KR6', 'Formol', 'Glutaraldéhyde 50%',
    'Glyoxal 40%', 'Gomme xanthane', 'Green Apple LEV', 'Hydroxypropylméthylcellulose HPMC',
    'Isopropyl alcohol IPA', 'Linear Alkyl Benzene Sulfonic Acid LABSA 96%',
    'MP Acide nitrique 58%', 'MP Acide phosphorique 85%', 'MP Extrait de Javel 50°',
    'MP Lessive de soude caustique 50%', 'MP Premix Alcalin', 'MP Premix Alcalin Chlore',
    'MP Premix CAM 4260', 'MP Premix CIP 1500', 'MP Premix Dégraissant alimentaire',
    'Musk Nokhba', 'Nansa LSS 38/AS', 'NP9', 'Parfum vanille oude',
    'Parfum citron vert', 'Parfum extra lavender', 'Parfum jasmin', 'Parfum lavande',
    'Parfum lemon', 'Parfum MAR', 'Parfum océan bleu', 'Parfum oud cannelle',
    'Parfum pear & rose', 'Parfum pêche', 'Parfum pin parasol', 'Parfum pink comfort',
    'Parfum pretty lemon', 'Parfum softinella', 'Potasse caustique', 'Producto 2000',
    'Sel', 'Sinebact CG', 'Sodium Lauryl Ether Sulfate SLES 70%', 'TEA'
  ];

  // Show only first 24 materials initially
  const displayedMaterials = showAllMaterials ? rawMaterials : rawMaterials.slice(0, 24);

  // Get color for material tag based on type
  const getMaterialColor = (material) => {
    if (material.toLowerCase().includes('colorant')) {
      return isDark ? 'bg-purple-900/50 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-300';
    } else if (material.toLowerCase().includes('parfum')) {
      return isDark ? 'bg-pink-900/50 text-pink-300 border-pink-700' : 'bg-pink-100 text-pink-800 border-pink-300';
    } else if (material.toLowerCase().includes('acide')) {
      return isDark ? 'bg-orange-900/50 text-orange-300 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-300';
    } else if (material.toLowerCase().includes('mp ')) {
      return isDark ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700' : 'bg-cyan-100 text-cyan-800 border-cyan-300';
    } else if (material.toLowerCase().includes('empigen') || material.toLowerCase().includes('empicol')) {
      return isDark ? 'bg-teal-900/50 text-teal-300 border-teal-700' : 'bg-teal-100 text-teal-800 border-teal-300';
    } else {
      return isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Calculate weekly KPI
  const calculateWeeklyKPI = () => {
    const weekStart = getMondayOfWeek(selectedDate);
    const weekEnd = getSundayOfWeek(selectedDate);
    
    const weekWastedMaterials = wastedMaterials.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
    
    const totalWasted = weekWastedMaterials.length;
    
    if (totalWasted === 0) return 100;
    if (totalWasted >= weeklyTarget) return 0;
    
    const wasteRatio = totalWasted / weeklyTarget;
    return Math.round((1 - wasteRatio) * 100);
  };

  // Get weekly statistics
  const getWeeklyStats = () => {
    const weekStart = getMondayOfWeek(selectedDate);
    const weekEnd = getSundayOfWeek(selectedDate);
    
    const weekWastedMaterials = wastedMaterials.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
    
    const totalWasted = weekWastedMaterials.length;
    const remainingTarget = Math.max(0, weeklyTarget - totalWasted);
    
    return {
      totalWasted,
      remainingTarget,
      weekWastedMaterials,
      status: totalWasted >= weeklyTarget ? 'exceeded' : totalWasted >= weeklyTarget * 0.8 ? 'warning' : 'good'
    };
  };

  // Handle drag start
  const handleDragStart = (e, material) => {
    setDraggedItem(material);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', material);
  };

  // Handle drag over trash
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on trash
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      const wasteItem = {
        id: Date.now(),
        material: draggedItem,
        date: selectedDate, // Use selected week's Monday date
        time: new Date().toTimeString().slice(0, 5),
        createdAt: new Date().toISOString()
      };
      
      setWastedMaterials(prev => [...prev, wasteItem]);
      setDraggedItem(null);
      setIsDragging(false);
    }
  };

  // Remove wasted item
  const removeWastedItem = (itemId) => {
    setWastedMaterials(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle submit
  const handleSubmit = () => {
    const weeklyKPI = calculateWeeklyKPI();
    const stats = getWeeklyStats();
    
    const wasteData = {
      value: weeklyKPI,
      date: selectedDate,
      weeklyTarget: weeklyTarget,
      wastedMaterials: wastedMaterials,
      stats: stats,
      type: 'production_waste_rate'
    };
    
    onSave('quality', 'production_waste_rate', wasteData, '');
  };

  // Handle date change
  const handleDateChange = (dateString) => {
    const selectedDate = new Date(dateString);
    const monday = getMondayOfWeek(selectedDate);
    setSelectedDate(monday.toISOString().split('T')[0]);
  };

  const baseInputClasses = `w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-red-500 focus:ring-red-500/20'
  }`;

  const stats = getWeeklyStats();
  const weeklyKPI = calculateWeeklyKPI();
  const mondayOfWeek = getMondayOfWeek(selectedDate);
  const sundayOfWeek = getSundayOfWeek(selectedDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl border flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Compact Header */}
        <div className={`px-6 py-4 border-b flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Suivi Gaspillage Production
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Contrôle hebdomadaire • Glissez matières vers corbeille
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="text-xs">Efficacité</div>
                <div className={`text-2xl font-bold ${
                  weeklyKPI >= 80 ? 'text-emerald-600' : 
                  weeklyKPI >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {weeklyKPI}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Configuration & Materials */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* Compact Configuration Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Week Selection */}
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Semaine
                  </span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={baseInputClasses}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {mondayOfWeek.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} → {sundayOfWeek.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </p>
              </div>

              {/* Target Setting */}
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-amber-600'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-amber-800'}`}>
                    Objectif Max
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(parseInt(e.target.value) || 5)}
                  className={baseInputClasses}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-amber-700'}`}>
                  {weeklyTarget} items/semaine
                </p>
              </div>

              {/* Performance Status */}
              <div className={`p-3 rounded-lg border ${
                stats.status === 'good' 
                  ? isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                  : stats.status === 'warning'
                  ? isDark ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'
                  : isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className={`w-4 h-4 ${
                    stats.status === 'good' 
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : stats.status === 'warning'
                      ? isDark ? 'text-amber-400' : 'text-amber-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`} />
                  <span className={`text-xs font-semibold ${
                    stats.status === 'good' 
                      ? isDark ? 'text-emerald-300' : 'text-emerald-800'
                      : stats.status === 'warning'
                      ? isDark ? 'text-amber-300' : 'text-amber-800'
                      : isDark ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Performance
                  </span>
                </div>
                <div className={`text-lg font-bold ${
                  stats.status === 'good' 
                    ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                    : stats.status === 'warning'
                    ? isDark ? 'text-amber-400' : 'text-amber-700'
                    : isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {stats.totalWasted}/{weeklyTarget}
                </div>
                <p className={`text-xs ${
                  stats.status === 'good' 
                    ? isDark ? 'text-emerald-500' : 'text-emerald-600'
                    : stats.status === 'warning'
                    ? isDark ? 'text-amber-500' : 'text-amber-600'
                    : isDark ? 'text-red-500' : 'text-red-600'
                }`}>
                  {stats.remainingTarget} restantes
                </p>
              </div>
            </div>

            {/* Materials Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Matières Premières ({rawMaterials.length})
                </h4>
                <button
                  onClick={() => setShowAllMaterials(!showAllMaterials)}
                  className={`text-sm font-medium transition-colors ${
                    isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  {showAllMaterials ? 'Réduire' : `Voir toutes (${rawMaterials.length - 24} de plus)`}
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {displayedMaterials.map((material, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, material)}
                    className={`px-2 py-2 rounded-lg border text-xs font-medium cursor-move transition-all hover:shadow-md hover:scale-105 ${
                      getMaterialColor(material)
                    }`}
                    title={`Glisser vers corbeille: ${material}`}
                  >
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{material}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Waste Zone */}
          <div className={`w-80 border-l flex flex-col ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            
            {/* Drop Zone - Fixed height */}
            <div className="p-6 pb-4 flex-shrink-0">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`p-6 rounded-xl border-2 border-dashed text-center transition-all ${
                  isDragging
                    ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                    : isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                  isDragging 
                    ? 'bg-red-600 animate-pulse' 
                    : isDark ? 'bg-slate-700' : 'bg-slate-200'
                }`}>
                  <Trash2 className={`w-6 h-6 ${
                    isDragging ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </div>
                <h4 className={`text-sm font-semibold mb-1 ${
                  isDragging ? 'text-red-600' : isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Corbeille
                </h4>
                <p className={`text-xs ${
                  isDragging ? 'text-red-500' : isDark ? 'text-slate-500' : 'text-slate-600'
                }`}>
                  Glissez ici
                </p>
              </div>
            </div>

            {/* Wasted Materials List - Flexible height with proper scrolling */}
            <div className="flex-1 flex flex-col min-h-0 px-6 pb-4">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Gaspillées Cette Semaine
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stats.weekWastedMaterials.length === 0 
                    ? isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  {stats.weekWastedMaterials.length}
                </span>
              </div>

              {/* Scrollable container */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {stats.weekWastedMaterials.length === 0 ? (
                  <div className={`text-center py-8 border border-dashed rounded-lg ${
                    isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'
                  }`}>
                    <CheckCircle className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Aucun gaspillage!
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Performance excellente
                    </p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-2">
                    <div className="space-y-2">
                      {wastedMaterials.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                            isDark ? 'bg-red-900/20 border-red-800 hover:bg-red-900/30' : 'bg-red-50 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-semibold mb-1 leading-tight ${
                                isDark ? 'text-red-300' : 'text-red-800'
                              }`}>
                                {item.material}
                              </div>
                              <div className={`text-xs flex items-center space-x-2 ${
                                isDark ? 'text-red-400' : 'text-red-600'
                              }`}>
                                <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                                <span>•</span>
                                <span>{item.time}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeWastedItem(item.id)}
                              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ml-3 ${
                                isDark ? 'text-red-400 hover:bg-red-900/50 hover:text-red-300' : 'text-red-600 hover:bg-red-200 hover:text-red-700'
                              }`}
                              title="Restaurer cet élément"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className={`px-6 py-3 border-t flex-shrink-0 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className={`font-semibold ${
                weeklyKPI >= 80 ? 'text-emerald-600' : 
                weeklyKPI >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {weeklyKPI}%
              </span> efficacité • {stats.totalWasted}/{weeklyTarget} gaspillées
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
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

export default ProductionWasteTracker;