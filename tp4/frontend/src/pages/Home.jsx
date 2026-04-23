import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuperheroCard from '../components/SuperheroCard';
import { toast } from 'react-toastify';

const Home = ({ filter, searchTerm }) => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroes();
  }, [filter]);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const url = filter === 'All' 
        ? 'http://localhost:5000/api/superheroes' 
        : `http://localhost:5000/api/superheroes?house=${filter}`;
      
      const response = await axios.get(url);
      setHeroes(response.data);
    } catch (error) {
      console.error('Error fetching heroes:', error);
      toast.error('Error al cargar superhéroes desde el servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hero.character_name && hero.character_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{filter === 'All' ? 'Todos los Superhéroes' : `Universo ${filter}`}</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando héroes...</div>
      ) : filteredHeroes.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>No se encontraron superhéroes.</div>
      ) : (
        <div className="hero-grid">
          {filteredHeroes.map(hero => (
            <SuperheroCard key={hero._id} hero={hero} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
