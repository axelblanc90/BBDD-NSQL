import { Link } from 'react-router-dom';
import { toast } from './toastManager';

// Componente que representa la tarjeta de un superhéroe en los listados
const SuperheroCard = ({ hero, onDelete }) => {
  // Determinamos la casa para aplicar la clase CSS de color (rojo/azul)
  const isMarvel = hero.house?.toLowerCase() === 'marvel';
  const themeClass = isMarvel ? 'marvel' : 'dc';
  
  // Función para manejar la eliminación del personaje
  const handleDelete = async (e) => {
    e.preventDefault(); // Evita que se navegue al detalle al hacer clic en borrar
    if (window.confirm(`¿Seguro que deseas eliminar a ${hero.name}?`)) {
      try {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${url}/superheroes/${hero._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success(`${hero.name} eliminado correctamente`);
          onDelete(hero._id);
        } else {
          toast.error("Error al eliminar");
        }
      } catch (err) {
        toast.error("Error de red");
      }
    }
  };

  const imageUrl = hero.images && hero.images.length > 0 
    ? hero.images[0] 
    : 'https://via.placeholder.com/300x400?text=No+Image';

  const truncatedBio = hero.bio?.length > 100 
    ? hero.bio.substring(0, 100) + '...' 
    : hero.bio;

  return (
    <div className={`hero-card ${themeClass}`}>
      <Link to={`/hero/${hero._id}`} style={{textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%'}}>
        <div className="card-image-wrapper">
          <img src={imageUrl} alt={hero.name} className="card-image" />
        </div>
        <div className="card-content">
          <h2 className="card-title">{hero.name}</h2>
          <div className="card-subtitle">{hero.real_name ? `Nombre Real: ${hero.real_name}` : 'Identidad Desconocida'}</div>
          <p className="card-bio">{truncatedBio}</p>
          
          <div className="card-actions">
            <Link to={`/edit/${hero._id}`} className={`btn btn-${themeClass}`}>Editar</Link>
            <button className="btn-icon delete" onClick={handleDelete} title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SuperheroCard;
