import React, { useState } from 'react';
import ViewTeams from '../components/ViewTeams'; // Import the ViewTeams component
import CreateTeamForm from '../components/CreateTeamForm'; // Import the CreateTeamForm component
import './TeamBuilder.css';

function TeamBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="page">
      <h1 className="sr-only">Team builder</h1>
      <div className="team-builder-container">
        <div className="segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!showCreateForm}
            className={showCreateForm ? 'segment' : 'segment segment-active'}
            onClick={() => setShowCreateForm(false)}
          >
            View Teams
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showCreateForm}
            className={showCreateForm ? 'segment segment-active' : 'segment'}
            onClick={() => setShowCreateForm(true)}
          >
            Create Team
          </button>
        </div>
      </div>
      {showCreateForm ? <CreateTeamForm /> : <ViewTeams />}
    </div>
  );
}

export default TeamBuilder;
