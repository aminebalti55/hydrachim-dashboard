import React, { useState, useEffect, useCallback } from 'react';
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
  Calendar,
  Edit3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  Timer,
  Package,
  Check,
  CalendarDays,
  Loader2
} from 'lucide-react';

const ProductDevelopmentTracker = ({ onSave, onCancel, existingData = null, isDark = false, rndService = null }) => {
  // Get current system date
  const aujourdhui = new Date();
  
  // Date utility functions
  const obtenirPremierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const obtenirDernierJourMois = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const obtenirNomMois = (date) => {
    const mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois[new Date(date).getMonth()];
  };

  // Custom date formatting function
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

  // States
  const [dateSelectionnee, setDateSelectionnee] = useState(
    existingData?.date || aujourdhui.toISOString().split('T')[0]
  );
  const [objectifMensuel, setObjectifMensuel] = useState(existingData?.monthlyTarget || 85);
  const [produits, setProduits] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [erreurs, setErreurs] = useState({});
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '',
    type: 'nouveau_produit',
    dateDebut: aujourdhui.toISOString().split('T')[0],
    dateFin: '',
    estTermine: false,
    dateTerminaison: null
  });

  // Custom Calendar Component (Enhanced like Energy Consumption)
  const CustomCalendar = () => {
    const currentDate = new Date();
    const [viewDate, setViewDate] = useState(new Date(dateSelectionnee));
    
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
        const isSelected = dayDate.toDateString() === new Date(dateSelectionnee).toDateString();
        
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
      const selectedDate = dayObj.date.toISOString().split('T')[0];
      setDateSelectionnee(selectedDate);
      setShowCalendar(false);
      // Load data for the selected date
      loadDataForDate(selectedDate);
    };
    
    return (
      <div className={`absolute top-full mt-3 z-50 rounded-xl shadow-xl border overflow-hidden ${
        isDark 
          ? 'bg-slate-900 border-slate-700 shadow-slate-900/50' 
          : 'bg-white border-emerald-200 shadow-emerald-100/50'
      }`} style={{ width: '280px' }}>
        
        {/* Calendar Header */}
        <div className={`px-3 py-3 ${
          isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-emerald-500 to-green-600'
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
                    ? isDark ? 'text-white hover:bg-emerald-600' : 'text-slate-900 hover:bg-emerald-500 hover:text-white'
                    : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
                  }
                  ${dayObj.isSelected 
                    ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300 shadow-lg' 
                    : ''
                  }
                  ${dayObj.isToday && !dayObj.isSelected
                    ? isDark 
                      ? 'bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-500' 
                      : 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
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
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-emerald-100 bg-emerald-50/50'
        }`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const todayDate = currentDate.toISOString().split('T')[0];
                setDateSelectionnee(todayDate);
                setShowCalendar(false);
                loadDataForDate(todayDate);
              }}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                isDark 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              Aujourd'hui
            </button>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatDate(new Date(dateSelectionnee), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Load data for a specific date from the database
  const loadDataForDate = useCallback(async (selectedDate) => {
    setIsLoading(true);
    setErreurs({});
    
    try {
      let kpiData = null;
      
      // Try to get data from database service if available
      if (rndService && rndService.getKPIValueForMonth) {
        try {
          kpiData = await rndService.getKPIValueForMonth('rnd', 'product_development_time', selectedDate);
        } catch (error) {
          console.warn('Database service error, falling back to localStorage:', error);
        }
      }
      
      // Fallback to localStorage if no database service or if database call fails
      if (!kpiData) {
        const targetMonth = obtenirPremierJourMois(selectedDate);
        const monthKey = targetMonth.toISOString().split('T')[0];
        const savedDataKey = `rnd_product_development_${monthKey}`;
        const savedData = localStorage.getItem(savedDataKey);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            kpiData = {
              data: {
                monthlyTarget: parsedData.monthlyTarget,
                products: parsedData.products
              }
            };
          } catch (parseError) {
            console.error('Error parsing localStorage data:', parseError);
          }
        }
      }
      
      if (kpiData && kpiData.data) {
        // Transform database products to component format if needed
        const products = kpiData.data.products || [];
        const transformedProducts = products.map(product => {
          // Ensure all required fields are present
          return {
            id: product.id || Date.now() + Math.random(),
            nom: product.nom || product.name || product.product_name || '',
            type: product.type || product.project_type || 'nouveau_produit',
            dateDebut: product.dateDebut || product.start_date || '',
            dateFin: product.dateFin || product.end_date || '',
            semainesDeveloppement: product.semainesDeveloppement || product.dev_weeks || 0,
            estTermine: product.estTermine || product.is_completed || false,
            dateTerminaison: product.dateTerminaison || product.completion_date || null,
            creeA: product.creeA || product.created_at || new Date().toISOString()
          };
        });
        
        setProduits(transformedProducts);
        setObjectifMensuel(kpiData.data.monthlyTarget || 85);
        setOriginalData(kpiData.data);
      } else {
        // No data for this month - clear the list
        setProduits([]);
        setOriginalData(null);
        setObjectifMensuel(85); // Reset to default
      }
      
    } catch (error) {
      console.error('Error loading data for date:', error);
      setErreurs({ loading: 'Erreur lors du chargement des données' });
      setProduits([]);
      setOriginalData(null);
    } finally {
      setIsLoading(false);
    }
  }, [rndService]);

  // Load initial data when component mounts or date changes
  useEffect(() => {
    loadDataForDate(dateSelectionnee);
  }, [dateSelectionnee, loadDataForDate]);

  // Calculate automatic project status
  const calculerStatutProduit = (produit) => {
    const dateActuelle = new Date();
    const dateEcheance = new Date(produit.dateFin);
    
    if (produit.estTermine) {
      const dateTerminaison = produit.dateTerminaison ? new Date(produit.dateTerminaison) : dateActuelle;
      return dateTerminaison <= dateEcheance ? 'termine_a_temps' : 'termine_en_retard';
    } else {
      return dateActuelle > dateEcheance ? 'en_retard' : 'en_cours';
    }
  };

  // Get current month entries
  const obtenirProduitsMois = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    return produits.filter(produit => {
      const dateDebut = new Date(produit.dateDebut);
      const dateFin = new Date(produit.dateFin);
      return (dateDebut <= finMois && dateFin >= debutMois) || 
             (dateFin >= debutMois && dateFin <= finMois);
    });
  };

  // Calculate monthly KPI
  const calculerKPIMensuel = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    const projetsEvalues = produits.filter(produit => {
      const dateDebut = new Date(produit.dateDebut);
      const dateFin = new Date(produit.dateFin);
      return (dateDebut <= finMois && dateFin >= debutMois) || 
             (dateFin >= debutMois && dateFin <= finMois);
    });
    
    if (projetsEvalues.length === 0) return 100;
    
    let scoreTotal = 0;
    
    projetsEvalues.forEach(produit => {
      const statut = calculerStatutProduit(produit);
      
      switch(statut) {
        case 'termine_a_temps':
          scoreTotal += 100;
          break;
        case 'termine_en_retard':
          scoreTotal += 60;
          break;
        case 'en_cours':
          scoreTotal += 85;
          break;
        case 'en_retard':
          scoreTotal += 30;
          break;
        default:
          scoreTotal += 70;
      }
    });
    
    return Math.round(scoreTotal / projetsEvalues.length);
  };

  // Get monthly statistics
  const obtenirStatistiques = () => {
    const debutMois = obtenirPremierJourMois(dateSelectionnee);
    const finMois = obtenirDernierJourMois(dateSelectionnee);
    
    const projetsEvalues = produits.filter(produit => {
      const dateDebut = new Date(produit.dateDebut);
      const dateFin = new Date(produit.dateFin);
      return (dateDebut <= finMois && dateFin >= debutMois) || 
             (dateFin >= debutMois && dateFin <= finMois);
    });
    
    const total = projetsEvalues.length;
    let terminesATemps = 0;
    let terminesEnRetard = 0;
    let enCours = 0;
    let enRetard = 0;
    
    projetsEvalues.forEach(produit => {
      const statut = calculerStatutProduit(produit);
      switch(statut) {
        case 'termine_a_temps':
          terminesATemps++;
          break;
        case 'termine_en_retard':
          terminesEnRetard++;
          break;
        case 'en_cours':
          enCours++;
          break;
        case 'en_retard':
          enRetard++;
          break;
      }
    });
    
    const dateMoisSelectionne = new Date(dateSelectionnee);
    const estMoisActuel = dateMoisSelectionne.getMonth() === aujourdhui.getMonth() && 
                         dateMoisSelectionne.getFullYear() === aujourdhui.getFullYear();
    
    return {
      total,
      terminesATemps,
      terminesEnRetard,
      enCours,
      enRetard,
      estMoisActuel,
      tauxReussite: total > 0 ? Math.round((terminesATemps / total) * 100) : 0
    };
  };

  // Calculate development weeks
  const calculerSemainesDeveloppement = () => {
    if (!nouveauProduit.dateDebut || !nouveauProduit.dateFin) return 0;
    
    const dateDebut = new Date(nouveauProduit.dateDebut);
    const dateFin = new Date(nouveauProduit.dateFin);
    const diffTemps = Math.abs(dateFin - dateDebut);
    const semaines = diffTemps / (7 * 24 * 60 * 60 * 1000);
    return Math.round(semaines * 10) / 10;
  };

  // Add product
  const ajouterProduit = () => {
    if (!nouveauProduit.nom.trim()) {
      setErreurs({ nom: 'Le nom du produit est requis' });
      return;
    }

    if (!nouveauProduit.dateFin) {
      setErreurs({ dateFin: 'La date de fin est requise' });
      return;
    }

    const dateDebut = new Date(nouveauProduit.dateDebut);
    const dateFin = new Date(nouveauProduit.dateFin);
    
    if (dateFin <= dateDebut) {
      setErreurs({ dateFin: 'La date de fin doit être après la date de début' });
      return;
    }

    const produit = {
      id: Date.now(),
      nom: nouveauProduit.nom.trim(),
      type: nouveauProduit.type,
      dateDebut: nouveauProduit.dateDebut,
      dateFin: nouveauProduit.dateFin,
      semainesDeveloppement: calculerSemainesDeveloppement(),
      estTermine: false,
      dateTerminaison: null,
      creeA: new Date().toISOString()
    };

    // Update the products list immediately
    const updatedProducts = [...produits, produit];
    setProduits(updatedProducts);
    
    // Save to localStorage immediately for persistence during session
    const targetMonth = obtenirPremierJourMois(dateSelectionnee);
    const monthKey = targetMonth.toISOString().split('T')[0];
    const savedDataKey = `rnd_product_development_${monthKey}`;
    
    // Create temporary data structure
    const tempData = {
      monthlyTarget: objectifMensuel,
      products: updatedProducts,
      date: dateSelectionnee,
      type: 'product_development_time'
    };
    
    localStorage.setItem(savedDataKey, JSON.stringify(tempData));
    
    // Reset form
    setNouveauProduit({
      nom: '',
      type: 'nouveau_produit',
      dateDebut: aujourdhui.toISOString().split('T')[0],
      dateFin: '',
      estTermine: false,
      dateTerminaison: null
    });
    setAfficherFormulaire(false);
    setErreurs({});
    
    // Show feedback that project was added
    console.log('✅ Projet ajouté:', produit.nom);
  };

  // Remove product
  const supprimerProduit = (produitId) => {
    const updatedProducts = produits.filter(p => p.id !== produitId);
    setProduits(updatedProducts);
    
    // Update localStorage immediately
    const targetMonth = obtenirPremierJourMois(dateSelectionnee);
    const monthKey = targetMonth.toISOString().split('T')[0];
    const savedDataKey = `rnd_product_development_${monthKey}`;
    
    const tempData = {
      monthlyTarget: objectifMensuel,
      products: updatedProducts,
      date: dateSelectionnee,
      type: 'product_development_time'
    };
    
    localStorage.setItem(savedDataKey, JSON.stringify(tempData));
  };

  // Mark project as completed
  const marquerProjetTermine = (produitId) => {
    const updatedProducts = produits.map(produit => 
      produit.id === produitId ? { 
        ...produit, 
        estTermine: !produit.estTermine,
        dateTerminaison: !produit.estTermine ? new Date().toISOString() : null
      } : produit
    );
    
    setProduits(updatedProducts);
    
    // Update localStorage immediately
    const targetMonth = obtenirPremierJourMois(dateSelectionnee);
    const monthKey = targetMonth.toISOString().split('T')[0];
    const savedDataKey = `rnd_product_development_${monthKey}`;
    
    const tempData = {
      monthlyTarget: objectifMensuel,
      products: updatedProducts,
      date: dateSelectionnee,
      type: 'product_development_time'
    };
    
    localStorage.setItem(savedDataKey, JSON.stringify(tempData));
  };

  // Handle submission
  const gererSoumission = async () => {
    if (produits.length === 0) {
      setErreurs({ produits: 'Ajoutez au moins un produit' });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const kpiMensuel = calculerKPIMensuel();
      const stats = obtenirStatistiques();
      
      const donneesDeveloppement = {
        value: kpiMensuel,
        date: dateSelectionnee,
        monthlyTarget: objectifMensuel,
        products: produits,
        stats: stats,
        type: 'product_development_time'
      };
      
      // Save to localStorage as backup
      const targetMonth = obtenirPremierJourMois(dateSelectionnee);
      const monthKey = targetMonth.toISOString().split('T')[0];
      const savedDataKey = `rnd_product_development_${monthKey}`;
      localStorage.setItem(savedDataKey, JSON.stringify(donneesDeveloppement));
      
      // Call the parent onSave function to handle database saving
      await onSave('rnd', 'product_development_time', donneesDeveloppement, '');
      
      // Show success message
      console.log('✅ Données sauvegardées avec succès pour le mois:', monthKey);
      
      // Reload data to ensure consistency
      setTimeout(async () => {
        await loadDataForDate(dateSelectionnee);
      }, 500);
      
    } catch (error) {
      console.error('Error saving data:', error);
      setErreurs({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsSaving(false);
    }
  };

  const stats = obtenirStatistiques();
  const kpiMensuel = calculerKPIMensuel();
  const produitsMois = obtenirProduitsMois();
  const moisActuel = obtenirNomMois(dateSelectionnee);
  const anneeActuelle = new Date(dateSelectionnee).getFullYear();
  const selectedDateObj = new Date(dateSelectionnee);

  // Get KPI color based on custom target
  const obtenirCouleurKPI = () => {
    if (kpiMensuel >= 95) return 'text-emerald-600';
    if (kpiMensuel >= objectifMensuel) return 'text-blue-600';
    if (kpiMensuel >= objectifMensuel * 0.8) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'
      }`}>
        
        {/* Loading Overlay */}
        {(isLoading || isSaving) && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-60 flex items-center justify-center rounded-2xl">
            <div className={`p-6 rounded-2xl shadow-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isSaving ? 'Sauvegarde en cours...' : 'Chargement...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Header */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Temps de Développement Produits
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  Suivi mensuel intelligent des délais de développement
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  KPI Mensuel
                </div>
                <div 
                  className={`text-3xl font-light cursor-help transition-all hover:scale-105 ${obtenirCouleurKPI()}`}
                  title={`📊 FORMULE KPI DÉVELOPPEMENT AUTOMATIQUE

🎯 CALCUL DU SCORE:
• KPI = Moyenne pondérée des performances projet

📋 SITUATION ACTUELLE:
• Mois: ${moisActuel} ${anneeActuelle}
• Projets évalués: ${stats.total}
• Terminés à temps: ${stats.terminesATemps}
• Terminés en retard: ${stats.terminesEnRetard}
• En cours (à temps): ${stats.enCours}
• En cours (en retard): ${stats.enRetard}
• Objectif personnalisé: ${objectifMensuel}%

📈 SCORING AUTOMATIQUE:
• ✅ Terminé à temps: 100 points
• ⚠️ Terminé en retard: 60 points  
• 🔄 En cours dans délais: 85 points
• 🚨 En cours en retard: 30 points

🤖 LOGIQUE AUTOMATIQUE:
• Le système compare automatiquement:
  - Date actuelle vs Date d'échéance
  - Date de terminaison vs Date d'échéance prévue
• Aucune saisie manuelle requise

📊 EXEMPLE DE CALCUL:
• Score moyen = Σ(scores individuels) ÷ nombre de projets
• Score actuel: ${kpiMensuel}%

💡 INTERPRÉTATION:
• 95-100%: Excellence opérationnelle
• ${objectifMensuel}-94%: Performance satisfaisante
• ${Math.round(objectifMensuel * 0.8)}-${objectifMensuel-1}%: Attention requise
• <${Math.round(objectifMensuel * 0.8)}%: Action corrective urgente

Score actuel: ${kpiMensuel}%
${kpiMensuel >= objectifMensuel ? '✅ OBJECTIF ATTEINT' : '🚨 SOUS LE SEUIL'}`}
                >
                  {kpiMensuel}%
                </div>
              </div>
              <button 
                onClick={onCancel} 
                disabled={isSaving}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark 
                      ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' 
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Smart Control Panel */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <div className="flex items-center justify-between">
            
            {/* Enhanced Date Selector */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-medium transition-all hover:scale-105 ${
                    isSaving 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark 
                        ? 'bg-slate-800 border-slate-600 text-white hover:border-emerald-500 shadow-lg' 
                        : 'bg-white border-emerald-200 text-slate-900 hover:border-emerald-400 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(selectedDateObj, 'MMMM yyyy')}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showCalendar ? 'rotate-90' : ''}`} />
                </button>

                {/* Calendar Backdrop */}
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
                stats.estMoisActuel 
                  ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {stats.estMoisActuel ? '📅 Mois actuel' : '📋 Historique'}
              </div>
            </div>

            {/* Target and Toggle Button */}
            <div className="flex items-center space-x-4">
              {/* Editable Target */}
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-emerald-200'
              }`}>
                <Target className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Objectif:</div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setObjectifMensuel(Math.max(0, objectifMensuel - 5))}
                    disabled={isSaving}
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200' 
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                    }`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={objectifMensuel}
                    onChange={(e) => setObjectifMensuel(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    disabled={isSaving}
                    className={`w-14 text-center text-sm font-semibold rounded-md py-1 outline-none ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-emerald-200 text-slate-900 focus:border-emerald-500'
                    } border`}
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>%</span>
                  <button
                    onClick={() => setObjectifMensuel(Math.min(100, objectifMensuel + 5))}
                    disabled={isSaving}
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200' 
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Form Toggle Button */}
              <button
                onClick={() => setAfficherFormulaire(!afficherFormulaire)}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : afficherFormulaire
                      ? isDark ? 'bg-slate-600 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : isDark ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {afficherFormulaire ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{afficherFormulaire ? 'Fermer' : 'Nouveau Projet'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Layout with conditional side menu */}
        <div className="flex-1 min-h-0 flex">
          
          {/* LEFT - Side Menu for new project (conditional) */}
          {afficherFormulaire && (
            <div className={`w-80 flex flex-col border-r ${
              isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-emerald-50/30 border-emerald-100'
            }`}>
              
              {/* Form header */}
              <div className={`px-6 py-4 border-b flex-shrink-0 ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-emerald-100 bg-white'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nouveau Projet</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Créez votre projet</p>
                  </div>
                </div>
              </div>

              {/* Form with scroll */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-900'
                  }`}>
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={nouveauProduit.nom}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Ex: Application Mobile V2"
                    disabled={isSaving}
                    className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500' 
                          : 'bg-white border-emerald-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                    }`}
                  />
                  {erreurs.nom && (
                    <p className="mt-1 text-xs text-red-600">{erreurs.nom}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-900'
                  }`}>
                    Type
                  </label>
                  <select
                    value={nouveauProduit.type}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, type: e.target.value }))}
                    disabled={isSaving}
                    className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-slate-800 border-slate-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-emerald-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  >
                    <option value="nouveau_produit">Nouveau produit</option>
                    <option value="amelioration">Amélioration</option>
                    <option value="reformulation">Reformulation</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-900'
                  }`}>
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={nouveauProduit.dateDebut}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, dateDebut: e.target.value }))}
                    disabled={isSaving}
                    className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-slate-800 border-slate-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-emerald-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-900'
                  }`}>
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={nouveauProduit.dateFin}
                    onChange={(e) => setNouveauProduit(prev => ({ ...prev, dateFin: e.target.value }))}
                    disabled={isSaving}
                    className={`w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors ${
                      isSaving 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDark 
                          ? 'bg-slate-800 border-slate-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-emerald-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {erreurs.dateFin && (
                    <p className="mt-1 text-xs text-red-600">{erreurs.dateFin}</p>
                  )}
                </div>

                {nouveauProduit.dateDebut && nouveauProduit.dateFin && calculerSemainesDeveloppement() > 0 && (
                  <div className={`text-center text-sm py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Durée : <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{calculerSemainesDeveloppement()} semaines</span>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={ajouterProduit}
                    disabled={!nouveauProduit.nom.trim() || !nouveauProduit.dateFin || isSaving}
                    className={`w-full py-3 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                      (!nouveauProduit.nom.trim() || !nouveauProduit.dateFin || isSaving)
                        ? 'bg-slate-400 text-white cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Créer le projet</span>
                    </div>
                  </button>
                </div>

                <div className="h-4"></div>
              </div>
            </div>
          )}
          
          {/* RIGHT - Projects list */}
          <div className="flex-1 flex flex-col">
            
            {/* List header */}
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-emerald-100 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Projets de {moisActuel}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {produitsMois.length} projet(s) • {stats.terminesATemps} terminé(s) à temps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects list */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${
                      isDark ? 'text-slate-400' : 'text-slate-400'
                    }`} />
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Chargement...
                    </h3>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      Récupération des données du mois
                    </p>
                  </div>
                </div>
              ) : produitsMois.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Timer className={`w-12 h-12 mx-auto mb-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-400'
                    }`} />
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Aucun projet ce mois
                    </h3>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      Cliquez sur "Nouveau Projet" pour créer votre premier projet
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {produitsMois.map((produit) => {
                    const infoProduit = produit.type === 'nouveau_produit' 
                      ? { icon: Zap, couleur: 'bg-blue-500', label: 'Nouveau Produit' }
                      : produit.type === 'amelioration'
                      ? { icon: Activity, couleur: 'bg-purple-500', label: 'Amélioration' }
                      : { icon: Package, couleur: 'bg-orange-500', label: 'Reformulation' };
                    
                    const IconeProduit = infoProduit.icon;
                    const statut = calculerStatutProduit(produit);
                    
                    const infoStatut = {
                      'termine_a_temps': { 
                        couleur: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200', 
                        label: '✅ Terminé À Temps'
                      },
                      'termine_en_retard': { 
                        couleur: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', 
                        label: '⚠️ Terminé En Retard'
                      },
                      'en_cours': { 
                        couleur: 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white', 
                        label: '🔄 En Cours'
                      },
                      'en_retard': { 
                        couleur: 'bg-red-600 text-white dark:bg-red-700 dark:text-white', 
                        label: '🚨 En Retard'
                      }
                    };
                    
                    const statutInfo = infoStatut[statut] || infoStatut['en_cours'];
                    
                    return (
                      <div 
                        key={produit.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 hover:shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg ${infoProduit.couleur} flex items-center justify-center flex-shrink-0`}>
                            <IconeProduit className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {produit.nom}
                            </h4>
                            <div className={`flex items-center space-x-3 text-xs mt-1 ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Début: {new Date(produit.dateDebut).toLocaleDateString('fr-FR')}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Fin: {new Date(produit.dateFin).toLocaleDateString('fr-FR')}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                produit.type === 'nouveau_produit'
                                  ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                                  : produit.type === 'amelioration'
                                  ? 'bg-purple-600 text-white dark:bg-purple-700 dark:text-white'
                                  : 'bg-orange-600 text-white dark:bg-orange-700 dark:text-white'
                              }`}>
                                {infoProduit.label}
                              </span>
                              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {produit.semainesDeveloppement} sem.
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutInfo.couleur}`}>
                                {statutInfo.label}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => marquerProjetTermine(produit.id)}
                              disabled={isSaving}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSaving 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : produit.estTermine
                                    ? 'bg-emerald-500 text-white'
                                    : isDark 
                                      ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-700' 
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              {produit.estTermine ? 'Terminé' : 'Marquer'}
                            </button>
                            <button
                              onClick={() => supprimerProduit(produit.id)}
                              disabled={isSaving}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                isSaving 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : isDark 
                                    ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {erreurs.produits && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{erreurs.produits}</p>
                </div>
              )}

              {erreurs.loading && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-amber-700 bg-amber-900/20' : 'border-amber-300 bg-amber-50'
                }`}>
                  <p className="text-amber-600 font-semibold text-sm">{erreurs.loading}</p>
                </div>
              )}

              {erreurs.submit && (
                <div className={`text-center py-4 border-2 border-dashed rounded-xl mt-6 ${
                  isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="text-red-500 font-semibold text-sm">{erreurs.submit}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex-shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${obtenirCouleurKPI()}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{kpiMensuel}% KPI Mensuel</span>
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.terminesATemps}/{stats.total} projets terminés à temps
              </div>
              <div className={`text-sm font-medium ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {moisActuel} {anneeActuelle}
              </div>
              <div className={`text-sm font-medium ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                Objectif: ≥{objectifMensuel}%
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                  isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark 
                      ? 'border-red-600 hover:border-red-500 hover:bg-red-900/20 text-red-400' 
                      : 'border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={gererSoumission}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 shadow-sm ${
                  isSaving 
                    ? 'opacity-50 cursor-not-allowed bg-emerald-600' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDevelopmentTracker;