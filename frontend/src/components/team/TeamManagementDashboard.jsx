import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { 
  Users, UserPlus, Shield, Activity, Bell, Settings,
  Mail, Calendar, Clock, MoreVertical, Edit, Trash2,
  Crown, Star, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import teamManagementService from '../../services/teamManagementService';

const TeamManagementDashboard = ({ workspaceId }) => {
  const [teamData, setTeamData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamRoles, setTeamRoles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      loadTeamData();
    }
  }, [workspaceId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const [dashboardData, membersData, rolesData, activitiesData, notificationsData] = await Promise.all([
        teamManagementService.getDashboard(workspaceId),
        teamManagementService.getTeamMembers(workspaceId),
        teamManagementService.getTeamRoles(workspaceId),
        teamManagementService.getTeamActivities(workspaceId),
        teamManagementService.getTeamNotifications(workspaceId)
      ]);

      setTeamData(dashboardData);
      setTeamMembers(membersData.team_members || []);
      setTeamRoles(rolesData.roles || []);
      setActivities(activitiesData.activities || []);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (email, roleId, message) => {
    try {
      await teamManagementService.inviteTeamMember(workspaceId, email, roleId, message);
      setShowInviteModal(false);
      loadTeamData(); // Refresh data
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handleUpdateRole = async (memberId, roleId) => {
    try {
      await teamManagementService.updateMemberRole(workspaceId, memberId, roleId);
      loadTeamData(); // Refresh data
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await teamManagementService.removeMember(workspaceId, memberId);
        loadTeamData(); // Refresh data
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'invite': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'create': return <Settings className="h-4 w-4 text-green-500" />;
      case 'update': return <Edit className="h-4 w-4 text-orange-500" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_invite': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'achievement': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'task_assigned': return <Settings className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
          <Button
            onClick={() => setShowRoleModal(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Manage Roles</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        {['overview', 'members', 'roles', 'activities', 'notifications'].map(tab => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? 'default' : 'outline'}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && teamData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamData.team_overview.total_members}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamData.team_overview.active_members}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-gray-900">{teamData.team_overview.pending_invites}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Roles</p>
                    <p className="text-2xl font-bold text-gray-900">{teamData.team_overview.roles_count}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.recent_activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      {getActivityIcon(activity.action)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()} • {activity.user.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  <span>Recent Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.notifications.map((notification, index) => (
                    <div key={notification.id} className="flex items-center space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{member.user.name}</p>
                        {member.role.name === 'Owner' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{member.role.name}</Badge>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-500">
                      <p>Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                      <p>Last active {new Date(member.last_activity).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRoleModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamRoles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">{role.name}</h3>
                      {role.is_system && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                    {!role.is_system && (
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions).map(([module, perms]) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}: {Array.isArray(perms) ? perms.join(', ') : perms}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.action)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{activity.module}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()} • {activity.user.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`flex items-center space-x-4 p-4 rounded-lg ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                }`}>
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                        {notification.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleInviteMember(
                formData.get('email'),
                formData.get('role'),
                formData.get('message')
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select name="role" required className="w-full border rounded px-3 py-2">
                    {teamRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Welcome message..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementDashboard;