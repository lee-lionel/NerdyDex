import React, { useState, useEffect } from 'react';
import Airtable from 'airtable';


function ViewTeams() {
  const [teams, setTeams] = useState([]);
  const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY;
  const base = new Airtable({ apiKey }).base('app2Zq6DikKlO4AV3');
  

  const fetchTeams = async () => {
    try {
      const records = await base('Team List').select({
        // maxRecords: 3,
        view: 'Grid view',
      }).all();

      setTeams(records);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleDelete = async (teamId) => {
    try {
      await base('Team List').destroy(teamId);
      // Update the teams state after deletion
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

 

  return (
    <div>
      {teams.map((team) => (
        <div key={team.id}>
          <h1>{team.fields['Team Name']}</h1>
          <h2>Format: {team.fields['Format']}</h2>
          <table>
            <thead>
              <tr>
                <th>Pokemon</th>
                <th>Held Item</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, index) => {
                const pokemonKey = `Pokemon ${index + 1}`;
                const heldItemKey = `Held Item ${index + 1}`;
                if (team.fields[pokemonKey]) {
                  return (
                    <tr key={`${team.id}-${index}`}>
                      <td>{team.fields[pokemonKey]}</td>
                      <td>{team.fields[heldItemKey]}</td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
          <button onClick={() => handleDelete(team.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default ViewTeams;
