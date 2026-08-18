import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Pokedex.css";
import { useNameIndex } from "../utils/useNameIndex";
import { pickBest, rank } from "../utils/fuzzy";

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

  /* Fuzzy search state. `correctedFrom` records that the reader typed
     something misspelled and we searched for the nearest name instead, so
     the result can say so rather than silently showing a different Pokemon.
     `suggestions` are the near-misses offered when nothing was confident. */
  const names = useNameIndex();
  const [correctedFrom, setCorrectedFrom] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const boxRef = useRef(null);

  // Live matches for what is typed, for the suggestion list under the input.
  const matches = useMemo(
    () => (names.length ? rank(pokemonInput, names, 6) : []),
    [pokemonInput, names]
  );

  const getPokemonData = async (pokemon, typedInstead = "") => {
    setStatus("loading");
    setLastSearch(pokemon);
    setCorrectedFrom(typedInstead);
    setSuggestions([]);
    setOpen(false);
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

  const runSearch = (raw) => {
    const query = raw.trim().toLowerCase();
    if (!query) return;

    /* An exact name goes straight to the API. Otherwise the closest name is
       searched instead when it is close enough to be obvious, and merely
       plausible matches are offered rather than guessed at. */
    if (!names.length || names.includes(query)) {
      getPokemonData(query);
      return;
    }

    const hits = rank(query, names, 6);
    const { hit, confident } = pickBest(hits);
    if (confident && hit) {
      getPokemonData(hit.name, query);
      return;
    }

    if (hits.length) {
      setLastSearch(query);
      setSuggestions(hits);
      setStatus("notFound");
      setOpen(false);
      return;
    }

    // Nothing resembled it — let the API give the definitive answer.
    getPokemonData(query);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Arrow keys move a highlight through the list; Enter takes that one.
    if (open && highlighted >= 0 && matches[highlighted]) {
      runSearch(matches[highlighted].name);
      return;
    }
    runSearch(pokemonInput);
  };

  const handleKeyDown = (event) => {
    if (!matches.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => {
        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = current + step;
        if (next < 0) return matches.length - 1;
        if (next >= matches.length) return 0;
        return next;
      });
    } else if (event.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  useEffect(() => {
    if (pokemonData.name) {
      setPokemonInput("");
    }
  }, [pokemonData.name]);

  // Clicking away closes the suggestion list, the way a combobox should.
  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="page Pokedex">
      <h1 className="sr-only">Pokédex</h1>
      <form className="pokedex-search" onSubmit={handleFormSubmit} role="search">
        <div className="pokedex-combobox" ref={boxRef}>
          <input
            type="text"
            name="pokemonName"
            placeholder="Enter a Pokemon Name"
            value={pokemonInput}
            autoComplete="off"
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-controls="pokedex-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={
              open && highlighted >= 0 ? `pokedex-option-${highlighted}` : undefined
            }
            aria-label="Search for a Pokémon by name"
            onChange={(event) => {
              setPokemonInput(event.target.value.toLowerCase());
              setOpen(true);
              setHighlighted(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
          />

          {open && matches.length > 0 && (
            <ul className="pokedex-suggestions" id="pokedex-suggestions" role="listbox">
              {matches.map((hit, index) => (
                <li
                  key={hit.name}
                  id={`pokedex-option-${index}`}
                  role="option"
                  aria-selected={index === highlighted}
                  className={
                    index === highlighted
                      ? "pokedex-suggestion is-highlighted"
                      : "pokedex-suggestion"
                  }
                  /* mousedown rather than click: the input's blur would
                     close the list before a click ever landed. */
                  onMouseDown={(event) => {
                    event.preventDefault();
                    runSearch(hit.name);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                >
                  {hit.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Searching…" : "Search"}
        </button>
      </form>

      {status === "notFound" && (
        <div className="pokedex-message">
          <p>No Pokémon called “{lastSearch}”.</p>
          {suggestions.length > 0 && (
            <p className="pokedex-didyoumean">
              Did you mean{" "}
              {suggestions.map((hit, index) => (
                <React.Fragment key={hit.name}>
                  {index > 0 && (index === suggestions.length - 1 ? " or " : ", ")}
                  <button
                    type="button"
                    className="pokedex-suggestion-link"
                    onClick={() => runSearch(hit.name)}
                  >
                    {hit.name}
                  </button>
                </React.Fragment>
              ))}
              ?
            </p>
          )}
        </div>
      )}

      {status === "error" && (
        <p className="pokedex-message pokedex-message-error">
          Couldn't reach the Pokédex. Check your connection and try again.
        </p>
      )}

      {/* Say plainly that a different name was searched. Silently showing
          Charizard to someone who typed "charizrd" is helpful; not telling
          them is how they end up thinking that is the spelling. */}
      {status === "ready" && correctedFrom && (
        <p className="pokedex-corrected" role="status">
          Showing <strong>{pokemonData.name}</strong> — nothing matched “
          {correctedFrom}”.
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
