import { useState, useEffect } from 'react';

// Custom Hook para manejar la obtención (fetch) de los superhéroes desde el backend
// Permite filtrar por casa (Marvel/DC) opcionalmente
export const useHeroes = (house = null) => {
  const [heroes, setHeroes] = useState([]); // Lista de superhéroes recuperada
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const query = house ? `?house=${house}` : '';
        const res = await fetch(`${url}/superheroes${query}`);
        const data = await res.json();
        setHeroes(data);
      } catch (err) {
        console.error("Error fetching heroes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroes();
  }, [house]);

  const removeHero = (id) => {
    setHeroes(heroes.filter(h => h._id !== id));
  };

  return { heroes, loading, removeHero };
};
