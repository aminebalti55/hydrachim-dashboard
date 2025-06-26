// YearlyReports.js - Main component that coordinates all yearly reports
import React, { useState } from 'react';
import {
  X,
  Calendar,
  BarChart3,
  ChevronRight,
  FlaskConical,
  Users,
  Factory,
  Shield,
  Package
} from 'lucide-react';

// Import all the yearly report components
import { RnDYearlyReport } from './RnDYearlyReport';
import { TeamYearlyReport } from './TeamYearlyReport';
import { ProductionYearlyReport } from './ProductionYearlyReport';
import { QualityYearlyReport } from './QualityYearlyReport';
import { WarehousesYearlyReport } from './WarehousesYearlyReport';

export const YearlyReports = ({ isDark, onClose }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const departments = [
    {
      id: 'rnd',
      name: 'R&D et Innovation',
      icon: FlaskConical,
      color: '#6366F1',
      description: 'Développement produits et formulations',
      usesOwnHook: true, // Uses own data hook
      status: 'active'
    },
    {
      id: 'team',
      name: 'Gestion d\'Équipe',
      icon: Users,
      color: '#EC4899',
      description: 'Performance équipe et sécurité',
      usesOwnHook: true, // Now uses own data hook (useTeamsKPIData)
      status: 'active'
    },
    {
      id: 'production',
      name: 'Production',
      icon: Factory,
      color: '#F97316',
      description: 'Efficacité énergétique et performance',
      usesOwnHook: true, // Uses own data hook (useProductionData)
      status: 'active'
    },
    {
      id: 'quality',
      name: 'Contrôle Qualité',
      icon: Shield,
      color: '#059669',
      description: 'Qualité matières et processus',
      usesOwnHook: true, // Uses own data hook
      status: 'active'
    },
    {
      id: 'warehouses',
      name: 'Logistique',
      icon: Package,
      color: '#8B5CF6',
      description: 'Coûts et rotation inventaire',
      usesOwnHook: true, // Now uses own data hook (useWarehouseData)
      status: 'active'
    }
  ];

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
  };

  const handleCloseReport = () => {
    setSelectedDepartment(null);
  };

  const renderSelectedReport = () => {
    if (!selectedDepartment) return null;

    // All reports now manage their own data through hooks
    switch (selectedDepartment.id) {
      case 'rnd':
        return (
          <RnDYearlyReport
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'team':
        return (
          <TeamYearlyReport
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'production':
        return (
          <ProductionYearlyReport
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'quality':
        return (
          <QualityYearlyReport
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      case 'warehouses':
        return (
          <WarehousesYearlyReport
            isDark={isDark}
            onClose={handleCloseReport}
          />
        );
      default:
        return null;
    }
  };

  // If a department is selected, render its report
  if (selectedDepartment) {
    return renderSelectedReport();
  }

  // Otherwise, render the department selection interface
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-2xl rounded-xl shadow-xl border ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rapports Annuels {new Date().getFullYear()}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Choisir un département • Données Supabase
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Department Selection */}
        <div className="p-5">
          <div className="space-y-2">
            {departments.filter(dept => dept.status === 'active').map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentSelect(dept)}
                className={`w-full group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.01] text-left ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: dept.color }}
                  >
                    <dept.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {dept.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {dept.usesOwnHook && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              Supabase
                            </span>
                          </div>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`} />
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {dept.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info Banner */}
          <div className={`mt-4 p-3 rounded-lg border ${
            isDark ? 'bg-blue-900/10 border-blue-700/30' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-2">
              <BarChart3 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <h4 className={`text-sm font-medium ${
                  isDark ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  Données en temps réel
                </h4>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Tous les rapports utilisent directement les données Supabase pour garantir la cohérence et la mise à jour en temps réel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Données {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {departments.filter(d => d.status === 'active').length} départements actifs
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Supabase
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};