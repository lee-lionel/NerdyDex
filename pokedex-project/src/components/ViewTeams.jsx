import React, { useState, useEffect } from 'react';
import Airtable from 'airtable';
import PokemonSprite from './PokemonSprite';
import './ViewTeams.css';


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
    <div className="teams">
      {teams.length === 0 && (
        <p className="teams-empty">No teams yet — create one to get started.</p>
      )}

      {teams.map((team) => (
        <div key={team.id} className="team-card">
          <header className="team-card-header">
            <div>
              <h2 className="team-name">{team.fields['Team Name']}</h2>
              <span className="team-format">{team.fields['Format']}</span>
            </div>
            <button className="btn btn-danger" onClick={() => handleDelete(team.id)}>Delete</button>
          </header>

          <div className="team-table-wrap">
            <table className="team-table">
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
                        <td>
                          <span className="pokemon-cell">
                            <PokemonSprite name={team.fields[pokemonKey]} size={40} />
                            {team.fields[pokemonKey]}
                          </span>
                        </td>
                        <td className="held-item">{team.fields[heldItemKey] || '—'}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ViewTeams;
