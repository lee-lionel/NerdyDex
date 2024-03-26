import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div className="Home">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>{pokemonData.name}</h1>
          <img src={pokemonData.image} alt={pokemonData.name} />
          <p>{pokemonData.description}</p>
        </div>
      )}
    </div>
  );
}

export default Home;