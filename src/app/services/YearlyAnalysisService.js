import { supabase } from '../lib/supabase';

/**
 * Service for managing yearly analysis cache in Supabase
 * Uses the tables from the provided SQL schema
 */
class YearlyAnalysisService {

  /**
   * Save yearly analysis to cache
   */
  async saveYearlyAnalysis(departmentId, year, yearlyAnalysis) {
    try {
      const { detections, recommendations, ...analysisData } = yearlyAnalysis;

      // Insert or update the main analysis record
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('yearly_department_analysis')
        .upsert({
          department_id: departmentId,
          year: year,
          overall_score: yearlyAnalysis.yearlyPerformance.overall,
          analysis_json: analysisData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'department_id,year'
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      // Clear existing detections and recommendations
      await this.clearYearlyDetections(analysisRecord.id);
      await this.clearYearlyRecommendations(analysisRecord.id);

      // Insert detections
      if (detections && detections.length > 0) {
        const detectionsData = detections.map(detection => ({
          yearly_analysis_id: analysisRecord.id,
          type: detection.type,
          severity: detection.severity,
          category: detection.category,
          title: detection.title,
          description: detection.description,
          impact: detection.impact,
          quarter: detection.quarter,
          details_json: detection.realData || null
        }));

        const { error: detectionsError } = await supabase
          .from('yearly_detections')
          .insert(detectionsData);

        if (detectionsError) throw detectionsError;
      }

      // Insert recommendations
      if (recommendations && recommendations.length > 0) {
        const recommendationsData = recommendations.map(rec => ({
          yearly_analysis_id: analysisRecord.id,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          recommendation_json: rec
        }));

        const { error: recommendationsError } = await supabase
          .from('yearly_recommendations')
          .insert(recommendationsData);

        if (recommendationsError) throw recommendationsError;
      }

      return analysisRecord;
    } catch (error) {
      console.error('Error saving yearly analysis:', error);
      throw error;
    }
  }

  /**
   * Get yearly analysis from cache
   */
  async getYearlyAnalysis(departmentId, year) {
    try {
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('yearly_department_analysis')
        .select(`
          *,
          yearly_detections (*),
          yearly_recommendations (*)
        `)
        .eq('department_id', departmentId)
        .eq('year', year)
        .single();

      if (analysisError) {
        if (analysisError.code === 'PGRST116') {
          return null; // No data found
        }
        throw analysisError;
      }

      // Reconstruct the yearly analysis object
      const yearlyAnalysis = {
        ...analysisRecord.analysis_json,
        detections: analysisRecord.yearly_detections || [],
        recommendations: analysisRecord.yearly_recommendations || []
      };

      return yearlyAnalysis;
    } catch (error) {
      console.error('Error getting yearly analysis:', error);
      throw error;
    }
  }

  /**
   * Check if yearly analysis exists and is recent
   */
  async isAnalysisCurrent(departmentId, year, maxAgeHours = 24) {
    try {
      const { data, error } = await supabase
        .from('yearly_department_analysis')
        .select('updated_at')
        .eq('department_id', departmentId)
        .eq('year', year)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // No analysis found
        }
        throw error;
      }

      const analysisAge = Date.now() - new Date(data.updated_at).getTime();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
      
      return analysisAge < maxAge;
    } catch (error) {
      console.error('Error checking analysis currency:', error);
      return false;
    }
  }

  /**
   * Get all departments with yearly analysis
   */
  async getDepartmentAnalysisSummary(year) {
    try {
      const { data, error } = await supabase
        .from('yearly_department_analysis')
        .select(`
          department_id,
          overall_score,
          updated_at,
          departments (name)
        `)
        .eq('year', year)
        .order('overall_score', { ascending: false });

      if (error) throw error;

      return data.map(record => ({
        departmentId: record.department_id,
        departmentName: record.departments?.name || record.department_id,
        overallScore: record.overall_score,
        lastUpdated: record.updated_at
      }));
    } catch (error) {
      console.error('Error getting department analysis summary:', error);
      throw error;
    }
  }

  /**
   * Clear detections for a yearly analysis
   */
  async clearYearlyDetections(yearlyAnalysisId) {
    try {
      const { error } = await supabase
        .from('yearly_detections')
        .delete()
        .eq('yearly_analysis_id', yearlyAnalysisId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing yearly detections:', error);
      throw error;
    }
  }

  /**
   * Clear recommendations for a yearly analysis
   */
  async clearYearlyRecommendations(yearlyAnalysisId) {
    try {
      const { error } = await supabase
        .from('yearly_recommendations')
        .delete()
        .eq('yearly_analysis_id', yearlyAnalysisId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing yearly recommendations:', error);
      throw error;
    }
  }

  /**
   * Delete yearly analysis
   */
  async deleteYearlyAnalysis(departmentId, year) {
    try {
      const { error } = await supabase
        .from('yearly_department_analysis')
        .delete()
        .eq('department_id', departmentId)
        .eq('year', year);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting yearly analysis:', error);
      throw error;
    }
  }

  /**
   * Log dashboard activity
   */
  async logActivity(departmentId, kpiId, activityType, title, description) {
    try {
      const { error } = await supabase
        .from('dashboard_activity_log')
        .insert({
          department_id: departmentId,
          kpi_id: kpiId,
          activity_type: activityType,
          title: title,
          description: description
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main functionality
    }
  }

  /**
   * Get recent dashboard activities
   */
  async getRecentActivities(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('dashboard_activity_log')
        .select(`
          *,
          departments (name)
        `)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(activity => ({
        ...activity,
        departmentName: activity.departments?.name || activity.department_id
      }));
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }
}

export default new YearlyAnalysisService();
