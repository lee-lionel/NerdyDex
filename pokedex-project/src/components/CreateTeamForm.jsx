import React, { useState } from 'react';
import PokemonSprite from './PokemonSprite';
import { teamTable } from '../utilities/airtable';
import './CreateTeamForm.css';

function CreateTeamForm() {
  const [teamName, setTeamName] = useState('');
  const [format, setFormat] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [heldItemList, setHeldItemList] = useState([]);

  const handlePokemonChange = (index, value) => {
    const updatedPokemonList = [...pokemonList];
    updatedPokemonList[index] = value;
    setPokemonList(updatedPokemonList);
  };

  const handleHeldItemChange = (index, value) => {
    const updatedHeldItemList = [...heldItemList];
    updatedHeldItemList[index] = value;
    setHeldItemList(updatedHeldItemList);
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const createdTeam = await teamTable().create([
        {
          "fields": {
            "Team Name": teamName,
            "Format": [format],
            "Pokemon 1": pokemonList[0] || "",
            "Pokemon 2": pokemonList[1] || "",
            "Pokemon 3": pokemonList[2] || "",
            "Pokemon 4": pokemonList[3] || "",
            "Pokemon 5": pokemonList[4] || "",
            "Pokemon 6": pokemonList[5] || "",
            "Held Item 1": heldItemList[0] || "",
            "Held Item 2": heldItemList[1] || "",
            "Held Item 3": heldItemList[2] || "",
            "Held Item 4": heldItemList[3] || "",
            "Held Item 5": heldItemList[4] || "",
            "Held Item 6": heldItemList[5] || "",
          }
        }
      ]);

      console.log('Team created successfully:', createdTeam);
      // Reset form fields after successful submission
      setTeamName('');
      setFormat('');
      setPokemonList([]);
      setHeldItemList([]);
    } catch (error) {
      console.error('Error creating team:', error);
      alert(`Could not save the team: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="team-form-card">
      <h1 className="team-form-title">Create Team</h1>
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="teamName">Team Name</label>
            <input type="text" id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="format">Format</label>
            <select id="format" value={format} onChange={(e) => setFormat(e.target.value)} required>
              <option value="">Select a format</option>
              <option value="VGC 2024">VGC 2024</option>
              <option value="Smogon OU 2024">Smogon OU 2024</option>
              <option value="3v3 Singles 2024">3v3 Singles 2024</option>
            </select>
          </div>
        </div>

        <h2 className="team-form-subtitle">Roster</h2>
        <div className="roster">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={`slot-${index}`} className="roster-slot">
              <span className="roster-slot-number">{index}</span>
              <PokemonSprite name={pokemonList[index - 1]} size={44} delay={450} />
              <div className="field">
                <label htmlFor={`pokemon-${index}`}>Pokemon {index}</label>
                <input type="text" id={`pokemon-${index}`} value={pokemonList[index - 1] || ''} onChange={(e) => handlePokemonChange(index - 1, e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor={`heldItem-${index}`}>Held Item {index}</label>
                <input type="text" id={`heldItem-${index}`} value={heldItemList[index - 1] || ''} onChange={(e) => handleHeldItemChange(index - 1, e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Create Team'}
        </button>
      </form>
    </div>
  );
}

export default CreateTeamForm;
