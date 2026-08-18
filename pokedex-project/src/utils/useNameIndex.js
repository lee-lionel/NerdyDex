import { useEffect, useState } from 'react'

/* One fetch per session at most. The list is a little over a thousand names
   and never changes during a visit, so it is held at module scope and reused
   by every mount; sessionStorage carries it across reloads. */
const CACHE_KEY = 'nerdydex-pokemon-names'
let cached = null
let inFlight = null

async function loadNames() {
  if (cached) return cached

  try {
    const stored = sessionStorage.getItem(CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length) {
        cached = parsed
        return cached
      }
    }
  } catch {
    /* Private mode, or a corrupted entry — refetch rather than fail. */
  }

  if (!inFlight) {
    inFlight = fetch('https://pokeapi.co/api/v2/pokemon?limit=100000')
      .then((r) => {
        if (!r.ok) throw new Error(`PokeAPI responded ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const names = data.results.map((r) => r.name)
        cached = names
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(names))
        } catch {
          /* Over quota is not worth failing the search over. */
        }
        return names
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

/**
 * The list of every Pokémon name, for suggesting and correcting searches.
 *
 * Failing to load it is deliberately quiet: search still works, it just
 * stops offering suggestions, which is exactly how it behaved before.
 */
export function useNameIndex() {
  const [names, setNames] = useState(cached ?? [])

  useEffect(() => {
    if (cached) return
    let live = true
    loadNames()
      .then((list) => live && setNames(list))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  return names
}
