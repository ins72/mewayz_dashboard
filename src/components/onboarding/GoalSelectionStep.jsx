import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../../components/ui/Button';
import { CheckCircle, ArrowRight, Target, Star } from 'lucide-react';

const GoalSelectionStep = () => {
  const {
    BUSINESS_GOALS,
    selectedGoals,
    setSelectedGoals,
    completeStep,
    goToNextStep,
    ONBOARDING_STEPS
  } = useOnboarding();

  const [tempSelectedGoals, setTempSelectedGoals] = useState(selectedGoals);

  const handleGoalToggle = (goalId) => {
    setTempSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (tempSelectedGoals.length === 0) return;
    
    setSelectedGoals(tempSelectedGoals);
    completeStep(ONBOARDING_STEPS.GOAL_SELECTION);
    goToNextStep();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Mewayz</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step 1 of 6: Goal Selection
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-2">
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '16.67%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              What are your main business goals?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the areas where you want to focus your efforts. We'll customize your workspace based on your choices.
            </p>
          </div>

          {/* Goal Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {BUSINESS_GOALS.map((goal) => {
              const isSelected = tempSelectedGoals.includes(goal.id);
              
              return (
                <div
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-border bg-card hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-4 right-4">
                    {isSelected ? (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-muted-foreground rounded-full"></div>
                    )}
                  </div>

                  {/* Goal Content */}
                  <div className="pr-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${goal.color}`}>
                        <span className="text-2xl">{goal.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {goal.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {goal.description}
                    </p>

                    {/* Features Preview */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        Key Features:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {goal.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                        {goal.features.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground">
                            +{goal.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selection Summary */}
          {tempSelectedGoals.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">
                Selected Goals ({tempSelectedGoals.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tempSelectedGoals.map(goalId => {
                  const goal = BUSINESS_GOALS.find(g => g.id === goalId);
                  return (
                    <div
                      key={goalId}
                      className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full"
                    >
                      <span className="text-lg">{goal.icon}</span>
                      <span className="text-sm font-medium text-blue-900">
                        {goal.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={tempSelectedGoals.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Don't worry, you can change these selections later and add more goals as your business grows.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoalSelectionStep;