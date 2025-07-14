import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, Plus, X, Settings } from 'lucide-react';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const TeamStructureBuilder = ({ structure, onUpdate }) => {
  const [newDepartment, setNewDepartment] = useState('');
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);

  const handleAddDepartment = () => {
    if (newDepartment.trim() && !structure?.departments?.includes(newDepartment.trim())) {
      const updatedStructure = {
        ...structure,
        departments: [...(structure?.departments || []), newDepartment.trim()]
      };
      onUpdate(updatedStructure);
      setNewDepartment('');
      setShowDepartmentForm(false);
    }
  };

  const handleRemoveDepartment = (departmentToRemove) => {
    const updatedStructure = {
      ...structure,
      departments: (structure?.departments || []).filter(dept => dept !== departmentToRemove)
    };
    onUpdate(updatedStructure);
  };

  const handleRolePermissionChange = (roleValue, permissions) => {
    const updatedRoles = (structure?.roles || []).map(role => 
      role.value === roleValue 
        ? { ...role, permissions }
        : role
    );
    
    const updatedStructure = {
      ...structure,
      roles: updatedRoles
    };
    onUpdate(updatedStructure);
  };

  return (
    <div className="space-y-6">
      {/* Departments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Departments</h3>
              <p className="text-gray-400 text-sm">Organize your team into departments</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowDepartmentForm(!showDepartmentForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Add Department Form */}
        {showDepartmentForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex space-x-2">
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Department name (e.g., Marketing, Sales)"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
              />
              <Button onClick={handleAddDepartment} size="sm">
                Add
              </Button>
              <Button 
                onClick={() => {
                  setShowDepartmentForm(false);
                  setNewDepartment('');
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Departments List */}
        <div className="flex flex-wrap gap-2">
          {structure?.departments?.map((department, index) => (
            <motion.div
              key={department}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2"
            >
              <span className="text-white text-sm">{department}</span>
              <button
                onClick={() => handleRemoveDepartment(department)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          
          {(!structure?.departments || structure.departments.length === 0) && (
            <p className="text-gray-500 text-sm">No departments added yet. Click "Add Department" to get started.</p>
          )}
        </div>
      </motion.div>

      {/* Roles Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Team Roles</h3>
            <p className="text-gray-400 text-sm">Define roles and permissions for your team</p>
          </div>
        </div>

        <div className="space-y-4">
          {structure?.roles?.map((role, index) => (
            <motion.div
              key={role.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-white font-medium">{role.name}</h4>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {role.value}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{role.description}</p>
                  
                  {/* Permissions */}
                  <div className="flex flex-wrap gap-2">
                    {role.permissions?.map((permission, permIndex) => (
                      <span
                        key={permIndex}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                      >
                        {permission.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            💡 <strong>Role Hierarchy:</strong> Owner > Admin > Manager > Member > Viewer. 
            Higher roles inherit permissions from lower roles.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamStructureBuilder;