// Updated KPI definitions - Warehouse section with only cost tracking
export const kpiDefinitions = {
  rnd: {
    id: 'rnd',
    name: {
      en: 'Research & Development Laboratory',
      fr: 'Laboratoire de Recherche & Développement'
    },
    kpis: [
      // UPDATED INTERACTIVE R&D KPIs with correct IDs that match the components
      {
        id: 'product_development_time',
        name: {
          en: 'Product Development Time',
          fr: 'Temps de Développement de Nouveaux Produits'
        },
        description: {
          en: 'Smart tracking with deadline detection and global performance calculation',
          fr: 'Suivi intelligent avec détection des retards d\'échéance et calcul de performance globale'
        },
        unit: '%',
        type: 'percentage',
        target: 80,
        category: 'efficiency',
        trackingType: 'interactive',
        features: ['project_tracking', 'deadline_detection', 'auto_performance', 'timeline_analysis']
      },
      {
        id: 'formulation_development',
        name: {
          en: 'New Formulation Development',
          fr: 'Développement de Nouvelles Formules'
        },
        description: {
          en: 'Monthly objectives tracking with development timelines and deadline management',
          fr: 'Suivi des objectifs mensuels avec délais de développement et gestion des échéances'
        },
        unit: '%',
        type: 'percentage',
        target: 75,
        category: 'development',
        trackingType: 'interactive',
        features: ['monthly_goals', 'timeline_tracking', 'deadline_management', 'completion_analysis']
      },
      // TRADITIONAL R&D KPIs (kept for compatibility)
      {
        id: 'new_product_dev_time_legacy',
        name: {
          en: 'New Product Development Time (Legacy)',
          fr: 'Temps de Développement de Nouveaux Produits (Ancien)'
        },
        description: {
          en: 'Time taken from idea to lab validation',
          fr: 'Temps pris de l\'idée à la validation en laboratoire'
        },
        unit: 'days',
        type: 'number',
        target: 30,
        category: 'efficiency'
      },
      {
        id: 'new_formulas_quarter',
        name: {
          en: 'New Formulas Developed per Quarter',
          fr: 'Nouvelles Formules Développées par Trimestre'
        },
        description: {
          en: 'Number of new formulations completed',
          fr: 'Nombre de nouvelles formulations terminées'
        },
        unit: 'count',
        type: 'number',
        target: 5,
        category: 'productivity'
      },
      {
        id: 'lab_trial_success_rate',
        name: {
          en: 'Success Rate of Lab Trials',
          fr: 'Taux de Réussite des Essais de Laboratoire'
        },
        description: {
          en: '% of lab trials that proceed to industrial scale',
          fr: '% d\'essais de laboratoire qui passent à l\'échelle industrielle'
        },
        unit: '%',
        type: 'percentage',
        target: 80,
        category: 'quality'
      }
    ]
  },
  quality: {
    id: 'quality',
    name: {
      en: 'Quality Control',
      fr: 'Contrôle Qualité'
    },
    kpis: [
      // UPDATED QUALITY KPIs - REMOVED quality_response_time card
      {
        id: 'material_batch_acceptance_rate',
        name: {
          en: 'Raw Materials & Packaging Non-Conformity Rate at Reception',
          fr: 'Taux des Matières Premières et Emballage Non Conforme à la Réception'
        },
        description: {
          en: 'Rate of raw materials and packaging rejected upon arrival with manual inspection tracking',
          fr: 'Taux de matières premières et emballages rejetés à l\'arrivée avec suivi d\'inspection manuelle'
        },
        unit: '%',
        type: 'percentage',
        target: 90,
        category: 'quality',
        trackingType: 'reception-based',
        features: ['daily_tracking', 'conformity_check', 'automatic_calculation', 'weekly_performance']
      },
      {
        id: 'production_waste_rate',
        name: {
          en: 'Production Waste Rate',
          fr: 'Taux de Déchet de Production'
        },
        description: {
          en: 'Percentage of materials wasted during production process',
          fr: 'Pourcentage de matériaux gaspillés pendant le processus de production'
        },
        unit: '%',
        type: 'percentage',
        target: 2,
        category: 'efficiency',
        trackingType: 'waste-tracking',
        features: ['daily_waste_tracking', 'material_type_classification', 'cost_impact_calculation']
      },
      {
        id: 'raw_materials_inventory_list',
        name: {
          en: 'Raw Materials & Packaging Inventory List',
          fr: 'Liste des Produits Matières Première et Emballage'
        },
        description: {
          en: 'Comprehensive inventory tracking of raw materials and packaging materials with expiry monitoring',
          fr: 'Suivi exhaustif de l\'inventaire des matières premières et emballages avec surveillance des dates de péremption'
        },
        unit: 'items',
        type: 'inventory',
        target: 100,
        category: 'inventory',
        trackingType: 'inventory-based',
        features: ['stock_tracking', 'expiry_monitoring', 'supplier_tracking', 'quantity_alerts']
      },
      {
        id: 'compliance_rate',
        name: {
          en: 'Compliance Rate with Quality Standards',
          fr: 'Taux de Conformité aux Normes de Qualité'
        },
        description: {
          en: '% of formulations meeting internal specs or standards',
          fr: '% de formulations respectant les spécifications internes'
        },
        unit: '%',
        type: 'percentage',
        target: 95,
        category: 'quality'
      }
    ]
  },
  production: {
    id: 'production',
    name: {
      en: 'Production & Mixing Area',
      fr: 'Zone de Production & Mélange'
    },
    kpis: [
      {
        id: 'batch_yield',
        name: {
          en: 'Batch Production Yield',
          fr: 'Rendement de Production par Lot'
        },
        description: {
          en: 'Actual vs. theoretical output',
          fr: 'Production réelle vs. théorique'
        },
        unit: '%',
        type: 'percentage',
        target: 98,
        category: 'efficiency'
      },
      {
        id: 'mixing_time',
        name: {
          en: 'Mixing Time per Batch',
          fr: 'Temps de Mélange par Lot'
        },
        description: {
          en: 'Average time per mixing cycle',
          fr: 'Temps moyen par cycle de mélange'
        },
        unit: 'minutes',
        type: 'number',
        target: 45,
        category: 'efficiency'
      },
      {
        id: 'energy_consumption',
        name: {
          en: 'Energy Consumption per Batch',
          fr: 'Consommation d\'Énergie par Lot'
        },
        description: {
          en: 'Energy usage efficiency',
          fr: 'Efficacité de l\'utilisation d\'énergie'
        },
        unit: 'kWh',
        type: 'number',
        target: 25,
        category: 'sustainability'
      }
    ]
  },
  warehouses: {
    id: 'warehouses',
    name: {
      en: 'Warehouses & Logistics',
      fr: 'Entrepôts & Logistique'
    },
    kpis: [
      // UPDATED: Only cost tracking KPI remains, others removed as requested
      {
        id: 'cost_per_formulation',
        name: {
          en: 'Raw Material Costs',
          fr: 'Coût des Matières Premières et Emballage'
        },
        description: {
          en: 'Comprehensive cost tracking of raw materials and packaging with intelligent budget management',
          fr: 'Suivi complet des coûts des matières premières et emballages avec gestion budgétaire intelligente'
        },
        unit: '%',
        type: 'percentage',
        target: 100,
        category: 'cost',
        trackingType: 'cost-based',
        features: ['budget_tracking', 'cost_per_item', 'budget_alerts', 'cost_optimization']
      },
      {
        id: 'stock_issues_rate',
        name: {
          en: 'Stock Issues Rate',
          fr: 'Taux de Problèmes de Stock'
        },
        description: {
          en: 'Combined rate of expired and out-of-stock items',
          fr: 'Taux combiné d\'articles expirés et en rupture de stock'
        },
        unit: '%',
        type: 'percentage',
        target: 2,
        category: 'efficiency'
      }
    ]
  },
  team: {
    id: 'team',
    name: {
      en: 'Human Resources & Team Performance',
      fr: 'Ressources Humaines & Performance d\'Équipe'
    },
    kpis: [
      {
        id: 'team_productivity_attendance',
        name: {
          en: 'Team Productivity & Attendance',
          fr: 'Productivité et Présence de l\'Équipe'
        },
        description: {
          en: 'Employee attendance tracking with clock in/out times and productivity measurement',
          fr: 'Suivi de la présence des employés avec heures d\'arrivée/départ et mesure de productivité'
        },
        unit: '%',
        type: 'attendance',
        target: 95,
        category: 'productivity',
        trackingType: 'employee-based',
        fields: ['employeeName', 'clockIn', 'clockOut', 'productivity', 'notes']
      },
      {
        id: 'safety_incidents',
        name: {
          en: 'Safety Incidents Management',
          fr: 'Gestion des Incidents de Sécurité'
        },
        description: {
          en: 'Track safety incidents per employee with weekly and monthly targets',
          fr: 'Suivi des incidents de sécurité par employé avec objectifs hebdomadaires et mensuels'
        },
        unit: 'incidents',
        type: 'safety',
        target: 0,
        category: 'safety',
        trackingType: 'employee-incidents',
        fields: ['employeeName', 'incidentCount', 'incidentType', 'severity', 'notes']
      },
      {
        id: 'operator_efficiency',
        name: {
          en: 'Operator Efficiency & Task Management',
          fr: 'Efficacité des Opérateurs et Gestion des Tâches'
        },
        description: {
          en: 'Daily task management and efficiency tracking per operator with drag & drop interface',
          fr: 'Gestion des tâches quotidiennes et suivi d\'efficacité par opérateur avec interface glisser-déposer'
        },
        unit: '%',
        type: 'efficiency',
        target: 85,
        category: 'efficiency',
        trackingType: 'task-based',
        fields: ['employeeName', 'tasks', 'completedTasks', 'workHours', 'efficiency', 'notes']
      }
    ]
  }
};

// Helper function to get KPI by department and id
export const getKPIById = (departmentId, kpiId) => {
  const department = kpiDefinitions[departmentId];
  if (!department) return null;
  return department.kpis.find(kpi => kpi.id === kpiId);
};

// Get all departments
export const getAllDepartments = () => {
  return Object.values(kpiDefinitions);
};

// Get all KPIs for a specific department
export const getKPIsByDepartment = (departmentId) => {
  return kpiDefinitions[departmentId]?.kpis || [];
};

// Get KPI categories
export const getKPICategories = () => {
  return ['quality', 'efficiency', 'productivity', 'cost', 'sustainability', 'service', 'development', 'safety', 'retention', 'inventory'];
};

// Helper functions for team KPIs
export const getTeamKPIById = (kpiId) => {
  return kpiDefinitions.team.kpis.find(kpi => kpi.id === kpiId);
};

export const getEmployeeProductivity = (clockIn, clockOut, tasksCompleted, totalTasks) => {
  const workHours = (new Date(clockOut) - new Date(clockIn)) / (1000 * 60 * 60);
  const taskCompletionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const timeEfficiency = workHours >= 8 ? 100 : (workHours / 8) * 100;
  
  // Weighted formula: 70% task completion + 30% time efficiency
  return Math.round((taskCompletionRate * 0.7) + (timeEfficiency * 0.3));
};

export const calculateWeeklyTeamAverage = (employeeData) => {
  if (!employeeData || employeeData.length === 0) return 0;
  
  const total = employeeData.reduce((sum, emp) => sum + (emp.weeklyAverage || 0), 0);
  return Math.round(total / employeeData.length);
};

export const calculateMonthlyTeamAverage = (weeklyAverages) => {
  if (!weeklyAverages || weeklyAverages.length === 0) return 0;
  
  const total = weeklyAverages.reduce((sum, week) => sum + week, 0);
  return Math.round(total / weeklyAverages.length);
};

// Calculate employee efficiency based on task completion and time management
export const calculateEmployeeEfficiency = (employee) => {
  if (!employee.tasks || employee.tasks.length === 0) return 0;
  
  const completedTasks = employee.tasks.filter(task => task.completed);
  const taskCompletionRate = (completedTasks.length / employee.tasks.length) * 100;
  
  // Calculate time efficiency based on estimated vs actual work hours
  const totalEstimatedMinutes = employee.tasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
  const estimatedHours = totalEstimatedMinutes / 60;
  const timeEfficiency = estimatedHours > 0 ? Math.min(100, (estimatedHours / employee.workHours) * 100) : 100;
  
  // Priority bonus for high-priority completed tasks
  const highPriorityCompleted = completedTasks.filter(task => task.priority === 'high').length;
  const priorityBonus = highPriorityCompleted * 5; // 5% bonus per high-priority task
  
  // Weighted formula: 60% task completion + 25% time efficiency + 15% priority bonus
  const efficiency = (taskCompletionRate * 0.6) + (timeEfficiency * 0.25) + Math.min(priorityBonus, 15);
  
  return Math.round(Math.min(100, efficiency));
};

// Calculate total safety incidents for a team
export const calculateTotalIncidents = (employees) => {
  return employees.reduce((sum, emp) => sum + (emp.incidentCount || 0), 0);
};

// Calculate average productivity for attendance tracking
export const calculateAverageProductivity = (employees) => {
  if (!employees.length) return 0;
  const total = employees.reduce((sum, emp) => sum + (emp.productivity || 0), 0);
  return Math.round(total / employees.length);
};

// Get week number for reporting
export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

// Determine KPI status based on performance vs target 
export const getKPIPerformanceStatus = (value, target, kpiType, kpiId) => {
  if (!value || !target) return 'no-data';
  
  const tolerance = target * 0.1; // 10% tolerance
  
  // For some KPIs, lower is better (e.g., incidents, costs, time, waste)
  const lowerIsBetter = [
    'safety_incidents', 
    'energy_consumption', 
    'mixing_time',
    'new_product_dev_time_legacy',
    'production_waste_rate',
    'stock_issues_rate'
  ];
  
  // For cost KPI, special handling: 100% is excellent (within budget), 0% is poor (over budget)
  if (kpiId === 'cost_per_formulation') {
    if (value === 100) return 'excellent';
    if (value === 0) return 'needs-attention';
    return 'fair';
  }
  
  if (lowerIsBetter.includes(kpiId)) {
    if (value <= target) return 'excellent';
    if (value <= target + tolerance) return 'good';
    return 'needs-attention';
  } else {
    if (value >= target) return 'excellent';
    if (value >= target - tolerance) return 'good';
    return 'needs-attention';
  }
};

// HELPER FUNCTIONS FOR NEW R&D INTERACTIVE KPIs

// Product Development Time helpers
export const calculateProductDevelopmentKPI = (products) => {
  if (!products || products.length === 0) return 0;
  
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

export const calculateDevelopmentEfficiency = (product) => {
  const elapsedTime = calculateElapsedTime(product);
  const targetTime = product.targetWeeks;
  
  if (elapsedTime <= targetTime) {
    return 100;
  } else {
    return Math.round((targetTime / elapsedTime) * 100);
  }
};

export const calculateElapsedTime = (product) => {
  const startDate = new Date(product.startDate);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - startDate);
  const diffWeeks = diffTime / (7 * 24 * 60 * 60 * 1000);
  return Math.round(diffWeeks * 10) / 10;
};

export const isProjectOverdue = (product) => {
  const currentDate = new Date();
  const plannedFinishDate = new Date(product.finishDate);
  return currentDate > plannedFinishDate;
};

export const getDevelopmentStats = (products) => {
  const total = products.length;
  const completed = products.filter(p => p.isCompleted).length;
  const inProgress = products.filter(p => !p.isCompleted && !isProjectOverdue(p)).length;
  const overdue = products.filter(p => isProjectOverdue(p)).length;
  
  // On-time projects: not overdue (regardless of completion status)
  const onTime = products.filter(p => !isProjectOverdue(p)).length;
  const successRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
  
  return { total, completed, inProgress, overdue, onTime, successRate };
};

// Formulation Development helpers
export const calculateFormulationKPI = (formulas, monthlyGoal) => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlyFormulas = formulas.filter(formula => {
    const formulaMonth = formula.finishDate?.substring(0, 7);
    return formulaMonth === currentMonth;
  });
  
  const completedFormulas = monthlyFormulas.filter(f => f.isCompleted);
  
  if (monthlyGoal === 0) return 0;
  
  const achievementRate = (completedFormulas.length / monthlyGoal) * 100;
  return Math.min(Math.round(achievementRate), 100);
};

export const calculateAverageDevelopmentTime = (formulas) => {
  const completedFormulas = formulas.filter(f => f.isCompleted);
  if (completedFormulas.length === 0) return 0;
  
  const totalDays = completedFormulas.reduce((sum, formula) => {
    return sum + calculateFormulaDuration(formula.startDate, formula.finishDate);
  }, 0);
  
  return Math.round(totalDays / completedFormulas.length);
};

export const calculateFormulaDuration = (startDate, finishDate) => {
  if (!startDate || !finishDate) return 0;
  const start = new Date(startDate);
  const finish = new Date(finishDate);
  const diffTime = Math.abs(finish - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getFormulaStatus = (formula) => {
  if (formula.isCompleted) return 'completed';
  
  const today = new Date();
  const finishDate = new Date(formula.finishDate);
  
  if (finishDate < today) return 'overdue';
  return 'in_progress';
};

export const getFormulationStats = (formulas, monthlyGoal) => {
  const currentMonthFormulas = getCurrentMonthFormulas(formulas);
  const total = formulas.length;
  const monthlyTotal = currentMonthFormulas.length;
  const completed = formulas.filter(f => f.isCompleted).length;
  const monthlyCompleted = currentMonthFormulas.filter(f => f.isCompleted).length;
  const inProgress = formulas.filter(f => !f.isCompleted && getFormulaStatus(f) === 'in_progress').length;
  const overdue = formulas.filter(f => getFormulaStatus(f) === 'overdue').length;
  const averageDays = calculateAverageDevelopmentTime(formulas);
  
  return {
    total,
    monthlyTotal,
    completed,
    monthlyCompleted,
    inProgress,
    overdue,
    averageDays,
    remaining: monthlyGoal - monthlyCompleted
  };
};

export const getCurrentMonthFormulas = (formulas) => {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  return formulas.filter(formula => {
    const formulaMonth = formula.finishDate?.substring(0, 7);
    return formulaMonth === currentMonth;
  });
};

// HELPER FUNCTIONS FOR NEW QUALITY KPIs

// Calculate reception-based KPI value
export const calculateReceptionKPI = (receptions) => {
  if (!receptions || receptions.length === 0) return 0;
  
  // Group receptions by date
  const receptionsByDate = receptions.reduce((acc, reception) => {
    if (!acc[reception.date]) {
      acc[reception.date] = [];
    }
    acc[reception.date].push(reception);
    return acc;
  }, {});

  // Calculate daily KPIs
  const dailyKPIs = Object.keys(receptionsByDate).map(date => {
    const dayReceptions = receptionsByDate[date];
    const conformeCount = dayReceptions.filter(r => r.isConforme === true).length;
    const totalCount = dayReceptions.length;
    return (conformeCount / totalCount) * 100;
  });

  if (dailyKPIs.length === 0) return 0;
  
  const averageKPI = dailyKPIs.reduce((sum, kpi) => sum + kpi, 0) / dailyKPIs.length;
  return Math.round(averageKPI);
};

// Calculate daily reception KPI
export const calculateDailyReceptionKPI = (receptions, date) => {
  const dayReceptions = receptions.filter(r => r.date === date);
  if (dayReceptions.length === 0) return 100; // Default 100% if no receptions
  
  const conformeCount = dayReceptions.filter(r => r.isConforme === true).length;
  const totalCount = dayReceptions.length;
  
  return Math.round((conformeCount / totalCount) * 100);
};

// Get reception statistics
export const getReceptionStats = (receptions) => {
  const total = receptions.length;
  const conforme = receptions.filter(r => r.isConforme === true).length;
  const nonConforme = receptions.filter(r => r.isConforme === false).length;
  const pending = receptions.filter(r => r.isConforme === null).length;
  
  const matierePremiereCount = receptions.filter(r => r.productType === 'matiere_premiere').length;
  const emballageCount = receptions.filter(r => r.productType === 'emballage').length;
  
  return {
    total,
    conforme,
    nonConforme,
    pending,
    matierePremiereCount,
    emballageCount,
    conformeRate: total > 0 ? Math.round((conforme / total) * 100) : 0
  };
};

// Get reception status based on performance
export const getReceptionStatus = (kpiValue, target = 90) => {
  if (kpiValue >= target) return 'excellent';
  if (kpiValue >= target * 0.9) return 'good';
  if (kpiValue >= target * 0.7) return 'fair';
  return 'needs-attention';
};

// HELPER FUNCTIONS FOR NEW COST TRACKING KPI

// Calculate cost-based KPI value (100% if within budget, 0% if over budget)
export const calculateCostKPI = (productCosts, budget) => {
  if (!productCosts || !budget || budget === 0) return 0;
  
  const totalCost = Object.values(productCosts).reduce((sum, item) => {
    return sum + (parseFloat(item.cost) || 0);
  }, 0);
  
  return totalCost <= budget ? 100 : 0;
};

// Get cost statistics for tracking
export const getCostStats = (productCosts, budget, totalItems) => {
  const budgetedItems = Object.keys(productCosts).filter(key => productCosts[key].cost > 0).length;
  const totalCost = Object.values(productCosts).reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  const remainingBudget = budget - totalCost;
  
  return {
    totalItems: totalItems || 0,
    budgetedItems,
    totalCost,
    remainingBudget,
    budgetUtilization: budget > 0 ? Math.round((totalCost / budget) * 100) : 0
  };
};

// Get cost status based on budget performance
export const getCostStatus = (kpiValue) => {
  if (kpiValue === 100) return 'excellent'; // Within budget
  if (kpiValue === 0) return 'needs-attention'; // Over budget
  return 'fair'; // Edge case
};

// Cross-KPI integration helpers
export const syncDataStructures = (productDevData, formulationData) => {
  return {
    productDevelopment: {
      kpi: calculateProductDevelopmentKPI(productDevData?.products || []),
      stats: getDevelopmentStats(productDevData?.products || []),
      products: productDevData?.products || []
    },
    formulation: {
      kpi: calculateFormulationKPI(formulationData?.formulas || [], formulationData?.monthlyGoal || 0),
      stats: getFormulationStats(formulationData?.formulas || [], formulationData?.monthlyGoal || 0),
      formulas: formulationData?.formulas || [],
      monthlyGoal: formulationData?.monthlyGoal || 0
    }
  };
};

// Format helper functions
export const formatDuration = (days) => {
  if (days === 0) return '0 jour';
  if (days === 1) return '1 jour';
  if (days < 7) return `${days} jours`;
  
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  
  if (weeks === 1 && remainingDays === 0) return '1 semaine';
  if (weeks === 1) return `1 semaine ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
  if (remainingDays === 0) return `${weeks} semaines`;
  return `${weeks} semaines ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
};

export const formatElapsedTime = (weeks) => {
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

export const getMonthsFromWeeks = (weeks) => {
  const months = weeks / 4.33;
  if (months < 1) {
    return `${weeks} sem.`;
  } else if (months < 2) {
    return `≈ 1 mois`;
  } else {
    return `≈ ${Math.round(months)} mois`;
  }
};

// Legacy compatibility helpers (kept for backward compatibility)
export const getIngredientCategories = () => {
  return {
    matiere_premiere: [
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
    ],
    produit_fini: [
      'Dégraissant alimentaire', 'Agita', 'Atom EC 25', 'Airfresh good vibes',
      'CAM 1501', 'CAM 4102', 'CAM 4260', 'CIP 1073', 'CIP 1273', 'CIP 1500',
      'CIP 2040', 'Crème mains bactéricides', 'Décap Force Four', 'Décasol', 'DEGR MS'
    ],
    emballage: [
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
  };
};