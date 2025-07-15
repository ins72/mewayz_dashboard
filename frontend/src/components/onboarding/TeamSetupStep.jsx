import React, { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CheckCircle, ArrowRight, ArrowLeft, Users, Plus, X, Upload, Mail } from 'lucide-react';

const TeamSetupStep = () => {
  const {
    teamInvitations,
    setTeamInvitations,
    completeStep,
    goToNextStep,
    goToPreviousStep,
    ONBOARDING_STEPS
  } = useOnboarding();

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'editor',
    department: '',
    position: '',
    personalMessage: ''
  });

  const [csvData, setCsvData] = useState('');
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [csvError, setCsvError] = useState('');

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Platform management and team administration' },
    { id: 'editor', name: 'Editor', description: 'Content creation and management with limited settings access' },
    { id: 'contributor', name: 'Contributor', description: 'Content creation without publishing rights' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access with customizable scope' },
    { id: 'guest', name: 'Guest', description: 'Limited access with time-bound permissions' }
  ];

  const handleInputChange = (field, value) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddInvitation = () => {
    if (!inviteForm.email || !validateEmail(inviteForm.email)) {
      return;
    }

    // Check for duplicate email
    if (teamInvitations.find(inv => inv.email === inviteForm.email)) {
      return;
    }

    const newInvitation = {
      id: Date.now().toString(),
      ...inviteForm
    };

    setTeamInvitations([...teamInvitations, newInvitation]);
    
    // Reset form
    setInviteForm({
      email: '',
      role: 'editor',
      department: '',
      position: '',
      personalMessage: ''
    });
  };

  const handleRemoveInvitation = (id) => {
    setTeamInvitations(teamInvitations.filter(inv => inv.id !== id));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCsvUpload = () => {
    if (!csvData.trim()) {
      setCsvError('Please enter CSV data');
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        setCsvError('CSV must contain at least a header and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const emailIndex = headers.indexOf('email');
      const roleIndex = headers.indexOf('role');
      const departmentIndex = headers.indexOf('department');
      const positionIndex = headers.indexOf('position');

      if (emailIndex === -1) {
        setCsvError('CSV must contain an "email" column');
        return;
      }

      const newInvitations = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const email = values[emailIndex];

        if (!email || !validateEmail(email)) {
          errors.push(`Row ${i + 1}: Invalid email format`);
          continue;
        }

        // Check for duplicate in existing invitations
        if (teamInvitations.find(inv => inv.email === email) || 
            newInvitations.find(inv => inv.email === email)) {
          errors.push(`Row ${i + 1}: Duplicate email ${email}`);
          continue;
        }

        newInvitations.push({
          id: `csv-${Date.now()}-${i}`,
          email: email,
          role: values[roleIndex] || 'editor',
          department: values[departmentIndex] || '',
          position: values[positionIndex] || '',
          personalMessage: 'Welcome to our team!'
        });
      }

      if (errors.length > 0) {
        setCsvError(errors.join('\n'));
        return;
      }

      setTeamInvitations([...teamInvitations, ...newInvitations]);
      setCsvData('');
      setShowCsvUpload(false);
      setCsvError('');
    } catch (error) {
      setCsvError('Failed to parse CSV data. Please check the format.');
    }
  };

  const handleContinue = () => {
    completeStep(ONBOARDING_STEPS.TEAM_SETUP);
    goToNextStep();
  };

  const handleSkip = () => {
    setTeamInvitations([]);
    completeStep(ONBOARDING_STEPS.TEAM_SETUP);
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Mewayz</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step 3 of 6: Team Setup
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
              style={{ width: '50%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Invite your team
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up your team now or skip this step and add members later. Team members will receive email invitations.
            </p>
          </div>

          {/* Invitation Form */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Add Team Member</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="teammate@company.com"
                value={inviteForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Department (optional)"
                placeholder="Marketing, Sales, etc."
                value={inviteForm.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
              
              <Input
                label="Position (optional)"
                placeholder="Manager, Specialist, etc."
                value={inviteForm.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Personal Message (optional)</label>
              <textarea
                value={inviteForm.personalMessage}
                onChange={(e) => handleInputChange('personalMessage', e.target.value)}
                placeholder="Add a personal welcome message..."
                className="w-full border border-border rounded-lg px-3 py-2 bg-background resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddInvitation}
                disabled={!inviteForm.email || !validateEmail(inviteForm.email)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCsvUpload(!showCsvUpload)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>

          {/* CSV Upload */}
          {showCsvUpload && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Bulk Upload (CSV)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with columns: email, role, department, position
              </p>
              
              <div className="mb-4">
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="email,role,department,position&#10;john@company.com,editor,Marketing,Manager&#10;jane@company.com,contributor,Sales,Specialist"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background resize-none"
                  rows={6}
                />
              </div>
              
              {csvError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="text-red-800 text-sm whitespace-pre-line">
                    {csvError}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button onClick={handleCsvUpload}>
                  Upload CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCsvUpload(false);
                    setCsvData('');
                    setCsvError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Team Invitations List */}
          {teamInvitations.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Team Invitations ({teamInvitations.length})
              </h3>
              
              <div className="space-y-4">
                {teamInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {roles.find(r => r.id === invitation.role)?.name || invitation.role}
                            {invitation.department && ` • ${invitation.department}`}
                            {invitation.position && ` • ${invitation.position}`}
                          </div>
                        </div>
                      </div>
                      {invitation.personalMessage && (
                        <div className="mt-2 text-sm text-muted-foreground italic">
                          "{invitation.personalMessage}"
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInvitation(invitation.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleSkip}
                size="lg"
              >
                Skip for now
              </Button>
              
              <Button
                onClick={handleContinue}
                size="lg"
                className="min-w-[200px]"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Team members will receive email invitations after you complete the setup process.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamSetupStep;