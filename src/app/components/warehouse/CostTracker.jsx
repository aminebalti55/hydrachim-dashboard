import React, { useState, useMemo } from 'react';
import {
  Package,
  Save,
  X,
  Search,
  TestTube,
  Target,
  TrendingDown,
  TrendingUp,
  Banknote,
  Activity,
  Coins,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  DollarSign,
  ShoppingCart,
  Wallet,
  TrendingDown as TrendingDownIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const CostTracker = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  // Product categories and items
  const productCategories = {
    matieres_premieres: {
      name: 'Matières Premières',
      icon: TestTube,
      color: 'blue',
      items: [
        'Acide citrique', 'Acticide DDQ 50', 'Acticide GDA 50', 'Amidét B112',
        'BAC 50 Bactéricide Fangicide', 'Butyl glycol', 'Chimisol 13 LH FD',
        'Chlorhexidine gluconate 20%', 'Colorant bleu acide', 'Colorant jaune tartracina E-102',
        'Colorant marron SAV 648', 'Colorant rose rodhamine', 'Colorant vert olive',
        'Colorant violet acide 17', 'Décapant carrelage', 'Dehscofix CO 125', 'DPG',
        'Eau déminéralisée', 'EDTA-Masqual EDTA Na', 'Eltesol SC 93', 'Empicol OP 301',
        'Empigen BAC 80', 'Empigen BS/FA', 'Empigen OB', 'Empilan KR6', 'Formol',
        'Glutaraldéhyde 50%', 'Glyoxal 40%', 'Gomme xanthane', 'Green Apple LEV',
        'Hydroxypropylméthylcellulose HPMC', 'Isopropyl alcohol IPA',
        'Linear Alkyl Benzene Sulfonic Acid LABSA 96%', 'MP Acide nitrique 58%',
        'MP Acide phosphorique 85%', 'MP Extrait de Javel 50°', 'MP Lessive de soude caustique 50%',
        'MP Premix Alcalin', 'MP Premix Alcalin Chlore', 'MP Premix CAM 4260',
        'MP Premix CIP 1500', 'MP Premix Dégraissant alimentaire', 'Musk Nokhba',
        'Nansa LSS 38/AS', 'NP9', 'Parfum vanille oude', 'Parfum citron vert',
        'Parfum extra lavender', 'Parfum jasmin', 'Parfum lavande', 'Parfum lemon',
        'Parfum MAR', 'Parfum océan bleu', 'Parfum oud cannelle', 'Parfum pear & rose',
        'Parfum pêche', 'Parfum pin parasol', 'Parfum pink comfort', 'Parfum pretty lemon',
        'Parfum softinella', 'Potasse caustique', 'Producto 2000', 'Sel', 'Sinebact CG',
        'Sodium Lauryl Ether Sulfate SLES 70%', 'TEA'
      ]
    },
    emballage: {
      name: 'Emballage',
      icon: Package,
      color: 'orange',
      items: [
        'BIDON JAUNE 20L BM 900 G', 'BIDON 20L BLANC BM 900 G', 'BIDON 20L BLEU BM 900 G',
        'BIDON 20L NOIR BM 900 G', 'BIDON 20L ROUGE BM 900 G', 'BIDON 20L VERT BM 1200 KG',
        'BIDON 5L BLANC', 'BIDON TRANSPARENT /20 L', 'BIDON TRANSPARENT 5L',
        'BOUCHON DESK-TOP 24', 'BOUTEILLE 0.5 L', 'BOUTEILLE 100 ML', 'BOUTEILLE 250 ML',
        'BOUTEILLE 250ML BLANC LAIT', 'BOUTEILLE 5L 9RAM', 'BOUTEILLE 750 ML',
        'CARTON 275180250', 'CARTON 400270260', 'CARTON pour 4 bid 5l TL/TL 400260300',
        'FLACON 1L BLANC AMP', 'FLACON 1L CARRE-SOTUPROC', 'FLACON 1L/ BLANC',
        'FLACON 200 ML-24', 'FLACON 200ML-28', 'FLACON TRANSPARENT 1L AM',
        'LOTION PUMP FP 314 38/400 WHITE', 'MINI TRIGGER 28/410', 'MIST SPRAYER FP601',
        'POMPE BEC LONG G28', 'POMPE BLANC DIAM 28'
      ]
    }
  };

  // Date utility functions
  const getCurrentMonth = () => new Date();
  
  const getFirstDayOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const getLastDayOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const getMonthName = (date) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[new Date(date).getMonth()];
  };

  const formatDate = (date, formatStr) => {
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const d = new Date(date);
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    
    if (formatStr === 'MMMM yyyy') {
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    }
    if (formatStr === 'dd MMM yyyy') {
      return `${day.toString().padStart(2, '0')} ${month.substring(0, 3)} ${year}`;
    }
    return `${day}/${d.getMonth() + 1}/${year}`;
  };

  // State management
  const [activeCategory, setActiveCategory] = useState('matieres_premieres');
  const [searchTerm, setSearchTerm] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(existingData?.monthlyBudget || 150000);
  const [selectedDate, setSelectedDate] = useState(
    existingData?.date || getCurrentMonth().toISOString().split('T')[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [productCosts, setProductCosts] = useState(existingData?.productCosts || {});

  // Custom Calendar Component
  const CustomCalendar = () => {
    const currentDate = new Date();
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Previous month's trailing days
      const prevMonth = new Date(year, month - 1, 0);
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonth.getDate() - i,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          date: new Date(year, month - 1, prevMonth.getDate() - i)
        });
      }
      
      // Current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const isToday = dayDate.toDateString() === currentDate.toDateString();
        const isSelected = dayDate.toDateString() === new Date(selectedDate).toDateString();
        
        days.push({
          day,
          isCurrentMonth: true,
          isToday,
          isSelected,
          date: dayDate
        });
      }
      
      // Next month's leading days
      const totalCells = Math.ceil(days.length / 7) * 7;
      const remainingCells = totalCells - days.length;
      for (let day = 1; day <= remainingCells; day++) {
        days.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          date: new Date(year, month + 1, day)
        });
      }
      
      return days;
    };
    
    const days = getDaysInMonth(viewDate);
    
    const navigateMonth = (direction) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + direction);
      setViewDate(newDate);
    };
    
    const selectDay = (dayObj) => {
      setSelectedDate(dayObj.date.toISOString().split('T')[0]);
      setShowCalendar(false);
    };
    
    return (
      <div className={`absolute top-full mt-3 z-50 rounded-xl shadow-xl border overflow-hidden ${
        isDark 
          ? 'bg-slate-900 border-slate-700 shadow-slate-900/50' 
          : 'bg-white border-violet-200 shadow-violet-100/50'
      }`} style={{ width: '280px' }}>
        
        {/* Calendar Header */}
        <div className={`px-3 py-3 ${
          isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-violet-500 to-purple-600'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                {monthNames[viewDate.getMonth()]}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {viewDate.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={() => navigateMonth(1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-3">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className={`text-center py-1 text-xs font-bold uppercase tracking-wide ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayObj, index) => (
              <button
                key={index}
                onClick={() => selectDay(dayObj)}
                className={`
                  h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105
                  ${dayObj.isCurrentMonth 
                    ? isDark ? 'text-white hover:bg-violet-600' : 'text-slate-900 hover:bg-violet-500 hover:text-white'
                    : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                  }
                  ${dayObj.isSelected 
                    ? 'bg-violet-600 text-white font-bold ring-2 ring-violet-300 shadow-lg' 
                    : ''
                  }
                  ${dayObj.isToday && !dayObj.isSelected
                    ? isDark 
                      ? 'bg-violet-900/40 text-violet-300 ring-1 ring-violet-500' 
                      : 'bg-violet-100 text-violet-800 ring-1 ring-violet-300'
                    : ''
                  }
                `}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className={`px-3 py-2 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-violet-100 bg-violet-50/50'
        }`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedDate(currentDate.toISOString().split('T')[0]);
                setShowCalendar(false);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                isDark 
                  ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                  : 'bg-violet-500 hover:bg-violet-600 text-white'
              }`}
            >
              Aujourd'hui
            </button>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatDate(new Date(selectedDate), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate monthly total cost
  const getMonthlyTotalCost = () => {
    const selectedMonth = new Date(selectedDate);
    const currentMonth = getCurrentMonth();
    
    // Only consider costs for the selected month
    if (selectedMonth.getMonth() === currentMonth.getMonth() && 
        selectedMonth.getFullYear() === currentMonth.getFullYear()) {
      return Object.values(productCosts).reduce((total, item) => {
        return total + (parseFloat(item.cost) || 0) * (parseFloat(item.quantity) || 1);
      }, 0);
    }
    return 0;
  };

  // Calculate monthly KPI (100% if within budget, 0% if over budget)
  const calculateMonthlyKPI = () => {
    const monthlyTotal = getMonthlyTotalCost();
    return monthlyTotal <= monthlyBudget ? 100 : 0;
  };

  // Update cost for a product
  const updateProductCost = (productName, category, field, value) => {
    const costKey = `${category}_${productName}`;
    
    setProductCosts(prev => ({
      ...prev,
      [costKey]: {
        ...prev[costKey],
        productName,
        category,
        [field]: parseFloat(value) || (field === 'unit' ? value : 0),
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Get filtered products
  const getFilteredProducts = (category) => {
    let items = productCategories[category].items;
    if (searchTerm) {
      items = items.filter(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return items;
  };

  // Get cost statistics
  const getCostStats = () => {
    const monthlyTotal = getMonthlyTotalCost();
    const remainingBudget = monthlyBudget - monthlyTotal;
    const budgetedItems = Object.keys(productCosts).filter(key => productCosts[key]?.cost > 0).length;
    const totalItems = Object.values(productCategories).reduce((acc, cat) => acc + cat.items.length, 0);
    const budgetUtilization = monthlyBudget > 0 ? Math.round((monthlyTotal / monthlyBudget) * 100) : 0;
    
    // Calculate by category
    const materieresPremieresTotal = Object.entries(productCosts)
      .filter(([key]) => key.startsWith('matieres_premieres_'))
      .reduce((total, [, item]) => total + (item.cost || 0) * (item.quantity || 1), 0);
    
    const emballageTotal = Object.entries(productCosts)
      .filter(([key]) => key.startsWith('emballage_'))
      .reduce((total, [, item]) => total + (item.cost || 0) * (item.quantity || 1), 0);
    
    return {
      monthlyTotal,
      remainingBudget,
      budgetedItems,
      totalItems,
      budgetUtilization,
      materieresPremieresTotal,
      emballageTotal,
      isOverBudget: monthlyTotal > monthlyBudget
    };
  };

  // Get KPI color
  const getKPIColor = () => {
    const kpi = calculateMonthlyKPI();
    return kpi === 100 ? 'text-emerald-600' : 'text-red-600';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600 border-blue-500',
      orange: 'bg-orange-500 hover:bg-orange-600 border-orange-500'
    };
    return colors[productCategories[category].color] || 'bg-slate-500 hover:bg-slate-600';
  };

  const handleSubmit = () => {
    const kpi = calculateMonthlyKPI();
    const stats = getCostStats();
    
    const costData = {
      value: kpi,
      date: selectedDate,
      monthlyBudget: monthlyBudget,
      productCosts: productCosts,
      stats: stats,
      monthlyTotal: getMonthlyTotalCost(),
      type: 'cost_tracking'
    };
    
    // Call the save function with the correct parameters for Supabase integration
    onSave('warehouses', 'cost_per_formulation', costData, `Budget: ${monthlyBudget.toLocaleString()} DT - Total: ${getMonthlyTotalCost().toLocaleString()} DT`);
  };

  const kpi = calculateMonthlyKPI();
  const stats = getCostStats();
  const filteredItems = getFilteredProducts(activeCategory);
  const selectedDateObj = new Date(selectedDate);
  const currentDate = getCurrentMonth();
  const isCurrentMonth = selectedDateObj.getMonth() === currentDate.getMonth() && 
                        selectedDateObj.getFullYear() === currentDate.getFullYear();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'
      }`}>
        
        {/* Modern Header */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Contrôle Coûts Matières & Emballage
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  Suivi mensuel des coûts avec gestion budgétaire intelligente
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  KPI Budget
                </div>
                <div 
                  className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${getKPIColor()}`}
                  title={`💰 FORMULE KPI COÛTS MENSUELS

🎯 CALCUL DU SCORE:
• KPI = Coût Total Mensuel ≤ Budget Mensuel ? 100% : 0%

📋 SITUATION ACTUELLE:
• Mois: ${getMonthName(selectedDate)} ${selectedDateObj.getFullYear()}
• Budget Mensuel: ${monthlyBudget.toLocaleString()} DT
• Coût Total Mensuel: ${stats.monthlyTotal.toLocaleString()} DT
• Reste à dépenser: ${stats.remainingBudget.toLocaleString()} DT

📊 RÉPARTITION PAR CATÉGORIE:
• Matières Premières: ${stats.materieresPremieresTotal.toLocaleString()} DT
• Emballage: ${stats.emballageTotal.toLocaleString()} DT

📈 UTILISATION BUDGET:
• Pourcentage utilisé: ${stats.budgetUtilization}%
• Articles budgétés: ${stats.budgetedItems}/${stats.totalItems}

💡 INTERPRÉTATION:
• 100%: Budget respecté - coûts maîtrisés
• 0%: Budget dépassé - révision nécessaire

Score actuel: ${kpi}%
${stats.isOverBudget ? '🚨 BUDGET DÉPASSÉ' : '✅ BUDGET RESPECTÉ'}

📌 NOTE: Le calcul se base sur le mois sélectionné avec tous les produits configurés`}
                >
                  {kpi}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-violet-50/50 border-violet-100'
        }`}>
          <div className="flex items-center justify-between">
            
            {/* Month Selector with Calendar */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-600 text-white hover:border-violet-500 shadow-lg' 
                      : 'bg-white border-violet-200 text-slate-900 hover:border-violet-400 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(selectedDateObj, 'MMMM yyyy')}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
                </button>

                {/* Custom Calendar Dropdown */}
                {showCalendar && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowCalendar(false)}
                    />
                    <CustomCalendar />
                  </>
                )}
              </div>
              
              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                isCurrentMonth 
                  ? isDark ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-100 text-violet-700'
                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {isCurrentMonth ? '📅 Mois actuel' : '📋 Historique'}
              </div>
            </div>

            {/* Budget Control and Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <div className={`text-lg font-semibold text-blue-600`}>{stats.materieresPremieresTotal.toLocaleString()}</div>
                    <div className={`text-xs font-medium text-blue-600`}>Matières (DT)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <div>
                    <div className={`text-lg font-semibold text-orange-600`}>{stats.emballageTotal.toLocaleString()}</div>
                    <div className={`text-xs font-medium text-orange-600`}>Emballage (DT)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <div className={`text-lg font-semibold text-green-600`}>{stats.monthlyTotal.toLocaleString()}</div>
                    <div className={`text-xs font-medium text-green-600`}>Total (DT)</div>
                  </div>
                </div>
              </div>
              
              {/* Budget Setting */}
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                isDark 
                  ? 'bg-slate-800 border-slate-600' 
                  : 'bg-white border-violet-200'
              }`}>
                <Target className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Budget:</span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)}
                    className={`w-24 px-2 py-1 text-sm font-semibold text-center rounded border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-violet-200 text-slate-900'
                    }`}
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>DT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0">
          
          {/* Categories Sidebar */}
          <div className={`w-60 border-r p-4 ${
            isDark ? 'border-slate-700 bg-slate-800/30' : 'border-violet-100 bg-violet-50/30'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Catégories</h3>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className={`pl-10 pr-4 py-2 rounded-lg border text-sm w-full ${
                      isDark 
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                        : 'bg-white border-violet-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                </div>
              </div>
              
              {Object.entries(productCategories).map(([categoryKey, category]) => (
                <button
                  key={categoryKey}
                  onClick={() => setActiveCategory(categoryKey)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeCategory === categoryKey
                      ? `${getCategoryColor(categoryKey)} text-white shadow-lg`
                      : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-white hover:bg-violet-50 text-slate-700 border border-violet-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeCategory === categoryKey ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-violet-100'
                    }`}>
                      <category.icon className={`w-4 h-4 ${
                        activeCategory === categoryKey ? 'text-white' : isDark ? 'text-slate-300' : 'text-violet-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className={`text-xs ${
                        activeCategory === categoryKey ? 'text-white/80' : isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        {category.items.length} produits
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className={`mt-6 p-4 rounded-xl ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-violet-100'
            }`}>
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold ${
                  stats.isOverBudget ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {stats.budgetUtilization}%
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Budget utilisé
                </div>
                <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2`}>
                  <div
                    className={`h-2 rounded-full ${
                      stats.isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="flex-1 overflow-y-auto p-6">
            {(() => {
              const currentCategory = productCategories[activeCategory];
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(activeCategory)}`}>
                        <currentCategory.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {currentCategory.name}
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {filteredItems.length} produit(s) • Coûts en Dinars Tunisiens
                        </p>
                      </div>
                    </div>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-900'}`}>
                        Aucun produit trouvé
                      </h3>
                      <p className={`${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        Modifiez votre terme de recherche
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className={`grid grid-cols-12 gap-4 p-4 rounded-xl text-sm font-semibold ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-violet-50 text-slate-700'
                      }`}>
                        <div className="col-span-5">Produit</div>
                        <div className="col-span-2 text-center">Prix (DT)</div>
                        <div className="col-span-2 text-center">Quantité</div>
                        <div className="col-span-1 text-center">Unité</div>
                        <div className="col-span-2 text-center">Total (DT)</div>
                      </div>

                      {/* Product Rows */}
                      {filteredItems.map((item, index) => {
                        const costKey = `${activeCategory}_${item}`;
                        const productCost = productCosts[costKey] || { cost: 0, quantity: 1, unit: 'kg' };
                        const totalCost = productCost.cost * productCost.quantity;

                        return (
                          <div
                            key={item}
                            className={`grid grid-cols-12 gap-4 p-4 rounded-xl border transition-all ${
                              isDark 
                                ? 'border-slate-700 hover:bg-slate-800/50 bg-slate-800/30' 
                                : 'border-violet-100 hover:bg-violet-50 bg-white'
                            }`}
                          >
                            <div className="col-span-5 flex items-center">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item}
                              </span>
                            </div>
                            
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={productCost.cost || ''}
                                onChange={(e) => updateProductCost(item, activeCategory, 'cost', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-center text-sm ${
                                  isDark 
                                    ? 'bg-slate-800 border-slate-600 text-white' 
                                    : 'bg-white border-violet-200 text-slate-900'
                                }`}
                                placeholder="0.0"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={productCost.quantity || ''}
                                onChange={(e) => updateProductCost(item, activeCategory, 'quantity', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-center text-sm ${
                                  isDark 
                                    ? 'bg-slate-800 border-slate-600 text-white' 
                                    : 'bg-white border-violet-200 text-slate-900'
                                }`}
                                placeholder="1"
                              />
                            </div>
                            
                            <div className="col-span-1">
                              <select
                                value={productCost.unit || 'kg'}
                                onChange={(e) => updateProductCost(item, activeCategory, 'unit', e.target.value)}
                                className={`w-full px-2 py-2 rounded-lg border text-center text-xs ${
                                  isDark 
                                    ? 'bg-slate-800 border-slate-600 text-white' 
                                    : 'bg-white border-violet-200 text-slate-900'
                                }`}
                              >
                                <option value="kg">kg</option>
                                <option value="L">L</option>
                                <option value="pcs">pcs</option>
                                <option value="box">boîte</option>
                                <option value="m">m</option>
                                <option value="m²">m²</option>
                              </select>
                            </div>
                            
                            <div className="col-span-2 flex items-center justify-center">
                              <span className={`text-sm font-bold ${
                                totalCost > 0 
                                  ? 'text-emerald-600'
                                  : isDark ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                {totalCost > 0 ? totalCost.toLocaleString() : '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-violet-100'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${getKPIColor()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpi}% KPI Budget</span>
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.monthlyTotal.toLocaleString()} DT sur {monthlyBudget.toLocaleString()} DT budget
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                {stats.budgetedItems} articles budgétés
              </div>
              {stats.isOverBudget && (
                <div className="text-sm text-red-600 font-medium">
                  Budget dépassé de {Math.abs(stats.remainingBudget).toLocaleString()} DT
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                  isDark 
                    ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 text-red-400' 
                    : 'border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 shadow-sm ${
                  isDark 
                    ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostTracker;