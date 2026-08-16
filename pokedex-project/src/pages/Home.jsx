import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [pokemonData, setPokemonData] = useState({
    name: "",
    image: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPokemonData = async () => {
      const randomNumber = Math.floor(Math.random() * 1024) + 1;
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${randomNumber}`;

      try {
        const pokemonResponse = await axios.get(pokemonUrl);
        const pokemon = pokemonResponse.data;

        const descriptionResponse = await axios.get(pokemon.species.url);
        const description =
          descriptionResponse.data.flavor_text_entries.find(
            (entry) => entry.language.name === "en"
          )?.flavor_text || "";

        setPokemonData({
          name: pokemon.name,
          image: pokemon.sprites.front_default,
          description: description,
        });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchPokemonData();
  }, []);

  return (
    <div className="page Home">
      {isLoading ? (
        <p className="home-loading">Loading...</p>
      ) : (
        <div className="home-card">
          <p className="home-eyebrow">Pokémon of the moment</p>
          <div className="home-sprite">
            <img src={pokemonData.image} alt={pokemonData.name} />
          </div>
          <h1 className="home-name">{pokemonData.name}</h1>
          <p className="home-description">{pokemonData.description}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
