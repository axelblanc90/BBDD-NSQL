import { useState } from 'react';
import SuperheroCard from '../components/SuperheroCard';
import { useHeroes } from '../hooks/useHeroes';

// Componente que muestra ÚNICAMENTE los superhéroes del universo DC
const DC = () => {
  const { heroes, loading, removeHero } = useHeroes('DC'); // Llama al hook filtrando por casa "DC"
  const [filter, setFilter] = useState('');

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title dc-theme">Universo DC</h1>
      
      <div className="filter-container">
        <input 
          type="text" 
          className="filter-input" 
          placeholder="Buscar héroe de DC..." 
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

export default DC;
