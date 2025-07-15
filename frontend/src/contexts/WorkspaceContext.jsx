import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../utils/apiClient';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's workspaces
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/workspaces');
      
      if (response.data.success) {
        setWorkspaces(response.data.workspaces);
        
        // Set first workspace as current if none selected
        if (!currentWorkspace && response.data.workspaces.length > 0) {
          setCurrentWorkspace(response.data.workspaces[0]);
        }
      }
    } catch (error) {
      setError('Failed to load workspaces');
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (workspaceData) => {
    try {
      const response = await apiClient.post('/workspaces', workspaceData);
      
      if (response.data.success) {
        setWorkspaces([...workspaces, response.data.workspace]);
        setCurrentWorkspace(response.data.workspace);
        return response.data.workspace;
      }
    } catch (error) {
      setError('Failed to create workspace');
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId, workspaceData) => {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}`, workspaceData);
      
      if (response.data.success) {
        setWorkspaces(workspaces.map(w => 
          w.id === workspaceId ? response.data.workspace : w
        ));
        
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspace(response.data.workspace);
        }
        
        return response.data.workspace;
      }
    } catch (error) {
      setError('Failed to update workspace');
      console.error('Error updating workspace:', error);
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      const response = await apiClient.delete(`/workspaces/${workspaceId}`);
      
      if (response.data.success) {
        setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
        
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspace(workspaces.find(w => w.id !== workspaceId) || null);
        }
      }
    } catch (error) {
      setError('Failed to delete workspace');
      console.error('Error deleting workspace:', error);
      throw error;
    }
  };

  const switchWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
  };

  const value = {
    currentWorkspace,
    workspaces,
    loading,
    error,
    loadWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    clearError: () => setError(null),
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export { WorkspaceContext };
export default WorkspaceContext;