import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FlaskConical,
  Plus,
  Save,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  BarChart3,
  Trash2,
  TestTube,
  GripVertical,
  Zap,
  Trophy,
  TrendingUp,
  Layers,
  ArrowUp,
  ChevronUp
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

// Draggable ingredient tag - for ingredient library
const DraggableIngredient = ({ ingredient, category, isDark, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'matiere_premiere': return 'from-blue-500 to-blue-600';
      case 'produit_fini': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      } bg-gradient-to-r ${getCategoryColor(category)}`}
    >
      <GripVertical className="w-3 h-3" />
      <span>{ingredient.length > 20 ? ingredient.substring(0, 20) + '...' : ingredient}</span>
    </div>
  );
};

// Formula ingredient item (for ingredients already in the formula)
const FormulaIngredient = ({ ingredient, index, onRemove, isDark, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDark 
          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
          : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
      }`}
    >
      <GripVertical className="w-3 h-3 opacity-50" />
      <span title={ingredient}>
        {ingredient.length > 25 ? ingredient.substring(0, 25) + '...' : ingredient}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-red-500 hover:text-red-400" />
      </button>
    </div>
  );
};

// Droppable zone for formula creation
const FormulaDropZone = ({ formula, isDark, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'formula-dropzone',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`sticky top-4 p-6 rounded-xl border-2 border-dashed min-h-40 transition-all ${
        isOver 
          ? isDark ? 'border-green-500 bg-green-900/20 scale-[1.02]' : 'border-green-500 bg-green-50 scale-[1.02]'
          : isDark ? 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50' : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-100/50'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {formula.name || 'Nouvelle Formule'}
        </h4>
        <div className="flex items-center space-x-2">
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {formula.ingredients?.length || 0} ingrédients
          </div>
          <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </div>
      
      {formula.ingredients && formula.ingredients.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      ) : (
        <div className="text-center py-8">
          <FlaskConical className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Glissez et déposez des ingrédients ici
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Créez votre formule en combinant les ingrédients
          </p>
          {isOver && (
            <div className="mt-2 text-green-500 font-medium text-sm animate-pulse">
              ✨ Relâchez pour ajouter l'ingrédient
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FormulationBuilder = ({ onSave, onCancel, existingData = null, isDark = false }) => {
  const [selectedDate, setSelectedDate] = useState(existingData?.date || new Date().toISOString().split('T')[0]);
  const [formulas, setFormulas] = useState(existingData?.formulas || []);
  const [currentFormula, setCurrentFormula] = useState({
    name: '',
    ingredients: [],
    essais: [],
    maxEssais: 5,
    createdAt: selectedDate,
    target: 80
  });
  const [errors, setErrors] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [activeContainer, setActiveContainer] = useState(null);

  // Removed emballage - only matiere_premiere and produit_fini
  const availableIngredients = {
    matiere_premiere: [
      'Acide citrique', 'Acticide DDQ 50', 'Acticide GDA 50', 'Amidét B112', 'BAC 50 Bactéricide Fangicide',
      'Butyl glycol', 'Chimisol 13 LH FD', 'Chlorhexidine gluconate 20%', 'Colorant bleu acide', 'Colorant jaune tartracina E-102',
      'Colorant marron SAV 648', 'Colorant rose rodhamine', 'Colorant vert olive', 'Colorant violet acide 17', 'Décapant carrelage',
      'Dehscofix CO 125', 'DPG', 'Eau déminéralisée', 'EDTA-Masqual EDTA Na', 'Eltesol SC 93',
      'Empicol OP 301', 'Empigen BAC 80', 'Empigen BS/FA', 'Empigen OB', 'Empilan KR6',
      'Formol', 'Glutaraldéhyde 50%', 'Glyoxal 40%', 'Gomme xanthane', 'Green Apple LEV',
      'Hydroxypropylméthylcellulose HPMC', 'Isopropyl alcohol IPA', 'Linear Alkyl Benzene Sulfonic Acid LABSA 96%', 'MP Acide nitrique 58%', 'MP Acide phosphorique 85%',
      'MP Extrait de Javel 50°', 'MP Lessive de soude caustique 50%', 'MP Premix Alcalin', 'MP Premix Alcalin Chlore', 'MP Premix CAM 4260',
      'MP Premix CIP 1500', 'MP Premix Dégraissant alimentaire', 'Musk Nokhba', 'Nansa LSS 38/AS', 'NP9',
      'Parfum vanille oude', 'Parfum citron vert', 'Parfum extra lavender', 'Parfum jasmin', 'Parfum lavande',
      'Parfum lemon', 'Parfum MAR', 'Parfum océan bleu', 'Parfum oud cannelle', 'Parfum pear & rose',
      'Parfum pêche', 'Parfum pin parasol', 'Parfum pink comfort', 'Parfum pretty lemon', 'Parfum softinella',
      'Potasse caustique', 'Producto 2000', 'Sel', 'Sinebact CG', 'Sodium Lauryl Ether Sulfate SLES 70%', 'TEA'
    ],
    produit_fini: [
      'Dégraissant alimentaire', 'Agita', 'Atom EC 25', 'Airfresh good vibes', 'CAM 1501',
      'CAM 4102', 'CAM 4260', 'CIP 1073', 'CIP 1273', 'CIP 1500',
      'CIP 2040', 'Crème mains bactéricides', 'Décap Force Four', 'Décasol', 'DEGR MS'
    ]
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFormula = () => {
    if (!currentFormula.name.trim()) {
      setErrors({ formulaName: 'Nom de formule requis' });
      return;
    }

    if (currentFormula.ingredients.length === 0) {
      setErrors({ formulaIngredients: 'Ajoutez au moins un ingrédient' });
      return;
    }

    const newFormula = {
      ...currentFormula,
      id: Date.now(),
      createdAt: selectedDate
    };

    setFormulas(prev => [...prev, newFormula]);
    setCurrentFormula({
      name: '',
      ingredients: [],
      essais: [],
      maxEssais: 5,
      createdAt: selectedDate,
      target: 80
    });
    setErrors({});
  };

  const removeFormula = (formulaId) => {
    setFormulas(prev => prev.filter(f => f.id !== formulaId));
  };

  const addEssai = (formulaId, result) => {
    setFormulas(prev => prev.map(formula => {
      if (formula.id === formulaId && formula.essais.length < formula.maxEssais) {
        return {
          ...formula,
          essais: [...formula.essais, {
            id: Date.now(),
            result,
            date: new Date().toISOString().split('T')[0]
          }]
        };
      }
      return formula;
    }));
  };

  const calculateSuccessRate = (formula) => {
    if (formula.essais.length === 0) return 0;
    const passed = formula.essais.filter(e => e.result === 'passed').length;
    return Math.round((passed / formula.essais.length) * 100);
  };

  const calculateFormulaKPI = (formula) => {
    const successRate = calculateSuccessRate(formula);
    const completionRate = (formula.essais.length / formula.maxEssais) * 100;
    return Math.round((successRate * 0.7) + (completionRate * 0.3));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    
    // Track which container the drag started from
    const id = event.active.id.toString();
    if (id.startsWith('formula_')) {
      setActiveContainer('formula');
    } else if (id.startsWith('matiere_premiere_')) {
      setActiveContainer('matiere_premiere');
    } else if (id.startsWith('produit_fini_')) {
      setActiveContainer('produit_fini');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveContainer(null);

    if (!over || !active.id) return;

    // Handle drop on formula zone
    if (over.id === 'formula-dropzone') {
      const activeIdStr = active.id.toString();
      
      // Check if it's from available ingredients (not already in formula)
      if (activeIdStr.startsWith('matiere_premiere_') || activeIdStr.startsWith('produit_fini_')) {
        const [category, ...ingredientParts] = activeIdStr.split('_');
        // Remove the index part from the end
        const ingredientPartsWithoutIndex = ingredientParts.slice(0, -1);
        const ingredientKey = ingredientPartsWithoutIndex.join('_');
        
        // Find the actual ingredient name
        const fullIngredient = availableIngredients[category]?.find(ing => 
          ing.replace(/\s+/g, '_') === ingredientKey
        );

        if (fullIngredient && !currentFormula.ingredients.includes(fullIngredient)) {
          setCurrentFormula(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, fullIngredient]
          }));
          console.log('✅ Added ingredient to formula:', fullIngredient);
        }
      }
      return;
    }

    // Handle reordering within formula
    if (activeId && over.id && 
        activeId.toString().startsWith('formula_') && 
        over.id.toString().startsWith('formula_')) {
      
      const activeIndex = currentFormula.ingredients.findIndex((_, index) => 
        `formula_${currentFormula.ingredients[index].replace(/\s+/g, '_')}_${index}` === activeId
      );
      const overIndex = currentFormula.ingredients.findIndex((_, index) => 
        `formula_${currentFormula.ingredients[index].replace(/\s+/g, '_')}_${index}` === over.id
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        const newIngredients = arrayMove(currentFormula.ingredients, activeIndex, overIndex);
        setCurrentFormula(prev => ({
          ...prev,
          ingredients: newIngredients
        }));
        console.log('✅ Reordered ingredients in formula');
      }
    }
  };

  const removeIngredientFromFormula = (index) => {
    setCurrentFormula(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formulas.length === 0) {
      newErrors.noFormulas = "Veuillez créer au moins une formule";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateGlobalKPI = () => {
    if (formulas.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    formulas.forEach(formula => {
      const weight = Math.max(1, formula.essais.length);
      const formulaKPI = calculateFormulaKPI(formula);
      totalWeightedScore += formulaKPI * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const kpiValue = calculateGlobalKPI();
    
    const formulationData = {
      value: kpiValue,
      date: selectedDate,
      formulas: formulas.map(formula => ({
        ...formula,
        kpi: calculateFormulaKPI(formula),
        successRate: calculateSuccessRate(formula)
      })),
      currentFormula: currentFormula.ingredients.length > 0 ? currentFormula : null,
      type: 'formulation'
    };
    
    onSave('rnd', 'formulation_builder', formulationData, '');
  };

  // Chart data for success rates
  const getChartData = () => {
    return formulas.map(formula => ({
      name: formula.name.length > 15 ? formula.name.substring(0, 15) + '...' : formula.name,
      fullName: formula.name,
      successRate: calculateSuccessRate(formula),
      kpi: calculateFormulaKPI(formula),
      essais: formula.essais.length,
      maxEssais: formula.maxEssais,
      target: formula.target || 80
    }));
  };

  const getChartOptions = () => {
    const data = getChartData();
    
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#475569',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#E2E8F0' : '#1E293B'
        },
        formatter: function(params) {
          const dataIndex = params[0].dataIndex;
          const item = data[dataIndex];
          return `${item.fullName}<br/>
                  Taux de Réussite: ${item.successRate}%<br/>
                  KPI Formule: ${item.kpi}%<br/>
                  Essais: ${item.essais}/${item.maxEssais}<br/>
                  Cible: ${item.target}%`;
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { 
          color: isDark ? '#94A3B8' : '#64748B', 
          fontSize: 11,
          rotate: data.length > 4 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#E2E8F0' } },
        axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB', type: 'dashed' } }
      },
      series: [
        {
          name: 'Taux de Réussite',
          type: 'bar',
          data: data.map(item => item.successRate),
          itemStyle: { 
            color: '#10B981',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%'
        },
        {
          name: 'KPI Formule',
          type: 'line',
          data: data.map(item => item.kpi),
          lineStyle: { color: '#8B5CF6', width: 3 },
          itemStyle: { color: '#8B5CF6' },
          smooth: true
        },
        {
          name: 'Cible',
          type: 'line',
          data: data.map(item => item.target),
          lineStyle: { color: '#F59E0B', type: 'dashed', width: 2 },
          itemStyle: { color: '#F59E0B' },
          symbol: 'none'
        }
      ]
    };
  };

  const baseInputClasses = `w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:ring-2 focus:outline-none ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-green-500 focus:ring-green-500/20' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-green-500 focus:ring-green-500/30'
  }`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border-0 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-5 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Constructeur de Formulations
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Création de formules par glisser-déposer et suivi des essais avec KPI individuels
                </p>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className={`p-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-8 space-y-8">
            
            {/* Date Selection */}
            <div className="max-w-md">
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date de Création</span>
                </div>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={baseInputClasses}
              />
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Improved Layout: Formula Builder First, then Ingredients */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Formula Builder */}
                <div className="space-y-6">
                  <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Constructeur de Formule
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                        Nom de la Formule
                      </label>
                      <input
                        type="text"
                        value={currentFormula.name}
                        onChange={(e) => setCurrentFormula(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Dégraissant Éco-Responsable"
                        className={`${baseInputClasses} ${errors.formulaName ? (isDark ? 'border-red-500/70' : 'border-red-500') : ''}`}
                      />
                      {errors.formulaName && (
                        <span className="text-xs text-red-500 mt-1">{errors.formulaName}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                          Max Essais
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={currentFormula.maxEssais}
                          onChange={(e) => setCurrentFormula(prev => ({ ...prev, maxEssais: parseInt(e.target.value) || 5 }))}
                          className={baseInputClasses}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                          Cible (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentFormula.target}
                          onChange={(e) => setCurrentFormula(prev => ({ ...prev, target: parseInt(e.target.value) || 80 }))}
                          className={baseInputClasses}
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={addFormula}
                      disabled={!currentFormula.name.trim() || currentFormula.ingredients.length === 0}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                        !currentFormula.name.trim() || currentFormula.ingredients.length === 0
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Créer la Formule</span>
                    </button>
                    
                    {errors.formulaIngredients && (
                      <span className="text-xs text-red-500">{errors.formulaIngredients}</span>
                    )}
                  </div>
                </div>
                
                {/* Right: Drop Zone with separate SortableContext for formula ingredients */}
                <div>
                  <SortableContext 
                    items={currentFormula.ingredients.map((ingredient, index) => 
                      `formula_${ingredient.replace(/\s+/g, '_')}_${index}`
                    )}
                    strategy={rectSortingStrategy}
                  >
                    <FormulaDropZone
                      formula={currentFormula}
                      isDark={isDark}
                    >
                      {currentFormula.ingredients.map((ingredient, index) => (
                        <FormulaIngredient
                          key={`formula_${ingredient.replace(/\s+/g, '_')}_${index}`}
                          id={`formula_${ingredient.replace(/\s+/g, '_')}_${index}`}
                          ingredient={ingredient}
                          index={index}
                          onRemove={removeIngredientFromFormula}
                          isDark={isDark}
                        />
                      ))}
                    </FormulaDropZone>
                  </SortableContext>
                </div>
              </div>

              {/* Ingredients Library - Each category in its own SortableContext */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Bibliothèque d'Ingrédients
                  </h4>
                  <ArrowUp className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                
                {Object.entries(availableIngredients).map(([category, ingredients]) => {
                  const categoryLabels = {
                    matiere_premiere: 'Matières Premières',
                    produit_fini: 'Produits Finis'
                  };
                  
                  const categoryIcons = {
                    matiere_premiere: FlaskConical,
                    produit_fini: TestTube
                  };
                  
                  const Icon = categoryIcons[category];
                  
                  // Create separate IDs for each category
                  const categoryItemIds = ingredients.map((ingredient, index) => 
                    `${category}_${ingredient.replace(/\s+/g, '_')}_${index}`
                  );
                  
                  return (
                    <div key={category} className={`p-6 rounded-xl border ${
                      isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <Icon className={`w-5 h-5 ${
                          category === 'matiere_premiere' ? 'text-blue-500' : 'text-green-500'
                        }`} />
                        <h5 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {categoryLabels[category]} ({ingredients.length})
                        </h5>
                      </div>
                      
                      {/* Separate SortableContext for each category */}
                      <SortableContext 
                        items={categoryItemIds}
                        strategy={rectSortingStrategy}
                      >
                        <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto">
                          {ingredients.map((ingredient, index) => (
                            <DraggableIngredient
                              key={`${category}_${ingredient.replace(/\s+/g, '_')}_${index}`}
                              id={`${category}_${ingredient.replace(/\s+/g, '_')}_${index}`}
                              ingredient={ingredient}
                              category={category}
                              isDark={isDark}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>
                {activeId ? (
                  <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg shadow-2xl opacity-90 transform scale-105">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-3 h-3" />
                      <span className="font-medium">Glissez vers la zone de formule</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Created Formulas */}
            {formulas.length > 0 && (
              <div className="space-y-6">
                <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Formules Créées ({formulas.length})
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {formulas.map((formula) => {
                    const successRate = calculateSuccessRate(formula);
                    const formulaKPI = calculateFormulaKPI(formula);
                    return (
                      <div key={formula.id} className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        isDark 
                          ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}>
                        {/* Formula Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h5 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {formula.name}
                            </h5>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {formula.ingredients.slice(0, 3).map((ingredient, index) => (
                                <span key={index} className={`px-2 py-1 rounded text-xs ${
                                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {ingredient.length > 12 ? ingredient.substring(0, 12) + '...' : ingredient}
                                </span>
                              ))}
                              {formula.ingredients.length > 3 && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  isDark ? 'bg-slate-600 text-slate-400' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  +{formula.ingredients.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFormula(formula.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark 
                                ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                                : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* KPI Display */}
                        <div className={`mb-4 p-4 rounded-lg ${
                          formulaKPI >= (formula.target || 80)
                            ? isDark ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200'
                            : formulaKPI >= 60
                            ? isDark ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'
                            : isDark ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${
                              formulaKPI >= (formula.target || 80)
                                ? isDark ? 'text-green-400' : 'text-green-700'
                                : formulaKPI >= 60
                                ? isDark ? 'text-amber-400' : 'text-amber-700'
                                : isDark ? 'text-red-400' : 'text-red-700'
                            }`}>
                              KPI Formule
                            </span>
                            <span className={`text-2xl font-bold ${
                              formulaKPI >= (formula.target || 80) ? 'text-green-600' :
                              formulaKPI >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formulaKPI}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Réussite: {successRate}%
                              </span>
                            </div>
                            <div>
                              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Essais: {formula.essais.length}/{formula.maxEssais}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Essai Controls */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addEssai(formula.id, 'passed')}
                            disabled={formula.essais.length >= formula.maxEssais}
                            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              formula.essais.length >= formula.maxEssais
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Réussi</span>
                          </button>
                          <button
                            onClick={() => addEssai(formula.id, 'failed')}
                            disabled={formula.essais.length >= formula.maxEssais}
                            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              formula.essais.length >= formula.maxEssais
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Échoué</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chart */}
            {formulas.length > 0 && (
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Performance des Formules
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Taux de réussite et KPI par formule
                    </p>
                  </div>
                </div>
                
                <ReactECharts 
                  option={getChartOptions()} 
                  style={{ height: '350px' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            )}

            {/* Global KPI Summary */}
            <div className={`p-5 rounded-xl border ${
              isDark 
                ? calculateGlobalKPI() >= 80 
                  ? 'bg-green-900/20 border-green-700/30' 
                  : 'bg-red-900/20 border-red-700/30'
                : calculateGlobalKPI() >= 80 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    calculateGlobalKPI() >= 80 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isDark 
                      ? calculateGlobalKPI() >= 80 ? 'text-green-400' : 'text-red-400'
                      : calculateGlobalKPI() >= 80 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Performance Globale des Formulations
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl font-bold ${
                    calculateGlobalKPI() >= 80 
                      ? isDark ? 'text-green-400' : 'text-green-600' 
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {calculateGlobalKPI()}%
                  </span>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    calculateGlobalKPI() >= 80 
                      ? isDark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'
                      : isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    {calculateGlobalKPI() >= 80 ? 'Objectif Atteint' : 'À Améliorer'}
                  </div>
                </div>
              </div>
            </div>

            {errors.noFormulas && (
              <div className={`text-center py-8 border-2 border-dashed rounded-xl ${
                isDark ? 'border-red-700/50 bg-red-900/20' : 'border-red-300 bg-red-50'
              }`}>
                <p className="text-red-600 font-medium">{errors.noFormulas}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={formulas.length === 0}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 ${
                formulas.length === 0 
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-md hover:from-green-600 hover:to-green-700'
              }`}
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
  );
};

// Export the component as default
export { FormulationBuilder as default };