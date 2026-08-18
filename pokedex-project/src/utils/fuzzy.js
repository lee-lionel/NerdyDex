/**
 * Fuzzy matching for the Pokédex search.
 *
 * PokéAPI only answers exact names, so "charizrd" is a 404 and the reader is
 * told to check their spelling — which is not much help when they have no
 * idea how it is spelled. Ranking a typed query against the full name list
 * lets the search suggest, and correct, instead.
 */

/**
 * Levenshtein distance with a ceiling.
 *
 * Bailing out once every cell in a row exceeds `max` matters here: the index
 * is ~1300 names and this runs on every keystroke, so most comparisons want
 * to be abandoned rather than completed.
 */
export function distance(a, b, max = Infinity) {
  if (a === b) return 0
  // A length difference alone already costs that many edits.
  if (Math.abs(a.length - b.length) > max) return max + 1
  if (!a.length) return b.length
  if (!b.length) return a.length

  let prev = new Array(b.length + 1)
  let curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > max) return max + 1
    const swap = prev
    prev = curr
    curr = swap
  }
  return prev[b.length]
}

/**
 * Score one name against a query. Higher is better; 0 means no match.
 *
 * The tiers matter more than the numbers: someone typing "char" wants the
 * Charizard line, not whatever happens to be one edit away from "char". So
 * prefix beats substring beats near-miss, and only then does spelling
 * distance break ties.
 */
export function score(query, name) {
  if (!query) return 0
  if (name === query) return 1000
  if (name.startsWith(query)) return 900 - (name.length - query.length)
  if (name.includes(query)) return 700 - name.indexOf(query) - (name.length - query.length) * 0.1

  // Allow roughly one typo per four characters, always at least one.
  const budget = Math.max(1, Math.floor(query.length / 4) + 1)
  const d = distance(query, name, budget)
  if (d <= budget) return 500 - d * 50 - Math.abs(name.length - query.length)

  /* A typo inside a longer name — "charizrd" against "charizard-mega-x" —
     scores against the leading segment so the base form still surfaces. */
  const head = name.slice(0, query.length + 2)
  const dHead = distance(query, head, budget)
  if (dHead <= budget) return 300 - dHead * 50

  return 0
}

/** What kind of match a score represents, for deciding how to act on it. */
function kindOf(s) {
  if (s >= 1000) return 'exact'
  if (s >= 800) return 'prefix'
  if (s >= 600) return 'contains'
  if (s >= 350) return 'near'
  return 'weak'
}

/** The best `limit` matches for a query, best first. */
export function rank(query, names, limit = 6) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits = []
  for (const name of names) {
    const s = score(q, name)
    if (s > 0) hits.push({ name, score: s, kind: kindOf(s) })
  }
  hits.sort((a, b) => b.score - a.score || a.name.length - b.name.length)
  return hits.slice(0, limit)
}

/**
 * Whether to search the top match outright instead of only offering it.
 *
 * Being close is not enough — it has to be *decisively* closer than the
 * runner-up. "pikchu" is one edit from both "pichu" and "pikachu", and
 * picking one of those on the reader's behalf is a coin toss dressed up as
 * help; that case belongs in a did-you-mean list. "charizrd" is one edit
 * from "charizard" and nothing else comes close, so it just gets searched.
 *
 * A threshold on the raw score cannot express this, and tuning one is how
 * a single typo ends up scoring 449 against a cutoff of 450.
 */
export function pickBest(hits) {
  const best = hits[0]
  if (!best) return { hit: null, confident: false }
  if (best.kind === 'exact') return { hit: best, confident: true }

  // Only a genuine near-miss is worth correcting silently; a partial like
  // "char" matches a whole family and should be offered, not guessed.
  if (best.kind !== 'near') return { hit: best, confident: false }

  const second = hits[1]
  const decisive = !second || best.score - second.score >= 50
  return { hit: best, confident: decisive }
}
