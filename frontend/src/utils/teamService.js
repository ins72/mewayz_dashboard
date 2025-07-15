/**
 * Team Service for workspace team management
 * Handles team member invitations, role management, and team structure
 */

import apiClient from '../utils/apiClient';

class TeamService {
  /**
   * Create a new team invitation
   * @param {Object} invitationData - The invitation data
   * @returns {Promise} API response
   */
  async createInvitation(invitationData) {
    try {
      const response = await apiClient.post('/workspaces/invitations', invitationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get team members for a workspace
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} API response
   */
  async getTeamMembers(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/members`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update team member role
   * @param {string} workspaceId - The workspace ID
   * @param {string} memberId - The member ID
   * @param {Object} updateData - The update data
   * @returns {Promise} API response
   */
  async updateMemberRole(workspaceId, memberId, updateData) {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}/members/${memberId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove team member
   * @param {string} workspaceId - The workspace ID
   * @param {string} memberId - The member ID
   * @returns {Promise} API response
   */
  async removeMember(workspaceId, memberId) {
    try {
      const response = await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get team structure for a workspace
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise} API response
   */
  async getTeamStructure(workspaceId) {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}/structure`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update team structure
   * @param {string} workspaceId - The workspace ID
   * @param {Object} structureData - The structure data
   * @returns {Promise} API response
   */
  async updateTeamStructure(workspaceId, structureData) {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}/structure`, structureData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new TeamService();