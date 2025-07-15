import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Users, Star, Zap } from 'lucide-react';
import Button from 'components/ui/Button';
import Icon from '../../../components/AppIcon';


const WelcomeScreen = ({ workspace, role, onGetStarted }) => {
  const nextSteps = [
    {
      icon: Users,
      title: 'Complete your profile',
      description: 'Add your details and preferences to personalize your experience'
    },
    {
      icon: Star,
      title: 'Explore workspace features',
      description: 'Discover all the tools and features available in your workspace'
    },
    {
      icon: Zap,
      title: 'Meet your team',
      description: 'Connect with your colleagues and start collaborating'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to {workspace?.name || 'the workspace'}! 🎉
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            You've successfully joined as a{' '}
            <span className="text-blue-400 font-medium capitalize">{role}</span>
          </p>
          <p className="text-gray-400">
            Get ready to collaborate and achieve amazing things together
          </p>
        </motion.div>

        {/* Workspace Info */}
        {workspace?.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700"
          >
            <h3 className="text-white font-medium mb-2">About {workspace.name}</h3>
            <p className="text-gray-400">{workspace.description}</p>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">What's next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={onGetStarted}
            className="px-8 py-3 text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-gray-500 text-sm mt-4">
            You'll be redirected to your workspace in a few seconds...
          </p>
        </motion.div>

        {/* Celebration Animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                y: "100vh",
                x: Math.random() * window.innerWidth,
                rotate: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                y: "-10vh",
                rotate: 360
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;