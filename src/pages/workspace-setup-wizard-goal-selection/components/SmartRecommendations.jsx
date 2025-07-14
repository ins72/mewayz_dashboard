import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Users, Target, Zap } from 'lucide-react';

const SmartRecommendations = ({ selectedGoals, industry, teamSize, goals }) => {
  // Get industry-specific recommendations
  const getIndustryRecommendations = () => {
    const industryGoalMap = {
      'marketing': ['instagram', 'link_in_bio', 'analytics'],
      'ecommerce': ['ecommerce', 'instagram', 'analytics'],
      'education': ['courses', 'analytics'],
      'technology': ['analytics', 'crm'],
      'healthcare': ['crm', 'link_in_bio'],
      'professional': ['crm', 'analytics'],
      'creative': ['instagram', 'link_in_bio'],
      'real_estate': ['crm', 'link_in_bio', 'instagram'],
      'food': ['instagram', 'ecommerce'],
      'finance': ['crm', 'analytics']
    };

    return industryGoalMap[industry] || ['crm', 'analytics'];
  };

  // Get team size recommendations
  const getTeamSizeRecommendations = () => {
    const teamSizeGoalMap = {
      'solo': ['instagram', 'link_in_bio'],
      'small': ['crm', 'instagram', 'analytics'],
      'medium': ['crm', 'analytics', 'courses'],
      'large': ['analytics', 'crm', 'ecommerce']
    };

    return teamSizeGoalMap[teamSize] || ['crm', 'analytics'];
  };

  // Generate recommendations
  const generateRecommendations = () => {
    const industryRecs = getIndustryRecommendations();
    const teamSizeRecs = getTeamSizeRecommendations();
    const selectedGoalSlugs = selectedGoals.map(g => goals.find(goal => goal.id === g.goalId)?.slug).filter(Boolean);

    // Combine and filter recommendations
    const allRecs = [...new Set([...industryRecs, ...teamSizeRecs])];
    const unselectedRecs = allRecs.filter(slug => !selectedGoalSlugs.includes(slug));

    return unselectedRecs.slice(0, 3); // Limit to 3 recommendations
  };

  // Get completion insights
  const getCompletionInsights = () => {
    const insights = [];

    if (selectedGoals.length === 0) {
      insights.push({
        icon: Target,
        text: "Select at least one goal to get started with your workspace setup.",
        type: "warning"
      });
    } else if (selectedGoals.length === 1) {
      insights.push({
        icon: TrendingUp,
        text: "Consider adding 1-2 more goals to maximize your workspace potential.",
        type: "suggestion"
      });
    } else if (selectedGoals.length > 4) {
      insights.push({
        icon: Zap,
        text: "You've selected many goals. Focus on high-priority ones first for better results.",
        type: "tip"
      });
    } else {
      insights.push({
        icon: TrendingUp,
        text: "Great selection! This combination works well for most businesses.",
        type: "success"
      });
    }

    // Team size specific insights
    if (teamSize === 'solo' && selectedGoals.length > 3) {
      insights.push({
        icon: Users,
        text: "As a solo entrepreneur, consider starting with 2-3 goals to avoid overwhelm.",
        type: "tip"
      });
    }

    if (teamSize === 'large' && selectedGoals.length < 3) {
      insights.push({
        icon: Users,
        text: "Large teams can typically handle multiple goals simultaneously.",
        type: "suggestion"
      });
    }

    return insights;
  };

  const recommendations = generateRecommendations();
  const insights = getCompletionInsights();
  const recommendedGoals = recommendations.map(slug => goals.find(g => g.slug === slug)).filter(Boolean);

  if (recommendations.length === 0 && insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Lightbulb className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Smart Recommendations
        </h3>
      </div>

      <div className="space-y-4">
        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              const colorMap = {
                warning: 'text-yellow-400',
                suggestion: 'text-blue-400',
                tip: 'text-purple-400',
                success: 'text-green-400'
              };
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex items-start space-x-3"
                >
                  <IconComponent className={`h-4 w-4 mt-0.5 ${colorMap[insight.type]}`} />
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {insight.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Goal Recommendations */}
        {recommendedGoals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-200">
              Recommended for {industry} businesses:
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendedGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: goal.icon_color }}
                  />
                  <span className="text-gray-300">{goal.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {selectedGoals.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {selectedGoals.length}
              </div>
              <div className="text-xs text-gray-400">
                Goals Selected
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {selectedGoals.filter(g => g.setupNow).length}
              </div>
              <div className="text-xs text-gray-400">
                Setup Immediately
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SmartRecommendations;