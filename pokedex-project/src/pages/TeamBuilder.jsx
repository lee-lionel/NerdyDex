import React, { useState } from 'react';
import ViewTeams from '../components/ViewTeams'; // Import the ViewTeams component
import CreateTeamForm from '../components/CreateTeamForm'; // Import the CreateTeamForm component

function TeamBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  return (
    <div>
      <label htmlFor="toggle">Toggle:</label>
      <input type="checkbox" id="toggle" checked={showCreateForm} onChange={toggleForm} />
      {showCreateForm ? <CreateTeamForm /> : <ViewTeams />}
    </div>
  );
}

export default TeamBuilder;
