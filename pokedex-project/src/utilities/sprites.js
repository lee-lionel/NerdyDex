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
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const url = data && data.sprites ? data.sprites.front_default : null;
      cache.set(key, url); // replace the promise with the resolved value
      return url;
    })
    .catch(() => {
      cache.set(key, null);
      return null;
    });

  cache.set(key, request);
  return request;
}
