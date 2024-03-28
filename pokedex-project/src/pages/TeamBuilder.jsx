import React, { useState } from 'react';
import ViewTeams from '../components/ViewTeams'; // Import the ViewTeams component
import CreateTeamForm from '../components/CreateTeamForm'; // Import the CreateTeamForm component

function TeamBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  return (
    <>
    <div className="team-builder-container">
      <h1 className={showCreateForm ? 'inactive' : 'active'} onClick={() => setShowCreateForm(false)}>View Teams</h1>
      <div className={`toggle-switch ${showCreateForm ? 'checked' : ''}`} onClick={toggleForm}>
        <div className="toggle-switch-inner" />
      </div>
      <h1 className={showCreateForm ? 'active' : 'inactive'} onClick={() => setShowCreateForm(true)}>Create Team</h1>
      </div>
      {showCreateForm ? <CreateTeamForm /> : <ViewTeams />}
      </>
  );
}

export default TeamBuilder;
