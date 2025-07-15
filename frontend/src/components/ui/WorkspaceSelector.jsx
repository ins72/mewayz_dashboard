import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const WorkspaceSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('personal');
  const dropdownRef = useRef(null);

  const workspaces = [
    {
      id: 'personal',
      name: 'Personal Workspace',
      description: 'Your personal projects and tasks',
      icon: 'User',
      color: 'bg-primary'
    },
    {
      id: 'acme-corp',
      name: 'Acme Corporation',
      description: 'Enterprise business management',
      icon: 'Building2',
      color: 'bg-accent'
    },
    {
      id: 'startup-inc',
      name: 'Startup Inc.',
      description: 'Growing business operations',
      icon: 'Rocket',
      color: 'bg-warning'
    },
    {
      id: 'freelance',
      name: 'Freelance Projects',
      description: 'Client work and contracts',
      icon: 'Briefcase',
      color: 'bg-success'
    }
  ];

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectWorkspace = (workspaceId) => {
    setSelectedWorkspace(workspaceId);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors w-full lg:w-auto"
      >
        <div className={`flex items-center justify-center w-8 h-8 ${currentWorkspace.color} rounded-lg`}>
          <Icon name={currentWorkspace.icon} size={16} color="white" />
        </div>
        <div className="flex-1 text-left lg:max-w-48">
          <div className="font-medium text-sm text-foreground truncate">
            {currentWorkspace.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {currentWorkspace.description}
          </div>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full lg:w-80 bg-popover border border-border rounded-lg shadow-modal z-50 animate-slide-in">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
              Switch Workspace
            </div>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => selectWorkspace(workspace.id)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-muted transition-colors ${
                  selectedWorkspace === workspace.id ? 'bg-muted' : ''
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 ${workspace.color} rounded-lg`}>
                  <Icon name={workspace.icon} size={16} color="white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-foreground">
                    {workspace.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {workspace.description}
                  </div>
                </div>
                {selectedWorkspace === workspace.id && (
                  <Icon name="Check" size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-border p-2">
            <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                <Icon name="Plus" size={16} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm text-foreground">
                  Create Workspace
                </div>
                <div className="text-xs text-muted-foreground">
                  Set up a new workspace
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;