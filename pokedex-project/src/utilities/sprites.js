/* Sprite lookup for PokéAPI.
   Team tables repeat the same Pokémon across rows and teams, so results are
   cached by name. The in-flight promise is cached too, which means N rows
   asking for the same Pokémon at once share a single request. */

const cache = new Map();

export function normaliseName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

export function getSprite(name) {
  const key = normaliseName(name);
  if (!key) return Promise.resolve(null);
  if (cache.has(key)) return Promise.resolve(cache.get(key));

  const request = fetch(`https://pokeapi.co/api/v2/pokemon/${key}`)
    .then(async (res) => {
      // A 404 is a real answer — that name has no sprite — so it is worth
      // remembering. Anything else is treated as a failed request below.
      if (res.status === 404) {
        cache.set(key, null);
        return null;
      }
      if (!res.ok) throw new Error(`PokeAPI responded ${res.status}`);

      const data = await res.json();
      const url = data && data.sprites ? data.sprites.front_default : null;
      cache.set(key, url); // replace the promise with the resolved value
      return url;
    })
    .catch(() => {
      // A network blip must not be cached, or this name would show a
      // placeholder for the rest of the session. Drop it so the next
      // render retries.
      cache.delete(key);
      return null;
    });

  cache.set(key, request);
  return request;
}
