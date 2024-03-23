import React, { useState, useEffect } from "react";
import axios from "axios";

function Pokedex() {
  const [pokemonData, setPokemonData] = useState({
    name: "",
    image: "",
    types: [],
    abilities: [],
    baseStats: [],
    moves: [],
  });

  const [pokemonInput, setPokemonInput] = useState("");

  const getPokemonData = async (pokemon) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    const jsonData = await response.json();

    setPokemonData({
      name: jsonData.name,
      image: jsonData.sprites.front_default,
      types: jsonData.types.map((typeObj) => typeObj.type.name),
      abilities: jsonData.abilities.map((abilityObj) => abilityObj.ability.name),
      baseStats: jsonData.stats.map((statObj) => ({
        name: statObj.stat.name,
        value: statObj.base_stat,
      })),
      moves: jsonData.moves.map((moveObj) => moveObj.move.name),
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    getPokemonData(pokemonInput);
  };

 

    useEffect(() => {
    if (pokemonData.name) {
      setPokemonInput("");
    }
  }, [pokemonData.name]);

  return (
    <div className="Pokedex">
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="pokemonName"
          placeholder="Enter a Pokemon Name"
          value={pokemonInput}
          onChange={(event) => {
            setPokemonInput(event.target.value.toLowerCase());
          }}
        />
        <button type="submit">Search</button>
      </form>

      {pokemonData.name && (
        <div className="pokemon">
          <img src={pokemonData.image} alt={pokemonData.name} />
          <h2>{pokemonData.name}</h2>

          {pokemonData.types && pokemonData.types.length > 0 && (
            <p>Types: {pokemonData.types.join(", ")}</p>
          )}

          {pokemonData.abilities && pokemonData.abilities.length > 0 && (
            <p>Abilities: {pokemonData.abilities.join(", ")}</p>
          )}

          {pokemonData.baseStats && pokemonData.baseStats.length > 0 && (
            <p>
              Base Stats:
              <ul>
                {pokemonData.baseStats.map((stat) => (
                  <li key={stat.name}>
                    {stat.name}: {stat.value}
                  </li>
                ))}
              </ul>
            </p>
          )}

          {pokemonData.moves && pokemonData.moves.length > 0 && (
            <p>
              Moves:
              <ul>
                {pokemonData.moves.map((move) => (
                  <li key={move}>{move}</li>
                ))}
              </ul>
            </p>
          )}
        </div>
      )}

 

    </div>
  );
}

export default Pokedex;