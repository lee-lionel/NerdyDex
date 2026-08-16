import React, { useState, useEffect, useCallback } from 'react';
import PokemonSprite from './PokemonSprite';
import { teamTable, isConfigured } from '../utilities/airtable';
import './ViewTeams.css';

function ViewTeams() {
  const [teams, setTeams] = useState([]);
  // 'loading' | 'ready' | 'error' — an empty list and a failed request are
  // not the same thing, and must not render the same message.
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    if (!isConfigured) {
      setStatus('error');
      setError(new Error('Airtable is not configured — set REACT_APP_AIRTABLE_API_KEY.'));
      return;
    }
    try {
      setStatus('loading');
      const records = await teamTable().select({ view: 'Grid view' }).all();
      setTeams(records);
      setStatus('ready');
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err);
      setStatus('error');
    }
  }, []);

  const handleDelete = async (teamId) => {
    const previous = teams;
    // Optimistic removal, rolled back if the request fails.
    setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
    try {
      await teamTable().destroy(teamId);
    } catch (err) {
      console.error('Error deleting team:', err);
      setTeams(previous);
      alert(`Could not delete that team: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  if (status === 'loading') {
    return <p className="teams-message">Loading teams…</p>;
  }

  if (status === 'error') {
    return (
      <div className="teams-message teams-error">
        <p>Couldn't load your teams.</p>
        <p className="teams-error-detail">{error && error.message}</p>
        <button className="btn" onClick={fetchTeams}>Try again</button>
      </div>
    );
  }

  return (
    <div className="teams">
      {teams.length === 0 && (
        <p className="teams-message">No teams yet — create one to get started.</p>
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
