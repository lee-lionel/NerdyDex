import React, { useState, useEffect } from "react";
import "./Pokedex.css";

const MAX_STAT = 255; // highest possible base stat, used to scale the bars

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
  const [status, setStatus] = useState("idle"); // idle | loading | notFound | error
  const [lastSearch, setLastSearch] = useState("");

  const getPokemonData = async (pokemon) => {
    setStatus("loading");
    setLastSearch(pokemon);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

      // Without this check a 404 still parses as JSON and the first
      // property access throws.
      if (response.status === 404) {
        setStatus("notFound");
        return;
      }
      if (!response.ok) throw new Error(`PokeAPI responded ${response.status}`);

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
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const query = pokemonInput.trim();
    if (!query) return;
    getPokemonData(query);
  };

  useEffect(() => {
    if (pokemonData.name) {
      setPokemonInput("");
    }
  }, [pokemonData.name]);

  return (
    <div className="page Pokedex">
      <form className="pokedex-search" onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="pokemonName"
          placeholder="Enter a Pokemon Name"
          value={pokemonInput}
          onChange={(event) => {
            setPokemonInput(event.target.value.toLowerCase());
          }}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Searching…" : "Search"}
        </button>
      </form>

      {status === "notFound" && (
        <p className="pokedex-message">
          No Pokémon called “{lastSearch}”. Check the spelling and try again.
        </p>
      )}

      {status === "error" && (
        <p className="pokedex-message pokedex-message-error">
          Couldn't reach the Pokédex. Check your connection and try again.
        </p>
      )}

      {status === "ready" && pokemonData.name && (
        <div className="pokemon">
          <header className="pokemon-header">
            <div className="pokemon-sprite">
              <img src={pokemonData.image} alt={pokemonData.name} />
            </div>
            <div className="pokemon-identity">
              <h2 className="pokemon-name">{pokemonData.name}</h2>
              {pokemonData.types.length > 0 && (
                <div className="type-badges">
                  {pokemonData.types.map((type) => (
                    <span key={type} className={`type-badge type-${type}`}>
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {pokemonData.abilities.length > 0 && (
            <section className="pokemon-section">
              <h3 className="section-title">Abilities</h3>
              <div className="chip-list">
                {pokemonData.abilities.map((ability) => (
                  <span key={ability} className="chip">{ability}</span>
                ))}
              </div>
            </section>
          )}

          {pokemonData.baseStats.length > 0 && (
            <section className="pokemon-section">
              <h3 className="section-title">Base Stats</h3>
              <ul className="stat-list">
                {pokemonData.baseStats.map((stat) => (
                  <li key={stat.name} className="stat-row">
                    <span className="stat-name">{stat.name.replace(/-/g, " ")}</span>
                    <span className="stat-track">
                      <span
                        className="stat-fill"
                        style={{ width: `${(stat.value / MAX_STAT) * 100}%` }}
                      />
                    </span>
                    <span className="stat-value">{stat.value}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pokemonData.moves.length > 0 && (
            <section className="pokemon-section">
              <h3 className="section-title">
                Moves <span className="section-count">{pokemonData.moves.length}</span>
              </h3>
              <div className="chip-list moves-list">
                {pokemonData.moves.map((move) => (
                  <span key={move} className="chip">{move}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default Pokedex;
