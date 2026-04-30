import { useState } from 'react';
import SuperheroCard from '../components/SuperheroCard';
import { useHeroes } from '../hooks/useHeroes';

// Componente Principal (Home) que muestra TODOS los superhéroes
const Home = () => {
  const { heroes, loading, removeHero } = useHeroes(); // Hook personalizado para traer todos los datos
  const [filter, setFilter] = useState(''); // Estado para el filtro en tiempo real en cliente

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Directorio de Superhéroes</h1>
      
      <div className="filter-container">
        <input 
          type="text" 
          className="filter-input" 
          placeholder="Buscar superhéroe por nombre..." 
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

export default Home;
