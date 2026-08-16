import React, { useEffect, useState } from 'react';
import { getSprite } from '../utilities/sprites';
import './PokemonSprite.css';

/* Shows the PokéAPI sprite for a Pokémon name.
   `delay` debounces the lookup, so typing into the team form doesn't fire a
   request per keystroke. */
function PokemonSprite({ name, size = 40, delay = 0 }) {
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState('empty');

  useEffect(() => {
    if (!name || !name.trim()) {
      setUrl(null);
      setStatus('empty');
      return;
    }

    let active = true;
    setStatus('loading');

    const timer = setTimeout(() => {
      getSprite(name).then((found) => {
        if (!active) return;
        setUrl(found);
        setStatus(found ? 'ready' : 'missing');
      });
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, delay]);

  return (
    <span
      className={`sprite sprite-${status}`}
      style={{ width: size, height: size }}
      title={status === 'missing' ? `No sprite found for "${name}"` : undefined}
    >
      {status === 'ready' ? (
        <img src={url} alt={name} loading="lazy" />
      ) : (
        <span className="sprite-mark" aria-hidden="true">
          {status === 'missing' ? '?' : ''}
        </span>
      )}
    </span>
  );
}

export default PokemonSprite;
