import React, { createContext, useContext } from 'react';

// Create the App Context with default values
export const AppContext = createContext({
  // UI State
  language: 'en',
  setLanguage: () => {},
  isDark: false,
  setIsDark: () => {},
  
  // KPI Data State
  kpiData: {},
  isLoading: false,
  
  // KPI Data Functions
  updateKPIValue: () => {},
  getLatestKPIValue: () => {},
  getKPIHistory: () => {},
  getKPIStatus: () => {},
  getDepartmentSummary: () => {},
  getDashboardSummary: {},
  deleteKPIEntry: () => {},
  getKPITrend: () => {},
  clearAllData: () => {}
});

// Custom hook to use the App Context
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};

// Optional: Create a provider component for better organization
export const AppProvider = ({ children, value }) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};