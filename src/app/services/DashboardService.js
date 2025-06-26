import { supabase } from '../lib/supabase';

export class DashboardService {
  // ============================================================================
  // DEPARTMENTS MANAGEMENT
  // ============================================================================

  static async getAllDepartments() {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  static async getDepartment(departmentId) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw new Error('Failed to fetch department');
    }
  }

  // ============================================================================
  // ACTIVITY LOG MANAGEMENT
  // ============================================================================

  static async logActivity(activityData) {
    try {
      const { data, error } = await supabase
        .from('dashboard_activity_log')
        .insert([{
          department_id: activityData.departmentId,
          kpi_id: activityData.kpiId,
          activity_type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          occurred_at: activityData.occurredAt || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error('Failed to log activity');
    }
  }

  static async getRecentActivities(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('dashboard_activity_log')
        .select(`
          *,
          departments (
            id,
            name
          )
        `)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        title: activity.title,
        description: activity.description,
        time: new Date(activity.occurred_at).toLocaleTimeString(),
        department: activity.departments?.name || 'Unknown',
        departmentId: activity.department_id,
        kpiId: activity.kpi_id,
        occurredAt: activity.occurred_at
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw new Error('Failed to fetch recent activities');
    }
  }

  static async getActivitiesByDepartment(departmentId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('dashboard_activity_log')
        .select('*')
        .eq('department_id', departmentId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching department activities:', error);
      throw new Error('Failed to fetch department activities');
    }
  }

  // ============================================================================
  // YEARLY ANALYSIS MANAGEMENT
  // ============================================================================

  static async saveYearlyAnalysis(departmentId, year, overallScore, analysisData) {
    try {
      const { data, error } = await supabase
        .from('yearly_department_analysis')
        .upsert([{
          department_id: departmentId,
          year: year,
          overall_score: overallScore,
          analysis_json: analysisData,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving yearly analysis:', error);
      throw new Error('Failed to save yearly analysis');
    }
  }

  static async getYearlyAnalysis(departmentId, year) {
    try {
      const { data, error } = await supabase
        .from('yearly_department_analysis')
        .select('*')
        .eq('department_id', departmentId)
        .eq('year', year)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching yearly analysis:', error);
      throw new Error('Failed to fetch yearly analysis');
    }
  }

  static async getAllYearlyAnalysis(year = new Date().getFullYear()) {
    try {
      const { data, error } = await supabase
        .from('yearly_department_analysis')
        .select(`
          *,
          departments (
            id,
            name
          )
        `)
        .eq('year', year)
        .order('overall_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all yearly analysis:', error);
      throw new Error('Failed to fetch yearly analysis');
    }
  }

  // ============================================================================
  // DETECTIONS MANAGEMENT
  // ============================================================================

  static async saveDetections(yearlyAnalysisId, detections) {
    try {
      if (!detections || detections.length === 0) return [];

      const detectionsData = detections.map(detection => ({
        yearly_analysis_id: yearlyAnalysisId,
        type: detection.type,
        severity: detection.severity,
        category: detection.category,
        title: detection.title,
        description: detection.description,
        impact: detection.impact,
        quarter: detection.quarter,
        details_json: detection.details || {}
      }));

      const { data, error } = await supabase
        .from('yearly_detections')
        .insert(detectionsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error saving detections:', error);
      throw new Error('Failed to save detections');
    }
  }

  static async getDetectionsByAnalysis(yearlyAnalysisId) {
    try {
      const { data, error } = await supabase
        .from('yearly_detections')
        .select('*')
        .eq('yearly_analysis_id', yearlyAnalysisId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching detections:', error);
      throw new Error('Failed to fetch detections');
    }
  }

  // ============================================================================
  // RECOMMENDATIONS MANAGEMENT
  // ============================================================================

  static async saveRecommendations(yearlyAnalysisId, recommendations) {
    try {
      if (!recommendations || recommendations.length === 0) return [];

      const recommendationsData = recommendations.map(rec => ({
        yearly_analysis_id: yearlyAnalysisId,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        recommendation_json: rec.details || {}
      }));

      const { data, error } = await supabase
        .from('yearly_recommendations')
        .insert(recommendationsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw new Error('Failed to save recommendations');
    }
  }

  static async getRecommendationsByAnalysis(yearlyAnalysisId) {
    try {
      const { data, error } = await supabase
        .from('yearly_recommendations')
        .select('*')
        .eq('yearly_analysis_id', yearlyAnalysisId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  // ============================================================================
  // DASHBOARD STATISTICS
  // ============================================================================

  static async getDashboardStatistics() {
    try {
      // Get departments count
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id');

      if (deptError) throw deptError;

      // Get activities count for today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivities, error: actError } = await supabase
        .from('dashboard_activity_log')
        .select('id')
        .gte('occurred_at', today + 'T00:00:00')
        .lte('occurred_at', today + 'T23:59:59');

      if (actError) throw actError;

      // Get recent yearly analysis
      const currentYear = new Date().getFullYear();
      const { data: yearlyAnalysis, error: analysisError } = await supabase
        .from('yearly_department_analysis')
        .select('*')
        .eq('year', currentYear);

      if (analysisError) throw analysisError;

      const totalDepartments = departments?.length || 0;
      const activeDepartments = yearlyAnalysis?.length || 0;
      const todayActivitiesCount = todayActivities?.length || 0;
      const averageScore = yearlyAnalysis?.length > 0 
        ? Math.round(yearlyAnalysis.reduce((sum, analysis) => sum + analysis.overall_score, 0) / yearlyAnalysis.length)
        : 0;

      return {
        totalDepartments,
        activeDepartments,
        todayActivitiesCount,
        averageScore,
        yearlyAnalysisCount: yearlyAnalysis?.length || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  static async generateYearlyAnalysisForDepartment(departmentId, year, kpiData, performanceData) {
    try {
      // Calculate overall score based on performance data
      const overallScore = this.calculateOverallScore(performanceData);

      // Generate analysis JSON
      const analysisData = {
        department_id: departmentId,
        year: year,
        performance_summary: performanceData,
        kpi_summary: kpiData,
        generated_at: new Date().toISOString(),
        trends: this.calculateTrends(kpiData),
        achievements: this.identifyAchievements(performanceData),
        areas_for_improvement: this.identifyImprovements(performanceData)
      };

      // Save yearly analysis
      const savedAnalysis = await this.saveYearlyAnalysis(departmentId, year, overallScore, analysisData);

      // Log activity
      await this.logActivity({
        departmentId: departmentId,
        type: 'yearly_report_generated',
        title: 'Rapport Annuel Généré',
        description: `Rapport annuel ${year} généré avec un score de ${overallScore}%`
      });

      return savedAnalysis;
    } catch (error) {
      console.error('Error generating yearly analysis:', error);
      throw new Error('Failed to generate yearly analysis');
    }
  }

  static calculateOverallScore(performanceData) {
    if (!performanceData || Object.keys(performanceData).length === 0) return 0;

    const scores = Object.values(performanceData).filter(score => typeof score === 'number');
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  static calculateTrends(kpiData) {
    // Simple trend calculation - can be enhanced
    const trends = {};
    
    for (const [kpiId, data] of Object.entries(kpiData || {})) {
      if (Array.isArray(data) && data.length >= 2) {
        const recent = data.slice(-2);
        const trend = recent[1].value > recent[0].value ? 'up' : 
                     recent[1].value < recent[0].value ? 'down' : 'stable';
        trends[kpiId] = trend;
      }
    }
    
    return trends;
  }

  static identifyAchievements(performanceData) {
    const achievements = [];
    
    for (const [metric, score] of Object.entries(performanceData || {})) {
      if (typeof score === 'number' && score >= 90) {
        achievements.push({
          metric,
          score,
          description: `Excellent performance in ${metric} with ${score}% score`
        });
      }
    }
    
    return achievements;
  }

  static identifyImprovements(performanceData) {
    const improvements = [];
    
    for (const [metric, score] of Object.entries(performanceData || {})) {
      if (typeof score === 'number' && score < 70) {
        improvements.push({
          metric,
          score,
          priority: score < 50 ? 'high' : 'medium',
          description: `${metric} needs attention with current score of ${score}%`
        });
      }
    }
    
    return improvements;
  }
}