import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';

const SmartRecommendations = ({ 
  selectedGoals, 
  selectedFeatures, 
  industry, 
  teamSize, 
  features, 
  goals,
  onFeatureRecommend 
}) => {
  // Generate smart recommendations based on context
  const recommendations = useMemo(() => {
    const recs = [];

    // Industry-based recommendations
    const industryRecommendations = {
      'marketing': ['post_scheduler', 'content_calendar', 'analytics_dashboard'],
      'education': ['video_hosting', 'quiz_builder', 'student_progress'],
      'ecommerce': ['product_catalog', 'payment_processing', 'inventory_management'],
      'business': ['contact_management', 'email_templates', 'task_automation'],
      'consulting': ['meeting_scheduler', 'document_management', 'customer_support'],
      'nonprofit': ['email_capture', 'social_media_integration', 'goal_tracking']
    };

    if (industry && industryRecommendations[industry]) {
      const industryFeatures = features.filter(f => 
        industryRecommendations[industry].includes(f.slug) &&
        !selectedFeatures.some(sf => sf.featureId === f.id && sf.isEnabled)
      );

      if (industryFeatures.length > 0) {
        recs.push({
          type: 'industry',
          title: `Popular in ${industry}`,
          description: `These features are commonly used by ${industry} professionals`,
          icon: TrendingUp,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20',
          features: industryFeatures.slice(0, 3)
        });
      }
    }

    // Team size recommendations
    const teamSizeRecommendations = {
      'solo': ['task_automation', 'email_templates', 'goal_tracking'],
      'small': ['team_collaboration', 'shared_calendar', 'project_management'],
      'medium': ['user_roles', 'advanced_analytics', 'team_workflows'],
      'large': ['enterprise_security', 'custom_integrations', 'advanced_reporting']
    };

    if (teamSize && teamSizeRecommendations[teamSize]) {
      const teamFeatures = features.filter(f => 
        teamSizeRecommendations[teamSize].includes(f.slug) &&
        !selectedFeatures.some(sf => sf.featureId === f.id && sf.isEnabled)
      );

      if (teamFeatures.length > 0) {
        recs.push({
          type: 'team',
          title: `Perfect for ${teamSize} teams`,
          description: `Recommended features for ${teamSize} team size`,
          icon: Users,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/20',
          features: teamFeatures.slice(0, 3)
        });
      }
    }

    // Goal-based recommendations (complementary features)
    selectedGoals.forEach(selectedGoal => {
      const goal = goals.find(g => g.id === selectedGoal.goalId);
      if (!goal) return;

      const goalFeatures = features.filter(f => 
        f.goal_id === goal.id &&
        !selectedFeatures.some(sf => sf.featureId === f.id && sf.isEnabled)
      );

      const complementaryFeatures = {
        'instagram': ['hashtag_analytics', 'competitor_analysis', 'auto_reposting'],
        'link_in_bio': ['qr_code_generator', 'email_capture', 'custom_domains'],
        'courses': ['live_streaming', 'discussion_forums', 'certificate_generator'],
        'ecommerce': ['customer_reviews', 'discount_codes', 'shipping_calculator'],
        'crm': ['task_automation', 'meeting_scheduler', 'customer_support'],
        'analytics': ['automated_insights', 'benchmarking', 'alert_system']
      };

      const recommended = goalFeatures.filter(f => 
        complementaryFeatures[goal.slug]?.includes(f.slug)
      );

      if (recommended.length > 0) {
        recs.push({
          type: 'goal',
          title: `Enhance ${goal.name}`,
          description: `Advanced features to maximize your ${goal.name} goals`,
          icon: Zap,
          color: goal.icon_color,
          bgColor: `${goal.icon_color}10`,
          borderColor: `${goal.icon_color}20`,
          features: recommended.slice(0, 2)
        });
      }
    });

    // Must-have essentials
    const essentialFeatures = features.filter(f => 
      ['goal_tracking', 'basic_analytics', 'email_notifications'].includes(f.slug) &&
      !selectedFeatures.some(sf => sf.featureId === f.id && sf.isEnabled)
    );

    if (essentialFeatures.length > 0) {
      recs.push({
        type: 'essential',
        title: 'Essential Features',
        description: 'Core features that enhance productivity for any workspace',
        icon: Lightbulb,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/20',
        features: essentialFeatures.slice(0, 2)
      });
    }

    return recs.slice(0, 3); // Limit to 3 recommendation groups
  }, [selectedGoals, selectedFeatures, industry, teamSize, features, goals]);

  // Handle feature recommendation
  const handleRecommendFeature = (featureId) => {
    onFeatureRecommend(featureId, true);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Smart Recommendations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={`${rec.type}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className={`
              p-4 rounded-lg border
              ${rec.bgColor} ${rec.borderColor}
            `}
          >
            {/* Recommendation Header */}
            <div className="flex items-center space-x-2 mb-3">
              <rec.icon className={`h-5 w-5 ${rec.color}`} />
              <h4 className="font-medium text-white">{rec.title}</h4>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              {rec.description}
            </p>

            {/* Recommended Features */}
            <div className="space-y-2">
              {rec.features.map(feature => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-white truncate">
                      {feature.name}
                    </h5>
                    <p className="text-xs text-gray-400 truncate">
                      {feature.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRecommendFeature(feature.id)}
                    className={`
                      ml-2 p-1.5 rounded-lg transition-colors
                      hover:bg-gray-700
                    `}
                    title={`Enable ${feature.name}`}
                  >
                    <ArrowRight className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                rec.features.forEach(feature => {
                  handleRecommendFeature(feature.id);
                });
              }}
              className={`
                w-full mt-4 py-2 px-3 rounded-lg border transition-colors
                text-sm font-medium
                ${rec.borderColor} ${rec.color}
                hover:bg-gray-700/50
              `}
            >
              Enable All ({rec.features.length})
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SmartRecommendations;