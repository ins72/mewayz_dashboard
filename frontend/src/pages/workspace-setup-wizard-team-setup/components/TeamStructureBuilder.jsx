import React from 'react';

const TeamStructureBuilder = ({ teamStructure, onUpdate }) => {
  return (
    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <p className="text-blue-400 text-sm">
        💡 <strong>Role Hierarchy:</strong> Owner &gt; Admin &gt; Manager &gt; Member &gt; Viewer. 
        Higher roles inherit permissions from lower roles.
      </p>
    </div>
  );
};

export default TeamStructureBuilder;