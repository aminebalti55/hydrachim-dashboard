// Complete KPI definitions organized by department with multilingual support and team enhancements
export const kpiDefinitions = {
  rnd: {
    id: 'rnd',
    name: {
      en: 'Research & Development Laboratory',
      fr: 'Laboratoire de Recherche & Développement'
    },
    kpis: [
      {
        id: 'new_product_dev_time',
        name: {
          en: 'New Product Development Time',
          fr: 'Temps de Développement de Nouveaux Produits'
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
      {
        id: 'material_batch_acceptance_rate',
        name: {
          en: 'Material & Batch Acceptance Rate',
          fr: 'Taux d\'Acceptation des Matériaux et Lots'
        },
        description: {
          en: 'Combined rate of raw materials and finished batches accepted',
          fr: 'Taux combiné d\'acceptation des matières premières et lots finis'
        },
        unit: '%',
        type: 'percentage',
        target: 98,
        category: 'quality'
      },
      {
        id: 'quality_nonconformities',
        name: {
          en: 'Quality Non-Conformities Detected',
          fr: 'Non-Conformités Qualité Détectées'
        },
        description: {
          en: 'Number of quality issues identified',
          fr: 'Nombre de problèmes de qualité identifiés'
        },
        unit: 'count',
        type: 'number',
        target: 2,
        category: 'quality'
      },
      {
        id: 'quality_response_time',
        name: {
          en: 'Response Time to Quality Issues',
          fr: 'Temps de Réponse aux Problèmes de Qualité'
        },
        description: {
          en: 'Average time to address quality problems',
          fr: 'Temps moyen pour traiter les problèmes de qualité'
        },
        unit: 'hours',
        type: 'number',
        target: 4,
        category: 'efficiency'
      },
      {
        id: 'internal_rejection_rate',
        name: {
          en: 'Internal Rejection Rate',
          fr: 'Taux de Rejet Interne'
        },
        description: {
          en: '% of batches rejected before packaging',
          fr: '% de lots rejetés avant l\'emballage'
        },
        unit: '%',
        type: 'percentage',
        target: 1,
        category: 'quality'
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
      {
        id: 'inventory_accuracy',
        name: {
          en: 'Inventory Accuracy Rate',
          fr: 'Taux de Précision des Stocks'
        },
        description: {
          en: 'Accuracy of inventory records',
          fr: 'Précision des registres d\'inventaire'
        },
        unit: '%',
        type: 'percentage',
        target: 99,
        category: 'efficiency'
      },
      {
        id: 'average_storage_time',
        name: {
          en: 'Average Storage Time',
          fr: 'Temps de Stockage Moyen'
        },
        description: {
          en: 'Average time products stay in warehouse',
          fr: 'Temps moyen que les produits restent en entrepôt'
        },
        unit: 'days',
        type: 'number',
        target: 45,
        category: 'efficiency'
      },
      {
        id: 'order_fulfillment_time',
        name: {
          en: 'Order Fulfillment Time',
          fr: 'Temps d\'Exécution des Commandes'
        },
        description: {
          en: 'Time to complete orders on time and in full',
          fr: 'Temps pour compléter les commandes à temps et en totalité'
        },
        unit: 'hours',
        type: 'number',
        target: 24,
        category: 'service'
      },
      {
        id: 'cost_per_formulation',
        name: {
          en: 'Raw Material Costs',
          fr: 'Coût des Matières Premières'
        },
        description: {
          en: 'Average cost for raw materials per batch',
          fr: 'Coût moyen des matières premières par lot'
        },
        unit: '€',
        type: 'currency',
        target: 5000,
        category: 'cost'
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
        target: 95, // Default target, can be overridden
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
        target: 0, // Default target, can be overridden
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
        target: 85, // Default target, can be overridden
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
  return ['quality', 'efficiency', 'productivity', 'cost', 'sustainability', 'service', 'development', 'safety', 'retention'];
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
  
  // For some KPIs, lower is better (e.g., incidents, costs, time)
  const lowerIsBetter = [
    'safety_incidents', 
    'quality_nonconformities', 
    'quality_response_time',
    'cost_per_formulation', 
    'energy_consumption', 
    'average_storage_time',
    'order_fulfillment_time',
    'mixing_time',
    'new_product_dev_time'
  ];
  
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