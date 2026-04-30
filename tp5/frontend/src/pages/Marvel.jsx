import { useState } from 'react';
import SuperheroCard from '../components/SuperheroCard';
import { useHeroes } from '../hooks/useHeroes';

// Componente que muestra ÚNICAMENTE los superhéroes del universo Marvel
const Marvel = () => {
  const { heroes, loading, removeHero } = useHeroes('Marvel'); // Llama al hook filtrando por casa "Marvel"
  const [filter, setFilter] = useState('');

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title marvel-theme">Universo Marvel</h1>
      
      <div className="filter-container">
        <input 
          type="text" 
          className="filter-input" 
          placeholder="Buscar héroe de Marvel..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{textAlign:'center', marginTop:'3rem'}}>Cargando...</div>
      ) : (
        <div className="heroes-grid">
          {filteredHeroes.map(hero => (
            <SuperheroCard key={hero._id} hero={hero} onDelete={removeHero} />
          ))}
          {filteredHeroes.length === 0 && <p className="empty-state">No se encontraron héroes.</p>}
        </div>
      )}
    </div>
  );
};

export default Marvel;
