import { supabase } from '../lib/supabase';

// Default team ID (from schema)
const DEFAULT_TEAM_ID = '00000000-0000-0000-0000-000000000001';

class TeamsService {
  // ============================================================================
  // TEAM PRODUCTIVITY ATTENDANCE
  // ============================================================================
  
  async getTeamProductivityAttendance() {
    try {
      const { data, error } = await supabase
        .from('team_productivity_attendance')
        .select('*')
        .eq('team_id', DEFAULT_TEAM_ID)
        .order('kpi_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team productivity attendance:', error);
      return [];
    }
  }

  // NEW: Get attendance data for a specific date
  async getTeamProductivityAttendanceByDate(date) {
    try {
      const { data, error } = await supabase
        .from('team_productivity_attendance')
        .select('*')
        .eq('team_id', DEFAULT_TEAM_ID)
        .eq('kpi_date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data || null;
    } catch (error) {
      console.error('Error fetching team productivity attendance by date:', error);
      return null;
    }
  }

  async saveTeamProductivityAttendance(kpiData) {
    try {
      const record = {
        team_id: DEFAULT_TEAM_ID,
        kpi_value: kpiData.value,
        monthly_target: kpiData.monthlyTarget || kpiData.weeklyTarget,
        kpi_date: kpiData.date,
        stats: kpiData.stats,
        employees: kpiData.employees,
        notes: kpiData.notes || '',
        updated_at: new Date().toISOString()
      };

      // Check if record exists for this date
      const { data: existing } = await supabase
        .from('team_productivity_attendance')
        .select('id')
        .eq('team_id', DEFAULT_TEAM_ID)
        .eq('kpi_date', kpiData.date)
        .single();

      let result;
      if (existing) {
        // Update existing record
        result = await supabase
          .from('team_productivity_attendance')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('team_productivity_attendance')
          .insert(record)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      console.error('Error saving team productivity attendance:', error);
      throw error;
    }
  }

  // ============================================================================
  // OPERATOR EFFICIENCY
  // ============================================================================
  
  async getOperatorEfficiency() {
    try {
      const { data, error } = await supabase
        .from('operator_efficiency')
        .select('*')
        .eq('team_id', DEFAULT_TEAM_ID)
        .order('kpi_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching operator efficiency:', error);
      return [];
    }
  }

  // NEW: Get operator efficiency data for a specific date
  async getOperatorEfficiencyByDate(date) {
    try {
      const { data, error } = await supabase
        .from('operator_efficiency')
        .select('*')
        .eq('team_id', DEFAULT_TEAM_ID)
        .eq('kpi_date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching operator efficiency by date:', error);
      return null;
    }
  }

  async saveOperatorEfficiency(kpiData) {
    try {
      const record = {
        team_id: DEFAULT_TEAM_ID,
        kpi_value: kpiData.value,
        monthly_target: kpiData.monthlyTarget,
        kpi_date: kpiData.date,
        employees: kpiData.employees,
        notes: kpiData.notes || '',
        updated_at: new Date().toISOString()
      };

      // Check if record exists for this date
      const { data: existing } = await supabase
        .from('operator_efficiency')
        .select('id')
        .eq('team_id', DEFAULT_TEAM_ID)
        .eq('kpi_date', kpiData.date)
        .single();

      let result;
      if (existing) {
        // Update existing record
        result = await supabase
          .from('operator_efficiency')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('operator_efficiency')
          .insert(record)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      console.error('Error saving operator efficiency:', error);
      throw error;
    }
  }

  // ============================================================================
  // SAFETY INCIDENTS
  // ============================================================================
  
  async getSafetyIncidents() {
    try {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select('*')
        .eq('team_id', DEFAULT_TEAM_ID)
        .order('kpi_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching safety incidents:', error);
      return [];
    }
  }

  // NEW: Get safety incidents data for a specific date
  async getSafetyIncidentsByDate(date) {
    try {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select('*')
        .eq('team_id', DEFAULT_TEAM_ID)
        .eq('kpi_date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching safety incidents by date:', error);
      return null;
    }
  }

  async saveSafetyIncidents(kpiData) {
    try {
      const record = {
        team_id: DEFAULT_TEAM_ID,
        kpi_value: kpiData.value,
        monthly_target: kpiData.monthlyTarget,
        total_incidents: kpiData.totalIncidents || 0,
        kpi_date: kpiData.date,
        incidents: kpiData.incidents,
        stats: kpiData.stats,
        notes: kpiData.notes || '',
        updated_at: new Date().toISOString()
      };

      // Check if record exists for this date
      const { data: existing } = await supabase
        .from('safety_incidents')
        .select('id')
        .eq('team_id', DEFAULT_TEAM_ID)
        .eq('kpi_date', kpiData.date)
        .single();

      let result;
      if (existing) {
        // Update existing record
        result = await supabase
          .from('safety_incidents')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('safety_incidents')
          .insert(record)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      console.error('Error saving safety incidents:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS & SUMMARY FUNCTIONS
  // ============================================================================

  async getAllKPIData() {
    try {
      const [attendanceData, efficiencyData, safetyData] = await Promise.all([
        this.getTeamProductivityAttendance(),
        this.getOperatorEfficiency(),
        this.getSafetyIncidents()
      ]);

      return {
        team_productivity_attendance: attendanceData,
        operator_efficiency: efficiencyData,
        safety_incidents: safetyData
      };
    } catch (error) {
      console.error('Error fetching all KPI data:', error);
      return {
        team_productivity_attendance: [],
        operator_efficiency: [],
        safety_incidents: []
      };
    }
  }

  // Get latest KPI value for a specific type
  getLatestKPIValue(kpiData, kpiId) {
    if (!kpiData) return null;

    const dataKey = this.getDataKeyForKPI(kpiId);
    const data = kpiData[dataKey];
    
    if (!data || data.length === 0) return null;
    
    // Return the most recent entry (already sorted by date desc)
    const latest = data[0];
    return {
      value: latest.kpi_value,
      date: latest.kpi_date,
      data: this.formatKPIData(latest, kpiId)
    };
  }

  // Format KPI data based on type
  formatKPIData(record, kpiId) {
    switch (kpiId) {
      case 'team_productivity_attendance':
        return {
          value: record.kpi_value,
          date: record.kpi_date,
          monthlyTarget: record.monthly_target,
          weeklyTarget: record.monthly_target, // For backward compatibility
          employees: record.employees,
          stats: record.stats,
          type: 'attendance'
        };
      
      case 'operator_efficiency':
        return {
          value: record.kpi_value,
          date: record.kpi_date,
          monthlyTarget: record.monthly_target,
          employees: record.employees,
          type: 'efficiency'
        };
      
      case 'safety_incidents':
        return {
          value: record.kpi_value,
          date: record.kpi_date,
          monthlyTarget: record.monthly_target,
          incidents: record.incidents,
          totalIncidents: record.total_incidents,
          stats: record.stats,
          type: 'safety_incidents'
        };
      
      default:
        return record;
    }
  }

  // Get data key for KPI ID
  getDataKeyForKPI(kpiId) {
    switch (kpiId) {
      case 'team_productivity_attendance':
        return 'team_productivity_attendance';
      case 'operator_efficiency':
        return 'operator_efficiency';
      case 'safety_incidents':
        return 'safety_incidents';
      default:
        return kpiId;
    }
  }

  // Save KPI data based on type
  async saveKPIData(departmentId, kpiId, dataObject, notes = '') {
    const kpiDataWithNotes = { ...dataObject, notes };
    
    try {
      switch (kpiId) {
        case 'team_productivity_attendance':
          return await this.saveTeamProductivityAttendance(kpiDataWithNotes);
        
        case 'operator_efficiency':
          return await this.saveOperatorEfficiency(kpiDataWithNotes);
        
        case 'safety_incidents':
          return await this.saveSafetyIncidents(kpiDataWithNotes);
        
        default:
          throw new Error(`Unknown KPI type: ${kpiId}`);
      }
    } catch (error) {
      console.error(`Error saving KPI data for ${kpiId}:`, error);
      throw error;
    }
  }

  // Get department summary (for compatibility with existing code)
  getDepartmentSummary(kpiData, departmentId) {
    if (!kpiData) return { kpis: [] };

    const departmentKPIs = [
      'team_productivity_attendance',
      'operator_efficiency', 
      'safety_incidents'
    ];

    const kpis = departmentKPIs.map(kpiId => {
      const latestValue = this.getLatestKPIValue(kpiData, kpiId);
      
      return {
        id: kpiId,
        latestValue,
        status: this.getKPIStatus(latestValue?.value)
      };
    });

    return { kpis };
  }

  // Get team analytics (for reports)
  getTeamAnalytics(kpiData, departmentId) {
    if (!kpiData) return {};

    return {
      team_productivity_attendance: kpiData.team_productivity_attendance || [],
      operator_efficiency: kpiData.operator_efficiency || [],
      safety_incidents: kpiData.safety_incidents || []
    };
  }

  // Get KPI status based on value
  getKPIStatus(value) {
    if (!value && value !== 0) return 'no-data';
    if (value >= 90) return 'excellent';
    if (value >= 75) return 'good';
    return 'needs-attention';
  }
}

export const teamsService = new TeamsService();